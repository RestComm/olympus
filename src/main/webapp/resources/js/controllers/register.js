'use strict';

var olyMod = angular.module('mcWebRTC');

olyMod.controller('RegisterCtrl', function ($scope, $rootScope, $location, $timeout) {

  $scope.simplified = true;
  $scope.showAdvanced = false;

  $scope.serverAddress = window.location.hostname;
  $scope.serverPort = '5082';

  $scope.sip = {
    displayName: 'bob',
    username: 'bob',
    domain: $scope.serverAddress,
    login: 'bob',
    password: '1234'
  };

  $scope.stun = {
    address: 'stun.l.google.com:19302'
  };

  $scope.turn = {
    address: 'https://api.xirsys.com/getIceServers',
    login: 'deruelle',
    password: 'bec47bdc-3257-4b84-b992-de9cf5e96dee'
  };

  $scope.outboundProxy = {
    address: 'ws://' + $scope.serverAddress + ':5082'
  };

  $scope.communicationSettings = {
    audioCodecs: undefined,
    videoCodecs: undefined,
    localVideoFormat: '{}'
  };

  $scope.mirrorUsername = function() {
    $scope.sip.displayName = $scope.sip.login = $scope.sip.username;
  };

  // Should be valid at start, we are accessing it!
  $scope.validServer = true;

  $scope.mirrorServer = function() {
    $scope.validServer = validate($scope.serverAddress);
    if($scope.validServer) {
      $scope.outboundProxy.address = 'ws://' + $scope.serverAddress + ':' + $scope.serverPort;
      $scope.sip.domain = $scope.serverAddress;
    }
  };

  var validate = function(str) {
    return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str);
  }

/*
  angular.element(document).ready(function () {
    mobicentsWebRTCPhoneController.onLoadViewEventHandler();
  });
*/

});
