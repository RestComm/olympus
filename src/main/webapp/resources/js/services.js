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

  this.onWebRTCommClientKeepAliveEvent = function() {
    $timeout(function() {
      $rootScope.$broadcast('REGISTRATION_STATUS', 1);
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

  this.onWebRTCommCallErrorEvent = function(webRTCommCall, error) {
    $rootScope.$broadcast('CALL_ERROR', webRTCommCall, error);
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

olyServices.factory('tourManager', function ($compile, $location, $rootScope, $window, backdropService) {
  var service = {};

  var tours = {} //[{steps:[], stepIndex:-1}]
  var activeTour;
  var touringScope;


  service.context = {};

  service.addTour = function(name, tour) {
    tours[name] = tour ? angular.extend(tour, {steps:[], stepIndex:-1, name: name}) : {steps:[], stepIndex:-1, name: name};
  }

  service.selectTour = function(tourName) {
    if (activeTour !== tours[tourName]) {
      if (activeTour)
        service.stopTour();
      activeTour = tours[tourName];
    }
    return activeTour;
  }

  service.setScope = function(scope) {
    touringScope = scope;
  }

  service.registerStep = function(name, details, tourName) {
    var tour = tours[tourName];
    if (!tour) {
      console.warn("Can't register step '" + name + "'. Didn't find tour ",tourName);
      return;
    }
    var stepInfo;
    var i = stepIndex(name, tour);
    if (i == -1) {
      if (details) {
        stepInfo = angular.copy(details);
      } else {
        stepInfo = {}
      }
      stepInfo.name = name;
      if (!stepInfo.order) {
        if (tour.steps.length > 0)
          stepInfo.order = tour.steps[tour.steps.length-1].order + 1; // just put the step at the end
        else
          stepInfo.order = 1;
      }
      tour.steps.push(stepInfo);
      //console.log('registered tour step ', name);
    } else {
      //console.log("won't register step " + name + ". It's already there.");
      stepInfo = tour.steps[i];
    }
    return stepInfo;
  }

  service.getStep = function(stepName, tourName) {
    var tour = tours[tourName];
    if (!tour) {
      console.warn("Didn't find tour ",tourName);
      return;
    }
    var i = stepIndex(stepName, tour);
    if (i != -1) {
      return tour.steps[i];
    }

  }

  service.startTour = function (startStep, tourName) {
    if (activeTour && activeTour.stepIndex != -1)
      service.stopTour();
    if (tourName)
      service.selectTour(tourName);
    if (!activeTour) {
      console.warn("Can't start tour. There is none active.");
      return;
    }
    if (activeTour.steps.length > 0) {
      activeTour.steps.sort(sortSteps);
      if (startStep)
        activeTour.stepIndex = stepIndex(startStep, activeTour);
      else
        activeTour.stepIndex = 0;
      $rootScope.$broadcast('tour-enter-step', {name:activeTour.steps[activeTour.stepIndex].name, tour: activeTour});
      activeTour.steps[activeTour.stepIndex].active = true;
    }
  }

  service.stopTour = function() {
    if (activeTour) {
      if (activeTour.stepIndex >= 0) {
        activeTour.steps[activeTour.stepIndex].active = false;
        activeTour.stepIndex = -1;
        //console.log('stopped tour');
      }
      activeTour = undefined;
    }
  }

  // Activates next step. If 'from' is specified it will only move to next if current step is 'current'
  service.goto = function(nextStepName, from, redirectUrl) {
    console.log("moving to step ", nextStepName)
    if (!activeTour) return;

    // is there really a step to go to ?
    var nextStepIndex = stepIndex(nextStepName, activeTour);
    if (nextStepIndex > -1) {
      var nextStep = activeTour.steps[nextStepIndex];
      // ok, there is a next step. If we're currently on another we have to disable it
      var currentStep = service.currentStep();
      if (currentStep) {
        // we're already on another step. If 'from' restriction is set, take it into account first
        if (from && (currentStep.name != from))
          return; // nothing to do
        currentStep.active = false;
        // trigger onNext handler if any
        if (currentStep.handlers && currentStep.handlers.onNext) {
          currentStep.parentScope.$eval(currentStep.handlers.onNext);
        }
      }
    }
    // throw an event
    $rootScope.$broadcast('tour-enter-step', {name:nextStep.name, tour: activeTour});
    // at last, activate the next step
    activeTour.stepIndex = nextStepIndex;
    nextStep.active = true;
    if (redirectUrl) {
      $location.url(redirectUrl);
    }
  }

  // returns undefined if there is no tour active or there are no steps
  service.currentStep = function () {
    if (activeTour && activeTour.stepIndex >= 0 )
      return activeTour.steps[activeTour.stepIndex];
  }

  service.stepActive = function(stepName) {
    if (service.currentStep() && stepName == service.currentStep().name)
      return true;
    return false;
  }

  service.hookStepBySelector = function(tourName, selector, stepDetails, scope) {
    service.registerStep(stepDetails.name, stepDetails, tourName);
    scope.$watch(function(){
        return $(selector).length;    // Set a watch on the actual DOM value
    }, function(newVal){
        if (newVal) {
          var element = $(selector);
          var stepElement = angular.element('<div tour-step="' + stepDetails.name + '" tour-name="'+ tourName +'" backdrop="tourStep.active" backdrop-selector="' + selector + '"'+ (stepDetails.backdropSelector2 ? ' backdrop-selector2="'+stepDetails.backdropSelector2+'"' : "") +'></div>');
          element.append(stepElement);
          $compile(stepElement)(element.scope());
        }
    });
  }

  service.onStateChanged = function(fromState, toState) {
    if (activeTour && activeTour.stepIndex >=0) {
      var currentStep = activeTour.steps[activeTour.stepIndex];
      var nextaction;
      if (currentStep.done &&  currentStep.done.byState)
        nextaction = currentStep.done.byState[toState.name];
      else if (currentStep.done &&  currentStep.done.byUrl)
        nextaction = currentStep.done.byUrl[$location.url()];
      if (nextaction) {
        if (nextaction.nextStep) {
          if (typeof nextaction.nextStep === 'function') {
            service.goto(nextaction.nextStep(service, currentStep));
          } else
            service.goto(nextaction.nextStep);
        } else
        if (nextaction.expression)
          currentStep.parentScope.$eval(nextaction.expression);
      }
      if ( activeTour && activeTour.steps[activeTour.stepIndex].routerState &&  (activeTour.steps[activeTour.stepIndex].routerState != toState.name)) {// looks like we moved to location out of tour path. Let's stop the tour
        console.warn("It looks like we moved to location out of tour path. Let's stop the tour.");
        if (activeTour.abortStep)
          service.goto(activeTour.abortStep);
        else
          service.stopTour();
      }
    }
  }

  // initializes touring based on url parameters
  // location is the angular $location service
  service.init = function(location) {
    var startupTour = location.search().tour;
    var startupStep = location.search()['tour-step'];
    var tourContext = location.search()['tour-context'];
    location.search("tour", null); // clear 'tour' fragment parameter
    location.search('tour-step', null);
    location.search('tour-context', null);
    if (startupTour || startupStep) {
      if (tourContext) {
        //service.context.voiceOrSms = tourContext; // we only support voiceOrSms variable for tour context. Url encode this if needed to support key-value pairs - TODO
        service.context = service.parseContextParam(tourContext);
      }
      if (startupTour)
        service.selectTour(startupTour);
      else
        service.selectTour("main"); // 'main' is the default tour
      service.startTour(startupStep || undefined);
    }
  }

  // How many steps currently active ? In proper touring, it returns 1. When the tour has stopped it returns 'undefined'.
  // If it returns 0 the there is no active step but the tour is still active and its status should be updated with calling
  // stopTour() etc.
  service.countActiveSteps = function() {
    if (activeTour) {
      var counter = 0;
      for (var i = 0; i < activeTour.steps.length; i++) {
        if (activeTour.steps[i].active)
          counter ++;
      }
      return counter;
    }
  }

  // notify here if there are no active steps and tour still there is an active tour
  service.onTourAborted = function() {
    if (activeTour && activeTour.abortStep) {
      var currentStep = service.currentStep();
      if (currentStep && currentStep.name == activeTour.abortStep) {
        service.stopTour();
      } else
        service.goto(activeTour.abortStep);
    }
    else {
      service.stopTour();
      backdropService.reset();
    }
  }

  service.stepButtonClicked = function(button, step) {
    if (typeof button.click === 'function') {
      button.click(service, step);
    } else {
      step.parentScope.$eval(button.click);
    }
  }

  // create the parameter that will be passed in the url fragment
  service.contextAsParam = function () {
    if (service.context) {
      return encodeURIComponent(JSON.stringify(context))
      //return service.context.voiceOrSms;
    }
    else
      return "";
  }

  // parses the url encoded json context and returns an object
  service.parseContextParam = function(fragmentParam) {
    if (fragmentParam)
      return JSON.parse(decodeURIComponent(fragmentParam))
    else
      return {};
  }


  function sortSteps(stepA, stepB) {
    return stepA.order - stepB.order;
  }

  function stepIndex(stepName, tour) {
    for (var i=0; i < tour.steps.length; i++) {
      if (stepName == tour.steps[i].name) {
          return i;
      }
    }
    return -1;
  }

  service.getSteps = function() {
    return activeTour.steps;
  }

  service.backFromHistory = function () {
    $window.history.back();
  }

  return service;
});

olyServices.factory('backdropService', function() {
  var service = {}
  var showCount = 0;

  service.show = function() {
    showCount ++;
  }
  service.hide = function () {
    if (showCount > 0)
      showCount --;
    else
    if (showCount == 0)
      console.warn("Trying to hide backdrop but it should already been hidden");

  }
  service.shown = function () {
    return showCount > 0;
  }
  service.reset = function () {
    showCount = 0;
  }

  return service;
});
