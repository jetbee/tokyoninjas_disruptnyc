// routing test
var MainApp = angular.module('MainApp', ['ngRoute']);

MainApp.config(function($routeProvider){
	$routeProvider
	  .when('/', {controller: 'mainsCtrl', templateUrl:'view01.html'})
	  .when('/view01', {controller: 'mainsCtrl', templateUrl:'view01.html'})
	  .when('/view02', { controller: 'mainsCtrl', templateUrl: 'view02.html'})
	  .otherwise({redirectTo:'/'});
});

MainApp.controller('mainsCtrl', function($http, $scope){
  // 
});

