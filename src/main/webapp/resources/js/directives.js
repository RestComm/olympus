'use strict';

/* Directives */
var olyDirectives = angular.module('mcWebRTC.directives', []);

olyDirectives.directive('passwordMatch', [function () {
  return {
    restrict: 'A',
    scope:true,
    require: 'ngModel',
    link: function (scope, elem , attrs,control) {
      var checker = function () {

        //get the value of the first password
        var e1 = scope.$eval(attrs.ngModel);

        //get the value of the other password 
        var e2 = scope.$eval(attrs.passwordMatch);
        return e1 == e2;
      };
      scope.$watch(checker, function (n) {

        //set the form control to valid if both
        //passwords are the same, else invalid
        control.$setValidity("unique", n);
      });
    }
  };
}]);

olyDirectives.directive('shake', ['$animate', function ($animate) {
  return {
    scope: {
      shakeit: '='
    },
    link: function(scope, element, attrs) {
      scope.$watch('shakeit', function(newValue, oldValue) {
        if (newValue === oldValue || !newValue ) return;

        $animate.addClass(element, 'animated shake').then(function() {
          element.removeClass('animated shake');
          scope.shakeit = false;
          scope.$apply();
        });
      }, true);

    }
  };
}]);

olyDirectives.directive('myDraggable', ['$document', function($document) {
  return function(scope, element, attr) {
    var startX = 0, startY = 0, x = 0, y = 0;

    element.css({
     position: 'relative',
     //border: '1px solid red',
     //backgroundColor: 'lightgrey',
     cursor: 'pointer',
    });

    element.on('mousedown', function(event) {
      // Prevent default dragging of selected content
      event.preventDefault();
      startX = event.pageX - x;
      startY = event.pageY - y;
      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
    });

    function mousemove(event) {
      y = event.pageY - startY;
      x = event.pageX - startX;
      element.css({
        top: y + 'px',
        left:  x + 'px'
      });
    }

    function mouseup() {
      $document.off('mousemove', mousemove);
      $document.off('mouseup', mouseup);
    }
  };
}]);

olyDirectives.directive('myShow', function($animate) {
  return {
    scope: {
      'myShow': '=',
      'afterShow': '&',
      'afterHide': '&'
    },
    link: function(scope, element) {
      scope.$watch('myShow', function(show, oldShow) {
        if (show) {
          element.removeClass('flipOutX').removeClass('ng-hide');
          scope.$parent.contactsVisible = show;
          $animate.addClass(element, 'flipInY');
        }
        if (!show) {
          element.removeClass('flipInY');
          $animate.addClass(element, 'flipOutX').then(function() {
            element.addClass('ng-hide');
            //console.log('scope', scope.$parent);
            scope.$parent.contactsVisible = show;
            scope.$parent.$apply();
          });
        }
      });
    }
  };
});

olyDirectives.directive('scroll', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      scope.$watchCollection(attr.scroll, function(newVal) {
        $timeout(function() {
         element[0].scrollTop = element[0].scrollHeight;
        });
      });
    }
  }
});

// olyDirectives.directive("popoverHtmlUnsafePopup", function () {
//   return {
//     restrict: "EA",
//     replace: true,
//     scope: { title: "@", content: "@", placement: "@", animation: "&", isOpen: "&" },
//     templateUrl: "modules/templates/popover-html-unsafe-popup.html"
//   };
// })
// .directive("popoverHtmlUnsafe", [ "$tooltip", function ($tooltip) {
//   return $tooltip("popoverHtmlUnsafe", "popover", "click");
// }]);

olyDirectives.directive('olyKeypad', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'modules/templates/oly-keypad.html'
  };
});

olyDirectives.directive('olySidebar', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'modules/templates/oly-sidebar.html'
  };
});

olyDirectives.directive('olyConsole', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'modules/templates/oly-console.html'
  };
});

