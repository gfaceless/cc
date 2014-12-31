angular.module('app',["ngSanitize"])
	.config(function($compileProvider) {
		console.log($compileProvider.aHrefSanitizationWhitelist());

	})
	.controller('myCtrl', function($scope, $http) {
		$scope.v = "<span>hi</span>";
		i = angular.element(document).injector();
		i2 = angular.injector(['ng', 'ngSanitize']);
		sce = i.get("$sce");
		s = i2.get('$sanitize');


		$scope.url = "javascript:alert(1);";
	})


