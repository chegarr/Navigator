var themeColor;

/* VARIABLE OVERVIEW
 * xmlDoc: the loaded XML structure
 * xmlStr: temporary string that gets parsed as xmlDoc
 * xmlDir: selector for xml directory elements
 * xmlElement: selector for a xml element(s) needed in the function
 * htmlElement: selector for a element(s) needen in the function
 * htmlGroup: the html group parent representing the root folder of link group
 * htmlParent: the parent element for appending newly created items in functions
 * rootName
 * folderName
 * linkName
 */

if ( typeof window.DOMParser !== "undefined") {
	parseXml = function(xmlStr) {
		return (new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
	};
} else if ( typeof window.ActiveXObject !== "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
	parseXml = function(xmlStr) {
		var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = "false";
		xmlDoc.loadXML(xmlStr);
		return xmlDoc;
	};
} else {
	throw new Error("No XML parser found");
}

function loadLocalData() {
	var xmlString = localStorage.getItem("linkCollection");
	themeColor = localStorage.getItem("themeColor");
	if (themeColor === null) {
		themeColor = "teal";
		localStorage.setItem("themeColor", themeColor);
		console.info("theme color set to " + themeColor);
	}
	if (xmlString === null) {
		console.log("NO LOCAL DATA FOUND");
		Materialize.toast("Couldn't load data from the local storage", 4000);
		$("#menu-collapse").trigger("click");
	} else {
		console.log("LOADING XML FROM LOCAL STORAGE");
		try {
			xmlDoc = parseXml(xmlString);
			console.debug(xmlDoc);
			console.log("XML LOADED FROM LOCAL STORAGE");
			showData();
		} catch(err) {
			console.log(err.message);
		}
	}
}

function loadFloatButtons() {
	var xmlString = localStorage.getItem("quickAccessLinks");
	if (xmlString === null) {
		console.log("NO LOCAL DATA FOR QUICK LINKS FOUND");
		Materialize.toast("Couldn't load quick access links", 4000);
		//$("#menu-collapse").trigger("click");
	} else {
		console.log("LOADING QUICKLINKS FROM LOCAL STORAGE");
		try {
			xmlQuickAccess = parseXml(xmlString);
			console.log("QUICKLINKS LOADED FROM LOCAL STORAGE");
			console.debug(xmlQuickAccess);
			listFloatButtons();
		} catch(err) {
			console.log(err.message);
		}
	}
}

function addFloatButton() {
	var table = document.getElementById("modalButtonsTable"),
	row = table.insertRow(table.rows.length),
	name = row.insertCell(0),
	icon = row.insertCell(1),
	url = row.insertCell(2),
	action = row.insertCell(3);
	name.innerHTML = $('#modalButtonsName').val();
	icon.innerHTML = $('#modalButtonsIcon').val();
	url.innerHTML = $('#modalButtonsURL').val();
	action.innerHTML = "<a href=\"#!\"><i class=\"material-icons right slim " + themeColor + "-text\">delete</i></a>";
	action.innerHTML += "<a href=\"#!\"><i class=\"material-icons right slim " + themeColor + "-text\">keyboard_arrow_up</i></a>";
	action.innerHTML += "<a href=\"#!\"><i class=\"material-icons right slim " + themeColor + "-text\">keyboard_arrow_down</i></a>";
	$('#modalButtons').find('input').val("");
}

function saveFloatButtons() {
	console.debug("_saveFloatButtons: saving data");
	xmlQuickAccess = document.implementation.createDocument(null, "quickaccess");

	var i, xmlString, newElement, xmlParent = xmlQuickAccess.getElementsByTagName("quickaccess")[0],
	rows = document.getElementById("modalButtonsTable").getElementsByTagName("tr");
	for (i = 1; i < rows.length; i++) {
		newElement = xmlDoc.createElement("link");
		newElement.setAttribute("name", escape(rows[i].cells[0].innerHTML));
		newElement.setAttribute("icon", rows[i].cells[1].innerHTML);
		newElement.setAttribute("link", encodeURIComponent(rows[i].cells[2].innerHTML));
		console.log("adding " + rows[i].cells[0].innerHTML);
		xmlParent.appendChild(newElement);
	}
	console.log(xmlParent);
	xmlString = new XMLSerializer().serializeToString(xmlParent);
	if ( typeof (localStorage) === 'undefined') {
		Materialize.toast('Your browser does not support HTML5 localStorage. Try upgrading.', 4000);
	} else {
		try {
			localStorage.setItem("quickAccessLinks", xmlString);
			Materialize.toast("Saving changes", 4000);
			console.log("_saveFloatButtons: changes saved");
		} catch (e) {
			Materialize.toast('save failed!' + e, 4000);
			console.log("_saveFloatButtons: failed with error " + e);
		}
	}
	location.reload();
}

function listFloatButtons() {
	var i, links = $("link", xmlQuickAccess);
	//var table =
	//also in dialog!!! add it
	for (i = 0; i < links.length; i++) {
		//filling dialog
		$('#modalButtonsTable > tbody:last-child').append('<tr><td>Name</td><td>Icon</td><td>Link</td><td>Actions</td></tr>');
		var currentRow = $('#modalButtonsTable tr').last()[0];
		console.log(currentRow.cells[0].innerHTML + " " + links[i].getAttribute('name'));
		currentRow.cells[0].innerHTML = unescape(links[i].getAttribute('name'));
		currentRow.cells[1].innerHTML = links[i].getAttribute('icon');
		currentRow.cells[2].innerHTML = decodeURIComponent(links[i].getAttribute('link'));
		currentRow.cells[3].innerHTML = "";
		currentRow.cells[3].innerHTML += "<a href=\"#!\"><i class=\"material-icons right slim " + themeColor + "-text\">delete</i></a>";
		currentRow.cells[3].innerHTML += "<a href=\"#!\"><i class=\"material-icons right slim " + themeColor + "-text\">keyboard_arrow_up</i></a>";
		currentRow.cells[3].innerHTML += "<a href=\"#!\"><i class=\"material-icons right slim " + themeColor + "-text\">keyboard_arrow_down</i></a>";

		//filling FAB
		if (links[i].getAttribute('icon').indexOf(".") > -1) {
			var icon = document.createElement("img");
			icon.classList.add("icon");
			icon.setAttribute('src', 'img\\' + links[i].getAttribute('icon'));
		} else {
			var icon = document.createElement("i");
			icon.classList.add("material-icons");
			icon.textContent = links[i].getAttribute('icon');
		}

		var anchor = document.createElement("a");
		anchor.classList.add("btn-floating", "theme-colored");
		anchor.setAttribute('href', decodeURIComponent(links[i].getAttribute('link')));
		anchor.appendChild(icon);

		var li = document.createElement("li");
		li.appendChild(anchor);

		document.getElementById("floatButtonList").appendChild(li);
	}
}

function showData() {
	buildConstruct();
	fillConstruct("folder");
	fillConstruct("link");
	fillFavs();
	fillNodeSelection();
	console.log("BASE STRUCTURE FILLED");
	sortChips();
	$('.tooltipped').tooltip({
		delay : 50
	});
	console.log("DONE LOADING");
}

function buildConstruct() {
	var i, xmlDir = $("dir", xmlDoc);
	for (i = 0; i < xmlDir.length; i++) {
		if (xmlDir[i].getAttribute('level') == "0") {
			var li = document.createElement("li");
			li.classList.add("group-marker");
			appendCollapsibleHeader(li, xmlDir[i]);
			appendCollapsibleBody(li, "folder");
			appendCollapsibleBody(li, "link");
			document.getElementById("content_list").appendChild(li);
		}
	}
	console.log("BASE STRUCTURE CREATED");
}

function appendCollapsibleHeader(htmlParent, xmlElement) {
	var anchor1 = document.createElement("a");
	anchor1.href = "#!";
	anchor1.classList.add('secondary-content', 'black-text');
	anchor1.style.display = "none";
	anchor1.onclick = function() {
		openAllLinks(this);
	};
	appendIcon(anchor1, "call_made", "tooltipped", "Open all links");

	var anchor2 = document.createElement("a");
	anchor2.href = "#!";
	anchor2.classList.add('secondary-content', 'black-text');
	anchor2.style.display = "none";
	anchor2.onclick = function() {
		addNewLink(this);
	};
	appendIcon(anchor2, "add", "tooltipped", "Add new link");

	var breadcrumbList = document.createElement("div");
	breadcrumbList.classList.add("breadcrumb-list");
	appendBreadcrumb(breadcrumbList, xmlElement);

	var header = document.createElement("div");
	header.classList.add("collapsible-header");
	header.appendChild(anchor1);
	header.appendChild(anchor2);
	header.appendChild(breadcrumbList);
	appendHorizontalCard(header, "grade");

	htmlParent.appendChild(header);
}

function appendCollapsibleBody(htmlParent, type) {
	var body = document.createElement("div");
	body.classList.add("collapsible-body");
	body.style.display = "none";
	appendHorizontalCard(body, type);

	htmlParent.appendChild(body);
}

function appendHorizontalCard(htmlParent, icon) {
	var div = document.createElement("div");
	div.classList.add("card", "horizontal");
	appendCardImage(div, icon);
	appendChipList(div);
	htmlParent.appendChild(div);
}

function appendCardImage(htmlParent, icon) {
	var i = document.createElement("i");
	i.classList.add("material-icons", "badge", themeColor);
	i.textContent = icon;

	var div = document.createElement("div");
	div.classList.add("card-image");
	div.appendChild(i);

	htmlParent.appendChild(div);
}

function openFolder(trigger) {
	var htmlGroup = $(trigger).parents("li.group-marker")[0];
	if (trigger.classList.contains("chip")) {
		appendBreadcrumb(htmlGroup.getElementsByClassName("breadcrumb-list")[0], getXmlElementById(trigger.getAttribute("id")));
		fillChips("folder", htmlGroup.getElementsByClassName("chips")[1]);
		fillChips("link", htmlGroup.getElementsByClassName("chips")[2]);
	} else if (trigger.classList.contains("breadcrumb")) {
		removeBreadcrumb(htmlGroup.getElementsByClassName("breadcrumb-list")[0], trigger);
		fillChips("folder", htmlGroup.getElementsByClassName("chips")[1]);
		fillChips("link", htmlGroup.getElementsByClassName("chips")[2]);
	}
	sortChips();
	addContextMenu();
	LetterAvatar.transform();
	if ($(htmlGroup).hasClass('active')) {
		event.stopImmediatePropagation();
		event.stopPropagation();
	}
}

function appendBreadcrumb(htmlParent, xmlElement) {
	var anchor = document.createElement("a");
	var id = xmlElement.getAttribute('id');
	anchor.dataset.surrogateId = id;
	anchor.href = "#!";
	anchor.classList.add("breadcrumb", "black-text");
	anchor.setAttribute('onClick', 'return openFolder(this);');
	anchor.textContent = unescape(xmlElement.getAttribute('name'));
	htmlParent.appendChild(anchor);
	console.debug("   added breadcrumb: " + unescape(xmlElement.getAttribute('name')));
}

function removeBreadcrumb(htmlParent, trigger) {
	var htmlElement = trigger;
	if (htmlElement != htmlParent.lastChild) {
		while (htmlElement != null) {
			if (htmlElement != htmlParent.firstChild && htmlElement != trigger) {
				htmlElement.classList.add("delete");
			}
			htmlElement = htmlElement.nextSibling;
		}
		$(".delete").remove();
	}
}

function appendChipList(parent) {
	console.debug("_appendChipList");
	var chipList = document.createElement("div");
	chipList.classList.add("chips");
	parent.appendChild(chipList);
}

function appendChip(htmlParent, xmlElement) {
	console.debug("_appendChip");
	var div = document.createElement("div");
	var img = document.createElement("img");
	var url,
	    link = xmlElement.getAttribute('link');
	    
	div.setAttribute('id',xmlElement.getAttribute('id'));
	div.classList.add("chip", "sized", "truncate", "blue-grey", "lighten-5", "black-text", "jctx-host");
	div.innerHTML = unescape(xmlElement.getAttribute('name'));
	if (link) {
		// link chip
		if (htmlParent.parentNode.getElementsByClassName("badge")[0].innerHTML == "grade") {
			div.classList.add("jctx-id-favorite");
		} else {
			div.classList.add("jctx-id-link");
		}
		//google s2 resolver
		url = "url('https://www.google.com/s2/favicons?domain=" + link;
		//url = "url('https://www.google.com/s2/u/0/favicons?domain=" + link;
		link = decodeURIComponent(link);
		div.setAttribute('onClick', 'clickCount(this, \'' + link + '\', \'_self\');');
		console.debug("   added link: " + link);
	} else {
		// folder chip
		div.classList.add("jctx-id-folder");
		//custom resolver from some dude
		/*url = "url('http://icons.better-idea.org/icon?url=" + xmlElement.getAttribute('name') + "&size=32..32..128')";
		img.style.backgroundSize = "32px 32px";*/
		//Artur Heinze letter avatars
		img.setAttribute('avatar', unescape(xmlElement.getAttribute('name')));

		div.setAttribute('onClick', 'openFolder(this);');
		console.debug("   added folder: " + unescape(xmlElement.getAttribute('name')));
	}
	div.insertBefore(img, div.firstChild);
	img.style.backgroundImage = url;

	htmlParent.appendChild(div);
}

function fillConstruct(type) {
	console.debug("_fillConstruct");
	var i, htmlElement = $("i:contains('" + type + "')");
	console.debug("_processing " + htmlElement.length + " elements of the type " + type);
	for (i = 0; i < htmlElement.length; i++) {
		console.log("  Filling up " + type + "s of " + getFolderName(htmlElement[i]));
		fillChips(type, $(htmlElement[i]).parents(".card").children(".chips")[0]);
	}
}

function fillFavs() {
	console.debug("_fillFavs");
	var i,j,htmlElement = $("i:contains('grade')");
	var xmlRoot,
	    xmlElement;
	for (i = 0; i < htmlElement.length; i++) {
		console.debug("_processing " + htmlElement[i].innerHTML);
		htmlGroup = getHTMLgroup(htmlElement[i]);
		xmlRoot = getXMLdir(htmlElement[i]);
		xmlElement = getFavs(xmlRoot);
		console.log("  Filling up favorites from " + xmlRoot.getAttribute('name') + " with a total of " + xmlElement.length + " links");
		for (j = 0; j < 15; j++) {
			if (xmlElement[j]) {
				appendChip(htmlGroup.getElementsByClassName("chips")[0], xmlElement[j]);
			} else {
				break;
			}
		}
	}
}

function getFavs(xmlRoot) {
	var i, xmlElement = xmlRoot.getElementsByTagName("link");
	var sortedList = [];
	for (i = 0; i < xmlElement.length; ++i) {
		if (xmlElement[i].getAttribute('count') >= 1) {
			console.debug("   added favorite: " + xmlElement[i].getAttribute('name'));
			sortedList.push(xmlElement[i]);
		}
	}
	sortedList.sort(function(a, b) {
		return b.getAttribute('count') - a.getAttribute('count');
	});
	return sortedList;
}

function fillChips(type, htmlParent) {
	console.debug("_fillChips for " + htmlParent.innerHTML);
	console.debug("_fillChips for " + getFolderName(htmlParent));
	var xmlParent = getXMLdir(htmlParent);
	var xmlElement = xmlParent.firstChild;
	htmlParent.innerHTML = "";

	if (type == "folder") {
		console.debug("_FOLDER");
		type = "dir";
		console.debug("   appending folders for " + getFolderName(htmlParent));
	} else {
		console.debug("_LINK");

		type = "link";
	}
	while (xmlElement != null) {
		if (xmlElement.nodeName == type) {
			appendChip(htmlParent, xmlElement);
		}
		xmlElement = xmlElement.nextSibling;
	}

	hideIfNotFilled(htmlParent);

}

function sortChips() {
	var i, htmlParent = $('.chips');
	for (i = 0; i < htmlParent.length; ++i) {
		var htmlElement = $(htmlParent[i]).find('.chip');
		var sortedList = htmlElement.sort(function(a, b) {
			return $(a).text() > $(b).text();
		});
		$(htmlParent[i]).html(sortedList);
	}
}

function fillNodeSelection() {
	console.debug("_fillNodeSelection");
	//var htmlParent = $('#folder_selector').find('select')[0];
	var htmlParent = $('#modalActionFolderSelector').find('select')[0];
	var xmlDir = $("dir", xmlDoc);
	for (var i = 0; i < xmlDir.length; i++) {
		var htmlElement = document.createElement("option");
		htmlElement.innerHTML = unescape(xmlDir[i].getAttribute('name'));
		htmlElement.classList.add('no-width', 'left', 'sub-' + xmlDir[i].getAttribute('level'), 'id-' + xmlDir[i].getAttribute('id'));
		htmlElement.dataset.icon = "img/empty.png";
		htmlParent.appendChild(htmlElement);
		//add class for level!!
	}
}

function clickCount(trigger, link, option) {
	if (option == "_self") {
		var xmlElement = getXmlElementById(trigger.getAttribute('id'));
	} else {
		var xmlElement = trigger;
	}
	var count = parseInt(xmlElement.getAttribute('count')) + 1;
	xmlElement.setAttribute("count", count);
	message = "New count of " + unescape(xmlElement.getAttribute('name')) + ": " + xmlElement.getAttribute('count');
	saveLocalData("Wait for it...");
	window.open(link, option);
	event.stopImmediatePropagation();
	event.stopPropagation();
}

function openAllLinks(trigger) {
	console.debug("_openAllLinks: collecting links");
	var htmlGroup = getHTMLgroup(trigger);
	var chipList = $(htmlGroup).find('.chips')[2];
	var htmlElement = $(chipList).find('.chip');
	var links = [];

	Materialize.toast('Why not. I\'ll open all ' + htmlElement.length, 4000);
	for (var i = 0; i < htmlElement.length; ++i) {
		link = htmlElement[i].getAttribute('onclick');
		link = link.slice(link.indexOf("'") + 1, link.length);
		link = link.substr(0, link.length - 3);
		//htmlElement[i].click();
		console.debug("_openAllLinks: opening " + link);
		window.open(link, '_blank');
		window.blur();
	}
	window.focus();
	//$(chipList).find('.chip').trigger('click');
	//event.stopPropagation();
	//event.stopImmediatePropagation();
}

function openAllQuickLinks() {
	console.debug("_openAllQuickLinks: collecting links");
	var i, links = $("link", xmlQuickAccess);
	Materialize.toast('Why not. I\'ll open all', 4000);
		window.open(decodeURIComponent(links[0].getAttribute('link')), '_self');
	for (i = 1; i < links.length; i++) {
		window.open(decodeURIComponent(links[i].getAttribute('link')), '_blank');
		window.blur();
	}
	window.focus();
}

function setThemeColor() {
	var colorName = $("#theme_color_selector").find("input.select-dropdown").val().toString();
	console.debug("_setThemeColor: looks up " + colorName);
	$("img.black-text").each(function(index) {
		if (colorName == $( this ).parent().find('span')[0].innerHTML) {
			colorName = $( this )[0].classList;
			colorName = colorName.toString().replace('circle black-text ', '');
			console.debug("_setThemeColor: sets " + colorName);
		}
	});
	localStorage.setItem("themeColor", colorName);
}

function exportData() {
	Materialize.toast('Exporting', 4000);
	var d = document.getElementById("downloadLink");
	var file = new Blob([localStorage.getItem("linkCollection")], {
		type : 'text/xml'
	});
	d.href = URL.createObjectURL(file);
	d.download = "testFile.xml";
	document.getElementById('downloadLink').click();
}

function addNewLink(trigger) {
	console.debug("_addNewLink");
	fillModalAction("add", trigger);
	$('#modalAction').openModal();
	Materialize.updateTextFields();
	event.stopPropagation();
}

function fillModalAction(action, trigger) {
	if (action != "drop") {
		console.debug("_fillModalAction: " + action + " for " + trigger.parentNode.getAttribute("data-chip-name"));
	} else {
		console.debug("_fillModalAction: " + action);
	}
	//info for saving data later on
	$('#modalAction').data("action", action);
	$('#modalAction').data("trigger", trigger);
	//restoring visibility of all inputs
	$(".input-field").show();
	switch (action) {
	case "drop":
		$('#modalActionHeader').text("Add new link");
		$('#modalActionText').parent().hide();
		//re-initializing the dropdown selection
		$('select').material_select();
		$("#modalActionName").val("");
		$("#modalActionURL").val(trigger);
		$('#modalAction').data("target", "");
		break;
	case "add":
		$('#modalActionHeader').text("Add new link");
		$('#modalActionText').parent().hide();
		$('#modalAction').data('targetId', getFolderId(trigger));
		$("#modalActionFolderSelector").find("input.select-dropdown").val(getFolderName(trigger));
		$("#modalActionFolderSelector").find("input.select-dropdown").attr('value', getFolderName(trigger));
		$("#modalActionName").val("");
		$("#modalActionURL").val("");
		$('#modalAction').data("target", "");
		break;
	case "edit":
		$('#modalActionHeader').text("Edit link");
		$('#modalActionText').parent().hide();
		$("#modalActionFolderSelector").hide();
		$("#modalActionName").val(trigger.parentNode.getAttribute("data-chip-name"));
		var xmlElement = getXmlElementById(trigger.parentNode.getAttribute("data-id"));
		var link = decodeURIComponent(xmlElement.getAttribute('link'));
		$("#modalActionURL").val(link);
		$('#modalAction').data("target", xmlElement);
		break;
	case "rename":
		$('#modalActionHeader').text("Rename folder");
		$('#modalActionText').parent().hide();
		$("#modalActionFolderSelector").find("input.select-dropdown").parents(".input-field").hide();
		$("#modalActionURL").parent().hide();
		$("#modalActionName").val(trigger.parentNode.getAttribute("data-chip-name"));
		$('#modalAction').data("target", getXmlElementById("dir", trigger.parentNode.getAttribute("data-id")));
		break;
	case "remove":
		$('#modalActionHeader').text("Remove favorite");
		$('#modalActionText').html("Are you sure you want to remove \"" + trigger.parentNode.getAttribute("data-chip-name") + "\" from the favorites? <br> The link itself will not be deleted.");
		$("#modalActionFolderSelector").hide();
		$("#modalActionURL").parent().hide();
		$("#modalActionName").parent().hide();
		$('#modalAction').data("target", getXmlElementById(trigger.parentNode.getAttribute("data-id")));
		break;
	case "delete":
		$('#modalActionHeader').text("Delete link");
		$('#modalActionText').html("Are you sure you want to delete the link \"" + trigger.parentNode.getAttribute("data-chip-name") + "\"? <br> The link can not be restored.");
		$("#modalActionFolderSelector").hide();
		$("#modalActionURL").parent().hide();
		$("#modalActionName").parent().hide();
		$('#modalAction').data("target", getXmlElementById(trigger.parentNode.getAttribute("data-id")));
		break;
	default:
		$('#modalActionHeader').text("Do something");
		break;
	}

	$('#modalAction').openModal();
	if ($("#modalActionName").val() == '') {
		$("#modalActionName").focus();
	}
	Materialize.updateTextFields();
	event.stopPropagation();
}

function saveModalActionData() {
	var action = $('#modalAction').data("action");
	var trigger = $('#modalAction').data("trigger");
	var targetId = $('#modalAction').data("targetId");
	var xmlElement = $('#modalAction').data("target");
	if (xmlElement) {
		console.debug("_saveModalActionData: " + action + " " + xmlElement.getAttribute('name') + " triggered from " + trigger.textContent);

	} else {
		console.debug("_saveModalActionData: " + action + " triggered from " + trigger.textContent);
	}
	switch (action) {
	case "drop":
	case "add":
		var newElement = xmlDoc.createElement("link");
		newElement.setAttribute("id", getNextID());
		newElement.setAttribute("link", encodeURIComponent($('#modalActionURL').val()));
		newElement.setAttribute("name", escape($('#modalActionName').val()));
		newElement.setAttribute("count", 0);
		
		xmlDir = getXmlElementById(targetId);
		xmlDir.appendChild(newElement);

		console.debug("_saveModalActionData: added link " + $('#modalActionName').val() + " in " + $("#modalActionFolderSelector").find("input.select-dropdown").val().toString());
		break;
	case "edit":
		xmlElement.setAttribute("name", $('#modalActionName').val());
		xmlElement.setAttribute("link", encodeURIComponent($('#modalActionURL').val()));
		console.log("_saveModalActionData: saved new link values " + $('#modalActionName').val() + " / " + $('#modalActionURL').val());
		break;
	case "rename":
		xmlElement.setAttribute("name", $('#modalActionName').val());
		console.log("_saveModalActionData: saved new name " + $('#modalActionName').val());
		break;
	case "remove":
		xmlElement.setAttribute("count", 0);
		console.log("reset count for " + $('#modalActionName').val());
		break;
	case "delete":
		xmlElement.parentNode.removeChild(xmlElement);
		console.log("deleted the link" + $('#modalActionName').val());
		break;
	default:
		console.debug("_saveModalActionData: " + action + " not yet supported");
		break;
	}
	// restoring the modal
	$("#folder_selector").find("input.select-dropdown").attr('disabled', false);
}

function getNextID() {
	console.debug("_getNextID for new XML element");
	highestCount = 0;
	listOfElements = xmlDoc.getElementsByTagName("dir");
	for (var i = 0; i < listOfElements.length; ++i) {
		if (parseInt(listOfElements[i].getAttribute('id')) > highestCount) {
			highestCount = parseInt(listOfElements[i].getAttribute('id'));
		}
	}
	listOfElements = xmlDoc.getElementsByTagName("link");
	for (var i = 0; i < listOfElements.length; ++i) {
		if (parseInt(listOfElements[i].getAttribute('id')) > highestCount) {
			highestCount = parseInt(listOfElements[i].getAttribute('id'));
		}
	}
	highestCount++;
	console.debug("_getNextID returns: " + highestCount);
	return highestCount;
}

function getChipType(htmlElement) {
	var type = "unknown";
	console.debug("_getChipType for: " + htmlElement.innerHTML);
	type = $(htmlElement).parents(".card").find('i')[0].innerHTML;
	if (type == "folder") {
		type = "dir";
	} else {
		type = "link";
	}
	return type;
}

function getHTMLgroup(htmlElement) {
	console.debug("_getHTMLgroup");
	var htmlGroup;
	if (htmlElement.classList.contains("group-marker")) {
		htmlGroup = htmlElement;
	} else {
		htmlGroup = $(htmlElement).parents(".group-marker")[0];
	}
	console.debug("_getHTMLgroup returns " + htmlGroup);
	return htmlGroup;
}

function getFolderName(htmlElement) {
	console.debug("_getFolderName");
	var htmlGroup = $(htmlElement).parents("li.group-marker")[0];
	htmlParent = htmlGroup.getElementsByClassName("breadcrumb-list")[0];
	console.debug("_getFolderName returns: " + htmlParent.lastChild.innerHTML);
	return htmlParent.lastChild.innerText;
}

function getFolderId(htmlElement) {
	console.debug("_getFolderID");
	var htmlGroup = $(htmlElement).parents("li.group-marker")[0];
	htmlParent = htmlGroup.getElementsByClassName("breadcrumb-list")[0];
	console.debug("_getFolderId returns: " + htmlParent.lastChild.dataset.surrogateId);
	return htmlParent.lastChild.dataset.surrogateId;
}

function getRootName(htmlElement) {
	console.debug("_getRootName");
	var htmlGroup = $(htmlElement).parents("li.group-marker")[0];
	var htmlParent = htmlGroup.getElementsByClassName("breadcrumb-list")[0];
	console.debug("_getRootName returns: " + htmlParent.firstChild.innerHTML);
	return htmlParent.firstChild.innerText;
}

function getXMLdir(htmlParent) {
	console.debug("_getXMLdir");
	var xmlName,
	    folderName = getFolderName(htmlParent);
	var rootName = getRootName(htmlParent);
	var xmlDir = $("dir", xmlDoc);
	if (rootName && rootName != folderName) {
		for (var i = 0; i < xmlDir.length; i++) {
			xmlName = unescape(xmlDir[i].getAttribute('name'));
			if (xmlName == rootName) {
				xmlDir = xmlDir[i];
				console.debug("_getXMLdir found the root \"" + xmlName + "\" with " + xmlDir.getElementsByTagName('dir').length + " child folders");
			}
		}
		xmlDir = xmlDir.getElementsByTagName('dir');
	}
	for (var i = 0; i < xmlDir.length; i++) {
		xmlName = unescape(xmlDir[i].getAttribute('name'));
		if (xmlName == folderName) {
			if (xmlName != folderName) {
				console.debug("_getXMLdir found the folder " + xmlName + " in " + rootName);
			}
			console.debug("_getXMLdir returns " + xmlName);
			return xmlDir[i];
		}
	}
}

function getXmlElementById(id) {
	console.debug("_getXmlElementById: " + id);
	var xmlElement = $("dir", xmlDoc);
	for (var i = 0; i < xmlElement.length; i++) {
		if (unescape(xmlElement[i].getAttribute('id')) == id) {
			return xmlElement[i];
		}
	}
	if (xmlElement[i] == null){
		xmlElement = $("link", xmlDoc);
	for (var i = 0; i < xmlElement.length; i++) {
		if (unescape(xmlElement[i].getAttribute('id')) == id) {
			return xmlElement[i];
		}
	}
	}
	if (xmlElement[i] == null){
		alert("Not found");
	}
	//if not returned earlier
	Materialize.toast("Element not found because of special characters in the naming.", 4000);
	event.stopPropagation();
	return false;
}


function hideIfNotFilled(htmlElement) {
	if (htmlElement.innerHTML == "") {
		htmlElement.parentNode.parentNode.style.display = "none";
		console.debug("_hideIfNotFilled: card got hidden");
	} else {
		htmlElement.parentNode.parentNode.style.display = "block";
	}

}
