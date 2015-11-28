fusic-meteor [![Project Status: Suspended - Initial development has started, but there has not yet been a stable, usable release; work has been stopped for the time being but the author(s) intend on resuming work.](http://www.repostatus.org/badges/latest/suspended.svg)](http://www.repostatus.org/#suspended)
============

Fusic: Realtime Social Music Collaboration

The development version runs on http://fusic.meteor.com/

If you have good idea's or want to report a bug, please [create a new issue on github](https://github.com/Rayman/fusic-meteor/issues).

If you have any modifications or additions, please send a pull request.

Installation
------------
1. Install meteor (https://www.meteor.com/)
   `curl https://install.meteor.com/ | sh`
2. Initialize all git submodules
   `git submodule update --init --recursive`
3. Update all git submodules
   `git submodule update --recursive`
4. Run fusic locally
   `meteor`

Collaborating
------------
Here is some good reading material: https://help.github.com/categories/63/articles

- [Using pull requests](https://help.github.com/articles/using-pull-requests)
- [Syncing a fork](https://help.github.com/articles/syncing-a-fork)

Meteorite (Optional)
--------------------
You can use meteorite to quickly add new meteor packages. Unfortunately it only runs on Windows.

1. Install
  `sudo -H npm install -g meteorite`
2. Add a new package
   `mrt add <package name>`
3. Update all packages
   `mrt update`

Install a more recent nodejs installation (Optional)
-------------------
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs

