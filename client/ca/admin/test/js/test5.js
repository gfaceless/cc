var app = angular.module('app', [])

console.log('not here??');
app.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
	$locationProvider.hashPrefix('!');
	
})

app.controller('MainCtrl', function($scope, $location) {
	l = $location;
	// l.path('/hey').search({a:'a'}).hash('c')

});
