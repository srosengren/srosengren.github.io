---
layout: post
title:  "Xamarin UserControl instantiation and binding context"
date:   2018-01-16 14:45:00
tags: [development,xamarin,forms, usercontrol,bindableproperty, bindingcontext, xaml]
---

Having worked with React for the last 3 years has made Components my favourite way of structuring code, it might have been 5-7 years since I worked with WPF and Silverlight but I do remember them having UserControls as a concept which is fairly similar to Components. This term doesn't seem to be used as much in the Xamarin camp, instead they seem to be talking about Views, which makes finding information that much harder as the term View could mean any kind of view.

Anyway, what I wanted to build is a component that takes a title, an icon, and a command. I want to list 3 (right now) of these vertically, my first idea was to use the `ListView` component as it's purpose is to list similar data in a single direction, it provides a `ItemsSource` and a `ItemTemplate`. This didn't suit me however as there was quite a bit of styling and behaviour to remove, which lead me to believe that this wasn't the way to go.

The next attempt was to subclass a `StackLayout` (as my component itself contains a couple of views in a single direction) and work with that. This lead me to roughly this code:

```
public partial class CustomControl : StackLayout
{

    public string Title { get; set; }
    public string Detail { get; set; }
    public string Icon { get; set; }

    public ICommand Command
    {
        get
        {
            return (ICommand)GetValue(CommandProperty);
        }
        set
        {
            SetValue(CommandProperty, value);
        }
    }

    public static readonly BindableProperty CommandProperty =
        BindableProperty.Create("Command", typeof(ICommand), typeof(CustomControl));
    public CustomControl()
    {
        InitializeComponent();
        this.BindingContext = this;
    }
}
```

The reasoning for having the `this.BindingContext = this` is I felt that having a dedicated `ViewModel` for this seemed excessive, and I wanted to bind my values to the view instead of assigning them in the code-behind as they could be updated.

The View looks something like this:

```
<?xml version="1.0" encoding="UTF-8"?>
<StackLayout
    xmlns="http://xamarin.com/schemas/2014/forms"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    x:Class="...CustomControl"
    Orientation="Horizontal">
    <StackLayout.GestureRecognizers>
        <TapGestureRecognizer
            Command="{Binding Command}" />
    </StackLayout.GestureRecognizers>
    <Image
        Source="{Binding Icon}" />
    <Label
        Text="{Binding Title}" />
</StackLayout> 
```

And I used the component from my main view like this:

```
<ContentPage
    xmlns="http://xamarin.com/schemas/2014/forms"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    Title="my view"
    x:Class="..."
    xmlns:control="clr-namespace:...CustomControl;assembly=...">
        <control:CustomControl
            Title="My title"
            Icon="my-icon.png"
            Command="{Binding ViewModelCommand}" />
</ContentPage>
```

The ContentPage in itself has it's `BindingContext` set to a ViewModel that contains a property of type `ICommand` and this is what I want to pass down to my CustomControl.

The result of this was that my CustomControl displayed as expected, the title and icon was set to the expected value, but the Command didn't work.

Some debugging told me that there was nothing passed into the ICommand property of the CustomControl, and that the `PropertyChanged` handler didn't receive a value.

As it turns out it's my mindset from working with React that snagged me. I expected that the `Command="{Binding ViewModelCommand}"` to be executed using the surrounding `BindingContext` (the viewmodel). What was really happening was that the binding is executed in it's own context, meaning `this` because of the line `this.BindingContext = this;` in the constructor of the CustomControl.

How does one solve this? I couldn't remove the `BindingContext` assignment as I still needed to bind the inner views (`Label`, `Image`) to the properties of the CustomControl, removing that would mean that the CustomControl would be bound to the surrounding `BindingContext` (the ViewModel), removing the ability to have several instances of CustomControl binding to different values.

The solution was to change how I bound the Command using syntax that doesn't seem to well documented (in official docs). [https://xamarinhelp.com/xaml-markup-extension-cheatsheet/](https://xamarinhelp.com/xaml-markup-extension-cheatsheet/)

The final XAML in the ContentPage ended up looking like:

```
<ContentPage
    xmlns="http://xamarin.com/schemas/2014/forms"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    Title="my view"
    x:Class="..."
    x:Name="Root"
    xmlns:control="...CustomControl;assembly=...">
    <control:FaulReportType
        Grid.Row="1"
        Title="Fill out form"
        Icon="icon_email.png"
        Command="{Binding Source={x:Reference Root}, Path=BindingContext.ViewModelCommand}"
        IsVisible="{Binding ShowMail}"
        AutomationId="FaultReportMailStacklayout" />
</ContentPage>
```

Where the changes are

- Add a reference to the ContentPage `x:Name="Root"`.
- Edit the Binding to `{Binding Source={x:Reference Root}, Path=BindingContext.ViewModelCommand}` which makes it bind to the specified `BindingContext`.