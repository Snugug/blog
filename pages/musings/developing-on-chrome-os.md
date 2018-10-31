---
title: Setting up a Chrome OS Development Environment
template: _layout.html
published: October 31, 2018
updated: October 31, 2018
summary: >
  After joining Google, I was given a Google Pixelbook as my main computer. This is my journey to get it set up for web development
---

_Disclaimer: I now work for Google, and while this post is about me setting up my work Google Pixelbook, these are my personal thoughts and do not Google's._

So, like the introduction says, I just joined Google! My first order of business, clearly, was getting my new Pixelbook set up to do some webdev on it. Now, being most comfortable developing on a Mac, I immediately reached for the Terminal which... wasn't there. I thought I was stuck, knowing that I'm most comfortable developing when I'm zooming around in `zsh`, but then a coworker helped me get [Crostini](https://www.reddit.com/r/Crostini/) set up. This is the key to being a happy web developer (or probably most any developer) on Chrome OS.

Crostini, also known as Linux on Chrome OS, will actually let you run a Linux container (or maybe virtual machine? Not entirely sure ) on your Chromebook. This means that, currently (Chrome OS 70), once you've gotten it installed, you'll get a Debian container and a terminal ready to go! Poking around the subreddit above it _appears_ that you can install other containers, but Debian works well for me.

With the Debian install, you don't get an actual Linux desktop, like you would with say a Virtual Box VM. Instead, you get something much more interesting; after getting set up, the Linux environment for all intents and purposes _feels_ like a fully integrated part of the OS! There's a `Linux files` folder in the Files app that puts stuff directly in to the container, and the native Chrome can access the container's `localhost` (or `penguin.linux.test`, if you're feeling cool). With my Linux container set up, the next for me was setting up a development environment that felt familiar to me coming from a Mac. For me, that first step was replacing the terminal that comes with Crostini with a new one, because I wanted to full control over customizing the look, feel, and shortcuts of my terminal.

## Terminal Setup

