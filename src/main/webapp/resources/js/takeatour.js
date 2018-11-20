'use strict';

angular.module('mcWebRTC').run(function (tourManager, $rootScope, $location) {
  // Add tours and steps below
  // 'main' tour
  tourManager.addTour("main");
  tourManager.registerStep("step-enter-creds", {
    name:'step-enter-creds',
    body:"<p>This is the WebRTC Demo sign page.</p> <p>For Username type the <em>user</em>  part of your account email. For example, for <em><strong>alice</strong>@company.com</em> just type <em><strong>alice</strong></em>.</p> <p>The account password will work as it is.</p>",
    order: 1,
    placement: 'right',
    customClasses: "popover-medium"
  }, "main");

  tourManager.registerStep('step-add-contact',{
    name: 'step-add-contact',
    body: "<p>You will need to add your new number as a contact in order to test your application.</p> <p>Click here to add it.</p>",
    placement: 'right',
    order: 3
  },"main");

  tourManager.registerStep('step-enter-contact-address', {
    name: 'step-enter-contact-address',
    body: "<p>Paste your number here and optionally give it a name. Then click 'Add contact'.</p> <p><strong>Hint</strong>: If you don't remember it, your number is {{tourManager.context.phoneNumber}}.</p>",
    order: 4,
    placement: 'right'
  }, "main");

  tourManager.registerStep('step-make-the-call', {
    name: 'step-make-the-call',
    body: '<p>Time to call your number and test your application.</p> <p>Click on the phone button bellow to initiate the call.</p>',
    order: 5,
    placement: 'top-right',
    //done: [{byExpression: "inCall && inCall.intStatus === 'ESTABLISHED'", doNext: 'tourManager.stopTour(); showTourSplash();', delay: 2000}]
  }, "main");

  tourManager.registerStep('step-send-the-message', {
    name: 'step-send-the-message',
    body: '<p>Time to send a message to your application.</p> <p>Type a messsage and click on the button below to send it.</p>',
    order: 5,
    placement: 'top-left',
  }, "main");

  $rootScope.$on('tour-enter-step',function (event,args) {
    // hook step entering
    //console.log('entering step ', args.name);
  });

  // Initiate touring from url
  tourManager.init($location);
});

