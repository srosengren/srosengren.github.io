---
layout: post
title:  "Variance with generic classes and interfaces in c# (type matching, type guarding)"
date:   2019-12-02 16:12:00
tags: [development,csharp,variance]
---

## Actual real life problem
I've got a .NET (framework) MVC application (using EpiServer) where most (but not all) views are typed to a `Model` of type `PageViewModel<T> where T: PageData`. The feature to be implemented is to render a property of `PageData` whenever we're rendering a view that's typed to `PageViewModel<T> where T: PageData`, but do nothing for other views. A instance of `T` is available on the model. The property should be rendered in the "root" of the page, and not besides the rest of the view specific rendering.

I see the following solutions to this "problem":
1. Use a `section` in the root layout, and render into it from the sub view. This isn't an option as the same thing should always be rendered, regardless of which subview it is, using this solution wouldn't be DRY.
2. Combine above with a typed parent layout of our subviews. Where the rendering into the section could be handled in the new parent layout. A better solution, but would make developers need to remember to use this layout. Perhaps not a big hassle, and could possibly be abstracted away. Probably the solution that will be used.
3. Use a type guard in the root view that render the property in the correct place if the model is of type `PageViewModel<T> where T: PageData` (the model in the root is untyped, making it a dynamic).

## Type guarding generic types in c#
The 3rd solution is what got me thinking about variance in C# and how I would handle it in this scenario.

The first approach would be to check if the model is of type `PageViewModel<PageData>`, using something similar to `var propToRender = (Model as PageViewModel<PageData>)?.InnerModel.Prop`. I mean we know that the generic parameter is always a type derived from `PageData`, trying to upcast it like this makes sense right?

The problem is that variance doesn't work like this in C#, it's only valid if our model is *exactly* `PageViewModel<T> where T: PageData`. The solution to this is to use a *variance modifier* when defining our `PageViewModel`, the next problem is that *variance modifiers* aren't available on generic classes. They are however available on interfaces. The solution being to create the interface `IPageViewModel<out T> where T: PageData` and having our `PageViewModel` implement it. the `out` modifier in `PageViewModel<out T>` means that `T` is now *covariant*, meaning that it's now possible to do `var propToRender = (Model as IPageViewModel<PageData>)?.InnerModel.Prop`, which will be valid.

This is something that the compiler will generally help you with, except for these cases where your instance is previously cast to `dynamic` or `object`.

The output from the contrived example below is the following, highlighting how this works.

- I'm a variant of variance.Container`1[variance.TypeParameterDerived] :)
- I'm not a variant of variance.Container`1[variance.TypeParameterBase] :(
- I'm a variant of variance.IContainer`1[variance.TypeParameterDerived] :)
- I'm a variant of variance.IContainer`1[variance.TypeParameterBase] :)

{% highlight c# %}
using System;

namespace variance
{
    class Program
    {
        static void Main(string[] args)
        {
            object sut = new Container<TypeParameterDerived>();

            Console.WriteLine(test(sut as Container<TypeParameterDerived>));
            Console.WriteLine(test(sut as Container<TypeParameterBase>));
            Console.WriteLine(test(sut as IContainer<TypeParameterDerived>));
            Console.WriteLine(test(sut as IContainer<TypeParameterBase>));

            TypeParameterBase f = new TypeParameterDerived();
        }

        private static string test<T>(T sut) =>
            sut is T c
                ? $"I'm a variant of {typeof(T)} :)"
                : $"I'm not a variant of {typeof(T)} :(";
    }

    public abstract class TypeParameterBase { }

    public class TypeParameterDerived : TypeParameterBase { }

    public interface IContainer<out T> where T : TypeParameterBase { }

    public class Container<T> : IContainer<T> where T : TypeParameterBase { }
}

{% endhighlight %}

You may also use the `in` keyword to make the generic parameter be `contravariant`.


## Resources used when finding this solution
- [https://weblogs.asp.net/paulomorgado/c-4-0-covariance-and-contravariance-in-generics](https://weblogs.asp.net/paulomorgado/c-4-0-covariance-and-contravariance-in-generics)
- [https://blogs.msdn.microsoft.com/ericlippert/2009/12/03/exact-rules-for-variance-validity/](https://blogs.msdn.microsoft.com/ericlippert/2009/12/03/exact-rules-for-variance-validity/)
