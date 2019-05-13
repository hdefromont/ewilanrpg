// ==UserScript==
// @name         Ewilan RPG - Validation de Personnage
// @namespace    http://ewilanrpg.forumactif.com/
// @version      0.1b
// @description  Ajoute les boutons de raccourcis qui permettent de valider un personnage.
// @updateURL    https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/character-sheet.user.js
// @downloadURL  https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/character-sheet.user.js
// @author       Hélène de Fromont
// @match        http://sanctuary.forumactif.com/t*
// @match        http://ewilanrpg.forumactif.com/t*
// @resource     header https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/templates/character-sheet/header.html
// @resource     message-archive https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/templates/character-sheet/message-archive.html
// @resource     message-inactive https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/templates/character-sheet/message-inactive.html
// @resource     message-validated https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/templates/character-sheet/message-validated.html
// @resource     message-welcome https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/templates/character-sheet/message-welcome.html
// @resource     style https://github.com/hdefromont/ewilanrpg/raw/master/userscripts/styles/character-sheet.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
	'use strict';

	var retrieveCharacterData = function(post) {
		var profile = $(post).find(".post-author-name a").attr("href");

		var data = {
			metiers: [],
			profil: profile
		};

		var perso = $(post).find("character").first();
		$(perso).find(".data").each(function() {
			var name = $(this).data("form");
			var value = $(this).text();

			if(name === "metier") {
				var metier = {
					id: $(this).data("metier"),
					value: value
				};
				data.metiers.push(metier);
			} else if(name === "genre") {
				var more = value;
				if(value !== "Femme" && value !== "Homme") {
					value = "Autre";
				}
				data[name] = {value: value, more: more};
			} else if(name === "type") {
				data[name] = value;
				data.lien = $(this).data("lien");
			} else {
				data[name] = value;
			}
		});

		console.log(data);
		return data;
	};

	var generateString = function() {
		var post = $(this).parents(".post-wrap");
		var data = retrieveCharacterData(post);

		var text = data.nom + "	" + data.prenom + "	" + data.genre.value + "	" + data.groupe + "	" + data.type + "	";

		if(data.type === "Scénario") {
			text += "Pris";
		} else {
			text += "	";
		}

		text += "	" + data.profil + "	" + data.lien;

		data.metiers.forEach(function(element) {
			text += "	" + element.id;
		});

		//text.select();
		//document.execCommand("copy");

		GM_setClipboard(text, "text");
		console.log(text);
	};

	var countWords = function() {
		$("block[data-form]").each(function() {
			var count = $(this).text().replace(/\[.*?\]/g," ").replace(/<.*?>/g," ").replace(/[\x00-\x40\x5b-\x60\x7b-\x7e]/g," ").split(" ").length;
			var wordcount = "<div class='wordcount' data-count='" + count + "'><i class='material-icons'></i>" + count + " mots</div>";
			$(this).append(wordcount);

			switch($(this).data("form")) {
				case "caractere":
				case "physique":
					if(count >= 300) {
						$(this).find(".wordcount").addClass("valid");
					}
					break;
				case "histoire":
					if(count >= 500) {
						$(this).find(".wordcount").addClass("valid");
					}
					break;
			}
		});
	};

	var nbReason = 0;

	var addReason = function() {
		nbReason += 1;

		var reason = '<li class="form-group"><textarea class="form-control" rows="3" name="other-' + nbReason + '" id="other-' + nbReason + '" placeholder="Raison n°' + nbReason + '"></textarea></li>';

		$("#rejectReasons").find("ol").append(reason);
	}

	var removeReason = function() {
		$("#rejectReasons").find("li").last().detach();
		nbReason -= 1;
	}

	if($(".character").length > 0) {
		var firstPost = $(".post").has(".character");
		var username = $(firstPost).find(".post-author-name").text();
		var groupId = $(firstPost).find(".data[data-form='groupe']").data("group");

		var modButtons = GM_getResourceText("header");
		$(firstPost).find(".post-body").prepend(modButtons);
		
		var customStyle = GM_getResourceText("style");
		GM_addStyle(customStyle);

		$("#listing").click(generateString);

		// Fiche Correcte à Valider
		$("#validate").click(function() {
			addToGroup(username, FA.Group[groupId]);
			moveTopic(FA.Post.getTopicInfos(), FA.Group[groupId].forum);

			var message = GM_getResourceText("message-validated").replace("{USERNAME}", username).replace("{MESSAGE}", message);
			FA.Post.postReply(FA.Post.getTopicInfos(), message);
		});

		// Message de Bienvenue
		$("#welcome").click(function() {
			var message = GM_getResourceText("message-welcome").replace("{USERNAME}", username).replace("{MESSAGE}", message);
			FA.Post.postReply(FA.Post.getTopicInfos(), message);
		});

		// Message pour demander des Nouvelles
		$("#news").click(function() {
			var message = GM_getResourceText("message-inactive").replace("{USERNAME}", username);
			FA.Post.postReply(FA.Post.getTopicInfos(), message);
		});

		// Message pour archiver
		$("#archive").click(function() {
			console.log("archive");
			
			var message = GM_getResourceText("message-archive");
			FA.Post.moveTopic(FA.Post.getTopicInfos(), FA.Archive.auberges.personnages);
			FA.Post.postReply(FA.Post.getTopicInfos(), message);
		});

		// Message pour demander des modifications
		$("#reject").click(function() {
			console.log("reject");
			
			var message = "";
			FA.Post.postReply(FA.Post.getTopicInfos(), message);
		});

		countWords();
	}
})();
