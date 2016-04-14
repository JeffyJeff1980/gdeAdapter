(function () {
    'use strict';

    angular.module('app.gde.adapter')
    .service('GdeContainerService', GdeContainerService);
     
    GdeContainerService.$inject = ['$q', '$rootScope', 'GdeAdapterService'];
    
    function GdeContainerService($q, $rootScope, GdeAdapterService) {
        
        var service = {};
        
        var adapterParams = {
                docId: '74300',
                lang: 'fr-CA',
                codeInterneDuFormulaire: '11F9170286DC3D1CE0540003BA845D75_-10066',
                noDossier: 'R0000000372',
                data: {
                  webgde: {
                    documentattributs: {
                        field: [
                            {alias: "champ", value: "test234"},
                            {alias: "combo2", value: "test234"},
                            {alias: "radio", value: "true"},
                            ],
                    },
                    documentdata:
                    {
                        field: [
                            {alias: "champ", value: "test234"},
                            {alias: "combo2", value: "test234"},
                            {alias: "radio", value: "true"},
                            ],
                    }
                  }
                }
        };
        
        service.ouvrir = function() {
        var deferred = $q.defer();
        GdeAdapterService
            .open(adapterParams)
            .then(
                function success(response) {
                    deferred.resolve(response);
                },
                function failure(reason) {
                    deferred.reject(reason);
                }
            );
            return deferred.promise;
        };
        
        service.nouveau = function() {
            var deferred = $q.defer();
            GdeAdapterService
                .create(adapterParams)
                .then(
                    function success(response) {
                        deferred.resolve(response);
                    },
                    function failure(reason) {
                        deferred.reject(reason);
                    }
                );
            return deferred.promise;
        };
        
        service.passerValeur = function(params) {
            var deferred = $q.defer();
            GdeAdapterService.onPassValues(adapterParams)
                .then(
                    function success(response) {
                        deferred.resolve(response);
                    },
                    function failure(reason) {
                        deferred.reject(reason);
                    }
                );
            return deferred.promise;
        };
        
        service.sauvegarder = function() {
            var deferred = $q.defer();
            GdeAdapterService
                .save(adapterParams)
                .then(
                    function success(response) {
                        deferred.resolve(response);
                    },
                    function failure(reason) {
                        deferred.reject(reason);
                    }
                );
            return deferred.promise;
        };
        
        service.incomplet = function() {
            var deferred = $q.defer();
            GdeAdapterService
                .saveIncomplete(adapterParams)
                .then(
                    function success(response) {
                        deferred.resolve(response);
                    },
                    function failure(reason) {
                        deferred.reject(reason);
                    }
                );
            return deferred.promise;
        };
        
        service.annuler = function() {
            var deferred = $q.defer();
            GdeAdapterService
                .cancel(adapterParams)
                .then(
                    function success(response) {
                        deferred.resolve(response);
                    },
                    function failure(reason) {
                        deferred.reject(reason);
                    }
                );
            return deferred.promise;
        };
        
        service.imprimer = function() {
            var deferred = $q.defer();
            GdeAdapterService
                .print(adapterParams)
                .then(
                    function success(response) {
                        deferred.resolve(response);
                    },
                    function failure(reason) {
                        deferred.reject(reason);
                    }
                );
            return deferred.promise;
        };
        
        service.afficherHistorique = function() {
            var deferred = $q.defer();
            GdeAdapterService
                .history(adapterParams)
                .then(
                    function success(response) {
                        deferred.resolve(response);
                    },
                    function failure(reason) {
                        deferred.reject(reason);
                    }
                );
            return deferred.promise;
        };
        
        return service;
    }
})();