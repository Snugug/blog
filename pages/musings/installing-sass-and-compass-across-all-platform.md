---
title: 'Installing Sass and Compass Across All Platforms'
template: '_layout.html'
published: November 4, 2012
updated: November 4, 2012
summary: >
  How to install Ruby Sass and Compass globally across Mac, Windows, and Linux.
---
One of the most frequent questions that gets asked of me is how to install Sass+Compass across platform. Without further adue, here are the instructions for the three major platforms.

## Mac

Fortunately for us Mac users, Ruby and Ruby Gems comes pre-installed on our systems. Installing Sass+Compass is as easy as the following:

```bash
sudo gem install compass
```

You will be asked to type in your user password. Do so, press enter, and you've got Sass+Compass installed.

## Windows

Windows is a little bit more complicated, but not particularly. Go to [RubyInstaller](http://rubyinstaller.org/), download the installer, and follow the wizard. It will install a program called "Start Command Prompt with Ruby"; open it and type in the following:

```bash
gem install compass
```

## Linux/Unix

Linux/Unix systems are a little bit harder. These instructions assume that you've got access to `apt-get` installed. Open up your terminal and type in the following:

```bash
sudo apt-get install ruby-full build-essential 
```

```bash
sudo apt-get install rubygems 
```

```bash
export PATH=/var/lib/gems/1.8/bin:$PATH
sudo gem install compass 
```

Done and done! Enjoy Sass+Compass!
