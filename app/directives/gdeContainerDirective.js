(function () {
    'use strict';

    angular.module('app.gde.adapter')
    .directive('gdeAdapter', gdeAdapterDirective);
        
    gdeAdapterDirective.$inject = ['$window', '$timeout', 'GdeAdapterService'];

    function gdeAdapterDirective($window, $timeout, GdeAdapterService) {

        return {
            restrict: 'E',
            scope: {},
            template: '<iframe width="100%" height="100%" id="iframe" src="about:blank" scrolling="no" style="border:0;position:absolute;"></iframe>',
            link: function postLink($scope, $element, $attrs) {

                function openActionCallback(onDocumentOpenedPostMessageCallback, args) {
                    $timeout(function() {
                        $window.addEventListener('message', onDocumentOpenedPostMessageCallback, false);
                        
                        $scope.$apply(function() {
                            $('#iframe').replaceWith($('#iframe').clone().attr('src', args));
                        });
                    });
                }

                function documentLoadedCallback(onDocumentOpenedPostMessageCallback) {
                    $window.removeEventListener('message', onDocumentOpenedPostMessageCallback, false);
                }

                function closeActionCallback(onDocumentOpenedPostMessageCallback) {
                    $timeout(function() {
                        $window.removeEventListener('message', onDocumentOpenedPostMessageCallback, false);
                        $scope.$apply(function() {
                            $('#iframe').attr('src', "about:blank");
                        });
                    });
                }

                function saveCompletedActionCallback(onSaveCompletedPostMessageCallback) {
                    $window.removeEventListener('message', onSaveCompletedPostMessageCallback, false);
                }

                function saveActionCallback(onSaveCompletedPostMessageCallback, targetOrigin) {
                    $window.addEventListener('message', onSaveCompletedPostMessageCallback, false);
                    $('#iframe')[0].contentWindow.postMessage("SAVE", targetOrigin);
                }

                function sendValuesActionCallback(payload, targetOrigin) {
                    $('#iframe')[0].contentWindow.postMessage(payload, targetOrigin);
                }

                function cancelActionCallback(onCancelCompletedPostMessageCallback, targetOrigin) {
                    //$window.addEventListener('message', onCancelCompletedPostMessageCallback, false);
                    $('#iframe')[0].contentWindow.postMessage("CANCEL", targetOrigin);
                }
                
                function cancelCompletedActionCallback(onCancelCompletedPostMessageCallback, targetOrigin) {
                    $window.removeEventListener('message', onCancelCompletedPostMessageCallback, false);
                }
                
                GdeAdapterService.registerCallbacks({
                    openActionCallback: openActionCallback,
                    documentLoadedCallback : documentLoadedCallback,
                    saveActionCallback : saveActionCallback,
                    saveCompletedActionCallback : saveCompletedActionCallback,
                    sendValuesActionCallback : sendValuesActionCallback,
                    cancelActionCallback : cancelActionCallback,
                    cancelCompletedActionCallback : cancelCompletedActionCallback
                });

                $scope.$on('$destroy', function onDestroy() {
                    GdeAdapterService.unregisterCallbacks();
                });

            }
        };
    }
})();