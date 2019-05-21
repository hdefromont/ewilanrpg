// ==UserScript==
// @name         Ewilan RPG - Activité des Partenaires
// @namespace    http://ewilanrpg.forumactif.com/
// @version      0.0a
// @description  Ajoute la description dans les sujets de partenariats pour vérifier l'activité des partenaires rapidement.
// @updateURL    https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/partner-management.user.js
// @downloadURL  https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/partner-management.user.js
// @author       Hélène de Fromont
// @match        http://sanctuary.forumactif.com/f34-*
// @match        http://ewilanrpg.forumactif.com/f34-*
// @resource     header https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/templates/character-sheet/header.html
// @resource     style https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/styles/partner-management.css
// @grant        GM_addStyle

// ==/UserScript==

(function() {
	'use strict';

    var parsePartnersSheet = function(rows) {
			var data = [];

			rows.forEach(function(row) {
				var cells = row.cells;
				data[cells.sheet] = {
                    name: cells.name,
                    link: cells.link
                };
			});

            console.log(data);
			return data;
		};

    var getPostId = function(partner) {
        var url = $(partner).find("h3").children("a").first().attr("href");
        return Number.parseInt(url.split("/")[1].split("-")[0].replace("t", ""));
    };

    var addDescription = function(partnersList) {
        var retrieveRSSData = function(partner, url) {
            var settings = {
                url: url + 'feed/',
                success: function(data) {
                    console.log(data);
                    var items = $(data).find("item");
                    console.log(items);
                    var date = new Date($(items).first().children("pubDate").first().html());
                    console.log("date: " + date);
                    $(partner).find("h3").after('<span class="topic-description"><div class="btn" title="Date du 25ème dernier message"><i class="material-icons">clock</i> ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + '</div></span>');
                }
            };

            $.post(settings);
        };

        var partners = $(".posts-main").last().find(".posts-section");
        $(partners).each(function(index) {
            var id = getPostId(this);
            retrieveRSSData(this, partnersList[id].link);
        });
    };

    $(document).sheetrock({
        url: EwilanRPG.getSpreadSheet("partners"),
        query: "select B, C, E order by D, B asc",
        callback: function (error, options, response) {
            console.log("loadPartnersList");
            console.log(response);

            var partnersList = parsePartnersSheet(response.rows);
            addDescription(partnersList);
        },
        labels: ["name", "link", "sheet"],
        reset: true
    });

})();
