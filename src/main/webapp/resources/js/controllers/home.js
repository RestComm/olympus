/* jslint node: true, browser: true */
/* global angular: true */

'use strict';

var olyMod = angular.module('mcWebRTC');

olyMod.controller('HomeCtrl', function ($scope, $rootScope, $filter, $location, $timeout, $interval, $window, $alert, tourManager, $modal) {

  $scope.Math = window.Math;

  var TOGGLE_KEYPAD_KEY = 190; // '.'

  $rootScope.onKeyUp = function(key) {
    if (key === TOGGLE_KEYPAD_KEY) {
      // let's make sure we don't trigger when writing on text elements
      var activeElement = document.activeElement;
      var inputs = ['input', 'select', 'textarea'];
      if (activeElement && inputs.indexOf(activeElement.tagName.toLowerCase()) === -1) {
        $scope.toggleKeypad();
      }
    }
  };

  $rootScope.logs = [
    {time: Date.now(), level: 'INFO', message: 'Loaded Olympus v2!'}
  ];

  var log = function(logLevel, message, alert) {
    $rootScope.logs.push({time: Date.now(), level: logLevel, message: message});
    if (alert) {
      $alert({
        title: '<i class="fa fa-' + (alert.icon || '') + '"></i> ' + alert.title,
        content: alert.content || message,
        type: (alert.type || $filter('lowercase')(logLevel)), duration: alert.duration || 10,
        show: true, html: true,
        container: '.notifications-container'
      });
    }
  };

  if (!$rootScope.loggedUser || $rootScope.loggedUser === '') {
    // $rootScope.loggedUser = 'alice';
    $location.path('/');
    return;
  }
  else {
    log('INFO', 'The user "' + $rootScope.loggedUser + '" has logged in to Olympus.', {
      icon: 'thumbs-up', title: 'Welcome back!',
      content: 'Welcome back to Olympus, ' + $rootScope.loggedUser + '. Who will you meet today ?',
      type: 'info', duration: 10});

    $window.onbeforeunload = function() {
      if ($rootScope.loggedUser) {
        return 'Are you sure you want to leave Olympus ?';
      }
    };

    $window.onunload = function() {
      $scope.closeConnection();
    };
  }

  // -- OLYMPUS v2 -------------------------------------------------------------

  $scope.closeConnection = function () {
    if ($rootScope.loggedUser && $rootScope.wrtcClient) {
      $rootScope.wrtcClient.close();
    }
  };

  // FIXME: fake contacts
  $scope.contacts = [
    {id: 'jgrey',   name: 'Jean Dylan',        address: 'dylan'},
    {id: 'charlie', name: 'Charles Xavier',    address: 'charlie'},
    {id: '1234',    name: 'Hello Play Demo',   address: '+1234', icon: 'play'},
    {id: '1235',    name: 'Hello Say Demo',    address: '+1235', icon: 'bullhorn'},
    {id: '1236',    name: 'Hello Gather Demo', address: '+1236', icon: 'hand-o-up'},
    {id: '1310',    name: 'Conference Client', address: '+1310', icon: 'headphones'},
    {id: '1311',    name: 'Conference Admin',  address: '+1311', icon: 'briefcase'}
  ];

  // TODO: Remove, just for demo...
  if($scope.loggedUser !== 'alice' && $scope.loggedUser !== 'Alice Alissys') {
    $scope.contacts.splice(0, 0, {id: 'alice', name: 'Alice Alissys', address: 'alice'});
  }
  if ($scope.loggedUser !== 'bob') {
    $scope.contacts.splice(0, 0, {id: 'bob', name: 'Bob Robert', address: 'bob'});
  }

  var loadContacts = function() {
    if ($window.localStorage.getItem($scope.loggedUser + '_contacts')) {
     $scope.contacts = angular.fromJson($window.localStorage.getItem($scope.loggedUser + '_contacts'));
    }
  };

  var saveContacts = function() {
    $window.localStorage.setItem($scope.loggedUser + '_contacts', angular.toJson($scope.contacts));
  };

  var getContactById = function(contactId, tryAddress) {
    for (var i = 0; i < $scope.contacts.length; i++) {
      if (contactId === $scope.contacts[i].id || (tryAddress && contactId === $scope.contacts[i].address)) {
        return $scope.contacts[i];
      }
    }
  };

  var moveContactToTop = function(contactId) {
    var contact = getContactById(contactId, true);
    $scope.contacts.splice(0, 0, $scope.contacts.splice($scope.contacts.indexOf(contact), 1)[0]);
    saveContacts();
  };

  loadContacts();

  $scope.hasContacts = true;
  $scope.hasRooms = false;

  $scope.selectContact = function(contact) {
    $scope.ac = contact;
    $scope.videoClass = 'fadeIn';
    if ($scope.activeChats[contact.id]) {
      $scope.activeChats[contact.id].unread = 0;
    }
    $timeout(function() {
      $scope.videoClass = '';
    }, 1000);
  };

  $scope.toggleSidebar = function(section) {
    if ($scope.sidebarAction === section) {
      delete $scope.sidebarAction;
    }
    else {
      $scope.sidebarAction = section;
    }
  };

  // -- Messaging --

  // $scope.chat = [{"time":1476584495106,"direction":"in","from":"alice","text":"ewrjwej"},{"time":1476584511105,"direction":"in","from":"alice","text":";)"},{"time":1476584544105,"direction":"in","from":"alice","text":"Random Stuff"}];//[];

  var addEntryToChat = function(chatId, entry) {
    if ($scope.activeChats[chatId]) {
      $scope.activeChats[chatId].history.push(entry);
    }
    else {
      $scope.activeChats[chatId] = {id: chatId, status: 'normal', history: [entry]};
    }

    // reveal the chat in case it is hidden (for windowed chats)
    if ($scope.activeChats[chatId].status === 'hid') {
      $scope.activeChats[chatId].status = 'normal';
    }
    else if ($scope.activeChats[chatId].status === 'min' || !$scope.ac || chatId !== $scope.ac.id) {
      $scope.activeChats[chatId].unread = ($scope.activeChats[chatId].unread || 0) + 1;
    }

    $timeout(function() {
      // FIXME: make this a directive!
      $(".chat-container").scrollTop($(".chat-container")[0].scrollHeight);
    }, 50);
  };

  $scope.sendMessage = function (ac) {
    if (false && currentCall && currentCall.peerConnectionState === 'established') {
      // FIXME: Check if the connection is to the contact
      currentCall.sendMessage(ac.writeText);
    }
    else {
      $rootScope.wrtcClient.sendMessage(ac.id, ac.writeText);
    }
    var entry = {time: Date.now(), direction: 'out', status: 'pending', from: $rootScope.loggedUser, text: ac.writeText};
    var chatId = ac.id.substr(0, ac.id.indexOf('@') === -1 ? 999 : ac.id.indexOf('@'));
    addEntryToChat(chatId, entry);
    $scope.ac.writeText = '';

    moveContactToTop($scope.ac.id);
  };

  $scope.$on('MESSAGE_RECEIVED', function (event, message) {
    $('#snd_message')[0].play(); // FIXME ?
    console.log('got message', event, message);
    $scope.$apply(
      function() {
        //var entry = {time: Date.now(), direction: 'in', from: message.from, text: message.text};
        var entry = {time: Date.now(), direction: 'in', text: message.text};
        var chatId = message.from.substr(0, message.from.indexOf('@') === -1 ? 999 : message.from.indexOf('@'));
        if($scope.activeChats[chatId]) {
          moveContactToTop(chatId);
          addEntryToChat(chatId, entry);
        }
        else {
          $scope.activeChats[chatId] = {id: message.from, status: 'normal', history: [entry], unread: ($scope.ac && chatId === $scope.ac.id ? 0 : 1)};
          var existingContact = false;
          for (var i = 0; i < $scope.contacts.length; i++) {
            if (chatId === $scope.contacts[i].id || chatId === $scope.contacts[i].address) {
              moveContactToTop($scope.contacts[i].id);
              existingContact = true;
              break;
            }
          }
          if (!existingContact) {
            $scope.contacts.unshift({id: chatId, name: chatId, address: message.from, icon: 'user-secret'});
          }
        }
      });
  });

  $scope.$on('MESSAGE_SENT', function (event, message) {
    $scope.$apply(
      function() {
        var chatId = message.to.substr(0, message.to.indexOf('@') === -1 ? 999 : message.to.indexOf('@'));
        if($scope.activeChats[chatId]) {
          var msgs = $filter('filter')($scope.activeChats[chatId].history, { direction: 'out', status: 'pending', text: message.text });
          if (msgs.length > 0) {
            msgs[0].status = 'delivered';
          }
        }
        else {
          //window.alert('FIXME: no chat for [' + chatId + ']...');
        }
      });
  });

  $scope.$on('MESSAGE_FAILED', function (event, message/*, error*/) {
    $scope.$apply(
      function() {
        var chatId = message.to.substr(0, message.to.indexOf('@') === -1 ? 999 : message.to.indexOf('@'));
        if($scope.activeChats[chatId]) {
          var msgs = $filter('filter')($scope.activeChats[chatId].history, { direction: 'out', status: 'pending', text: message.text });
          if (msgs.length > 0) {
            msgs[0].status = 'failed';
          }
        }
        else {
          //window.alert('FIXME: no chat for [' + chatId + ']...');
        }
      });
  });

  // -- OLYMPUS v2 - END -------------------------------------------------------

  // -- Local Media Management -------------------------------------------------

  $scope.setMarginTop = function() {
    $timeout(function() {
      var leTop = $('.contacts-popover').css('top');
      if(leTop) {
        var topMar = Math.min(parseInt(leTop.substr(1, leTop.indexOf('px')-1)), 150) + 50;
        $scope.contactsMarginTop = topMar + 'px';
      }
    }, 250);
  };

  /* TODO: For future use, if needed to replace webcam directive
   navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

   navigator.getMedia( {video:
   {mandatory: { maxWidth: 640, maxHeight: 360, minWidth: 640, minHeight: 360 } }, audio: true},
   function(stream) {
   $timeout(function() {
   $rootScope.myStream = stream;
   $scope.localVideo = $sce.trustAsResourceUrl(URL.createObjectURL(stream));
   });
   },
   function(err) {
   $scope.noVideo = true;
   log('WARN', 'Permission to access the webcam/microphone has been denied. You may not be able to make calls!', {
   title: 'No Media Access',
   icon: 'warning', type: 'warning'});
   }
   );
   **/

  var currentCall;
  // -- Alerts and Notification Management -------------------------------------
  // TODO: Move to service/factory

  $rootScope.signOut = function () {
    $scope.closeConnection();
    delete $rootScope.loggedUser;
    $location.path('/');
  };

  $scope.toggleConsole = function () {
    $rootScope.showConsole = !$rootScope.showConsole;
  };

  $scope.layouts = {'SbS':'Side-by-Side', 'FuW': 'Full Window', 'FuS': 'Full Screen'};
  $scope.activeLayout = 'SbS';

  $scope.setActiveLayout = function(id) {
    this.$hide && this.$hide();
    if(id === 'FuS') {
      $scope.remoteFS = true;
    }
    $scope.activeLayout = id;
  };

  $scope.$watch('remoteFS', function(newValue, oldValue) {
    if (newValue !== oldValue) {
      if(newValue === true) {
        $scope.activeLayout = 'FuS';
      }
      else {
        $scope.activeLayout = 'FuW';
      }
    }
  });

  $scope.playDTMF = function (dtmf) {
    currentCall.sendDTMF(dtmf);
    $('audio[title="' + dtmf + '"]')[0].play();
  };

  $scope.toggleKeypad = function () {
    $scope.showKeypad = !$scope.showKeypad;
    $timeout(function() {
      angular.element('.keypad-btn').focus();
    });
  };

  $scope.keypressDTMF = function (event) {
    var dtmf;
    if (event.keyCode === 35 || (event.keyCode === 51 && event.shiftKey)) { // # (shift + 3)
      dtmf = '\\#';
    }
    else if (event.keyCode === 42 || ((event.keyCode === 56 || event.keyCode === 187) && event.shiftKey)) { // * (shift + 8)
      dtmf = '\\*';
    }
    else if (event.keyCode >= 48 && event.keyCode <= 57) { // 0 to 9
      dtmf = String.fromCharCode(event.keyCode);
    }

    $timeout(function() {
      angular.element('#btnDTMF' + dtmf).trigger('focus').trigger('click');
    });
  };

  $scope.videoConstraints = {
    'mandatory': { 'minWidth': '480', 'minHeight': '360' },
    'optional': [ { 'minWidth': '480' }, { 'minHeight': '360' } ]
  };

  $scope.getRemoteHeight = function() {
    return (parseInt($scope.videoConstraints.mandatory.minHeight) + 37) + 'px';
  };

  // -- Contact List -----------------------------------------------------------

  $scope.toggleContactList = function () {
    $scope.showContacts = !$scope.showContacts;
  };

  $scope.$watch('newContact.address', function(newAddress) {
    for (var i = 0; i < $scope.contacts.length; i++) {
      if (newAddress === $scope.contacts[i].address &&
          (!$scope.editingContact || ($scope.editingContact && $scope.curContact !== $scope.contacts[i]))) {
        $scope.duplicateContact = true;
        return;
      }
    }
    $scope.duplicateContact = false;
  });

  $scope.addContact = function () {
    var contact = {
      name: $scope.newContact.name || $scope.newContact.address,
      address: $scope.newContact.address,
      id: $scope.newContact.address.substr(0, $scope.newContact.address.indexOf("@")) || $scope.newContact.address
    }
    $scope.contacts.unshift(contact);
    log('SUCCESS', 'The contact "' + ($scope.newContact.name || $scope.newContact.address)  + ' (' + $scope.newContact.address + ')" has been added to the contact list.', {
      icon: 'users', title: 'Contact added!'});
    $scope.selectContact(contact);
    if (tourManager.context.voiceOrSms == 'sms')
      tourManager.goto('step-send-the-message','step-enter-contact-address');
    else
      tourManager.goto('step-make-the-call','step-enter-contact-address');

    $scope.newContact = {};
    $scope.addContactForm.$setPristine();
    saveContacts();
    delete $scope.sidebarAction;
  };

  $scope.editContact = function (contact) {
    $scope.editingContact = true;
    $scope.curContact = contact;
    $scope.newContact = angular.copy(contact);
    $scope.toggleSidebar('addContact');
  };

  $scope.cancelEditContact = function() {
    delete $scope.editingContact;
    delete $scope.curContact;
    $scope.newContact = {};
    $scope.addContactForm.$setPristine();
    $scope.toggleSidebar('addContact');
  };

  $scope.saveEditContact = function() {
    $scope.curContact.name = $scope.newContact.name;
    $scope.curContact.address = $scope.newContact.address;
    saveContacts();
    $scope.cancelEditContact();
  };

  $scope.isValidContact = function () {
    if ($scope.newContact && $scope.newContact.address) {
      return $filter('filter')($scope.contacts, {address: $scope.newContact.address}, true).length === 0;
    }
    return false;
  };

  $scope.preDeleteContact = function (contact) {
    contact.deleteConfirm = $timeout(function () { contact.deleteConfirm = false; }, 2000);
  };

  $scope.deleteContact = function (contact) {
    if (contact.deleteConfirm) {
      $timeout.cancel(contact.deleteConfirm);
    }
    var contactIdx = $scope.contacts.indexOf(contact);
    $scope.contacts.splice(contactIdx, 1);
    delete $scope.activeChats[contact.id];
    log('SUCCESS', 'The contact "' + (contact.name || contact.address)  + ' (' + contact.address + ')" has been deleted from the contact list.', {
      icon: 'trash-o', title: 'Contact deleted!'});
    saveContacts();
    $scope.cancelEditContact();
    $scope.selectContact($scope.contacts[Math.min($scope.contacts.length - 1, contactIdx)]);
  };

  $scope.isClient = function(contact) {
    return contact.address.indexOf('@') > 0;
  };

  // -- Webcam Directive Callbacks ---------------------------------------------

  $scope.onStream = function (stream) {
    $scope.$apply(
      function () {
        $rootScope.myStream = stream;
        $scope.localVideo = stream;
      }
    );
  };

  $scope.onStreaming = function () {
    $scope.$apply(
      function () {
        $scope.streaming = true;
      }
    );
  };

  $scope.onError = function (err) {
    $scope.$apply(
      function () {
        $scope.noVideo = true;
        log('WARN', 'Permission to access the webcam/microphone has been denied. You may not be able to make calls!', {
          title: 'No Media Access',
          icon: 'warning', type: 'warning'});
      }
    );
  };

  $scope.fsVideo = false;
  $scope.toggleFullScreen = function() {
    $scope.fsVideo = !$scope.fsVideo;
  };

  var requestStream = function(video, callback) {
    $rootScope.myStream = undefined;
    $scope.isVideoCall = video;
    $scope.requestStream = true;
    var removeStreamWatch = $rootScope.$watch('myStream', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        if(newValue) {
          callback();
          removeStreamWatch();
        }
      }
    });
  };

  $scope.callContact = function(contactId, video) {
    moveContactToTop(contactId);
    requestStream(video, function() { $scope.makeCall(contactId, video); });
  };

  $scope.makeCall = function(contactId, video) {
    var callConfiguration = {
      displayName: $rootScope.loggedUser,
      localMediaStream: $rootScope.myStream,
      audioMediaFlag: true,
      videoMediaFlag: video,
      messageMediaFlag: false,
      audioCodecsFilter: '', // TODO ?
      videoCodecsFilter: ''  // TODO ?
    };

    currentCall = $rootScope.wrtcClient.call(contactId, callConfiguration);
    $scope.inCall = extractCallToScope(currentCall);
    $scope.inCall.intStatus = 'CONNECTING...';
  };

  var extractCallToScope = function(call) {
    return {
      calleePhoneNumber: call.calleePhoneNumber,
      callerDisplayName: call.callerDisplayName,
      callerPhoneNumber: call.callerPhoneNumber,
      contact: getContactById(call.calleePhoneNumber || call.callerPhoneNumber, true),
      isVideo: call.remoteSdpOffer && call.remoteSdpOffer.indexOf(VIDEO_CALL_SDP) > -1,
      //configuration: Object
      //connector: PrivateJainSipCallConnector
      //dtmfSender: undefined
      //eventListener: Object
      id: call.id,
      incomingCallFlag: call.incomingCallFlag
      //messageChannel: undefined
      //peerConnection: RTCPeerConnection
      //peerConnectionState: "new"
      //remoteAudioMediaStream: undefined
      //remoteBundledAudioVideoMediaStream: undefined
      //remoteSdpOffer: undefined
      //remoteVideoMediaStream: undefined
      //webRTCommClient: WebRTCommClient
    };
  };

  $scope.chatContact = function(contact) {
    var chatId = contact.substr(0, contact.indexOf('@') === -1 ? 999 : contact.indexOf('@'));
    if(!$scope.activeChats[chatId]) {
      $scope.activeChats[chatId] = {id: contact,  status: 'normal', history: []};
    }
    else {
      $scope.activeChats[chatId].status = 'normal';
    }
  };

  // -- INCOMING CALL ----------------------------------------------------------

  var AUDIO_CALL_SDP = 'm=audio';
  var VIDEO_CALL_SDP = 'm=video';

  $scope.$on('CALL_INCOMING', function (event, call) {
    currentCall = call;
    $scope.$apply(
      function() {
        var chatId = call.callerPhoneNumber.substr(0, call.callerPhoneNumber.indexOf('@') === -1 ? 999 : call.callerPhoneNumber.indexOf('@'));
        if ($scope.activeChats[chatId]) {
          moveContactToTop(chatId);
        }
        else {
          $scope.activeChats[chatId] = {id: call.callerPhoneNumber, status: 'normal', history: [], unread: 0};
          var existingContact = false;
          for (var i = 0; i < $scope.contacts.length; i++) {
            if (chatId === $scope.contacts[i].id || chatId === $scope.contacts[i].address) {
              moveContactToTop($scope.contacts[i].id);
              existingContact = true;
              break;
            }
          }
          if (!existingContact) {
            $scope.contacts.unshift({id: chatId, name: chatId, address: call.callerPhoneNumber, icon: 'user-secret'});
          }
        }

        $scope.inCall = extractCallToScope(call);
        moveContactToTop(call.callerPhoneNumber);
        $scope.selectContact($scope.contacts[0]);
        $('#snd_ringing')[0].play(); // FIXME ?
      });
  });

  $scope.$on('CALL_HANGUP', function (event, call) {
    if (call.peerConnectionState === 'established') {
      // call was established, we were on a call
      registerCallEvent('oncall', call.incomingCallFlag ? call.callerPhoneNumber : call.calleePhoneNumber);
    }
    else if (call.incomingCallFlag) {
      // we have rejected it
      registerCallEvent('missed', call.callerPhoneNumber);
    }
    cleanupCurrentCall();
  });

  $scope.acceptCall = function(video) {
    requestStream(video, function() { $scope.doAcceptCall(video); });
  };

  $scope.doAcceptCall = function(video) {
    $('#snd_ringing')[0].pause(); // FIXME ?
    var callConfiguration = {
      displayName: $scope.loggedUser,
      localMediaStream: $rootScope.myStream,
      audioMediaFlag: true,
      videoMediaFlag: video,
      messageMediaFlag: false
    };

    currentCall.accept(callConfiguration);
  };

  $scope.rejectCall = function() {
    currentCall.reject();
  };

  var cleanupCurrentCall = function() {
    $timeout(function() {
      angular.element('#snd_ringing')[0].pause();
      angular.element('#snd_ringback')[0].pause();
      if ($scope.inCall && $scope.inCall.timerProm) {
        $interval.cancel($scope.inCall.timerProm);
      }
      delete $scope.requestStream;
      delete $scope.remoteVideo;
      delete $scope.inCall;
      currentCall = undefined;
    });
  };

  // -- OUTGOING CALL ----------------------------------------------------------

  $scope.$on('CALL_OUTGOING_RINGING', function (event, call) {
    $scope.$apply(
      function() {
        currentCall = call;
        $scope.inCall = extractCallToScope(currentCall);
        console.log('incoming call', $scope.inCall);
        $scope.inCall.intStatus = 'RINGING...';
        $('#snd_ringback')[0].play();
      });
  });

  $scope.$on('CALL_ERROR', function (event, call, error) {
    $scope.$apply(
      function() {
        // TODO: CALL_ERROR can occur both in outgoing & incoming calls, but for incoming I can't get access to the number of the peer (for outgoing it's calleePhoneNumber and for incoming callerPhoneNumber is undefined for some reason). Let's leave the number out for now since the user has enough context to figure it out. Once we migrate to restcomm-web-sdk, the number will be there in the Connection object
        //log('WARN', 'Call with ' + $scope.inCall.calleePhoneNumber + ' has failed with "' + error + '".');
        $('#snd_ringback')[0].pause();
        log('WARN', 'Call has failed with "' + error + '".');
        $alert({
          //title: '<i class="fa fa-user-times"></i> Call with ' + $scope.inCall.calleePhoneNumber + ' has failed.',
          title: '<i class="fa fa-user-times"></i> Call has failed!',
          content: error,
          type: 'info', duration: 10,
          show: true, html: true,
          container: '.notifications-container'});
      });
  });

  $scope.$on('CALL_OPEN_ERROR', function (event, call, error) {
    registerCallEvent('unanswered', call.calleePhoneNumber);
    cleanupCurrentCall();
  });

  $scope.$on('CALL_CLOSED', function (event, call) {
    if (currentCall) {
      if (call.peerConnectionState === 'established') {
        // we didn't make it through CALL_HANGUP, means we have disconnected
        registerCallEvent('oncall', call.incomingCallFlag ? call.callerPhoneNumber : call.calleePhoneNumber);
      }
      else {
        if (call.incomingCallFlag) {
          // we have rejected an incoming call
          registerCallEvent('rejected', call.callerPhoneNumber);
        }
        else {
          // remote party didn't answer and/or we cancelled our outgoing
          registerCallEvent('unanswered', call.calleePhoneNumber);
        }
      }
    }
    cleanupCurrentCall();
  });

  var registerCallEvent = function(eventType, participant) {
    var entry = {
      time: Date.now(),
      direction: 'system',
      status: 'system',
      from: 'system',
      type: eventType
    };
    participant = participant.substr(0, participant.indexOf('@') === -1 ? 999 : participant.indexOf('@'));
    if (eventType === 'oncall') {
      entry.text = 'You were on a call with ' + participant + ' on ' + new Date().toUTCString() + ' for ' + $filter('secondsToTime')($scope.inCall.callTimer, true) + '.';
    }
    else if (eventType === 'rejected') {
      entry.text = 'You rejected a call from ' + participant + ' on ' + new Date().toUTCString() + '.';
    }
    else if (eventType === 'missed') {
      entry.text = 'Missed call from ' + participant + ' on ' + new Date().toUTCString() + '.';
    }
    else if (eventType === 'unanswered') {
      entry.text = 'Your call to ' + participant + ' on ' + new Date().toUTCString() + ' was not answered.';
    }
    addEntryToChat(participant, entry);
  };

  $scope.$on('CALL_OPENED', function (event, call) {
    console.debug('Event "CALL_OPENED"', event, call);
    $timeout(
      function() {
        $('#snd_ringback')[0].pause();
        if (call.incomingCallFlag) {
          var existingContact = false;
          for (var i = 0; i < $scope.contacts.length; i++) {
            if (call.callerPhoneNumber === $scope.contacts[i].id || call.callerPhoneNumber === $scope.contacts[i].address) {
              $scope.ac = $scope.contacts[i];
              existingContact = true;
              break;
            }
          }
          if (!existingContact) {
            var contactId = call.callerPhoneNumber.substr(0, call.callerPhoneNumber.indexOf('@') === -1 ? 999 : call.callerPhoneNumber.indexOf('@'));
            $scope.contacts.unshift({id: contactId, name: call.callerDisplayName || call.callerPhoneNumber, address: call.callerPhoneNumber, icon: 'user-secret'});
            $scope.ac = $scope.contacts[0];
          }
        }
        currentCall = call;
        $scope.inCall = extractCallToScope(currentCall);
        $scope.inCall.hasRemoteVideo = call.remoteBundledAudioVideoMediaStream.getVideoTracks().length > 0;
        $scope.inCall.intStatus = 'ESTABLISHED';
        $scope.inCall.callTimer = 0;
        $interval.cancel($scope.inCall.timerProm);
        $scope.inCall.timerProm = $interval(function() {
          $scope.inCall.callTimer++;
        }, 1000);
        $scope.remoteVideo = call.getRemoteBundledAudioVideoMediaStream() ||
          call.getRemoteVideoMediaStream() ||
          call.getRemoteAudioMediaStream();
        angular.element('.remote-video')[0].srcObject = $scope.remoteVideo;
      }, 0);
      $timeout(
        function() {
          $scope.rvWidth = angular.element('video.remote-video')[0].videoWidth;
          $scope.rvHeight = angular.element('video.remote-video')[0].videoHeight;
          $scope.isPortrait = $scope.rvWidth < $scope.rvHeight;
          console.log('Remote Video Info - width[' + $scope.rvWidth + '] height[' + $scope.rvHeight + '] portrait[' + $scope.isPortrait + ']');
        }, 500);
  });

  // -- CURRENT CALL(S) --------------------------------------------------------

  $scope.localMuteAudio = function () {
    if ($scope.inCall.localAudioMuted) {
      currentCall.unmuteLocalAudioMediaStream();
    }
    else {
      currentCall.muteLocalAudioMediaStream();
    }
    $scope.inCall.localAudioMuted = !$scope.inCall.localAudioMuted;
  };

  $scope.localMuteVideo = function () {
    if ($scope.inCall.localVideoMuted) {
      currentCall.showLocalVideoMediaStream();
    }
    else {
      currentCall.hideLocalVideoMediaStream();
    }
    $scope.inCall.localVideoMuted = !$scope.inCall.localVideoMuted;
  };

  $scope.remoteMuteAudio = function () {
    if ($scope.inCall.remoteAudioMuted) {
      currentCall.unmuteRemoteAudioMediaStream();
    }
    else {
      currentCall.muteRemoteAudioMediaStream();
    }
    $scope.inCall.remoteAudioMuted = !$scope.inCall.remoteAudioMuted;
  };

  $scope.remoteMuteVideo = function () {
    if ($scope.inCall.remoteAudioMuted) {
      currentCall.showRemoteVideoMediaStream();
    }
    else {
      currentCall.hideRemoteVideoMediaStream();
    }
    $scope.inCall.remoteVideoMuted = !$scope.inCall.remoteVideoMuted;
  };

  $scope.callHangup = function () {
    console.log($scope.inCall);
    if ($scope.inCall) {
      currentCall.close();
    }
  };

  // -- CHAT -------------------------------------------------------------------

  $scope.activeChats = {};

  $scope.timeToGroup = 60000;

  var colors = ['#F44336','#E91E63','#9C27B0','#673AB7','#3F51B5','#2196F3','#03A9F4','#00BCD4','#009688','#4CAF50','#8BC34A','#CDDC39','#FFEB3B','#FFC107','#FF9800','#FF5722','#795548','#607D8B'];//,'#9E9E9E','#000000'];
  // var colors200 = ['#EF9A9A','#F48FB1','#CE93D8','#B39DDB','#9FA8DA','#90CAF9','#81D4FA','#80DEEA','#80CBC4','#A5D6A7','#C5E1A5','#E6EE9C','#FFF59D','#FFE082','#FFCC80','#FFAB91','#BCAAA4','#B0BEC5'];//,'#EEEEEE','#000000'];
  var colorsBackup = colors.slice(0);
  var usedColors = {};

  var hash = function(str) {
    var hash = 0, i, chr, len;
    if (str.length === 0) { return hash; }
    for (i = 0, len = str.length; i < len; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  $scope.getChatColor = function(name) {
    if (!name) {
      return '#000000';
    }
    if (usedColors[name]) {
      return usedColors[name];
    }
    else {
      if (colors.length === 0) {
        colors = colorsBackup.slice(0);
      }
      var idx = Math.abs(hash(name)) % colors.length;
      var color = colors[idx];
      colors.splice(idx, 1);
      usedColors[name] = color;
      return usedColors[name];
    }
  };

  $scope.getChatPosition = function (index) {
    return {'right': 10 + index * 255};
  };

  $scope.minimizeChat = function (id) {
    var chatId = id.substr(0, id.indexOf('@') === -1 ? 999 : id.indexOf('@'));
    if ($scope.activeChats[chatId].status === 'min') {
      $scope.activeChats[chatId].status = 'normal';
      $scope.activeChats[chatId].unread = 0;
    }
    else {
      $scope.activeChats[chatId].status = 'min';
    }
  };

  $scope.clearChatHistory = function (id) {
    var chatId = id.substr(0, id.indexOf('@') === -1 ? 999 : id.indexOf('@'));
    $scope.activeChats[chatId].history = [];
  };

  $scope.closeChat = function (id) {
    var chatId = id.substr(0, id.indexOf('@') === -1 ? 999 : id.indexOf('@'));
    $scope.activeChats[chatId].status = 'hid';
  };

  // initialize with first contact for now
  if ($scope.contacts && $scope.contacts.length) {
    $scope.selectContact($scope.contacts[0]);
  }

  var regStatusTimer;
  var ALIVE_TIMEOUT = 90 * 1000;
  $scope.imAlive = true;

  $scope.$on('REGISTRATION_STATUS', function(event, status, error) {
    $timeout(
      function() {
        if (status === 1) { // keep-alive received
          $scope.imAlive = true;
          $timeout.cancel(regStatusTimer);
          regStatusTimer = $timeout(function () {
            $scope.imAlive = false;
          }, ALIVE_TIMEOUT);
        }
        else {
          console.warn('Unexpected REGISTRATION_STATUS ' + status + ' while logged in.');
        }
      });
  });

  // returns 'true' if we're touring and the address number entered is not in accordance with the phone number in the tour context
  $scope.wrongPhoneNumberForTour = function(address) {
    if (tourManager.stepActive('step-enter-contact-address') && tourManager.context.phoneNumber) {
      if (address != tourManager.context.phoneNumber )
        return true;
      else
        return false;
    }
    // return undefined if we're not touring or in other step
  }

  // Take-a-tour and splash screen stuff
  $scope.$on('CALL_OPEN_ERROR',handleCallErrorsWhileTouring);
  $scope.$on('CALL_ERROR',handleCallErrorsWhileTouring);
  $scope.$on('CALL_OPENED', function () {
    if (tourManager.stepActive('step-make-the-call')) {
      tourManager.stopTour();
      $scope.showTourSplash('call-success',2000);
    }
  });
  $scope.$on('MESSAGE_SENT',function () {
    if (tourManager.stepActive('step-send-the-message')) {
      tourManager.stopTour();
      $scope.showTourSplash('message-success',2000);
    }
  });
  $scope.$on('MESSAGE_FAILED', function () {
    if (tourManager.stepActive('step-send-the-message')) {
      tourManager.stopTour();
      $scope.showTourSplash('message-failure',2000);
    }
  });

  function handleCallErrorsWhileTouring(a,b) {
    if (tourManager.stepActive('step-make-the-call')) {
      tourManager.stopTour();
      $scope.showTourSplash('call-failure',2000);
    }
  }

  $scope.showTourSplash = function(status, delay) {
    console.log('IN showTourSplash()');
    var templatePath = 'modules/templates/tour-splash-' + status + ".html";
    $timeout(function () {
      $modal({
          template: templatePath,
          show: true,
          prefixEvent: 'splash'
      });
    },delay ? delay: 0);
  }

  // when splash is closed redirect to Console
  $rootScope.$on('splash.hide', function (event, params) {
    console.log('modal hidden: ', params.$scope.status);
    if (params.$scope.status == 'ok') {
      window.location = '/';
    }
  });

});
