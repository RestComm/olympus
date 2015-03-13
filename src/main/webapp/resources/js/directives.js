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

        $animate.addClass(element, 'shake').then(function() {
          element.removeClass('shake');
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