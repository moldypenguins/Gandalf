/*
// @name zt.scans.js
// @description Zero Tolerance scanner script for Planetarion
// @copyright moldypenguins (c) 2020
// @version 20201108
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
      initAllianceScanRequests();
    }

    switch (page) {
      case 'alliance_members':
        alliance_member_addCoordButton();
        break;
      case 'alliance_intel':
        alliance_intel_addCoordButton();
        break;
    }
  }


  function unique(list) {
    var result = [];
    $j.each(list, function(i, e) {
      if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
  }


  function initAllianceScanRequests() {
    try {
      $j('#botscans').remove();
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://ztpa.ca/scans/requests', true);
      xhr.withCredentials = true;
      xhr.send();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          var data = JSON.parse(xhr.responseText);console.log(data);
          $j('#tab2').prepend('<div class="container" id="botscans"><div class="header">Bot Scan Requests</div><div class="maintext"><table id="scans"><thead><th>Coords</th><th>Type</th><th>Dists</th><th></th></thead>');
          $j.each(data, function(index, request) {
            console.log(data[index]);
            var dists = data[index].dists || 'Unknown';
            var x = data[index].x;
            var y = data[index].y;
            var z = data[index].z;
            var type = data[index].scantype;
            var id = data[index]._id;
            $j('#scans').append('<tr><td class="center">' + x + ':' + y + ':' + z + '</td><td class="center">' + scanTypeToDisplay(type) + '</td><td>' + dists + '</td><td class="center"><input id="buttonscan' + index + '" type="submit" value="Submit"></input></td></tr>');
            $j('#buttonscan' + index).click({x:x, y:y, z:z, type:type, id:id}, attemptScan);
          });
          $j('#scans').append('</table></div><div class="footer"</div></div>');
        }
      }
    } catch(err) {
      
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
    
  function attemptScan(data) {
    var urlRandomizer = Math.floor((Math.random() * 9999999999) + 1000000000);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://game.planetarion.com/waves.pl?rn=' + urlRandomizer, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("action=single_scan&scan_type=" + data.data.type + "&scan_x=" + data.data.x + "&scan_y=" + data.data.y + "&scan_z=" + data.data.z);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        if (xhr.responseText.indexOf("Invalid coords and/or scantype.") !== -1) {
          alert("Invalid coords or scan type! Removing scan request!");
          var reject = new XMLHttpRequest();
          reject.open('POST', 'https://ztpa.ca/parse/reject', true);
          reject.setRequestHeader("Content-Type", "application/json");
          reject.send(JSON.stringify({id:data.data.id}));
        } else if (xhr.responseText.indexOf("planet is too protected") !== -1) {
          alert("Too many dists for you!");
        } else if (xhr.responseText.indexOf("You can't scan before ticks start") !== -1) {
          alert("Scans arent allowed before tick dummy!");
        } else if (xhr.responseText.indexOf("The target planet is too well protected against scans, and you need more Wave Amplifiers to successfully scan") !== -1) {
          alert("The target planet is too well protected against scans, and you need more Wave Amplifiers to successfully scan.");
        } else {
          var startText = "load('', 'show_scan', 'showscan.pl?scan_id=";
          var endText = "&inc=1')";
          var startIndex = xhr.responseText.indexOf(startText)+startText.length;
          var endIndex = xhr.responseText.indexOf(endText);
          var scanId = xhr.responseText.substring(startIndex, endIndex);
          postScanLinks([scanId]);
          sleepFor(2000);
        }
        initAllianceScanRequests();
      }
    };
  }

  function alliance_intel_addCoordButton() {
    $j('#contents_footer').append('<input id="coordList" type="submit" value="Get Coord List"></input>');
    $j('#coordList').click(listIntelCoords);
  }

  function alliance_member_addCoordButton() {
    $j('#contents_footer').append('<input id="coordList" type="submit" value="Get Coord List"></input>');
    $j('#coordList').click(listMemberCoords);
  }

  function listMemberCoords() {
    coordsList($j('table tbody tr td:nth-child(5) a'));
  }

  function listIntelCoords() {
    coordsList($j('table tbody tr td:nth-child(1) a'), true);
  }

  function coordsList(selector, skip_first) {
    var coords = "";
    $j.each(selector, function(ind, obj) {
      if (ind == 0 && skip_first) {
      } else {
        coords += $j(obj).text() + " ";
      }
    });
    $j('#contents_footer').append('<textarea id="js-copytextarea">' + coords + '</textarea>');
    $j('#js-copytextarea').focus();
    $j('#js-copytextarea').select();
    document.execCommand('copy');
    $j('#js-copytextarea').remove();
    alert('Copied coords to clipboard, paste to use.');
  }

})(window);


function getScanId(search) {
  var regex = new RegExp('[\\?&]scan_id=([^&#]*)');
  var results = regex.exec(search);
  return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function sleepFor(sleepDuration) {
  var now = new Date().getTime();
  while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
}

function scanTypeToDisplay(number) {
  switch (number) {
    case 1:
      return "Planet Scan";
    case 2:
      return "Landing Scan";
    case 3:
      return "Development Scan";
    case 4:
      return "Unit Scan";
    case 5:
      return "News Scan";
    case 6:
      return "Incoming Scan";
    default:
    case 7:
      return "Jumpgate Scan";
    case 8:
      return "Advanced Unit Scan";
  }
}


