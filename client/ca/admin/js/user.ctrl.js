var app = angular.module('myApp')

app.controller('loginCtrl', function($scope, $modalInstance, $http, MessageApi) {
	var url = "login"
	$scope.user = {};
	/*$scope.focus = true;*/
	$scope.ok = function() {
		$http.post(url, {
				user: $scope.user
			})
			.success(function(data) {
				if (data.success) $modalInstance.close(data);

			})

	};
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};

})

app.controller('userCtrl', function($scope, $http, $modal, MessageApi) {
	
	
	$scope.users = [];
	
	$scope.upsert = function(user, index) {
		var successMsg = user ? "编辑成功" : "添加成功";
		$modal.open({
			templateUrl: 'views/upsert-user.html',
			controller: "userUpsertCtrl",
			// size: 'lg',
			resolve: {
				user: function() {
					return angular.copy(user);
				}
			},
			backdrop: 'static'
		}).result.then(function(data) {
			MessageApi.success(successMsg);
			if(user){
				// user must be an object, or else it would fail
				angular.extend(user, data.user);
				// $scope.users.splice(index, 1, data.user);
			}else{
				$scope.users.unshift(data.user);
				
			}
		}, function(data) {

		})
	}
	$scope.remove = function(user) {
		var confirmed = confirm("确定删除么");
		if (!confirmed) return;
		$http["delete"]('users/' + user._id)
			.success(function(data) {
				MessageApi.success("删除成功");
				$scope.users.splice($scope.users.indexOf(user), 1);
			})
	}


	function init() {
		$http.get('users', {mute: true})
			.success(function(data) {
				$scope.users = data.users;
			})
	}

	init();

})
app.controller('userUpsertCtrl', function($scope, $modalInstance, $http, user) {
	$scope.form = {};

	var editing = user ? true : false;
	var method = user ? "put" : "post";
	var url = user ? "users/" + user._id : "users";


	$scope.user = user || {};
	$scope.editing = editing;
	console.log($scope.userForm);
	setTimeout(function() {
		console.log($scope.userForm);
	},2000)

	$scope.ok = function() {

		$http[method](url, {
				user: $scope.user
			})
			.success(function(data) {
				$modalInstance.close(data);
			})

	};
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};
	
	
})
