---
layout: post
title: Notes on migrating to OSX Lion
category: OSX
tags:
  - OSX
---
I bought Lion yesterday ! People have already tested it against tools I
use
for work : Homebrew, RVM, MacVim so installing it on a friday night
shouldn't 
be too painful. Plus I got backups everywhere (local server + dropbox +
github + tarsnap). 

## What went well

- Downloading it, I got a stable and fast ADSL connection ( thanks
  Free.fr )
- Installing it right after the download
- Installing Xcode and [Homebrew](http://mxcl.github.com/homebrew/).


## FAIL : Uninstalling MacFuse

- Uninstalling [MacFuse](http://code.google.com/p/macfuse/) after the
  install. I forgot to remove it before
  intalling Lion, since it's quite unmaintained, you can guess it's
  going be boring to remove it correctly.
- The uninstall script will fail with various errors.
  - [Mailing list thread that sum up what's going
    on](http://www.mail-archive.com/macfuse@googlegroups.com/msg01094.html)
- Removing it manually, *but wait that's my fault !* I inspected the
  uninstall shell script
  and decided to do some quick shell script surgery.
  - Looks like I messed up there. Even if I manually unplugged the Kext
    before starting it, I got a weird freeze where no more application
    could be launched, they were bouncing endlessly. 
  - Forced reboot.
  - Lion detects a broken os and decided to re-install itself. 
  
## FAIL : Admin privileges

- Second install, Lion did not set any admin rights to my main user.
  This
  means : 
  - I can't touch anything in system preferences.
  - I can't sudo.
- Fixed it by booting in single user mode and adding myself manually to
  admin group :
  - Reboot and hold cmd+s
  - Remount your partition to have it writable
    - */sbin/fsck -fy*
    - */sbin/mount -uw /*
  - Add myself to admin group
    - *dseeditgroup -o edit -a myusername -t user admin*
  - Reboot 

## FAIL : SSH encoding issues

- SSH'ing into any box messed up completely my encoding settings. 
- Comment *SendEnv LANG LC_* * in */etc/ssh_config* to get back to the
  pre-Lion behavior.
- Lion does not set its locale to *en_us.utf8* by default,
  appending it to your *~/.profile* with *export LC_ALL=en_US.UTF-8*
corrects this issue if you want to adapt to the new
  default.
  
## FAIL : Rvm and Ruby Entreprise edition ( Ree )

- Segfault ! 

```
ld: warning: directory not found for option '-L/opt/local/lib'
./ext/purelib.rb:2: [BUG] Segmentation fault
ruby 1.8.7 (2011-02-18 patchlevel 334) [i686-darwin11.0.0],
MBARI 0x6770, Ruby Enterprise Edition 2011.03
```

  [fulls logs](https://gist.github.com/1115457) 

- Fixed by using gcc instead of llvm 

```
rvm remove ree
export CC=/usr/bin/gcc-4.2
rvm install --force ree
```

  [StackOverflow
thread](http://stackoverflow.com/questions/6804195/cant-install-ruby-enterprise-edition-with-rvm-on-osx-lion)

## FAIL : Rvm and Postgresql with Homebrew

- Fail to exec the *Postgresql* recipe : 

```
Error: undefined method `strip' for #<KegOnlyReason:0x10ac404b8>
```

- I updated and relaunched *brew install postgresql* which ran smoothly
  thanks to [this
fix](https://github.com/mxcl/homebrew/commit/20d2edf18deefb6d6439d415625f506c662dcba2)

## FAIL : Fullscreen : 

- Can't use cmd+` to alternate windows while in fullscreen, this isn't
  vital but it's quite annoying. 

## Finally

As I wasn't expecting everything to work for the first time, those small
issues did not upset me and weren't hard to fix. I laughed hard at
myself for the macfuse failed surgery where I
can only blame myself.