olyDirectives.directive('tourStep', function($compile, tourManager, $interval) {
  return {
    restrict: 'A',
    priority: 1000,
    scope: true,
    terminal: true, // this is important!
    compile: function compile(element, attrs) {
      var stepInfo = tourManager.getStep(attrs.tourStep, attrs.tourName)
      element.removeAttr("tour-step"); //remove the attribute to avoid indefinite loop
      element.attr('bs-popover',"");
      //element.attr('bs-show', "tourStep.visible");
      element.attr('data-placement', stepInfo.placement);
      //element.attr('data-content','some content');
      //element.attr('title','the title');
      element.attr('data-template', "modules/templates/tour-step.html")
      element.attr('data-content',stepInfo.content);
      element.attr('trigger','manual');

      //element.attr('uib-popover-template', "'templates/tour-step.html'");
      //element.attr('popover-is-open',"tourStep.active");
      //element.attr('popover-class', "tour-popover" + (stepInfo.customClasses ? " "+stepInfo.customClasses: ''));
      //element.attr('popover-placement', "{{tourStep.placement}}");
      //element.attr('popover-trigger', "'none'"); // control popover only programmaticaly
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {
        },
        post: function postLink(scope, iElement, iAttrs, controller) {
          $compile(iElement)(scope);
          var stepInfo = tourManager.getStep(iAttrs.tourStep, iAttrs.tourName);
          var targetElement = iElement;
          if (iAttrs.target) {
            targetElement = $(iAttrs.target);
          }
          if (stepInfo)
            stepInfo.parentScope = scope.$parent;
          //if (!stepInfo.routerState && !stepInfo.anyview)
            //stepInfo.routerState = $state.current.name;
          scope.tourManager = tourManager;
          scope.tourStep = stepInfo;

          // step visibility - only name the step visible if both the tourstep is active and the hosting element is visible
          var stepActive = undefined;
          var elementVisible = undefined;

          function checkStepStatus() {
            if (stepActive && elementVisible ) {
              scope.tourStep.visible = true;
            } else {
              scope.tourStep.visible = false;
            }
          }
          scope.$watch("tourStep.active",function(newVal, oldVal) {
            console.warn('tourStep activation: ', iAttrs.tourStep, newVal);
            stepActive = newVal;
            checkStepStatus();
          });
          scope.$watch(function() {
            // returns 'true' if the targetElement is visible, false otherwise
            return (!!targetElement[0] && (targetElement[0].offsetParent !== null));
          }, function(newVal, oldVal) {
            console.warn('tourStep visibility: ', iAttrs.tourStep,  newVal);
            if (newVal)
              console.warn('tourStep visibility: ', newVal);
            elementVisible = newVal;
            checkStepStatus();
          });
          var clearElementVisibilityInterval = $interval(function () {
            console.warn('running inerval for', iAttrs.tourStep);
            if (iAttrs.target) {
              targetElement = $(iAttrs.target);
            }
            var newVal = (!!targetElement[0] && (targetElement[0].offsetParent !== null));
            if (newVal !== elementVisible) {
              elementVisible = newVal;
              checkStepStatus();
            }
           }, 1000);

          if (stepInfo && stepInfo.done ) {
              if (stepInfo.done.byExpression) {
              var byExpression = stepInfo.done.byExpression;
              for (var i=0; i < byExpression.length; i++) {
                var handler = byExpression[i];
                var clearWatch = scope.$parent.$watch(handler.expression, function (newValue, oldValue) {
                  if (tourManager.currentStep()) {
                    if (!!newValue) {
                      tourManager.goto(handler.nextStep);
                      scope.$emit('tour-step-next', {name: attrs.tourStep});
                    }
                  }
                });
              }
            }
            if (stepInfo.done.byEvent) {
              var byEvent = stepInfo.done.byEvent;
              scope.$on(byEvent.eventName, function () {
                console.log('step byEvent triggered for ', byEvent.eventName );
                if (byEvent.nextStep) {
                  console.log('byEvent advancing to next step: ', attrs.tourStep);
                  tourManager.goto(byEvent.nextStep);
                  scope.$emit('tour-step-next', {name: attrs.tourStep});
                }
              });
            }
          }

          scope.$on('$destroy', function() {
            //console.warn('destroying ', iAttrs.tourStep);
            $interval.cancel(clearElementVisibilityInterval);
          });
        }
      }
    }
  }
});

olyDirectives.directive('touring', function($compile, tourManager) {
  return {
    link: function(scope, element, attrs) {
      tourManager.setScope(scope);
      scope.tourManager = tourManager;

      scope.$watch("tourManager.countActiveSteps()", function (newVal, oldVal) {
        console.warn('active step count: ', newVal)
        if (newVal === 0) {
          tourManager.onTourAborted()
        }
      })
    }
  }
});

