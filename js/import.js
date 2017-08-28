// Variables
var xmlDoc = document.implementation.createDocument(null, "collection");
var xmlQuickAccess = document.implementation.createDocument(null, "quickaccess");
var file_type,
    raw_data,
    structure_level,
    latest_parent,
    folder_count,
    subfolder_count = "";

// Event listener
document.getElementById('import_file').addEventListener('change', fileImport, false);

// Functions
function fileImport(evt) {
	console.debug("_fileImport: loading data");
	var f = evt.target.files[0];
	var reader = new FileReader();
	folder_count = 0;
	subfolder_count = 0;
	structure_level = -1;

	reader.onloadend = function(evt) {
		if (evt.target.readyState == FileReader.DONE) {// DONE == 2
			fileAnalysis(evt.target.result);
		}
	};
	var blob = f.slice(0, f.size);
	reader.readAsText(blob);
}

function fileAnalysis(data) {
	console.debug("_fileAnalysis: loading data");
	if (data.indexOf("<H3 FOLDED") >= 0) {
		Materialize.toast('Looks like IE bookmarks', 4000);
		file_type = "ie";
		structure_level += 1;
		simplifyStructure(data);
		return;
	} else if (data.indexOf(">Bookmarks Menu<") >= 0) {
		Materialize.toast('Looks like Firefox bookmarks', 4000);
		file_type = "firefox";
		simplifyStructure(data);
		return;
	} else if (data.indexOf(">Bookmarks<") >= 0) {
		Materialize.toast('Looks like Chrome bookmarks', 4000);
		file_type = "chrome";
		simplifyStructure(data);
		return;
	} else {
		Materialize.toast('Are you sure you gave me a bookmarks file?', 4000);
		return;
	}
	Materialize.toast('Why?', 4000);
}

function simplifyStructure(data) {
	document.getElementById("import_structure").innerHTML = "";

	if (file_type == "ie") {
		data = data.replace(/<H3 FOLDED/gi, "<H3");
	}
	data = data.replace(/<![\s\S]*?<TITLE/g, "<TITLE");
	data = data.replace(/ ICON=".*">/gi, ">");
	data = data.replace(/ ADD_DATE=".*">/gi, ">");
	data = data.replace(/HREF/gi, "href");

	raw_data = data;
	extractStructure(data);
}

function extractStructure(data) {
	var temp = raw_data;
	var node_title,
	    position,
	    range = "";

	while (temp.indexOf("<") > -1) {
		position = temp.indexOf("<");
		node_title = temp.substr(position, 3);

		if (temp.substr(position, 3) == "<DL") {
			// going deeper
			structure_level += 1;
		} else if (temp.substr(position, 4) == "</DL") {
			// coming up again
			structure_level -= 1;
			if (structure_level == 1) {
				latest_parent.childNodes[2].textContent = "Containing " + subfolder_count + " sub folders";
				appendLink(latest_parent, "expand");
			}
		} else if (temp.substr(position, 3) == "<H3") {
			// searching for folders
			countNodes();
			position = temp.indexOf("<H3>") + 4;
			range = temp.indexOf("</H3>") - position;
			node_title = temp.substr(position, range);
			appendChildNode(node_title, structure_level);
		}
		// moving on
		position += 1;
		temp = temp.slice(position, temp.length);
	}
	setNodeCount();
	$('.tooltipped').tooltip({
		delay : 50
	});
	console.log(" ---- DONE IMPORTING STRUCTURE ---- ");
}

function countNodes() {
	folder_count += 1;
	if (structure_level > 1) {
		subfolder_count += 1;
	} else if (structure_level <= 1) {
		subfolder_count = 0;
	}
}

function setNodeCount() {
	var message = "Data extraction of " + folder_count + " folders done";
	var count = folder_count - 1;
	Materialize.toast(message, 4000);
	if (file_type != "ie") {
		message = "Containing " + count + " folders";
		document.getElementsByClassName("sub-0")[0].childNodes[2].innerText = message;
	}
}

