'use strict'

function quickCall(contact, video) {
	if (!contact) { return; }
	selectContact(contact);
	mobicentsWebRTCPhoneController.onClickCallButtonViewEventHandler(contact, video);
}

function quickChat(contact) {
	if (!contact) { return; }
	selectContact(contact);
	toggleChat();
}

var chatShown = false;
function toggleChat() {
	if (!selectedContact || isDID(selectedContact)) { return; }
	if (contactsShown) {
		toggleContacts();
	}
	$('.main').toggleClass('col-md-9');
	$('.chat').animate({width:'toggle'},350);
	chatShown = !chatShown;
	if (chatShown) {
		$('.ui-chatbox-input>textarea').focus();
		// just to clear unread, since it's now visible
		increaseUnreadText();
	}
}

function increaseUnreadText() {
	if (!$('.chat').is(":visible")) {
		$('#unreadTxt').text(parseInt($('#unreadTxt').text(),10)+1);
		$('#unreadTxt').show();
	}
	else {
		$('#unreadTxt').text(0);
		$('#unreadTxt').hide();
	}
}

function hangUpCall() {
	mobicentsWebRTCPhoneController.onClickEndCallButtonViewEventHandler(true);
}

function performStartCallActions() {
	$('#btnKeypad').parent().removeClass('disabled');
	$("#tKeypad").popover('enable');
	$('#btnHang').parent().removeClass('disabled');

	$('#btnCall').parent().addClass('disabled');
}

function performEndCallActions() {
	$('#btnKeypad').parent().addClass('disabled');
	$("#tKeypad").popover('hide');
	$("#tKeypad").popover('disable');
	$('#btnHang').parent().addClass('disabled');

	$('#btnCall').parent().removeClass('disabled');
}

function isDID(contact) {
	return contact.match(/[a-z]/i) ? false : true;
}

function changeme() {
	$("#dumper").focus();
	var press = jQuery.Event("keydown");
press.altGraphKey = false;
press.altKey = false;
press.bubbles = true;
press.cancelBubble = false;
press.cancelable = true;
press.charCode = 51;
press.clipboardData = undefined;
press.ctrlKey = false;
press.currentTarget = $("#dumper")[0];
press.defaultPrevented = false;
press.detail = 0;
press.eventPhase = 2;
press.keyCode = 51;
press.keyIdentifier = "";
press.keyLocation = 0;
press.layerX = 0;
press.layerY = 0;
press.metaKey = false;
press.pageX = 0;
press.pageY = 0;
press.returnValue = false;
press.shiftKey = false;
press.srcElement = $("#dumper")[0];
press.target = $("#dumper")[0];
press.type = "keypress";
press.view = Window;
press.which = 51;
$("#dumper").trigger(press);
}

function doit() {
	var press = jQuery.Event("keydown");
press.altGraphKey = false;
press.altKey = false;
press.bubbles = true;
press.cancelBubble = false;
press.cancelable = true;
press.charCode = 51;
press.clipboardData = undefined;
press.ctrlKey = false;
press.currentTarget = $("#dumper")[0];
press.defaultPrevented = false;
press.detail = 0;
press.eventPhase = 2;
press.keyCode = 51;
press.keyIdentifier = "";
press.keyLocation = 0;
press.layerX = 0;
press.layerY = 0;
press.metaKey = false;
press.pageX = 0;
press.pageY = 0;
press.returnValue = false;
press.shiftKey = false;
press.srcElement = $("#dumper")[0];
press.target = $("#dumper")[0];
press.type = "keypress";
press.view = Window;
press.which = 51;

var press2 = jQuery.Event("keyup");
press2.altGraphKey = false;
press2.altKey = false;
press2.bubbles = true;
press2.cancelBubble = false;
press2.cancelable = true;
press2.charCode = 51;
press2.clipboardData = undefined;
press2.ctrlKey = false;
press2.currentTarget = $("#dumper")[0];
press2.defaultPrevented = false;
press2.detail = 0;
press2.eventPhase = 2;
press2.keyCode = 51;
press2.keyIdentifier = "";
press2.keyLocation = 0;
press2.layerX = 0;
press2.layerY = 0;
press2.metaKey = false;
press2.pageX = 0;
press2.pageY = 0;
press2.returnValue = false;
press2.shiftKey = false;
press2.srcElement = $("#dumper")[0];
press2.target = $("#dumper")[0];
press2.type = "keypress";
press2.view = Window;
press2.which = 51;
$("#dumper").focus().trigger(press).trigger(press2);
}