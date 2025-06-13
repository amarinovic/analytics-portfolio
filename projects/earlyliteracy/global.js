/*
global.js
*/

// Create an app to store the directives.
var literacyApp = angular.module("literacyApp", [])

// Create a controller.
literacyApp.controller("literacyController", function($scope, schoolService, geoService, valueService){
    
    var totalStudents = 36378;  
    
    // Slider value.
    $scope.literacyRate = 36;    
    // When the literacy rate slider value changes...
    $scope.$watch("literacyRate", function(rate){
        
        // Update all the global variables.
        $scope.notProf = ((100 - rate) / 100) * totalStudents;
        $scope.notProfNotGrad = .16 * $scope.notProf;
        $scope.profNotGrad = .04 * (rate / 100) * totalStudents;
        $scope.moneyLost = ($scope.notProfNotGrad + $scope.profNotGrad) * 260000;
        
        // Update all the labels.
        $scope.notProfLabel = formatLabel($scope.notProf);
        $scope.notProfNotGradLabel = formatLabel($scope.notProfNotGrad);
        $scope.profNotGradLabel = formatLabel($scope.profNotGrad);
        $scope.moneyLostLabel = formatLabel($scope.moneyLost);
        
    })
    
    var schoolPromise = schoolService.getSchoolData()
    schoolPromise.then(function(data){ $scope.schoolData = data; })
    
    var geoPromise = geoService.getGeoData()
    geoPromise.then(function(data){ $scope.geoData = data; })
    
    var valuePromise = valueService.getValueData()
    valuePromise.then(function(data){ $scope.valueData = data; })

})

literacyApp.service("geoService", function($http, $q){
    
    var deferred = $q.defer();
    $http.get("data/counties.json").then(function(data){ deferred.resolve(data) })
    this.getGeoData = function(){ return deferred.promise }
    
})

literacyApp.service("valueService", function($http, $q){
    
    var deferred = $q.defer();
    $http.get("data/countyRates.json").then(function(data){ deferred.resolve(data) })
    this.getValueData = function(){ return deferred.promise }
    
})

literacyApp.service("schoolService", function($http, $q){
    
    var deferred = $q.defer();
    $http.get("data/schools.json").then(function(data){ deferred.resolve(data) })
    this.getSchoolData = function(){ return deferred.promise }
    
})

function formatLabel(a){ return d3.format(",")(d3.round(a)) }