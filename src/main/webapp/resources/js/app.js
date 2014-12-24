'use strict';

// Declare app level module which depends on views, and components
var olyMod = angular.module('mcWebRTC', [
  'ngRoute',
  'ngResource',
  'ui.bootstrap',
  'mcWebRTC.filters',
  'mcWebRTC.services',
  'mcWebRTC.directives',
  'mcWebRTC.controllers'
]);
olyMod.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {templateUrl: 'modules/register.html', controller: 'RegisterCtrl'}).
    when('/room', {templateUrl: 'modules/room.html', controller: 'RegisterCtrl'}).
    otherwise({redirectTo: '/'});

  // $locationProvider.html5Mode(true);
}]);