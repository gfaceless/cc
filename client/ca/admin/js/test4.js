angular.module('app', ["ngSanitize"])
	.config(function($compileProvider, $sceDelegateProvider) {
		console.log($compileProvider.aHrefSanitizationWhitelist());
		console.log($sceDelegateProvider.resourceUrlWhitelist());
	})
	.controller('myCtrl', function($scope, $http) {
		$scope.v = "<span>hi</span>";
		i = angular.element(document).injector();
		i2 = angular.injector(['ng', 'ngSanitize']);
		sce = i.get("$sce");
		s = i2.get('$sanitize');


		$scope.url = "javascript:alert(1);";
	})

	.directive('try', function() {
		return function(scope,el,attrs) {
			console.log('here');
		}
	})
	.directive('try', function($rootScope) {
		return function(scope,el,attrs) {
			console.log(scope.$parent === $rootScope)
		}
	})	