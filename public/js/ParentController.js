var schoolApp = angular.module('schoolApp', ['ngRoute']);
schoolApp.controller('MainController', function ($scope,$location,$http) {
    $scope.login="scope login";
    $scope.home="scope home";
});