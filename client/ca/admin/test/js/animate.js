var app = angular.module('app', ['ngAnimate'])


app.controller('MainCtrl', function($scope, $animate) {
	var el = document.querySelector('p');
	$scope.add = function() {
		$animate.addClass(el, 'hey');
	};
	$scope.remove = function() {
		$animate.removeClass(el, 'hey');
	};
})

.directive('message', function($animate) {


    return {
        restrict: 'AE',
        scope: {},
        replace: true,
        link: function(scope, el, attrs) {
            scope.$watch('show', function(newVal) {
                console.log('show: ', newVal);
                $animate[newVal ? 'removeClass' : 'addClass'](el, 'hey');
            })

            angular.element(document).on('click', function() {

                scope.show = !scope.show;
                scope.$apply();
            })

        },
        template: '<span>' +
            'bla' +
            '</span>'
    }
})
