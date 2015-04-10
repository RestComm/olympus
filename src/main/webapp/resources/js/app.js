/* jslint node: true, browser: true */
/* global angular: true */

'use strict';

// Declare app level module which depends on views, and components
var olyMod = angular.module('mcWebRTC', [
  'ngRoute',
  'ngResource',
  'ngAnimate',
  //'ui.bootstrap.dropdown',
  'mgcrea.ngStrap.tooltip',
  'mgcrea.ngStrap.popover',
  'mgcrea.ngStrap.dropdown',
  'mgcrea.ngStrap.alert',
  'webcam',
  'angularMoment',
  'ngEmoticons',
  'FBAngular',
  'mcWebRTC.filters',
  'mcWebRTC.services',
  'mcWebRTC.directives',
  'mcWebRTC.controllers'
]);
olyMod.config(['$routeProvider', /*'$locationProvider',*/ function($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {templateUrl: 'modules/register.html', controller: 'RegisterCtrl'}).
    when('/room', {templateUrl: 'modules/room.html', controller: 'RoomCtrl'}).
    otherwise({redirectTo: '/#/'});

  // $locationProvider.html5Mode(true);
}]);
