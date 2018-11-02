'use strict';

angular.module('mcWebRTC').run(function (tourManager, $rootScope, $location) {
  // Add tours and steps below
  // 'main' tour
  tourManager.addTour("main");
  tourManager.registerStep("step-enter-creds", {
    name:'step-enter-creds',
    body:"Add your credentials and click 'Sign-in'",
    order: 1,
    placement: 'right',
    active: true
    //buttons:[{label: 'End Tour', click: "tourManager.stopTour()"}]
    //done: {byEvent:{eventName: 'tour-user-logged-in', nextStep: "step-add-contact"}}
    //done: {byUrl: {'/home': {nextStep: "step-add-contact"}}}
  }, "main");

  tourManager.registerStep('step-add-contact',{
    name: 'step-add-contact',
    body: 'Click here to add you new number and test your application.',
    order: 3
  },"main");

  tourManager.registerStep('step-enter-contact-address', {
    name: 'step-enter-contact-address',
    body: "Paste your number here and give a name. Then add your contact.'",
    order: 4,
    placement: 'right'
  }, "main");

  tourManager.registerStep('step-make-the-call', {
    name: 'step-make-the-call',
    body: 'Call the number and test your application',
    order: 5
  }, "main");


  $rootScope.$on('tour-enter-step',function (event,args) {
    // hook step entering
    //console.log('entering step ', args.name);
  });

  // Initiate touring from url
  tourManager.init($location);
});

