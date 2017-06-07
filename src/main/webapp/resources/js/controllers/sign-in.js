'use strict';

var olyMod = angular.module('mcWebRTC');

olyMod.controller('SignInCtrl', function ($scope, $rootScope, $location, $timeout, $animate, wrtcEventListener) {

  var WS_PROTOCOL = $location.protocol() === 'https' ? 'wss' : 'ws';

  $rootScope.loggedUser = '';

  $scope.simplified = true;
  $scope.showAdvanced = false;

  $scope.serverAddress = window.location.hostname;
  $scope.serverPort = '5082';

  $scope.sip = {
    displayName: 'Alice Alissys',
    // username: 'alice',
    domain: $scope.serverAddress,
    // login: 'alice',
    // password: '1234'
  };

  $scope.stun = {
    address: 'stun.l.google.com:19302'
  };

  $scope.turn = {
    address: 'https://service.xirsys.com/ice',
    domain: 'cloud.restcomm.com',
    login: 'atsakiridis',
    password: '4e89a09e-bf6f-11e5-a15c-69ffdcc2b8a7'
  };

  $scope.outboundProxy = {
    address: WS_PROTOCOL + '://' + $scope.serverAddress + ':' + $scope.serverPort
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
      $scope.outboundProxy.address = WS_PROTOCOL + '://' + $scope.serverAddress + ':' + $scope.serverPort;
      $scope.sip.domain = $scope.serverAddress;
    }
  };

  var validate = function(str) {
    return (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9RTCPeerConnection: ,][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/).test(str);
  };

  $scope.connect = function() {
    $scope.registering = true;

    if($scope.turn.address && $scope.turn.address.indexOf('xirsys.com') > 0) {
      if(!$scope.turn.login || !$scope.turn.password) {
        return;
      }

      // because Firefox is picky...
      $.ajaxSetup({beforeSend: function(xhr) {
        if (xhr.overrideMimeType) {
          xhr.overrideMimeType('application/json');
        }
      }});

      $.ajax({
        type: 'POST',
        url: $scope.turn.address,
        data: {
          domain: $scope.turn.domain,
          room: 'default',
          application: 'default',
          ident: $scope.turn.login,
          secret: $scope.turn.password,
          username: $scope.sip.username,
          secure: '1'
        },
        success: function (data) {
          $scope.iceServers = data.d;
          delete $scope.turn.address;
          delete $scope.turn.login;
          delete $scope.turn.password;
        },
        async: false
      });
    }

    // TODO: Make scope config match this, so we don't need to re-format it here
    var wrtcConfiguration = {
      communicationMode: WebRTCommClient.prototype.SIP,
      sip: {
        sipUserAgent: 'TelScale RTM Olympus/1.0.0',
        sipRegisterMode: true,
        sipOutboundProxy: $scope.outboundProxy.address,
        sipDomain: $scope.sip.domain,
        sipDisplayName: $scope.sip.displayName,
        sipUserName: $scope.sip.username,
        sipLogin: $scope.sip.login,
        sipPassword: $scope.sip.password
      },
      RTCPeerConnection: {
        iceServers: $scope.iceServers.iceServers,
        stunServer: $scope.stun.address,
        turnServer: $scope.turn.address,
        turnLogin: $scope.turn.login,
        turnPassword: $scope.turn.password
      }
    };

    $rootScope.wrtcClient = new WebRTCommClient(wrtcEventListener);
    $rootScope.wrtcClient.open(wrtcConfiguration);
  };

  $scope.registering = false;
  $scope.shakeit = false;

  $scope.$on('REGISTRATION_STATUS', function(event, status/*, error*/) {
    $timeout(
      function() {
        $scope.registering = false;
        if (status === 0) {
          $rootScope.loggedUser = $scope.sip.displayName;
          $location.path('home');
        }
        else {
          $scope.registerFailed = true;
          $scope.shakeit = true;
        }
      });
  });

});
