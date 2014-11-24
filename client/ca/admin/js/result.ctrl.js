angular.module('myApp')
	.controller('resultCtrl', function($scope, $http, $log) {
		$http.get('ca-results')
		.success(function(data) {
			$scope.results = data.results;
			
		})
		.error(function(data) {

		})
	})