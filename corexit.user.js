// ==UserScript==
// @name         Corexit
// @version      0.2.0
// @description  Clean up a disaster
// @author  Stuart P. Bentley <s@stuartpb.com> (https://stuartpb.com)
// @license      sandia-wtfpl
// @match        *://*/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/*
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
*/

/* global GM_getValue GM_setValue location */

(function() {
'use strict';

// Paste the list of sites to clean up here
var cleanupSites = [];

//////////////////////////////////////////////////////////////////////////////
// Cleanup code

var currentDomainInCleanupSites = cleanupSites.indexOf(location.hostname);

var next;
var nextDomain = 'nonexistent';

function cleanup() {
  var cleanupScript =
    "localStorage.removeItem('ipirat_isInstalled');" +
    "location.href="+JSON.stringify('http://' + nextDomain +'/')+";";
  var cleanupElement = document.createElement('script');
  cleanupElement.textContent = cleanupScript;
  GM_setValue('corexit_cleaned_' + location.hostname, true);
  GM_setValue('corexit_nextdomain', nextDomain);
  console.log('// Trying to clean up '+location.host+':\n' +
    cleanupScript + '\n' + '// After next: ' +
      cleanupSites[currentDomainInCleanupSites + next + 1]);
  document.head.appendChild(cleanupElement);
}

if (currentDomainInCleanupSites > -1) {
  var cleaned = GM_getValue('corexit_cleaned_'+location.hostname);
  next = 1;
  nextDomain = cleanupSites[currentDomainInCleanupSites+1];
  while (GM_getValue('corexit_cleaned_'+nextDomain) &&
    next < cleanupSites.length) {
    ++next;
    if (next < cleanupSites.length) {
      nextDomain = cleanupSites[currentDomainInCleanupSites+next];
    }
  }

  if (cleaned) {
    console.log(location.hostname + ' has been cleaned: next unclean is ' +
      nextDomain);
  } else {
    cleanup();
  }
} else {
  console.log(location.hostname + ' not dirty: last destination was ' +
    GM_getValue('corexit_nextdomain'));
}
})();
