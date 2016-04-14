(function () {
   'use strict';

    angular.module('app.gde.adapter', []);
    
})();
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
(function () {
    'use strict';

    angular.module('app.gde.adapter')
    .provider('GdeAdapterService', GdeAdapterServiceProvider);

    function GdeAdapterServiceProvider() {
        var provider = this;

        provider.setGdeHost = function setGdeHost(value) {
            provider.gdeHost = value;
        };

        this.$get = ['$sce', '$q', '$timeout', '$window', '$rootScope', 'GdeConfigService',
            function GdeAdapterService ($sce, $q, $timeout, $window, $rootScope, GdeConfigServiceProvider) {

            var service = {};
            var callbacksDeferred = $q.defer();
            var callbacks;

            //
            // Strict Contextual Escaping (for Cross-domain messaging)
            //
            function trustedSource (src) {
                return $sce.trustAsResourceUrl(src);
            }

            //
            // Build Payload to send back to the container
            //
            function buildPayload (success, errorCode, errorMsg, docId, internalCode, caseNumber, data) {
                return  {
                        'success' : success,
                        'errorCode' : errorCode,
                        'errorMsg' : errorMsg,
                        'docId' : docId,
                        'internalCode' : internalCode,
                        'caseNumber' : caseNumber ,
                        'data' : data
                        };
            }

            //
            // URL Builder
            //
            function buildUrlParams (isForm) {

                function stringNotEmpty (pVar) {
                    return ((angular.isDefined(pVar)) && (pVar !== null) && (pVar !== ""));
                }

                //subFunction check if we need to add & to checkString
                function addSepIfNecessary (checkString) {
                    if (checkString !== "") {
                        return checkString + "&";
                    }
                    else {
                        return checkString;
                    }
                }

                //always add clex=y&tool=n (interop style)
                //clex=y says that it's an external call and will prevent route change
                //tool=n hide the toolbar
                var resultString = "?clex=y&tool=n";

                //add ownerid
                if ((isForm) && (stringNotEmpty($rootScope.noDossierE[0].id))) {
                    resultString = addSepIfNecessary(resultString);
                    resultString = resultString + "noDo=" + $rootScope.noDossierE[0].id;
                }

                return resultString;
            }

            //
            // Action callbacks that have to be registered for a given action
            //
            function getCallbacks () {
                if (callbacks !== undefined) {
                    return $q.when(callbacks);
                }
                else {
                    return callbacksDeferred.promise;
                }
            }

            //
            // Callback registration/deregistration
            //
            service.registerCallbacks = function (value) {
                callbacks = value;
                callbacksDeferred.resolve(callbacks);
            };

            service.unregisterCallbacks = function() {
                callbacks = undefined;
            };

            //
            // Open action
            //
            service.open = function (params) {

                var deferred = $q.defer();
                var payload = {};

                if (params === undefined) {
                    payload = buildPayload(false, "Parameters needed for: open()", undefined, undefined, undefined, undefined, undefined);
                    deferred.reject(payload);
                    return;
                }

                // get the URL
                var targetOrigin = GdeConfigServiceProvider.getTargetOrigin();

                var iframeUrl = trustedSource(targetOrigin + "#/" + params.lang + "/gde/" + params.docId + buildUrlParams(false));

                getCallbacks()
                    .then(function success (callbacks) {
                            if (callbacks.openActionCallback !== undefined) {
                                callbacks.openActionCallback(onDocumentOpenedPostMessageCallback, iframeUrl);
                            }
                            else {
                                payload = buildPayload(false, "Unregistred callback: openActionCallback", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                                deferred.reject(payload);
                            }
                        },
                        function failure (reason) {
                            payload = buildPayload(false, reason, undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                            deferred.reject(payload);
                    });

                // Set up a callback for webGde document loaded notification
                function onDocumentOpenedPostMessageCallback (event) {
                    if (event.origin == targetOrigin) {
                        if (typeof event.data !== undefined && event.data != "unchanged") {
                            $timeout(function() {
                                console.log("Received data: " + JSON.stringify(event.data));
                                if (event.data !== undefined) {
                                    if (event.data.webgde.event.indexOf("documentLoadFailed") > -1) {
                                        payload = buildPayload(false, "Document Load Failed", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                                        deferred.reject(payload);
                                    }
                                    if (event.data.webgde.event.indexOf("documentLoaded") > -1) {
                                        finalizeActionCallback(event.data);
                                    }
                                }
                            });
                        }
                    }
                }

                // Callback to documentLoadedCallback
                function finalizeActionCallback (data) {

                    // remove listener
                    if (callbacks.documentLoadedCallback !== undefined) {
                        callbacks.documentLoadedCallback(onDocumentOpenedPostMessageCallback);
                        payload = buildPayload(true, undefined, undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                        deferred.resolve(payload);
                    }
                    else {
                        payload = buildPayload(false, "Unregistred callback: documentLoadedCallback", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                        deferred.reject(payload);
                    }
                }

                return deferred.promise;
            };

            //
            // Create action
            //
            service.create = function (params) {

                var deferred = $q.defer();
                var payload = {};

                if (params === undefined) {
                    payload = buildPayload(false, "Parameters needed for: create()", undefined, undefined, undefined, undefined, undefined);
                    deferred.reject(payload);
                    return;
                }

                // get the URL
                var targetOrigin = GdeConfigServiceProvider.getTargetOrigin();

                var iframeUrl = trustedSource(targetOrigin + "#/" + params.lang + "/gde/" + params.noDossier + "/nouveau_document/" + params.codeInterneDuFormulaire + buildUrlParams(false));

                getCallbacks()
                    .then(function success (callbacks) {
                            if (callbacks.openActionCallback !== undefined) {
                                callbacks.openActionCallback(onDocumentOpenedPostMessageCallback, iframeUrl);
                            }
                            else {
                                payload = buildPayload(false, "Unregistred callback: openActionCallback", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                                deferred.reject(payload);
                            }
                        },
                        function failure (reason) {
                            payload = buildPayload(false, reason, undefined, params.docId, undefined, undefined, undefined);
                            deferred.reject(payload);
                    });


                // Set up a callback for webGde document loaded notification
                function onDocumentOpenedPostMessageCallback (event) {
                    if (event.origin == targetOrigin) {
                        if (typeof event.data !== undefined && event.data != "unchanged") {
                            $timeout(function() {
                                console.log("Received data: " + JSON.stringify(event.data));
                                if (event.data !== undefined) {
                                    if (event.data.webgde.event.indexOf("documentLoadFailed") > -1) {
                                        payload = buildPayload(false, "Document Load Failed", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                                        deferred.reject(payload);
                                    }
                                    if (event.data.webgde.event.indexOf("documentLoaded") > -1) {
                                        finalizeActionCallback(event.data);
                                    }
                                }
                            });
                        }
                    }
                }

                // Callback to sendValuesActionCallback and documentLoadedCallback
                function finalizeActionCallback () {

                    // send post message with parameters
                    if (callbacks.sendValuesActionCallback !== undefined) {
                        callbacks.sendValuesActionCallback(params.data, targetOrigin);

                        // remove listener
                        if (callbacks.documentLoadedCallback !== undefined) {
                            callbacks.documentLoadedCallback(onDocumentOpenedPostMessageCallback);
                            payload = buildPayload(true, undefined, undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                            deferred.resolve(payload);
                        }
                        else {
                            payload = buildPayload(false, "Unregistred callback: documentLoadedCallback", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                            deferred.reject(payload);
                        }
                    }
                    else {
                        payload = buildPayload(false, "Unregistred callback: sendValuesActionCallback", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                        deferred.reject(payload);
                    }
                }

                return deferred.promise;
            };

            //
            // Cancel action
            //
            service.cancel = function (params) {

                var deferred = $q.defer();
                var payload = {};

                // get the URL
                var targetOrigin = GdeConfigServiceProvider.getTargetOrigin();

                if (callbacks.cancelActionCallback !== undefined) {
                    callbacks.cancelActionCallback(onCancelCompletedPostMessageCallback, targetOrigin);
                    // temporaire
                    payload = buildPayload(true, undefined, undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                    deferred.resolve(payload);
                }
                else {
                    payload = buildPayload(false, "Unregistred callback: cancelActionCallback", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                    deferred.reject(payload);
                }

                // Set up a callback
                function onCancelCompletedPostMessageCallback (event) {
                    if (event.origin == targetOrigin) {
                        if (typeof event.data !== undefined && event.data != "unchanged") {
                            $timeout(function() {
                                console.log("Received data: " + JSON.stringify(event.data));
                                finalizeActionCallback(event.data);
                            });
                        }
                    }
                }

                // Callback cancelCompletedActionCallback
                function finalizeActionCallback (data) {

                    // remove listener
                    if (callbacks.cancelCompletedActionCallback !== undefined) {
                        callbacks.cancelCompletedActionCallback(onCancelCompletedPostMessageCallback);
                        payload = buildPayload(true, undefined, undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                        deferred.resolve(payload);
                    }
                    else {
                        payload = buildPayload(false, "Unregistred callback: cancelCompletedActionCallback", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                        deferred.reject(payload);
                    }
                }

                return deferred.promise;
            };

            //
            // Save action
            //
            service.save = function (params) {
                var deferred = $q.defer();
                var payload = {};

                var targetOrigin = GdeConfigServiceProvider.getTargetOrigin();

                if (callbacks.saveActionCallback !== undefined) {
                    callbacks.saveActionCallback(onSaveCompletedPostMessageCallback, targetOrigin);
                }
                else {
                    payload = buildPayload(false, "Unregistred callback: saveActionCallback", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                    deferred.reject(payload);
                }

                // Set up a callback
                function onSaveCompletedPostMessageCallback (event) {
                    if (event.origin == targetOrigin) {
                        if (typeof event.data !== undefined && event.data != "unchanged") {
                            $timeout(function() {
                                console.log("Received data: " + JSON.stringify(event.data));
                                finalizeActionCallback(event.data);
                            });
                        }
                    }
                }

                function finalizeActionCallback (data) {

                    // remove listener
                    if (callbacks.saveCompletedActionCallback !== undefined) {
                        callbacks.saveCompletedActionCallback(onSaveCompletedPostMessageCallback, targetOrigin);

                        if (data.webgde.documentSaved === true) {
                            payload = buildPayload(true, undefined, undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier,  data);
                            deferred.resolve(payload);
                        }
                        else {
                            payload = buildPayload(false, data.webgde.reason, data.webgde.errorMessage, params.docId, params.codeInterneDuFormulaire, params.noDossier, data.webgde.documentData);
                            deferred.reject(payload);
                        }
                    }
                    else {
                        payload = buildPayload(false, "Unregistred callback: saveCompletedActionCallback", undefined, params.docId, params.codeInterneDuFormulaire, params.noDossier, undefined);
                        deferred.reject(payload);
                    }
                }

                return deferred.promise;
            };

            //
            // Print action
            //
            service.print = function (params)
            {};

            //
            // History action
            //
            service.history = function (params)
            {};
            
            //
            // Close action
            //
            service.close = function (params)
            {};

            return service;
        }];
    }
})();
(function () {
    'use strict';

    angular.module('app.gde.adapter')
    .provider('GdeConfigService', GdeConfigServiceProvider);

    function GdeConfigServiceProvider() {
        var provider = this;
        var trustedUrls = {};
        return {
            setConfig: function(path) {
                    provider.configPath = path;
                },
            setTrustedUrls : function(data) {
                trustedUrls = {
                    targetOrigin: data.targetOrigin,
                    currentWindow: data.currentWindow
                };
            },
            $get: function() {
                return {
                    getTargetOrigin: function() {
                        return trustedUrls.targetOrigin;
                    },
                    getCurrentWindow: function() {
                        return trustedUrls.currentWindow;
                    }
                };
            }
        };
    }
})();