function appendChildNode(node_title, level) {
	var ul = document.getElementById("import_structure");
	var li = document.createElement("li");
	var sub_level = "sub-" + level;
	if (file_type == "ie") {
		sub_level = "sub-" + (level - 1 );
	}

	appendIcon(li, "folder", "circle");
	appendSpan(li, node_title);
	appendP(li, level);
	if (level <= 1) {
		appendLink(li, "import");
		latest_parent = li;
	} else if (level > 1) {
		li.classList.add('none');
	}

	li.classList.add('collection-item');
	li.classList.add('avatar');
	li.classList.add(sub_level);

	ul.appendChild(li);
	ul.style.overflowY = 'auto';
}

function appendIcon(parent, icon, optional_class, tooltip) {
	var i = document.createElement("i");
	i.textContent = icon;
	i.classList.add('material-icons', optional_class);
	if (optional_class == "tooltipped") {
		i.setAttribute("data-tooltip", tooltip);
		i.setAttribute("data-position", "left");
		i.classList.add(themeColor + '-text');
	}
	if (icon == "add") {
		i.classList.add('add_' + structure_level);
	}
	parent.appendChild(i);
}

function appendSpan(parent, text) {
	var span = document.createElement("span");
	span.textContent = text;
	span.classList.add('bold');
	parent.appendChild(span);
}

function appendP(parent, level) {
	var span = document.createElement("p");
	span.textContent = "Level " + level;
	parent.appendChild(span);
}

function appendLink(parent, action) {
	var a = document.createElement("a");
	a.href = "#!";
	a.classList.add('secondary-content');
	if (action == "expand") {
		a.classList.add('secondary-second');
		a.onclick = function() {
			toggleNode(this);
		};
		appendIcon(a, "expand_more", "tooltipped", "Expand folder");
	} else if (action == "import") {
		a.onclick = function() {
			importTrigger(this);
		};
		appendIcon(a, "add", "tooltipped", "Import content");
	}
	parent.appendChild(a);
}

function importTrigger(el) {
	if ($(el.firstChild).hasClass('add_0')) {
		el = $('.add_1');
		console.debug("importTrigger: adding all " + el.length + " nodes");
		for (var i = 0; i < el.length; i++) {
			importNode(el[i].parentNode);
		}
	} else {
		console.debug("importTrigger: adding a single node");
		importNode(el);
	}
}

function importNode(el) {
	var selected = $(el).parent();
	var temp = raw_data;
	var name = selected.find("span").text();
	var searchTag = ">" + name + "<";
	var newDir,
	    currentDir;
	var level = 0;
	var message,
	    position,
	    range = "";
	console.log(" ---- STARTING TO IMPORT NODE ---- ");
	console.debug("_importNode: " + name);

	//add root folder
	currentDir = xmlDoc.getElementsByTagName("collection")[0];
	newDir = addDir(currentDir, name, "0");

	//crop to starting folder
	position = temp.indexOf(searchTag) + 1;
	temp = temp.slice(position, temp.length);

	while (temp.indexOf("<") > -1) {
		position = temp.indexOf("<");

		if (temp.substr(position, 3) == "<DL") {
			//down
			console.log(String.fromCharCode(8681) + " " + newDir.getAttribute('name'));
			level += 1;
			currentDir = newDir;
		} else if (temp.substr(position, 4) == "</DL") {
			//up
			console.log(String.fromCharCode(8679) + " " + currentDir.parentNode.getAttribute('name'));
			level -= 1;
			currentDir = currentDir.parentNode;
			if (level == 0) {
				break;
			}
		} else if (temp.substr(position, 3) == "<H3") {
			//folder
			position = temp.indexOf("<H3>") + 4;
			range = temp.indexOf("</H3>") - position;
			name = temp.substr(position, range);
			newDir = addDir(currentDir, name, level);
		} else if (temp.substr(position, 7) == "<A href") {
			//folder
			position = temp.indexOf("<A") + 9;
			range = temp.indexOf("</A>") - position;
			link = temp.substr(position, range);
			addLink(currentDir, link);
		}
		// moving on
		position += 1;
		temp = temp.slice(position, temp.length);
	}
	console.log(" ---- DONE WITH THE NODE IMPORT ---- ");
	Materialize.toast("Added all links of " + selected.find("span").text(), 4000);
}

