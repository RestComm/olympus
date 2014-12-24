function makeCall(contact) {
	if (!contact) { return; }
	mobicentsWebRTCPhoneController.onClickCallButtonViewEventHandler(contact, !isDID(contact));
}

var contactsShown = false;
function toggleContacts() {
	// hide self from contact list
	$('#contact_' + $('#username').text()).hide();

	if (chatShown) { toggleChat(); }
	if (contactsShown) {
		$('.main').toggleClass('col-md-9', 350);
		$('.contacts').animate({width:'toggle'}, 300, function() {
			$('.main').toggleClass('col-md-offset-1', 0);
			$('.main').toggleClass('col-sm-offset-2', 0);
		});
	}
	else {
		//$('.main').toggleClass('col-md-9', 'col-md-11',function() {
			$('.main').toggleClass('col-md-offset-1', 0);
			$('.main').toggleClass('col-sm-offset-2', 0);
			$('.contacts').animate({width:'toggle'}, 350);
			$('.main').toggleClass('col-md-9', 300, function() {
			});
		//	});
	}
	contactsShown = !contactsShown;
}

var selectedContact;
function selectContact(contact) {
	if (contact === selectedContact || contact === $('#username').text()) { return; }
	// FIXME: temporary, just to grant we don't type into other user chat
	if (selectedContact !== undefined) {
		//closeChatBoxes();
		chatboxManager.activeChatBox = undefined;
		$('#chatInput' + selectedContact).hide();
		$('#chatbox' + selectedContact).hide();
		$('#remoteVideo' + selectedContact).hide();
	}
	selectedContact = contact;
	if (contact !== undefined) {
		if($('#chatInput' + selectedContact).length > 0) {
			chatboxManager.activeChatBox = contact;
			$('#chatInput' + contact).show();
			$('#chatbox' + contact).show();
			$('#remoteVideo' + selectedContact).show();
		}
		else {
			chat(contact, false);
		}
		$('#roomName').text(contact);
		$('#btnCall').parent().removeClass('disabled');
		//$('#btnVideo').parent().removeClass('disabled');
		//$('#btnAudio').parent().removeClass('disabled');
		if (isDID(contact)) {
			$('#btnText').parent().addClass('disabled');
		}
		else {
			$('#btnText').parent().removeClass('disabled');
		}
		if ($('.contacts').is(":visible")) {
			toggleContacts();
		}
	}
	else {
		$('#roomName').text('Welcome');
		$('#btnCall').parent().addClass('disabled');
		//$('#btnVideo').parent().addClass('disabled');
		//$('#btnAudio').parent().addClass('disabled');
		$('#btnText').parent().addClass('disabled');
	}
}

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

function acceptCall(videoCall) {
	mobicentsWebRTCPhoneController.onClickAcceptCallButtonViewEventHandler(videoCall);
	$("#incomingCall").hide();
}

function rejectCall() {
	mobicentsWebRTCPhoneController.onClickRejectCallButtonViewEventHandler();
	$("#incomingCall").hide();
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

function typeContact(e) {
	var newContact = $('#inputContact').val();
	if (newContact !== '') {
		if($('a[data-contact="' + newContact + '"]').length > 0) {
			$('#btnAddContact').attr('disabled', true);
		}
		else {
			$('#btnAddContact').removeAttr('disabled');
			if (e.which === 13) {
				addContact();
			}
		}
	}
}

function addContact() {
	var newContact = $('#inputContact').val();
	if (newContact !== '') {
		$('#inputContact').val('');
		var newContactElem = $('<dl>' +
			'<dt><i class="glyphicon glyphicon-glass"></i> ' + newContact + '</dt>' +
			'<dd><a class="contact-entry" data-contact="'+ newContact + '" href="" onclick="selectContact(\'' + newContact + '\'); return false;">' + newContact + '</a></dd>' +
			'</dl>');
		$('.contacts').append(newContactElem);
		/*
		$(".contact-entry").popover({
			placement : 'right',
			html : true,
			container: 'body',
			trigger: 'focus',
			content: '<button class="btn btn-sm btn-default" onclick="quickCall(tempContact, true);"><i class="glyphicon glyphicon-facetime-video"></i></button> '+
					'<button class="btn btn-sm btn-default" onclick="quickCall(tempContact, false);"><i class="glyphicon glyphicon-volume-up"></i></button> '+
					'<button class="btn btn-sm btn-default" onclick="quickChat(tempContact);"><i class="glyphicon glyphicon-comment"></i></button>'
			})
			.click(function(e) {
				window.tempContact = $(this).attr('data-contact');
				e.preventDefault();
		});
		*/
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