var app = angular.module('myApp');


// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

app.controller('editCtrl', function($scope, $modalInstance, cert, $http, MessageApi) {

    $scope.mode = cert ? 'edit' : 'create';
    $scope.cert = cert || {};
    var url = 'certs';

    $scope.ok = function() {
        if ($scope.mode === 'edit') {
            $http.put(url + '/' + cert._id, {
                cert: cert
            })
                .success(function(data, status) {
                    if (!data.success) {
                        handleFailure(data, status);
                    } else {
                        $modalInstance.close(data.result);
                    }
                })
                .error(handleFailure)
        }
        if ($scope.mode === 'create') {
            $http.post(url, {
                cert: $scope.cert
            })
                .success(function(data, status) {
                    if (!data.success) {
                        handleFailure(data, status);
                    } else {
                        $modalInstance.close(data.result);
                    }
                })
                .error(handleFailure)
        }


    };




    $scope.cancel = function() {
        $modalInstance.dismiss();
    };


    $scope.getError = function(error) {
        if (angular.isDefined(error)) {
            if (error.required) {
                return "必填";
            } else if (error.email) {
                return "Please enter a valid email address";
            }

        }

    }

    function handleFailure(msg) {
        MessageApi.error(msg);
    }

})



.controller('searchCtrl', function($scope, $modalInstance, $http, lastScope) {       

    $scope.criteria = $scope.criteria || {
        certdate : [], tscore: [], pscore: []
    };
    angular.extend($scope.criteria, lastScope && lastScope.criteria);

    $scope.datepicker = $scope.datepicker || {}

    $scope.datepicker = angular.extend($scope.datepicker, {        
        formats : ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'],
        options: {
            startingDay: 1,            
            showWeeks: false
        }
    });

    $scope.ok = function() {
        $modalInstance.close($scope);
    }
    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
    $scope.openDatepicker = function($event, dir) {        
        $event.preventDefault();
        $event.stopPropagation();
        $scope.datepicker[dir] = $scope.datepicker[dir] || {};
        $scope.datepicker[dir].opened = true;
    }
     

})
.controller('infoCtrl',  function($scope, $modalInstance, data, DOWNLOAD_URL) {
    $scope.data = data;
    if (data.href) data.href = DOWNLOAD_URL + '/' + data.href;

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
})
.controller( 'loginCtrl', function($scope, $modalInstance, $http) {
    var url = "admin9"
    $scope.user = {};
    $scope.ok = function() {
        $http.post(url, {
            user: $scope.user
        })
            .success(function(data) {


                if (data.success) $modalInstance.close(true);
                else alert('登录失败')
            })
            .error(function(data) {
                // $modalInstance.dismiss();
                alert('登录失败')
            })

    };
    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
})

