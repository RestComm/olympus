'use strict';

/* Services */
var olyServices = angular.module('mcWebRTC.services', []);

olyServices.service('wrtcEventListener', function($rootScope, $timeout) {

  this.onWebRTCommClientOpenErrorEvent = function(error) {
    $rootScope.$broadcast('REGISTRATION_STATUS', -1, error);
    // TODO: this.onClickStopVideoStreamButtonViewEventHandler();
  };

  this.onWebRTCommClientOpenedEvent = function() {
    $timeout(function() {
      $rootScope.$broadcast('REGISTRATION_STATUS', 0);
    });
  };

  this.onWebRTCommClientClosedEvent = function () {
    // TODO: this.onClickStopVideoStreamButtonViewEventHandler();
    // alert('// TODO: this.onClickStopVideoStreamButtonViewEventHandler();');
  };

  this.onGetUserMediaErrorEventHandler = function(error) {
    console.debug('MobicentsWebRTCPhoneController:onGetUserMediaErrorEventHandler(): error='+error);
    // alert('Failed to get local user media: error='+error);
  };

  /* == Call related listeners ============================================== */

  this.onWebRTCommCallRingingEvent = function(webRTCommCall) {
    $rootScope.$broadcast('CALL_INCOMING', webRTCommCall);
  };

  this.onWebRTCommCallInProgressEvent = function(webRTCommCall) {
    // alert('call in progress...');
    $rootScope.$broadcast('CALL_IN_PROGRESS', webRTCommCall);
  };

  this.onWebRTCommCallRingingBackEvent = function(webRTCommCall) {
    // alert('ringing back...');
    $rootScope.$broadcast('CALL_OUTGOING_RINGING', webRTCommCall);
  };

  this.onWebRTCommCallOpenErrorEvent = function(webRTCommCall, error) {
    $rootScope.$broadcast('CALL_OPEN_ERROR', webRTCommCall, error);
  };

  this.onWebRTCommCallClosedEvent = function(webRTCommCall) {
    $rootScope.$broadcast('CALL_CLOSED', webRTCommCall);
  };

  this.onWebRTCommCallOpenedEvent = function(webRTCommCall) {
    $rootScope.$broadcast('CALL_OPENED', webRTCommCall);
  };

  this.onWebRTCommCallHangupEvent = function(webRTCommCall) {
    $rootScope.$broadcast('CALL_HANGUP', webRTCommCall);
  };


  /* == End of Call related listeners ======================================= */

  /* == Messages related listeners ========================================== */

  this.onWebRTCommMessageReceivedEvent = function(message) {
    console.log(message);
    $rootScope.$broadcast('MESSAGE_RECEIVED', message);
  };

  this.onWebRTCommMessageSentEvent = function(message) {
    $rootScope.$broadcast('MESSAGE_SENT', message);
  };

  this.onWebRTCommMessageSendErrorEvent = function(message, error) {
    $rootScope.$broadcast('MESSAGE_FAILED', message, error);
  };

  /* == End of Messages related listeners =================================== */

});

/* TODO: Make it a service ?
olyServices.service('olyChat', function($rootScope) {
});
*/