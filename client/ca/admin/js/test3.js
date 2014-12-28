angular.module('app', [])
.controller('myCtrl', function($scope, $http) {
	$scope.submit = function() {
		var content = tinyMCE.editors[0].getContent();

		$http.post('we', {data: content})

	}

})