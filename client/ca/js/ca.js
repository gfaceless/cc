var app = angular.module('myApp', [])
    .controller('appCtrl', function($scope, $http) {
        var urlCA = '/ca/credit-apply';

        var templates = [{
            url: 'views/step1.html'
        }, {
            url: 'views/step2.html'
        }, {
            url: 'views/success.html'
        }, {
            url: 'views/failure.html'
        }];

        var currentTemplate = 0;
        $scope.template = templates[currentTemplate];
        $scope.ca = {
            cert: {name: "张志伟",idnumber: "654324199104120035",certnumber: "1449003012300160"}
        };

        $http
            .get('major')
            .success(function(data) {
                $scope.majors = data.majors;
            })
            .error(function() {

            })

        $scope.submit = function() {
            
            $http.post(urlCA, $scope.ca)
                .success(function(data) {                    

                    if (data.success) {
                        $scope.template = templates[2];
                        $scope.report = data.report;
                    } else {
                        $scope.template = templates[3];
                        $scope.reason = data.reason;
                    }
                })
                .error(function(data) {                    
                    $scope.template = templates[3];
                    // network failure
                    $scope.reason = 0
                })
        }

        $scope.start = function() {
            $scope.template = templates[++currentTemplate];
        }

    });
