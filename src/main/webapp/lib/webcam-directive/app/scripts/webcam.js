'use strict';

(function() {
  // GetUserMedia is not yet supported by all browsers
  // Until then, we need to handle the vendor prefixes
  navigator.getMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

  // Checks if getUserMedia is available on the client browser
  window.hasUserMedia = function hasUserMedia() {
    return navigator.getMedia ? true : false;
  };
})();

angular.module('webcam', [])
  .directive('webcam', function ($compile) {
    return {
      template: '<div class="webcam" ng-transclude></div>',
      restrict: 'E',
      replace: true,
      transclude: true,
      scope:
      {
        onError: '&',
        onStream: '&',
        onStreaming: '&',
        placeholder: '@',
        videoHeight: '=',
        videoWidth: '=',
        video: '=',
        audio: '=',
        videoConstraints: '='
      },
      link: function postLink($scope, element) {
        var videoElem = null,
            videoStream = null,
            placeholder = null;

        var _removeDOMElement = function _removeDOMElement(DOMel) {
          if (DOMel) {
            angular.element(DOMel).remove();
          }
        };

        var onDestroy = function onDestroy() {
          /*
          if (!!videoStream && typeof videoStream.stop === 'function') {
            videoStream.stop();
          }
          */
          if (!!videoStream) {
            videoStream.getTracks().forEach(function(track) {
              track.stop();
            });
          }
          if (!!videoElem) {
            delete videoElem.src;
          }
        };

        // called when camera stream is loaded
        var onSuccess = function onSuccess(stream) {
          videoStream = stream;

          // Firefox supports a src object
          if (navigator.mozGetUserMedia) {
            videoElem.mozSrcObject = stream;
          } else {
            var vendorURL = window.URL || window.webkitURL;
            videoElem.src = vendorURL.createObjectURL(stream);
          }

          /* Start playing the video to show the stream from the webcam */
          videoElem.muted = true;
          videoElem.play();
          $scope.video = videoElem;

          /* Call custom callback */
          if ($scope.onStream) {
            $scope.onStream({stream: stream});
          }
        };

        // called when any error happens
        var onFailure = function onFailure(err) {
          _removeDOMElement(placeholder);
          if (console && console.log) {
            console.log('The following error occured: ', err);
          }

          /* Call custom callback */
          if ($scope.onError) {
            $scope.onError({err:err});
          }

          return;
        };

        var startWebcam = function startWebcam() {
          videoElem = document.createElement('video');
          videoElem.setAttribute('class', 'webcam-live');
          videoElem.setAttribute('autoplay', '');
          videoElem.setAttribute('fullscreen', 'localFS');
          videoElem.setAttribute('only-watched-property', '');
          element.append(videoElem);

          $compile(videoElem);

          if ($scope.placeholder) {
            videoElem.className += ' hide';
            placeholder = document.createElement('img');
            placeholder.setAttribute('class', 'webcam-loader');
            placeholder.src = $scope.placeholder;
            element.append(placeholder);
          }

          // Default variables
          var isStreaming = false,
            width = element.width = $scope.videoWidth || 320,
            height = element.height = 0;

          // Check the availability of getUserMedia across supported browsers
          if (!window.hasUserMedia()) {
            onFailure({code:-1, msg: 'Browser does not support getUserMedia.'});
            return;
          }

          var mediaConstraint = { video: $scope.video && $scope.videoConstraints, audio: $scope.audio };
          navigator.getMedia(mediaConstraint, onSuccess, onFailure);

          /* Start streaming the webcam data when the video element can play
           * It will do it only once
           */
          videoElem.addEventListener('canplay', function() {
            if (!isStreaming) {
              var scale = width / videoElem.videoWidth;
              height = (videoElem.videoHeight * scale) || $scope.videoHeight;
              videoElem.setAttribute('width', width);
              videoElem.setAttribute('height', height);
              isStreaming = true;

              $scope.video = videoElem;

              videoElem.className = videoElem.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
              _removeDOMElement(placeholder);

              /* Call custom callback */
              if ($scope.onStreaming) {
                $scope.onStreaming();
              }
            }
          }, false);
        };

        var stopWebcam = function stopWebcam() {
          onDestroy();
          videoElem.remove();
        };

        $scope.$on('$destroy', onDestroy);
        $scope.$on('START_WEBCAM', startWebcam);
        $scope.$on('STOP_WEBCAM', stopWebcam);

        startWebcam();

      }
    };
  });