olyDirectives.directive('backdrop', function($interval, backdropService) {
   return {
     restrict: 'A',
     controller: function ($scope, $element, $attrs) {
       this.$onDestroy = function () {
         if ($scope.backdropActive)
           $scope.deactivateBackdrop($scope);
       }
     },
     link: function(scope, element,attrs) {
       scope.backdropActive = false;
       scope.clearRectWatcher;
       scope.clearRectTimeout;

       var rectPadding;
       if ( attrs.backdropPadding ) {
         var p = scope.$eval(attrs.backdropPadding);
         if (typeof p === "object")
           rectPadding = p;
         else
           rectPadding = {left: p, right: p, top: p, bottom: p}
       } else
         rectPadding = {left: 20, right: 20, top: 20, bottom: 20};
       if (!rectPadding.left) rectPadding.left = 0;
       if (!rectPadding.right) rectPadding.right = 0;
       if (!rectPadding.top) rectPadding.top = 0;
       if (!rectPadding.bottom) rectPadding.bottom = 0;

       scope.$watch(attrs.backdrop, function (newVal, oldVal) {
         console.log((scope.tourStep.name ? (scope.tourStep.name+" "): "") + 'backdrop: ', newVal)
         if (newVal && !scope.backdropActive) {
           // we need to activate backdrop
           activateBackdrop();
         } else
         if (!newVal && scope.backdropActive) {
           // we need to deactivate backdrop
           scope.deactivateBackdrop();
         }
       })

       function getFocusedRect() {
         var focusedElement = attrs.backdropSelector ? $(attrs.backdropSelector)[0] : element[0];
         if (! focusedElement || focusedElement.offsetParent === null)
           return; // maybe the element is not already in place
         var focusedElement2 = attrs.backdropSelector2 ? $(attrs.backdropSelector2)[0]: undefined;

         var rect1 = cumulativeOffset(focusedElement);
         var boundingRect;

         if (focusedElement2) {
           var rect2 = cumulativeOffset(focusedElement2);
           var biggerRect = {};
           biggerRect.left = Math.min(rect1.left, rect2.left);
           biggerRect.right = Math.max(rect1.left+rect1.width, rect2.left+rect2.width);
           biggerRect.top = Math.min(rect1.top, rect2.top);
           biggerRect.bottom = Math.max(rect1.top+rect1.height, rect2.top+rect2.height);
           biggerRect.width = biggerRect.right - biggerRect.left;
           biggerRect.height = biggerRect.bottom - biggerRect.top;
           boundingRect = biggerRect;
         } else {
           boundingRect = {top: rect1.top, left:rect1.left, bottom: rect1.top+rect1.height, right: rect1.left + rect1.width, width: rect1.width, height: rect1.height};
         }
         return boundingRect;
       }

       var focusedRect;

       function activateBackdrop() {
         //console.log('activating backdrop');
         focusedRect = getFocusedRect();
         scope.backdropActive = true;

         scope.clearRectWatcher = scope.$watch(getFocusedRect, function (newVal, oldVal) {
           focusedRect = newVal;
           if (!!focusedRect) {
             applyBackdrop(focusedRect);
           }
         }, true);

         scope.clearRectTimeout = $interval(function () {
           var rect = getFocusedRect();
           if (!!rect) {
             //console.log("interval: rect: ", rect, " focusedRect: ", focusedRect);
             if (! angular.equals(focusedRect, rect)) {
               focusedRect = rect;
               applyBackdrop(focusedRect);
             }
           }
         }, 1500);
         backdropService.show();
       }

       scope.deactivateBackdrop = function() {
         //console.log('de-activating backdrop');
         if (scope.clearRectWatcher) { scope.clearRectWatcher(); scope.clearRectWatcher = undefined; }
         if (scope.clearRectTimeout) {$interval.cancel(scope.clearRectTimeout); scope.clearRectTimeout = undefined; }
         scope.backdropActive = false;
         backdropService.hide();
       }

       function cumulativeOffset(element) {
           var top = 0, left = 0;
           var anyElement = element;
           do {
               top += anyElement.offsetTop  || 0;
               left += anyElement.offsetLeft || 0;
               anyElement = anyElement.offsetParent;
           } while(anyElement);

           return {
               top: top,
               left: left,
               width: element.clientWidth,
               height: element.clientHeight
           };
       };

       function applyBackdrop(focusedRect) {
         $(".backdrop-area.backdrop-top")
           .height(focusedRect.top-rectPadding.top);
         $(".backdrop-area.backdrop-bottom")
           .css({top:focusedRect.bottom+rectPadding.bottom});
         $(".backdrop-area.backdrop-left")
           .css({top:focusedRect.top-rectPadding.top, height:focusedRect.bottom-focusedRect.top+(rectPadding.top+rectPadding.bottom), width: focusedRect.left-rectPadding.left});
         $(".backdrop-area.backdrop-right")
           .css({top:focusedRect.top-rectPadding.top, height:focusedRect.bottom-focusedRect.top+rectPadding.top+rectPadding.bottom,left:focusedRect.right+rectPadding.left});
       }
     }
   }
});