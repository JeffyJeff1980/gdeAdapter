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