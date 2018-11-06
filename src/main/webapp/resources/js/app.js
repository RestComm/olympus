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
  'mgcrea.ngStrap.modal',
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
    when('/', {templateUrl: 'modules/sign-in.html', controller: 'SignInCtrl'}).
    when('/home', {templateUrl: 'modules/home.html', controller: 'HomeCtrl'}).
    otherwise({redirectTo: '/'});
}]);

let vndId = window.location.hostname.substr(0, window.location.hostname.indexOf('.')) || window.location.hostname;

angular.element(document).ready(['$http', function ($http) {
  // manually inject $q since it's not available
  var initInjector = angular.injector(['ng']);
  var $q = initInjector.get('$q');
  var $window = initInjector.get('$window');

  let wlDefaultPromise = $q.defer();
  $http.get($window.location.pathname + 'conf/olympus-settings.json?v=' + (+new Date())).success((response) => {
    wlDefaultPromise.resolve(response);
  }).error(() => {
    wlDefaultPromise.resolve({});
  });

  let wlPromise = $q.defer();
  $http.get($window.location.pathname + `resources/vnd/${vndId}/olympus-settings.json?v=` + (+new Date())).success((response) => {
    wlPromise.resolve(response);
  }).error(() => {
    wlPromise.resolve({});
  });

  $q.all([wlDefaultPromise.promise, wlPromise.promise]).then((responses) => {
    angular.module('mcWebRTC.services').factory('WLSettings', function () {
      let defSettings = typeof responses[0] === 'string' ? JSON.parse(responses[0]) : responses[0];
      let wlSettings = typeof responses[1] === 'string' ? JSON.parse(responses[1]) : responses[1];
      return _.extend({}, defSettings, wlSettings);
    });
    angular.bootstrap(document, ['mcWebRTC']);
  }, (error) => {
    console.error('Internal server error', error);
  });
}]);

olyMod.run(function($rootScope, $location, $anchorScroll, $http, WLSettings) {

  $rootScope.vndId = vndId;
  var defaultFaviconUrl = 'resources/images/favicon.png';
  var vendorFaviconUrl = 'resources/vnd/' + $rootScope.vndId + '/favicon.png';

  $http({method: 'GET', url: vendorFaviconUrl}).then(
    function(response) {
      if (response.status === 200) {
        // there's some caching issue if the filename is same as already used, append timestamp
        $rootScope.faviconUrl = vendorFaviconUrl + '?' + Date.now();
      } else {
        $rootScope.faviconUrl = defaultFaviconUrl;
      }
    },
    function () {
      $rootScope.faviconUrl = defaultFaviconUrl;
    });

  $rootScope.wls = WLSettings;
});

olyMod.run(function ($rootScope, backdropService) {
  // Make backdropService available in the scope
  $rootScope.backdropService = backdropService;



});


