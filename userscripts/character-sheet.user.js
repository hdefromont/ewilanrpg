// ==UserScript==
// @name         Validation de Personnage
// @namespace    http://sanctuary.forumactif.com/
// @version      0.1
// @description  Ajoute les boutons de raccourcis qui permettent de valider un personnage.
// @updateURL    https://raw.githubusercontent.com/hdefromont/ewilanrpg/master/userscripts/character-sheet.js
// @downloadURL  https://raw.githubusercontent.com/hdefromont/ewilanrpg/master/userscripts/character-sheet.js
// @author       Hélène de Fromont
// @match        http://sanctuary.forumactif.com/t*
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

        var perso = $(post).find("perso").first();
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

    if($(".perso").length > 0) {
        var firstPost = $(".post-wrap").has(".perso");
        var username = $(firstPost).find(".post-author-name").text();
        var groupId = $(firstPost).find(".data[data-form='groupe']").data("group");

        var modButtons = "<div class='mod-buttons' style='text-align:center;margin-bottom:16px;max-width:500px'></div>";

        var welcome = "<div class='dropdown' style='display:inline'><button class='btn btn-default dropdown-toggle' id='reply' style='margin:2.5px' type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><i class='material-icons'>reply</i> Répondre</a><div class='dropdown-menu' aria-labelledby='reply'><a class='dropdown-item' id='welcome'>Message de Bienvenue</a><a class='dropdown-item' id='news'>Demander des Nouvelles ?</a><a class='dropdown-item' id='archive'>Archiver</a></div></div>";
        var reject = "<button class='btn btn-default btn-red' id='reject' style='margin:2.5px'><i class='material-icons'>block</i> Rejeter</a>";
        var validate = "<button class='btn btn-default btn-green' id='validate' style='margin:2.5px'><i class='material-icons'>check</i> Valider</a>";
        var list = "<button class='btn btn-default' id='listing' style='margin:2.5px'><i class='material-icons'>list</i> Ajouter aux Listes</button>";

        var addData = '<hr style="margin-bottom:5px"/><form class="flex" style="padding:5px;text-align:left"><div class="form-group" style="flex:1;margin-bottom:unset"><label for="bienvenue">Souhaiter la bienvenue :</label><textarea class="form-control" rows="3" name="bienvenue" id="bienvenue" placeholder="Message personnalisé..."></textarea></div><button class="btn btn-default" type="submit" style="height:86px;margin-left:5px;margin-top:31px"><i class="material-icons" style="margin:-4px">send</i></button></form>';

        var rejectReasons = '<hr style="margin-bottom:5px"/><form style="padding:5px;text-align:left" id="rejectReasons"><div class="form-group"><label for="message">Message personnalisé :</label><textarea class="form-control" rows="3" name="message" id="message" placeholder="Message personnalisé..."></textarea></div><div class="form-group"><label for="reasons">Ce qu\'il faut corriger :</label><div class="form-check"><input class="form-check-input" type="checkbox" name="reasons" id="sizeAvatar" value="sizeAvatar" /><label class="form-check-label" for="sizeAvatar">La taille de l\'avatar est incorrecte.</label></div><div class="form-check"><input class="form-check-input" type="checkbox" name="reasons" id="pseudo" value="pseudo" /><label class="form-check-label" for="pseudo">Le pseudo est incorrect.</label></div><div class="form-check"><input class="form-check-input" type="checkbox" name="reasons" id="wordCount" value="wordCount" /><label class="form-check-label" for="wordCount">Les descriptions sont trop courtes.</label></div><div class="form-check"><input class="form-check-input" type="checkbox" name="reasons" id="typeAvatar" value="typeAvatar" /><label class="form-check-label" for="typeAvatar">L\'avatar n\'est pas dessiné.</label></div></div><div class="form-group"><label for="other">Autres corrections nécessaires :</label><br/><button class="btn btn-default" onclick="addReason()" style="margin:5px"><i class="material-icons" style="margin:-4px">add</i></button><button class="btn btn-default" onclick="removeReason()" style="margin:5px"><i class="material-icons" style="margin:-4px">remove</i></button></div><ol></ol></form>';

        $(firstPost).find(".post-content").prepend(modButtons);
        $(".mod-buttons").append(welcome)
            .append(validate)
            .append(reject)
            .append(list)
            .append(addData)
            .append(rejectReasons);

        $("#listing").click(generateString);
        $("#validate").click(function() {
            addToGroup(username, EwilanRPG.groups[groupId]);
            moveTopic(EwilanRPG.getTopicInfos(), EwilanRPG.groups[groupId].forum);

            var message = '<fiche><titre>Bienvenue en Gwendalavir</titre><content><block>Cette fiche est officiellement [b]validée[/b], félicitations !<br/><br/>Message personnalisé.</block><block>N\'hésite pas à faire ton <a href="/f39-journaux-de-personnages" target="_blank">journal de personnage</a>. Tu peux également faire une <a href="/t2264-rp-demande" target="_blank">demande de RP</a> et une <a href="/t2262-liens-demande target="_blank">demande de lien</a>.<br/><br/>Enfin, tu peux allez jeter un œil aux <a href="/f53-quetes target="_blank">quêtes</a> en cours !</block><block>Nous restons à ta disposition pour toutes demandes ou questions. Une fois encore bienvenue parmi nous et bon jeu !</block></content></fiche>';
            postReply(EwilanRPG.getTopicInfos(), message);
        });

        // Message de Bienvenue
        $("#welcome").click(function() {
            var message = '<fiche><titre>Bienvenue en Gwendalavir</titre><content><block>Bienvenue sur le forum, @"' + username + '" !<br/><br/>Message personnalisé.</block><block>Je t\'invite à consulter <a href="/f38-encyclopedie" target="_blank">l\'Encyclopédie</a> si tu as des questions sur l\'univers de Gwendalavir.<br/><br/>Tu peux également aller jeter un œil au <a href="/t2066-guide-du-nouveau-joueur" target="_blank">Guide du Nouveau Joueur</a> pour t\'aider à bien débuter sur le forum et construire ta fiche. Tu peux aussi aller faire une <a href="/t2260-parrainage-gestion" target="_blank">demande de parrainage</a> si tu en ressens le besoin.<br/><br/>Lorsque tu as terminé, tu dois passer par <a href="/t2261-fiche-terminee-passage-obligatoire">ce sujet</a> pour nous le signaler. Cela nous permet de te recenser plus facilement.</block><block><icon><i class="material-icons">forum</i></icon>Nous n\'avons pas de ChatBox, mais tu peux nous rejoindre sur <a href="https://discord.gg/nG4wy3r" target="_blank">Discord</a>. Pense à inclure au minimum le prénom de ton personnage dans ton pseudo Discord car c\'est obligatoire !</block><block><icon><i class="material-icons">help</i></icon>N\'hésite pas à poser tes questions dans la section des <a href="/f37-questions-et-idees" target="_blank">Questions</a> ou dans le salon [b]#questions[/b] sur Discord. Privilégie ces moyens pour une réponse rapide !</block><block>Bon courage pour la rédaction de ta fiche.</block></content></fiche>';
            postReply(EwilanRPG.getTopicInfos(), message);
        });

        // Message pour demander des Nouvelles
        $("#news").click(function() {
        	var message = '<fiche><titre>Des Nouvelles ?</titre><content><block>Coucou @"' + username + '" !<br/><br/>Cela fait déjà deux semaines que tu as posté cette fiche et nous n\'avons pas de nouvelles. Nous te donnons un délai supplémentaire d\'une semaine, mais passé ce délai, cette fiche sera archivée.</block><block><icon><i class="material-icons">help</i></icon>N\'hésite pas à poser tes questions dans la section des <a href="/f37-questions-et-idees" target="_blank">Questions</a> ou dans le salon [b]#questions[/b] sur Discord. Privilégie ces moyens pour une réponse rapide !</block></content></fiche>';
            postReply(EwilanRPG.getTopicInfos(), message);
        });

        // Message pour archiver
        $("#archive").click(function() {
        	var message = '<fiche><titre>Bienvenue en Gwendalavir</titre><br/><br/>Bienvenue sur le forum, [b]@"' + username + '"[/b] !<br/><br/>[i]Message personnalisé.[/i]<br/><br/>Je t\'invite à consulter <a href="/f38-encyclopedie">[b]l\'Encyclopédie[/b]</a> si tu as des questions sur l\'univers de Gwendalavir.</fiche>';
            moveTopic(EwilanRPG.getTopicInfos(), EwilanRPG.archives.personnages);
            postReply(EwilanRPG.getTopicInfos(), message);
        });

		// Message pour demander des modifications
        $("#reject").click(function() {
            var message = "";
            postReply(EwilanRPG.getTopicInfos(), message);
        });

        countWords();
    }
})();
