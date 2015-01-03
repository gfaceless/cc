var app = angular.module('app', [])

app.controller('MainCtrl', function($scope) {
  
  $scope.numbers = ['one', 'two', 'three'];
  $scope.myModel= "two"
});