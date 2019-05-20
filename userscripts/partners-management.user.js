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

  var partners = $(".posts-main").last().find(".posts-section");
	console.log(partners);
	
	$(partners).each(function() {
		$(this).find("h3").after('<span class="topic-description">#Syane - Added by userscript.</span>');
	});

})();
