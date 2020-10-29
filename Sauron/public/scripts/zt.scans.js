/*
// @name zt.scans.js
// @description Zero Tolerance scanner script for Planetarion
// @copyright moldypenguins (c) 2020
// @version 20200411
// @link https://ztpa.ca/scripts/zt.scans.js
*/

(function(w) {
  var doc = w.document;
  if (!doc) return;

  var $j;
  var page = '';
  var tick = 0;
  var globalDependencies = ['jQuery', 'get_cookie', 'get_ships_cookie', 'PA'];


  if (doc.readyState == 'complete') {
    checkDeps(true);
  } else {
    var _ev = w.addEventListener ? {add: 'addEventListener', rem: 'removeEventListener', pfx: ''} : w.attachEvent ? {add: 'attachEvent', rem: 'detachEvent', pfx: 'on'} : null;
    if(_ev) {
      doc[_ev.add](_ev.pfx + 'DOMContentLoaded', waitLoad, false);
      doc[_ev.add](_ev.pfx + 'readystatechange', waitLoad, false);
      w[_ev.add](_ev.pfx + 'load', waitLoad, false);
    } else {
      checkDeps();
    }
  }

  function waitLoad(ev) {
    ev = ev || w.event;
    if(ev.type === 'readystatechange' && doc.readyState && doc.readyState !== 'complete' && doc.readyState !== 'loaded') return;
    if(_ev) {
      doc[_ev.rem](_ev.pfx + 'DOMContentLoaded', waitLoad);
      doc[_ev.rem](_ev.pfx + 'readystatechange', waitLoad);
      w[_ev.rem](_ev.pfx + 'load', waitLoad);
      _ev = null;
      checkDeps(true);
    }
  }
  function checkDeps(loaded) {
    var remainingDeps = globalDependencies.filter(function(dep) {
      return !w[dep];
    });
    if(!remainingDeps.length) init();
    else if (loaded) console.error(remainingDeps.length+' missing userscript dependenc'+(remainingDeps.length==1?'y':'ies')+': '+remainingDeps.join(', '));
  }

  function init() {
    if($j) return;
    $j = w.jQuery;
    if(typeof w.PA != 'undefined' && 'page' in w.PA) { page = w.PA.page; }
    if(typeof w.PA != 'undefined' && 'last_tick' in w.PA) { tick = w.PA.last_tick; }
    
    if(page == 'scan' || page == 'waves') {
      var wvs = ($j('a[target="scan"]').map((id, scn) => getScanId(scn.search))).toArray();
      postScanLinks([... new Set(unique(wvs))]);
    } else if(page == 'alliance_scans') {
      var scns = ($j('a[target="wavescan"]').map((id, scn) => getScanId(scn.search))).toArray();
      postScanLinks([... new Set(unique(scns))]);
    }
  }


  function postScanLinks(scan_ids) {
    if(scan_ids.length > 0) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://ztpa.ca/parse/scans', true);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({scan_ids:scan_ids}));
    }
  }


  function unique(list) {
    var result = [];
    $j.each(list, function(i, e) {
      if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
  }

  function getScanId(search) {
    var regex = new RegExp('[\\?&]scan_id=([^&#]*)');
    var results = regex.exec(search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }


})(window);


