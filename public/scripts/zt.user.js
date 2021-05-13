/*
// @name zt.user.js
// @description Zero Tolerance user script for Planetarion
// @copyright moldypenguins (c) 2020
// @version 20201108
// @link https://ztpa.ca/scripts/zt.user.js
*/

(function (w) {
    let doc = w.document;
    if (!doc) return;

    let $j;
    let page = '';
    let view = '';
    let tick = 0;
    let globalDependencies = ['jQuery', 'get_cookie', 'get_ships_cookie', 'PA'];
    let _ev;

    if (doc.readyState.toString() === 'complete') {
        checkDeps(true);
    } else {
        _ev = w.addEventListener ? {add: 'addEventListener', rem: 'removeEventListener', pfx: ''} : w.attachEvent ? {add: 'attachEvent', rem: 'detachEvent', pfx: 'on'} : null;
        if (_ev) {
            doc[_ev.add](_ev.pfx + 'DOMContentLoaded', waitLoad, false);
            doc[_ev.add](_ev.pfx + 'readystatechange', waitLoad, false);
            w[_ev.add](_ev.pfx + 'load', waitLoad, false);
        } else {
            checkDeps();
        }
    }

    function waitLoad(ev) {
        ev = ev || w.event;
        if (ev.type === 'readystatechange' && doc.readyState && doc.readyState !== 'complete' && doc.readyState !== 'loaded') return;
        if (_ev) {
            doc[_ev.rem](_ev.pfx + 'DOMContentLoaded', waitLoad);
            doc[_ev.rem](_ev.pfx + 'readystatechange', waitLoad);
            w[_ev.rem](_ev.pfx + 'load', waitLoad);
            _ev = null;
            checkDeps(true);
        }
    }

    function checkDeps(loaded) {
        let remainingDeps = globalDependencies.filter(function (dep) {
            return !w[dep];
        });
        if (!remainingDeps.length) init(); else if (loaded) console.error(remainingDeps.length + ' missing userscript dependenc' + (remainingDeps.length == 1 ? 'y' : 'ies') + ': ' + remainingDeps.join(', '));
    }

    function init() {
        if ($j) return;
        $j = w.jQuery;
        if (typeof w.PA !== 'undefined' && 'page' in w.PA) {
            page = w.PA.page;
        }
        if (typeof w.PA !== 'undefined' && 'last_tick' in w.PA) {
            tick = w.PA.last_tick;
        }

        view = getUrlParameter('view');

        if (page != 'bcalc' && page != 'scan') {
            menu_updateMenu();
        }

        switch (page) {
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
            case 'alliance_members':
                alliance_member_addCoordButton();
                let own_coords = $('#page a:contains("' + $('#header_planet').children('span').html().match(/\d+:\d+:\d+/)[0] + '")').parent('td');
                own_coords.addClass('relations_own_member');
                own_coords.siblings().addClass('relations_own_member');
                break;
            case 'alliance_intel':
                alliance_intel_addCoordButton();
                break;
            case 'alliance_fleets':
                if (view === 'launch') {
                    alliance_fleets_launch_fillFleets();
                }
                break;
        }


    } //end init()


    function alliance_fleets_launch_fillFleets() {
        let links = $('table.tablesort tr td a');
        var cs = [];
        $.each(links, function (ind, val) {
            let fid = $(links[ind]).attr('onclick').match(/\d+/)[0];
            $(links[ind]).replaceWith(
                '<table class="fleet"><tbody>' +
                $.map(PA_dships[fid], function (f) {
                    cs.push(f.name + ': ' + f.count);
                    return '<tr><td class="ship">' + f.name + '</td><td>' + f.count + '</td></tr>';
                }).join('') +
                '<tr><td colspan="2" class="bcalc"><a href="#" onclick="set_ships_cookie(event, \'af\', \'' +  fid + '\', \'' + cs.join('\\n') + '\');">Add To Bcalc</a><span class="bcalc_links" id="bcalc_link_' + fid + '"></span><br><span class="bcalc_target" id="bcalc_target_' + fid + '"></span></td></tr>' +
                '</tbody></table>'
            );
        });
    }


    function fleets_addLocalTime() {
        $j.each($j('tr td.mission_attack:contains("Arrival:")'), function (ind, obj) {
            var today = new Date();
            today.setHours(today.getHours() + eval($j(obj).html().match(/^[\d\+\s]*/g)[0]));
            $j(obj).html($j(obj).html().replace(/(.*)<br>(Arrival: \d+)(<br>.*)/g, '$1<br>$2 (' + today.getHours() + ':00)$3'));
        });
    }

    function galaxy_addNameToIntel() {
        $j.each($j('table#galtable tbody tr td:last-child'), function (ind, obj) {
            $j(obj).children('a').first().append($j(obj).children('a').first().attr('onclick').replace(/.*?\(([^)]*)\).*?/g, '$1').split(',')[5].trim().replace(/.*?\'([^)]*)\'.*?/g, '$1').length <= 0 ? '' : '&nbsp;-&nbsp;<span>' + $j(obj).children('a').first().attr('onclick').replace(/.*?\(([^)]*)\).*?/g, '$1').split(',')[5].trim().replace(/.*?\'([^)]*)\'.*?/g, '$1') + '</span>')
        })
    }

    function scan_addFleetMissionColours() {
        var currETA = 0;
        var currStyle = 'fleet_alt';
        $j.each($j('table').children('tbody').children('tr:not(:first)'), function (ind, obj) {
            if ($j(obj).children('td').length > 3) {
                if (parseInt($j(obj).children('td')[3].innerText) == currETA) {
                    $j(obj).addClass(currStyle);
                } else {
                    if(ind !== 0) {$('<tr><td style="line-height:10px;" colspan="' + $j(obj).children('td').length + '">&nbsp;</td></tr>').insertBefore(obj);}
                    currETA = parseInt($j(obj).children('td')[3].innerText);
                    currStyle = currStyle == '' ? 'fleet_alt' : '';
                    $j(obj).addClass(currStyle);
                }
                currETA = parseInt($j(obj).children('td')[3].innerText);
                if ($j(obj).children('td').length > 0) {
                    switch ($j(obj).children('td')[1].innerText) {
                        case 'Attack':
                            $j(obj).children('td').addClass('mission_attack');
                            break;
                        case 'Defend':
                            $j(obj).children('td').addClass('mission_defend');
                            break;
                        case 'Return':
                            $j(obj).children('td').addClass('mission_return');
                            break;
                    }
                }
            }
        });
    }

    function menu_updateMenu() {
        //Add Remaining Ticks
        /*
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
        */
        doc.querySelector('div#header_tick span.textlabel').innerHTML += ' | Left';
        let remain = ((w.PA.round_end - w.PA.round_start) / (60 * 60 * 1000)) - w.PA.last_tick;
        doc.querySelector('div#header_tick span.textvalue').innerHTML += ' | ' +  remain;

        //addAllianceLinks
        let rand = Math.floor((Math.random() * 9999999999) + 1000000000);
        $j('#menu_alliance').append('<ul>' + '<li><a href="alliance_fund.pl?rn=' + rand + '">Fund</a></li>' + '<li><a href="alliance_attacks.pl?rn=' + rand + '">Attacks</a></li>' + '<li><a href="alliance_defence.pl?rn=' + rand + '">Defence</a></li>' + '<li><a href="alliance_fleets.pl?rn=' + rand + '">Fleets</a></li>' + '<li><a href="alliance_messages.pl?rn=' + rand + '">Messages</a></li>' + '<li><a href="alliance_scans.pl?rn=' + rand + '">Scans</a></li>' + '<li><a href="alliance_intel.pl?rn=' + rand + '">Intel</a></li>' + '<li><a href="alliance_members.pl?rn=' + rand + '&order=cscore">Members</a></li>' + '</ul>');
    }

    function overview_updateQuests() {
        var cats = [1, 2, 3, 4, 5, 6, 7, 13, 10, 9, 11];

        //add show completed link
        var qLink = doc.createElement('A');
        qLink.id = 'quest_system_showhide_completed';
        qLink.className = 'show_hide'
        qLink.href = '#';
        qLink.text = '[Show Completed]';
        $j(qLink).click(function (ev) {
            ev.preventDefault();
            //var cats = $j('div#quest_system div.section_information').length + 1;
            for (var cat in cats) {
                $j.each($j('tr#quests_in_category' + cats[cat] + ' td table tr'), function (k, v) {
                    if ($j(v).find('span.completed').length > 0) {
                        if ($j('a#quest_system_showhide_completed').text() == '[Show Completed]') {
                            //show completed quests
                            $j(v).show();
                        } else {
                            //hide completed quests
                            $j(v).hide();
                        }
                    }
                });
            }
            if ($j('a#quest_system_showhide_completed').text() == '[Show Completed]') {
                $j('a#quest_system_showhide_completed').text('[Hide Completed]');
            } else {
                $j('a#quest_system_showhide_completed').text('[Show Completed]');
            }
        });
        $j('div#quest_system div.header').append('&nbsp;').append(qLink);

        //add xp next to categories
        $j.each($j('div#quest_system div.section_information'), function (k, v) {
            $j(v).find('span.questionmark').remove();
            if (typeof ($j(v).parent().prev().find('div.progress_value').html()) != 'undefined' && !$j(v).parent().prev().find('div.progress_value').html().includes('100%')) {
                $j(v).html($j(v).find('div.info_contents span.superhighlight').text());
            }
            $j(v).addClass('nowrap');
            $j(v).parent().removeClass('center').addClass('right');
        });
        //iterate through quest categories
        //var cats = $j('div#quest_system div.section_information').length + 1;
        for (var cat in cats) {
            $j.each($j('tr#quests_in_category' + cats[cat] + ' td table tr'), function (k, v) {
                $j(v).children('td').first().css('padding-left', '20px');
                $j(v).children('td').first().children('span').remove();
                //add reward next to quest
                var reward = $j(v).find('td p:last span.superhighlight').html();
                var td = doc.createElement("TD");
                td.className = 'right';
                td.style.fontSize = '0.9em';
                if (reward) {
                    var span = doc.createElement("SPAN");
                    span.className = 'questReward';
                    span.append(doc.createTextNode(reward
                        .replace('Gain ', '')
                        .replace(' Bonus', '')
                        .replace('Construction Unit', 'CU')
                        .replace('Research Point', 'RP')
                        .replace('of each asteroid type', 'Each Roids')
                        .replace('of each resource', 'Each Res')));
                    td.append(span);
                }
                $j(v).prev().children('td:last').after(td);
                if ($j(v).find('span.completed').length > 0) {
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


function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
