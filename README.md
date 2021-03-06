# corexit

A userscript to clean up post-incident pollution.

Copyright 2016 Stuart P. Bentley

⚠️ WARNING! ⚠️  
☢️ 😱 DO NOT USE THIS PROGRAM. 😱 ☢️  
This program is not a program of honor.  

No highly esteemed function is executed here.  

What is here is dangerous and repulsive to us.  

The danger is still present, in your time, as it was in ours,  
without even the implied warranty of MERCHANTABILITY or  
FITNESS FOR A PARTICULAR PURPOSE.

This program is best shunned and left unused (but it is free software,  
and you are welcome to redistribute it under certain conditions).  
😱 ☢️ DO NOT USE THIS PROGRAM. ☢️ 😱

This program is licensed under the Sandia Message Public License,  
sublicense Do What The Fuck You Want To Public License.  
This may be abbreviated as sandia-wtfpl.  
You may obtain a copy of the License(s) at  
https://github.com/cdanis/sandia-public-license/blob/main/LICENSE.md and  
https://spdx.org/licenses/WTFPL.html

## Background

I had the Better History extension installed, and it got hijacked and spewed a bunch of [bogus Russian malware localStorage items][1] all over my browser. I wanted to get rid of these, without having to blow away all my local data.

[1]: https://www.reddit.com/r/Malware/comments/4cw9fz/lnkrus_redirect_malware_report/

This userscript, used in conjunction with the procedure described below, was the simplest tool I could build to do this.

## Usage

(This worked as of Chrome 49 in early April 2016, but if it's been a while since then, I'd be more surprised than not if this next part worked without major changes.)

Navigate to chrome://settings-frame/cookies and, for good normal maintenance's sake, delete anything you don't need. (Protip: you can probably delete everything that comes up when you search for domains containing "blog." or "blogs." or "times")

Once you've cleaned up all the low-hanging fruit,  paste this into the Developer Console:

```js
(function(){
"use strict";
var sitesMap = new Map();
var cookiesList = document.getElementById('cookies-list');
var localStorageLabel = loadTimeData.data_.cookie_local_storage;
function innerHeight(el) {
  var cStyle = getComputedStyle(el);
  function borderPixels(side) {
    return parseInt(cStyle['border' + side + 'Width'].replace(/px$/,''), 10);
  }
  return el.offsetHeight - borderPixels('Top') - borderPixels('Bottom');
}
function scrolledToBottom(el) {
  return el.scrollTop + innerHeight(el) >= el.scrollHeight;
}
var freshList = false;
function addSite(siteDiv) {
  var siteName = siteDiv.children[0].textContent;
  if (!sitesMap.has(siteName)) {
    if (freshList) {
      console.warn("Going too fast: " + siteName + " wasn't visible before");
    }
    var dataDivs = siteDiv.getElementsByClassName('cookie-data');
    var hasLocalStorage = false;
    for (var i = 0; i < dataDivs.length; i++) {
      if (dataDivs[i].textContent == localStorageLabel) {
        hasLocalStorage = true;
      }
    }
    sitesMap.set(siteName, hasLocalStorage);
  }
  freshList = false;
}
function reportSites() {
  var localStorageSites = [];
  sitesMap.forEach(function(hasLocalStorage, siteName) {
    if (hasLocalStorage) localStorageSites.push(siteName);
  });
  return console.log(JSON.stringify(localStorageSites, null, 2));
}
function readSites() {
  var siteDivs = cookiesList.querySelectorAll('li > div');
  for (var i = 0; i < siteDivs.length; i++) {
    addSite(siteDivs[i]);
  }
  freshList = true;
  if (scrolledToBottom(cookiesList)) {
    reportSites();
  }
}
cookiesList.addEventListener('scroll', readSites);
readSites();
})();
```

Then, scroll the list from top to bottom, so that every item in the list has been displayed. You can generally use any continuous "scroll down" mechanism (such as an auto-scroll by middle-clicking and moving the cursor to the bottom of the screen) and Chrome will block any scrolling faster than it can load entries in the list, but any scrolling that would *instantly jump* to a position (such as hitting the "End" key) will skip entries. You'll see a warning in the console if you appear to have jumped without loading prior entries.

(Yes, this is really the best way this can be done - for some bizarre reason, the elements for the site data are added *directly to the DOM from C++*, as far as I can tell. See [chrome/browser/ui/webui/options/cookies_view_handler.cc][] in the Chromium source tree, and the corresponding `chrome.send` calls in options_bundle.js.)

[chrome/browser/ui/webui/options/cookies_view_handler.cc]: https://chromium.googlesource.com/chromium/src/+/master/chrome/browser/ui/webui/options/cookies_view_handler.cc

After you've scrolled to the bottom, all the sites that have localStorage in use will be printed in an array to the console. Copy that array to the userscript
as the `cleanupSites` array.

Open a tab to the first domain in that array. The tab should start browsing through each domain on your list. Watch the tab.

The tab will likely stop browsing through domains several times. I recommend keeping the developer console open with "Preserve log" checked, to monitor exactly which domain was supposed to be loaded, and what happened instead.

If navigation stops (or skips) because of a redirect, you should remove the local storage for the domain that was supposed to load (as it's probably never going to load, due to the redirect), and navigate manually to the next domain. (If it skips to a domain that is later in the array, don't forget that you'll need to manually navigate back to what the next item was *going* to be before the redirect, to clean up the domains that were skipped over.)

If it's stopped because the domain failed to load (or was blocked by something like uBlock Origin), likewise, delete that domain's localStorage from the Chrome cookie settings tab you opened earlier (as it's usually an ad server), and manually navigate to the next item in the array (which will be printed in the console, if you keep "Preserve log" on).

If the autoclean stops on a proper site you trust and use regularly, and opening the console shows that the script element was blocked by the site's Content Security Policy, copy and paste the logged script directly into the console input, which should perform the cleanup and resume navigation. (If the userscript itself is disallowed, you can probably figure out how to assemble it using the script from a previous site's cleanup.)

## Conclusions

After looking at just *how much junk* has accrued trying to work around the cleanup for this (over a year or two on my desktop), I've come to one inescapable conclusion: you're better off just deleting all your local data anyway. It's 99% tracking cookies and detritus from dead domains, and you're better off without it.

## Name

The name for this userscript references the [Corexit][] oil dispersant used to clean up the Exxon Valdez and Deepwater Horizon oil spills, as, like that [toxic solution][toxicity], it is a regrettable pass at remedying a regrettable problem.

[Corexit]: https://en.wikipedia.org/wiki/Corexit
[toxicity]: https://en.wikipedia.org/wiki/Corexit#Toxicity