function addDir(currentDir, name, level) {
	var newElement = xmlDoc.createElement("dir");
	newElement.setAttribute("id", getNextID());
	newElement.setAttribute("level", level);
	newElement.setAttribute("name", escape(htmlEnDeCode.htmlDecode(name)));
	currentDir.appendChild(newElement);
	console.log("  " + name + " (level " + level + ") to " + currentDir.getAttribute('name'));
	return newElement;
}

function addLink(currentDir, link) {
	var newElement = xmlDoc.createElement("link");
	var name = link.substr(link.indexOf(">") + 1, link.length);
	link = link.substr(0, link.indexOf(">") - 1);

	newElement.setAttribute("id", getNextID());
	newElement.setAttribute("link", encodeURIComponent(link));
	newElement.setAttribute("name", escape(htmlEnDeCode.htmlDecode(name)));
	newElement.setAttribute("count", 0);
	currentDir.appendChild(newElement);
	console.log("  link: " + name + " / " + link);
}

// taken from http://stackoverflow.com/questions/3700326/decode-amp-back-to-in-javascript
var htmlEnDeCode = (function() {
    var charToEntityRegex,
        entityToCharRegex,
        charToEntity,
        entityToChar;

    function resetCharacterEntities() {
        charToEntity = {};
        entityToChar = {};
        // add the default set
        addCharacterEntities({
            '&amp;'     :   '&',
            '&gt;'      :   '>',
            '&lt;'      :   '<',
            '&quot;'    :   '"',
            '&#39;'     :   "'"
        });
    }

    function addCharacterEntities(newEntities) {
        var charKeys = [],
            entityKeys = [],
            key, echar;
        for (key in newEntities) {
            echar = newEntities[key];
            entityToChar[key] = echar;
            charToEntity[echar] = key;
            charKeys.push(echar);
            entityKeys.push(key);
        }
        charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
        entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
    }

    function htmlEncode(value){
        var htmlEncodeReplaceFn = function(match, capture) {
            return charToEntity[capture];
        };

        return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
    }

    function htmlDecode(value) {
        var htmlDecodeReplaceFn = function(match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        };

        return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
    }

    resetCharacterEntities();

    return {
        htmlEncode: htmlEncode,
        htmlDecode: htmlDecode
    };
})();



function toggleNode(el) {
	var selected = $(el).parent().next();

	if ($(el).find("i")[0].textContent == "expand_more") {
		$(el).find("i")[0].textContent = "expand_less";
		$(el).find("i")[0].setAttribute("data-tooltip", "Collapse folder");
	} else {
		$(el).find("i")[0].textContent = "expand_more";
		$(el).find("i")[0].setAttribute("data-tooltip", "Expand folder");
	}
	while ((selected.hasClass('sub-1')) == false) {
		selected.toggleClass('none');
		if (selected.next().is('li')) {
			selected = selected.next();
		} else {
			break;
		}
	}
	$('.tooltipped').tooltip('remove');
	$('.tooltipped').tooltip({
		delay : 50
	});
}

function saveLocalData(message) {
	console.debug("_saveLocalData: saving data");
	console.log(xmlDoc);
	var xmlString = new XMLSerializer().serializeToString(xmlDoc);
	if ( typeof (localStorage) == 'undefined') {
		Materialize.toast('Your browser does not support HTML5 localStorage. Try upgrading.', 4000);
	} else {
		try {
			localStorage.setItem("linkCollection", xmlString);
			if (message) {
				Materialize.toast(message, 4000);
			}
			console.log("_saveLocalData: changes saved");
		} catch (e) {
			Materialize.toast('save failed!' + e, 4000);
			console.log("_saveLocalData: failed with error " + e);
		}
	}
	location.reload();
}