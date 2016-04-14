(function () {
   'use strict';

    angular.module('app.gde.adapter').config(config);
    
    config.$inject = ['$routeProvider', 'GdeConfigServiceProvider'];
        
    function config($routeProvider, GdeConfigServiceProvider) { 
        GdeConfigServiceProvider.setTrustedUrls({
            "targetOrigin": "http://w5apps1601:62040", 
            "currentWindow": "http://localhost:8888"
        });
       
        $routeProvider
            .when('/', {
                templateUrl: 'views/tools.html',
                controller: 'toolsController'
            })
            .otherwise({
                redirectTo: '/'
            });
        }
})();