After a bunch of playing around for a good terminal replacement, I stumbled upon a [Reddit thread](https://www.reddit.com/r/Crostini/comments/8rgq26/multi_tabs_in_terminal/e29vjqr/) that help me install [Tilix](https://gnunn1.github.io/tilix-web/). I was looking for a good [iTerm 2](https://www.iterm2.com/) replacement, and this comes really close! The key bits from that thread, to get Tilix running, are as follows:

```bash
$ echo 'deb http://ftp.debian.org/debian stretch-backports main' | sudo tee /etc/apt/sources.list.d/stretch-backports.list
$ sudo apt update
$ sudo apt -y install tilix
$ sudo ln -s /etc/profile.d/vte-2.91.sh /etc/profile.d/vte.sh
```

This will add Stretch Backports as an `apt` source, update the `apt` source, and install Tilix. The last line symlinks `vte.sh` so Tilix can use it. The final thing you need to do is source that in your `.bashrc` or `.zshrc` file.

```bash
if [ $TILIX_ID ] || [ $VTE_VERSION ]; then
    source /etc/profile.d/vte.sh
fi
```

With that set up, Tilix became launchable from the Chrome OS launcher and pinnable!

Next, I wanted to use `zsh` instead of `bash`. I love [Oh My Zsh](https://github.com/robbyrussell/oh-my-zsh), which is an open source `zsh` configuration management framework, so I went to work installing that. Installation is a fairly straight forward, simply run `sudo apt-get install zsh wget` and we had `zsh`! We also install `wget` here because it doesn't come with our Linux container, and then use that to follow the standard _Oh My Zsh_ install instructions. I also recommend using the [z](https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/z),  [shrink-path](https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/shrink-path), and [zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting) `zsh` plugins; they're real productivity and quality-of-life enhancements for my terminal.

Finally, it's time to edit settings for Tilix! Open Tilix, click the top-left icon, and hit Preferences. From there, either edit the Default profile, or create a new one, go to the _Command_ tab, check `Run a custom command instead of my shell`, and under the command, type `zsh`. This will make Tilix run `zsh`! Then, go ahead and customize both the terminal and `zsh` to your liking!

While you're in Tilix preferences, you should play around with the shortcuts they provide. I like app-like shortcuts, like `CTRL+C`/`CTRL+V` for copy/paste, so go ahead and change those yo our heart's content

One last bit that may come in handy; if you're using a `zsh` theme that makes use of [Powerline fonts](https://github.com/powerline/fonts) (like I do), you'll need do a little bit extra to get them installed. After downloading the fonts I wanted, I followed another [Reddit thread](https://www.reddit.com/r/Crostini/comments/9ih3nv/installing_fonts/) to install the fonts I need. The steps are:

1. Create a folder named `.fonts` in the home (`~`) directory
2. Copy the font files to install into that folder
3. Run `fc-cache -fv` to verbosely force the cache to rebuild.

Once done, go back in to your profile under Tilix preferences and use the newly installed fonts!

## Web Development Environment

With the terminal squared away, it's now time to set up a web dev environment! The first thing on my list was installing a better text editor. It turns out that [Visual Studio Code](https://code.visualstudio.com/) not only is available for Debian, but it runs _beautifully_ on our new setup! Download the `.deb` file from their site, save it to the Linux files folder, and then from your terminal, in the folder you downloaded the `.deb` file, run ` sudo dpkg -i visual-studio-install-filename.deb`, replacing the last bit with the actual filename. That's it! You've got full VS Code now!

The final bit I really need is a Node environment. Instead of installing Node directly, I prefer using [NVM](https://github.com/creationix/nvm) (Node Version Manager) coupled with [AVN](https://github.com/wbyoung/avn) (Automatic Version Switching for Node). The installation instructions that are provided for both work wonders. The only caution I have here that you need to install NVM _and_ a version of Node _before_ installing AVN because AVN requires a Node install. With both installed, the bottom of my `~/.zshrc` file looks like this:

```bash
# Node Version Manager and ANV
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
[[ -s "$HOME/.avn/bin/avn.sh" ]] && source "$HOME/.avn/bin/avn.sh" # load avn
export PATH="/usr/local/bin:$PATH"
```

I also enable the `node`, `npm`, and `nvm` plugins for `zsh`.

## Migrating from a Mac

If you're coming from a Mac, one of the biggest pain points I found was the keyboard and trackpad are, by default, set up to mimic Windows. This can be resolved in settings, though! From the App Launcher, open Settings, then navigate (from the hamburger menu) to **Device**. Under **Touchpad**, you can set scrolling to `Australian`, or natural scrolling in the Mac world, and under **Keyboard**, swap the `Ctrl` and `Alt` keys. If you wind up constantly hitting the Google Assistant button in between the keyboard's `Ctrl` and `Alt` keys like I do, unfortunately that can't be remapped as of this writing, so the only way to stop that is by disabling Google Assistant entirely. I think that if and when that can be remapped, I'll probably re-enable Assistant and assign it to the `Ctrl` key, and have the assistant key be the new `Alt` (so `Alt` key === `Ctrl`, Assistant key === `Alt`, `Ctrl` key === Assistant, as opposed to Assistant key being disabled now, and `Ctrl` key === `Alt` currently). Finally, under **Displays**, you can change the Internal Display size. I set mine so it looks like `1500 x 1000` which is closest to my previous Mac's `1440 x 900` display. Change this to your liking.

The last thing that may be missing are some familiar and useful CLI commands; specifically, the `open` command, and `pbcopy`/`pbpaste`. They aren't natively available in Debian, so we'll need to roll our own.

To tackle `open`, in `~/.zshrc`, add the following function:

```bash
open() {
  setsid nohup xdg-open $1 > /dev/null 2> /dev/null
}
```

This will open whatever file or folder name is passed in, in the default application, in a new, effectively detached session, emulating how OSX's `open` command works.

For `pbcopy` and `pbpaste` (copying to and pasting from the clipboard), I followed [an article](https://www.ostechnix.com/how-to-use-pbcopy-and-pbpaste-commands-on-linux/) that had me install `xclip` (`sudo apt-get install xclip`) and then add the following aliases to my `~/.zshrc` file:

```bash
alias pbcopy='xclip -selection clipboard'
alias pbpaste='xclip -selection clipboard -o'
```

There's also a Linux port of Homebrew called [Linuxbrew](http://linuxbrew.sh/) which looks interesting, but I haven't investigated it yet.

## Final Thoughts

I consider myself somewhat of a power Mac user so getting my new Pixelbook set up to my liking is a _must_ in order for me to feel comfortable using it. There are still some gaps; I'd like to be able to change all of the global keyboard shortcuts (specifically, missing `CMD+Tab` to move through applications and `CMD+~` to move through application windows, the equivelant here would be `Ctrl` instead of `CMD`), and while the Pixelbook has great mouse-centric window snapping, I'm really missing keyboard shortcuts for window sizing and placement, like with [Divvy](http://mizage.com/divvy/) or [Spectacle](https://www.spectacleapp.com/). I'm also missing multitouch gestures, which I use extensively and extensively customize with [BetterTouchTool](https://folivora.ai/).

There's also another issue I've run in to though; the death by a thousand papercuts of tools you're likely use to or dependent on that don't have great web-based or Linux, like the Adobe suite, Sketch, [1Password](https://1password.com/), and other Mac and/or Windows-centric desktop apps. Some of these have Android alternatives that can be installed through the Play store on Chrome OS, but for many, you'll just need to go without for now.

On the other hand, [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/) are treated as _fabulous_ first-class citizens on Chrome OS, with you being able to install them and have them be treated, for all intents and purposes, as any other app. [Twitter's PWA](https://mobile.twitter.com), for example, works great installed. Because of how well these work, and the progress with which [WebAssembly](https://webassembly.org/) is coming along, I can see a future in which some of these desktop apps are able to be ported to the web and installed as a PWA, but I think that ma still be a bit far off for now.