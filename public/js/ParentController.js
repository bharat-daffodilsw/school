var schoolApp = angular.module('schoolApp', ['ngRoute']);
schoolApp.controller('MainController', function ($scope,$location,$http) {
    $scope.login="scope login";
    $scope.home="scope home";
});
schoolApp.controller('homeCtrl', function ($scope,$location,$http) {
    $scope.l=$scope.login;
    $scope.h=$scope.home;
});