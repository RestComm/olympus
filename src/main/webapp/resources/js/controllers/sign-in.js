'use strict';

var olyMod = angular.module('mcWebRTC');

olyMod.controller('SignInCtrl', function ($scope, $rootScope, $location, $timeout, $animate, $http, $window, wrtcEventListener) {

  $rootScope.clientVersion = '1.0.0';

  $scope.iceServers = [];

  $http.get('resources/xml/olympus.xml', {
    transformResponse: function (xmlResponse) {
      return new X2JS().xml_str2json(xmlResponse);
    }
    })
    .then(function successCallback(response) {
      var olympusConfig = response.data.olympus;
      $scope.serverAddress =  olympusConfig.server.address || $window.location.hostname;

      if (olympusConfig.server._secure && olympusConfig.server._secure.toLowerCase() === 'true') {
        $scope.serverProtocol = olympusConfig.server._secure === 'true' ? 'wss' : 'ws';
      }
      else {
        $scope.serverProtocol = $location.protocol() === 'https' ? 'wss' : 'ws';
      }
      $scope.serverPort = ($scope.serverProtocol === 'wss' ? (olympusConfig.server['secure-port'] || 5083) : (olympusConfig.server.port || 5082));
      $scope.serverPath = olympusConfig.server.path || '';

      $scope.sipRegisterMode = olympusConfig.client._register !== 'false';
      $scope.sipDomain =  olympusConfig.client.domain || $window.location.hostname;
      $scope.sipUserAgent =  olympusConfig.client['user-agent'] || 'TelScale RTM Olympus';

      if (olympusConfig.turn && olympusConfig.turn._enabled.toLowerCase() !== 'false') {
        $scope.iceAutoConfig = {
          address: olympusConfig.turn.address || 'https://global.xirsys.net/_turn/',
          domain: olympusConfig.turn.domain || '',
          login: olympusConfig.turn.login || '',
          password: olympusConfig.turn.password || ''
        };
      }

      if (olympusConfig.stun && olympusConfig.stun._enabled.toLowerCase() === 'true') {
        $scope.iceServers.push(
          { url: 'stun:' + (olympusConfig.stun.address ?
              (olympusConfig.stun.address + ':' + (olympusConfig.stun.port || 19302)) : 'stun.l.google.com:19302') });
      }

      $scope.outboundProxy = {
        address: $scope.serverProtocol + '://' + $scope.serverAddress + ':' + $scope.serverPort + '/' + $scope.serverPath
      };
  });

  $rootScope.loggedUser = '';

  $scope.sip = {
    displayName: 'Alice Alissys',
    // username: 'alice',
    // login: 'alice',
    // password: '1234',
    // domain: $scope.serverAddress
  };

  $scope.mirrorUsername = function() {
    $scope.sip.displayName = $scope.sip.login = $scope.sip.username;
  };

  var processICEAutoConfig = function () {
    if (!$scope.iceAutoConfig.address) {
      return;
    }

    if (!$scope.iceAutoConfig.login || !$scope.iceAutoConfig.password) {
      console.warn('Not all parameters for ICE Auto Config are set, please check.');
    }

    // because Firefox is picky...
    $.ajaxSetup({
      beforeSend: function(xhr) {
        xhr.setRequestHeader ("Authorization", "Basic " + btoa($scope.iceAutoConfig.login + ":" + $scope.iceAutoConfig.password));
        if (xhr.overrideMimeType) {
          xhr.overrideMimeType('application/json');
        }
      }
    });

    $.ajax({
      type: 'PUT',
      url: $scope.iceAutoConfig.address + ($scope.iceAutoConfig.domain || ''),
      data: {},
      success: function (data) {
        if (data.v.iceServers) {
          $scope.iceServers = $scope.iceServers.concat(data.v.iceServers);
        }
        else {
          console.warn('Invalid answer from ICE Auto Config server', data);
        }
      },
      async: false
    });
  };

  $scope.connect = function() {
    $scope.registerFailed = false;
    $scope.registering = true;

    processICEAutoConfig();

    // TODO: Make scope config match this, so we don't need to re-format it here
    var wrtcConfiguration = {
      communicationMode: WebRTCommClient.prototype.SIP,
      sip: {
        sipUserAgent: $scope.sipUserAgent + '/' +  $rootScope.clientVersion,
        sipRegisterMode: $scope.sipRegisterMode,
        sipOutboundProxy: $scope.outboundProxy.address,
        sipDomain: $scope.sipDomain,
        sipDisplayName: $scope.sip.displayName,
        sipUserName: $scope.sip.username,
        sipLogin: $scope.sip.login,
        sipPassword: $scope.sip.password
      },
      RTCPeerConnection: {
        iceServers: $scope.iceServers
      }
    };

    $rootScope.wrtcClient = new WebRTCommClient(wrtcEventListener);
    $rootScope.wrtcClient.open(wrtcConfiguration);
  };

  $scope.registering = false;
  $scope.shakeit = false;

  $scope.$on('REGISTRATION_STATUS', function(event, status, error) {
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
          if (error === 'Connection to WebRTCommServer has failed') {
            $scope.loginError = 'Service is temporarily unavailable. Please try again later.';
            if ($location.host().endsWith('.restcomm.com')) {
              $scope.loginError += '<br>If the problem persists, check <a target="_blank" href="http://status.restcomm.com/">Restcomm Status</a> for information.';
            }
          }
          else {
            $scope.loginError = 'Invalid Username or Password. Please try again.';
          }
        }
      });
  });

  // Auto-login functionality, based on stored credentials

  if (sessionStorage.sid && sessionStorage.auth_token) {
    var auth_header = sessionStorage.sid + ":" + sessionStorage.auth_token;
    auth_header = "Basic " + btoa(auth_header);
    $http({
      method: 'GET',
      url: '/restcomm/2012-04-24/Accounts/' + sessionStorage.sid + '/Clients.json',
      headers: {
        'Authorization': auth_header
      }
    }).then(
      function successCallback(response) {
        $scope.predefinedClients = response.data;
      },
      function errorCallback(response) {
        // noop
      });
  }

  $scope.loginAs = function(login) {
    $scope.sip.username = login;
    $scope.mirrorUsername();
    angular.forEach($scope.predefinedClients, function(client) {
      if (client.login === login) {
        $scope.sip.password = client.password;
      }
    });
    $timeout(function() {
      $scope.connect();
    });
  };

  $scope.startUser = 0;
  $scope.maxUsers = 3;

  $scope.nextUsers = function() {
    $scope.startUser = Math.min($scope.predefinedClients.length - $scope.maxUsers, $scope.startUser + $scope.maxUsers);
  };

  $scope.prevUsers = function() {
    $scope.startUser = Math.max(0, $scope.startUser - $scope.maxUsers);
  }
});
