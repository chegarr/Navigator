$(document).ready(function() {
	loadLocalData();
	loadFloatButtons();
	addContextMenu();
	$("div.collapsible-body").css("display", "none");
	$(".nav-wrapper").addClass(themeColor);
	$(".side-nav").find('.responsive-img').addClass(themeColor);
	$(".waves-effect").addClass("waves-" + themeColor);
	$(".theme-colored").addClass(themeColor).removeClass('theme-colored');
	$(".theme-colored-text").addClass(themeColor + "-text").removeClass('theme-colored-text');
	$('.modal-trigger').leanModal({
		// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
		dismissible : true, // Modal can be dismissed by clicking outside of the modal
		opacity :0.5, // Opacity of modal background
		in_duration : 300, // Transition in duration
		out_duration : 200, // Transition out duration
		starting_top : '4%', // Starting top style attribute
		ending_top : '10%', // Ending top style attribute
		ready : function() {
			$('#menu-collapse').sideNav('hide');
		},
		complete : function() {
			// Callback for Modal close
		}
	});
	$('#menu-collapse').sideNav({
			edge : 'right' // Choose the horizontal origin
		});
});

$(window).load(function() {
	//when everything is loaded and not only ready
	document.documentElement.style.setProperty('--themecolor', $('.badge').css('background-color'));
	$('select').material_select();
	//setting the ID of the selected folder of #modalActionFolderSelector
	$('ul.select-dropdown li').click(function(e) 
    {
		var targetId = $(this).find('img').attr('class');
		targetId = targetId.substr(targetId.indexOf('id-')+3);
		$('#modalAction').data('targetId', targetId);
    });
});

document.addEventListener("click", function(event) {
	if ($(event.target).is("html") || $(event.target).is("body") || $(event.target).is(".brand-logo")) {
		$(".active").removeClass("active");
		$("div.collapsible-body").css("display", "none");
		$("#searchfield").val('');
	}
});

//input validation
$('#modalButtons').find('input').keyup(function() {
	var empty = false;
	$('#modalButtons').find('input').each(function() {
		if ($(this).val() === '') {
			empty = true;
		}
	});
	if (empty) {
		$('#modalButtonsAdd').attr('disabled', 'disabled');
	} else {
		$('#modalButtonsAdd').removeAttr('disabled');
	}
});

function allowDrop(event) {
	event.preventDefault();
}

function drop(event) {
	event.preventDefault();
	var link = event.dataTransfer.getData("Text");
	fillModalAction("drop", link);
	//uses trigger to handover link
}

//differently as it is for dynamically created elements
$(document).on('click', '#modalButtonsTable i', function() {
	var row = $(this).parents("tr:first");
	switch ($(this).html()) {
	case "delete" :
		$(this).parents("tr").remove();
		break;
	case "keyboard_arrow_up":
		row.insertBefore(row.prev());
		break;
	case "keyboard_arrow_down":
		row.insertAfter(row.next());
		break;
	default:
		alert($(this).html());
		break;
	}
	event.stopPropagation();
});

$(document).on('click', '#modalButtonsTable td', function() {
var row = $(this).parents("tr:first");
	$('#modalButtonsName').val(row[0].cells[0].innerText);
	$('#modalButtonsIcon').val(row[0].cells[1].innerText);
	$('#modalButtonsURL').val(row[0].cells[2].innerText);
	$(this).parents("tr").remove();
});

$('#menu-collapse').click(function() {
	try {
		console.debug("setting theme color selection to " + $("#theme_color_selector").find("."+themeColor)[1].innerHTML);
		$("#theme_color_selector").find("input.select-dropdown").attr('value', $("#theme_color_selector").find("."+themeColor)[1].innerHTML);
	} catch(err) {
		console.log(err.message);
	}
});

$('#modalButtonsToggle').click(function() {
	$("#modalButtonsInfo").toggle();
});

$('#modalButtonsAdd').click(function() {
	addFloatButton();
});


$('#quickAccess').click(function() {
	openAllQuickLinks();
});

$('#modalButtonsDone').click(function() {
	saveFloatButtons();
});

$('#importDone').click(function() {
	saveLocalData();
	return false;
});

$('#settingsDone').click(function() {
	setThemeColor();
	location.reload();
	return false;
});

$('#exportData').click(function() {
	exportData();
	return false;
});

$('#backupDone').click(function() {
	location.reload();
	return false;
});

$('#modalActionDone').click(function() {
	saveModalActionData();
	saveLocalData();
	return false;
});