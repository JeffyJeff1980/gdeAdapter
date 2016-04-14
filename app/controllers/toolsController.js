(function () {
    'use strict';

    angular.module('app.gde.adapter')
        .controller('toolsController', ['$rootScope', '$scope', 'GdeContainerService', function($rootScope, $scope, GdeContainerService) {
            
            $rootScope.toolsModel = {
                refDocument: "74300",
                refNewDocument: "11F9170286DC3D1CE0540003BA845D75_-10066",
                selectedFormuaire: { refFormulaire: "", nomFormulaire: "", codeInterne: "" },
                refUserId: "",
                refProfil: "",
                noDossierE: "R0000000372",
                refInstallation: "",
                noEpisode: "",
                otherInput: "",
                resultAddress: "",
                resultText: ""
            };
            
            $scope.ouvrir = function() {
                GdeContainerService.ouvrir();
            };
            $scope.nouveau = function() {
                GdeContainerService.nouveau();
            };
            $scope.passerValeurs = function(params) {
                GdeContainerService.passerValeurs();
            };
            $scope.sauvegarder = function() {
                GdeContainerService.sauvegarder();
            };
            $scope.incomplet = function() {
                GdeContainerService.incomplet();
            };
            $scope.annuler = function() {
                GdeContainerService.annuler();
            };
            $scope.imprimer = function() {
                GdeContainerService.imprimer();
            };
            $scope.afficherHistorique = function() {
                GdeContainerService.afficherHistorique();
            };
    }]);
})();
