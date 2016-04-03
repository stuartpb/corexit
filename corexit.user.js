// ==UserScript==
// @name         Corexit
// @version      0.1
// @description  Clean up a disaster
// @author  Stuart P. Bentley <stuart@testtrack4.com> (https://stuartpb.com)
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

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
