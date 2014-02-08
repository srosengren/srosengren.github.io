---
layout: post
title:  "Automate and livereload a jekyll site with less using grunt"
date:   2013-12-20 15:25:00
tags: [web,javascript,frontend,jekyll,gruntjs,less,development]
---

I'll be the first to admit it, my "workflow" is/was really ancient, my professional work is to 99% done in Visual Studio which has made me a bit spoiled since it handles almost anything you want it to do.
Work that I do for fun on the other hand is mostly written with sublime text. This site for instance is built with jekyll and I use LESS as a preprocessor for its stylesheets.

My old workflow for developing/writing posts for this site was pretty much non-existant. I used Winless for compilling LESS and it has the occasional hiccups where it wouldn't listen to updates in imported files and recompile my main LESS file. I also ran ``jekyll build`` manually from a bash prompt. The Winless issue meant that I sometimes had to compile jekyll, realize that the LESS file wasn't compiled and thus not updated in the new build so I had to manually compile LESS and then build jekyll again, a time consuming and headache inducing experience I can assure you.

I've been interested in GruntJS for a while now but I didn't realize that I could use it to solve my issue before reading Chris Coyiers [article](http://24ways.org/2013/grunt-is-not-weird-and-hard/), I also feared that it would be hard since it runs on node. Turns out that setting up grunt on windows was a breeze and that creating a grunt file for this project wasn't to hard, mainly because a lot of people has written about parts of what I tried to achieve. Chris's article covered most of it but I also had to find some posts about jekyll and grunt, and then merge this information.

I will try to make an abridged version of the information that I've compiled, referring back to the original content but also write my conclusions in case the original posts disappears.

## Setting it up

[Chris Coyier](http://24ways.org/2013/grunt-is-not-weird-and-hard/) writes about the basics of setting up grunt, all you have to do is go to [http://nodejs.org/](http://nodejs.org/) and click the install button. You then create a file called "package.json" in your sites root folder with the following:

{% highlight javascript %}
{
  "name": "My jekyll site",
  "version": "1.0.0",
  "devDependencies": {
    "grunt": "~0.4.1",
    "grunt-contrib-less": "~0.8.3",
    "grunt-contrib-watch": "~0.5.3",
    "grunt-contrib-copy": "~0.4.1",
    "grunt-shell": "~0.6.1"
  }
}
{% endhighlight %}

And then run ``npm install`` to install your dependencies.

Now it's time to write our gruntfile that will compile less and build jekyll, it should of course do this without us having to press reload in our browser. 

We will begin with this simple gruntfile that compiles our less on the fly, we don't have to install livereload on our machines since this is built into ``grunt-contrib-watch``, but we still have to install a [browser plugin](http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions-)

{% highlight javascript %}
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.initConfig({
    less: {
      development: {
        options: {
          paths: ["./assets/styles/less"],
          yuicompress: true,
          compress: true
        },
        files: {
          './assets/styles/rosengren.css': './assets/styles/rosengren.less'
        }
      }
    }
  },
  watch: {
    less: {
      files: './assets/styles/*.less',
      tasks: ['less:development'],
      options: {
        livereload: true,
        spawn: false
      }
    }
  });
  grunt.registerTask('default', 'less');
}
{% endhighlight %}

What this does is that it listens to changes in any LESS file in my /assets/styles folder. It compiles and minifies ``rosengren.less`` to ``rosengren.css`` by running the ``less:development`` task from the ``watch:less`` task when it detects an update. It also notifies livereload in any browser and injects the new CSS without refreshing the page.

I found a post by [Thanasis Polychronakis](http://thanpol.as/jekyll/jekyll-and-livereload-flow/) That describes how to get grunt to build jekyll through a shell task. And also added that we should have an additional task that copies compiled less directly to our \_site folder without having to build jekyll since it takes a lot of time. 

We do this by adding these tasks directly into the ``grunt.initConfig`` parameter object, they should be added right next to the ``less`` and ``watch`` tasks.

{% highlight javascript %}
copy: {
  css : {
    files: {
      './_site/assets/styles/rosengren.css': './assets/styles/rosengren.css'
    }
  }
},
shell: {
  jekyll: {
    options: {
      stdout: true
    },
    command: 'jekyll build'
  }
}
{% endhighlight %}

We should also add ``'copy:css'`` into the ``watch:less`` tasks array. and a secondary watch task that should be added next to the ``watch:less`` task

{% highlight javascript %}
jekyll: {
  files: [
    '*.html', '*.yml', 'assets/js/**.js',
    '_posts/**', '_includes/**'
  ],
  tasks: 'shell:jekyll',
  options: {
    livereload: true
  }
}
{% endhighlight %}

We also have to tell grunt to load additional tasks for our config file to make sense.

{% highlight javascript %}
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');
{% endhighlight %}

The ``copy`` task simply copies the ``rosengren.css`` file into our \_site folder, this will be run when our ``watch:less`` detects a change since we added the task into the tasks array and it will be included in the livereload.

The new ``watch:jekyll`` task will listen to any change in files that should trigger a jekyll build, it will then trigger the ``shell:jekyll`` task and a livereload after it has finished.

The new tasks that we're loading should simply be added within the main function of the file, next to the previously loaded tasks.

## Finally

Well there you have it, a jekyll site that builds when files are updated and compiles and injects LESS when it detects any change in a LESS file.

The grunt file for this site as of writing can be found [here ](https://github.com/srosengren/srosengren.github.io/blob/bf3f4c50a3ccd853871fea8461128227887a933b/_site/gruntfile.js)