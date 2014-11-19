var app = angular.module('myApp', [])
    .controller('appCtrl', function($scope, $http) {
        var urlCA = '/ca/credit-apply';

        var templates = [
            {url: 'views/step1.html'},
            {url: 'views/step2.html'},
            {url: 'views/success.html'},
            {url: 'views/failure.html'}
        ];

        var currentTemplate = 0;
        $scope.template = templates[currentTemplate];
        $scope.ca = {cert: {}};
        
        $http.get('work-type')
        .success(function(data) {
            $scope.workTypes = data.workTypes;
        })
        .error(function() {

        })

        $scope.submit = function() {
            $http.post(urlCA, $scope.ca)
                .success(function(data) {
                    if(data.success) {
                        $scope.template = templates[2];
                    } else {
                        $scope.template = templates[3];
                    }
                })
                .error(function(a, b) {console.log(a,b)})
        }

        $scope.start = function() {
            $scope.template = templates[++currentTemplate];
        }

    });
