var app = angular.module('myApp', ['message', 'ui.bootstrap'])
    .controller('appCtrl', function($scope, $http, $modal, $log) {
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
            cert: {
                name: "张志伟",
                idnumber: "654324199104120035",
                certnumber: "1449003012300160"
            }
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
                    } else {
                        $scope.template = templates[3];
                    }
                    angular.extend($scope, data);
                })
                .error(function(data) {
                    $scope.template = templates[3];
                    // network failure
                    $scope.reason = 0
                })
        }

        $scope.restart = $scope.start = function() {
            $scope.template = templates[1];
        }

        $scope.getError = function(error) {            

            if (angular.isDefined(error)) {
                if (error.required) {
                    return "必填";
                } else if (error.email) {
                    return "Please enter a valid email address";
                }
            }
        }

        $scope.open = function(size) {

            var modalInstance = $modal.open({
                templateUrl: 'views/extra-info.html',
                controller: 'ModalInstanceCtrl',
                size: size
            });

            modalInstance.result.then(function(param) {
                $log.info(param);
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        $scope.alert = function(msg) {
            alert(msg);
        }
    })
    .controller('ModalInstanceCtrl', function($scope, $modalInstance) {

        $scope.ok = function() {
            $modalInstance.close('has read');
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });
