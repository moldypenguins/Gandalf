/*
// @name zt.user.js
// @description Zero Tolerance user script for Planetarion
// @copyright moldypenguins (c) 2020
// @version 20201108
// @link https://ztpa.ca/scripts/zt.user.js
*/

(function(w) {
  var doc = w.document;
  if (!doc) return;

  var $j;
  var page = '';
  var view = '';
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
    
    view = getUrlParameter('view');
    
    if(page == 'scan' || page == 'waves') {
      var wvs = ($j('a[target="scan"]').map((id, scn) => getScanId(scn.search))).toArray();
      postScanLinks([... new Set(unique(wvs))]);
    } else if(page == 'alliance_scans') {
      var scns = ($j('a[target="wavescan"]').map((id, scn) => getScanId(scn.search))).toArray();
      postScanLinks([... new Set(unique(scns))]);
      initAllianceScanRequests();
    }
    
    if(page != 'bcalc' && page != 'scan') {
      menu_updateMenu();
    }
    
    switch(page) {
      case 'overview':
        overview_updateQuests();
        break;
      case 'galaxy':
        galaxy_addNameToIntel();
        break;
      case 'scan':
        scan_addFleetMissionColours();
        break;
      case 'fleets':
        fleets_addLocalTime();
        break;
    }
    
    
    
  } //end init()
  
  
  
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
  
  function fleets_addLocalTime() {
    $j.each($j('tr td.mission_attack:contains("Arrival:")'), function(ind, obj) {
      var today = new Date();
      today.setHours(today.getHours() + eval($j(obj).html().match(/^[\d\+\s]*/g)[0]));
      $j(obj).html($j(obj).html().replace(/(.*)<br>(Arrival: \d+)(<br>.*)/g, '$1<br>$2 (' + today.getHours() + ':00)$3'));
    });
  }
  
  function galaxy_addNameToIntel() {
    $j.each($j('table#galtable tbody tr td:last-child'), function(ind, obj) {$j(obj).children('a').first().append($j(obj).children('a').first().attr('onclick').replace(/.*?\(([^)]*)\).*?/g, '$1').split(',')[5].trim().replace(/.*?\'([^)]*)\'.*?/g,'$1').length <= 0 ? '' : '&nbsp;-&nbsp;<span>' + $j(obj).children('a').first().attr('onclick').replace(/.*?\(([^)]*)\).*?/g, '$1').split(',')[5].trim().replace(/.*?\'([^)]*)\'.*?/g,'$1') + '</span>')})
  }
  
  function scan_addFleetMissionColours() {
    var currETA = 0;
    var currStyle = 'fleet_alt';
    $j.each($j('table').children('tbody').children('tr:not(:first)'), function(ind, obj) {
      if($j(obj).children('td').length > 3) {
        if(parseInt($j(obj).children('td')[3].innerText) == currETA) {
          $j(obj).addClass(currStyle);
        } else {
          currETA = parseInt($j(obj).children('td')[3].innerText);
          currStyle = currStyle == '' ? 'fleet_alt' : '';
          $j(obj).addClass(currStyle);
        }
        currETA = parseInt($j(obj).children('td')[3].innerText);
        if($j(obj).children('td').length > 0) {
          switch($j(obj).children('td')[1].innerText) {
            case 'Attack':
              $j(obj).children('td:not(:first)').addClass('attack');
              break;
            case 'Defend':
              $j(obj).children('td:not(:first)').addClass('defend');
              break;
          }
        }
      }
    });
  }
  
  function menu_updateMenu() {
    //Add Remaining Ticks
    var rTicksDiv = doc.createElement("DIV");
    rTicksDiv.id = 'header_remaining';
    rTicksDiv.appendChild(doc.getElementById('header_tick').childNodes[0].cloneNode());
    var rTicksLabel = doc.createElement('SPAN');
    rTicksLabel.className = 'textlabel';
    rTicksLabel.appendChild(doc.createTextNode("Remaining"));
    rTicksDiv.appendChild(rTicksLabel);
    rTicksDiv.appendChild(doc.getElementById('header_tick').childNodes[2].cloneNode());
    var rTicksValue = doc.createElement('SPAN');
    rTicksValue.className = 'textvalue';
    rTicksValue.appendChild(doc.createTextNode(1177 - w.PA.last_tick));
    rTicksDiv.appendChild(rTicksValue);
    rTicksDiv.appendChild(doc.getElementById('header_tick').childNodes[4].cloneNode());
    doc.getElementById('header').insertBefore(rTicksDiv, doc.getElementById('header_metal'));

    //addAllianceLinks
    var rand = Math.floor((Math.random() * 9999999999) + 1000000000);
    $j('#menu_alliance').append('<ul>' +
      '<li><a href="alliance_fund.pl?rn=' + rand + '">Fund</a></li>' +
      '<li><a href="alliance_attacks.pl?rn=' + rand + '">Attacks</a></li>' +
      '<li><a href="alliance_defence.pl?rn=' + rand + '">Defence</a></li>' +
      '<li><a href="alliance_fleets.pl?rn=' + rand + '">Fleets</a></li>' +
      '<li><a href="alliance_messages.pl?rn=' + rand + '">Messages</a></li>' +
      '<li><a href="alliance_scans.pl?rn=' + rand + '">Scans</a></li>' +
      '<li><a href="alliance_intel.pl?rn=' + rand + '">Intel</a></li>' +
      '<li><a href="alliance_members.pl?rn=' + rand + '&order=cscore">Members</a></li>' +
    '</ul>');
  }
  
  function overview_updateQuests() {
    var cats = [1,2,3,4,5,6,7,13,10,9,11];
    
    //add show completed link
    var qLink = doc.createElement('A');
    qLink.id = 'quest_system_showhide_completed';
    qLink.className = 'show_hide'
    qLink.href = '#';
    qLink.text = '[Show Completed]';
    $j(qLink).click(function(ev) {
      ev.preventDefault();
      //var cats = $j('div#quest_system div.section_information').length + 1;
      for(var cat in cats) {
        $j.each($j('tr#quests_in_category' + cats[cat] + ' td table tr'), function(k, v) {
          if($j(v).find('span.completed').length > 0) {
            if($j('a#quest_system_showhide_completed').text() == '[Show Completed]') {
              //show completed quests
              $j(v).show();
            }
            else
            {
              //hide completed quests
              $j(v).hide();
            }
          }
        });
      }
      if($j('a#quest_system_showhide_completed').text() == '[Show Completed]') {
        $j('a#quest_system_showhide_completed').text('[Hide Completed]');
      }
      else
      {
        $j('a#quest_system_showhide_completed').text('[Show Completed]');
      }
    });
    $j('div#quest_system div.header').append('&nbsp;').append(qLink);

    //add xp next to categories
    $j.each($j('div#quest_system div.section_information'), function(k, v) {
      $j(v).find('span.questionmark').remove();
      if(typeof($j(v).parent().prev().find('div.progress_value').html()) != 'undefined' && !$j(v).parent().prev().find('div.progress_value').html().includes('100%')) {
        $j(v).html($j(v).find('div.info_contents span.superhighlight').text());
      }
      $j(v).addClass('nowrap');
      $j(v).parent().removeClass('center').addClass('right');
    });
    //iterate through quest categories
    //var cats = $j('div#quest_system div.section_information').length + 1;
    for(var cat in cats) {
      $j.each($j('tr#quests_in_category' + cats[cat] + ' td table tr'), function(k, v) {
        $j(v).children('td').first().css('padding-left', '20px');
        $j(v).children('td').first().children('span').remove();
        //add reward next to quest
        var reward = $j(v).find('td p:last span.superhighlight').html();
        var td = doc.createElement("TD");
        td.className = 'right';
        td.style.fontSize = '0.9em';
        if(reward) {
          var span = doc.createElement("SPAN");
          span.className = 'questReward';
          span.append(
            doc.createTextNode(
              reward
                .replace('Gain ', '')
                .replace(' Bonus', '')
                .replace('Construction Unit', 'CU')
                .replace('Research Point', 'RP')
                .replace('of each asteroid type', 'Each Roids')
                .replace('of each resource', 'Each Res')
            )
          );
          td.append(span);
        }
        $j(v).prev().children('td:last').after(td);
        if($j(v).find('span.completed').length > 0) {
          //hide completed quests
          $j(v).hide();
        }
      });
    }
    //fix width
    $j($j('#quest_system div.maintext table').find('tr').first().children('th')[0]).css('width', '15%');
    $j($j('#quest_system div.maintext table').find('tr').first().children('th')[2]).css('width', '25%');
    $j($j('#quest_system div.maintext table').find('tr').first().children('th')[3]).css('width', '8%');
    $j($j('#quest_system div.maintext table').find('tr').first().children('th')[4]).css('width', '15%');
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


  
  
})(window);




function getScanId(search) {
  var regex = new RegExp('[\\?&]scan_id=([^&#]*)');
  var results = regex.exec(search);
  return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
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
        postScanLinks([scanId], function() {
          sleepFor(2000);
        });
      }
      initAllianceScanRequests();
    }
  };
}
