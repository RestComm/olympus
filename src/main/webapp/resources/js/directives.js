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

olyDirectives.directive('tourStep', function($compile, tourManager, $interval, $popover, $rootScope, $timeout, $interpolate) {
  var myPopover;
  return {
    restrict: 'A',
    scope: true,
    link: function postLink(scope, element,attrs) {
      var stepInfo = tourManager.getStep(attrs.tourStep, attrs.tourName);
      scope.tourStep = stepInfo;
      //console.log('creating tour step', attrs.tourStep );
      //console.log('visibility: ', attrs.tourStep, elementIsVisible(element), element.length);

      // start monitoring visibility of step target.Called when tourStep.active turns true
      stepInfo.visible = undefined;
      // interpollate tip content
      var exp = $interpolate(stepInfo.body);
      stepInfo.expandedBody = exp(scope);
      var clearIntervalHandle;
      var myPopover;
      var watchesToClear = [];
      function activate() {
        //console.log('will start monitoring visibility for ', attrs.tourStep)
        clearIntervalHandle = $interval(function () {
          if (elementIsVisible(element)) {
            if (!stepInfo.visible) {
              if (! myPopover) {
                myPopover = $popover(element, {title: 'My Title', content: stepInfo, template:'modules/templates/tour-step.html', placement: stepInfo.placement,target:attrs.target, container:'body', trigger:"'manual'"});
                return;
              }
              myPopover.show();
              stepInfo.visible = true;
            }
          } else {
            if (myPopover && stepInfo.visible) {
              myPopover.hide();
              myPopover.destroy();
              stepInfo.visible = false;
            }
          }
        },500);
        // set up 'done' expression watches
        if (stepInfo.done) {
          angular.forEach(stepInfo.done, function (item) {
            if (item.byExpression && item.doNext) {
              watchesToClear.push(scope.$watch(item.byExpression, function (newVal, oldVal) {
                if (newVal) {
                  $timeout(function () {
                    scope.$eval(item.doNext);
                  }, item.delay ? item.delay : 0);

                }
              }));
            }
          })
        }
      }

      scope.$watch('tourStep.active', function (newVal, oldVal) {
        if (newVal) {
          activate();
        } else {
          if (clearIntervalHandle) {
            $interval.cancel(clearIntervalHandle);
            console.log('stopped monitoring visibility for ', attrs.tourStep);
          }
          clearIntervalHandle = null;
          if (stepInfo.visible) {
            myPopover.hide();
            stepInfo.visible = false;
          }
        }
      });

      function elementIsVisible(element) {
        return (!!element[0] && (element[0].offsetParent !== null));
      }

      // clear any watches for stepInfo.done
      scope.$on('$destroy', function () {
        angular.forEach(watchesToClear, function (item) {
          item(); // clears the watch
        });
      });
     }
  }
});

olyDirectives.directive('touring', function($compile, tourManager) {
  return {
    link: function(scope, element, attrs) {
      tourManager.setScope(scope);
      scope.tourManager = tourManager;

      scope.$watch("tourManager.countActiveSteps()", function (newVal, oldVal) {
        //console.warn('active step count: ', newVal)
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
         //console.log((scope.tourStep.name ? (scope.tourStep.name+" "): "") + 'backdrop: ', newVal)
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