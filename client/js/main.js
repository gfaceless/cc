var app = angular.module('myApp', ['ui.bootstrap',  "customFilters", 'taiPlaceholder'])
    .config(function($httpProvider) {
        // see #http://stackoverflow.com/questions/16098430/angular-ie-caching-issue-for-http
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
    })
    /*.config(function($httpProvider) {

        $httpProvider.interceptors.push(function(indicator) {
            return {
                request: function(config) {
                    return config;
                },
                response: function(response) {                    
                    return response;
                }
            }
        });
    })*/
    .controller('appCtrl', function($scope, $modal, $http, $log, $timeout, $filter) {
        var url = 'certs';
        var EXPORT_URL = 'certs/export';
        var UPLOAD_URL = 'certs/upload';
        var DOWNLOAD_URL = 'certs/download';
        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            maxSize: 5
        }


        $scope.criteria = {};
        var lastCriteria;
        var moreCriteria;


        $scope.find = function(criteria, page, limit) {

            criteria = criteria || {};
            $http.get(url, {
                params: calcParams(criteria, page, limit)
            })
                .success(function(data, status) {
                    if (!data.success) return handleFailure(data, status);

                    $scope.certs = data.results;
                    $scope.pagination.total = data.total;

                    lastCriteria = criteria;
                    // reset currentPage:
                    $scope.pagination.currentPage = page;
                    $scope.exportUrl = EXPORT_URL + '?cert=' + angular.toJson(lastCriteria);
                })
                .error(handleFailure);

            function calcParams(criteria, page, limit) {
                var o = {
                    page: page || 1
                };

                for (var k in criteria) {
                    if (criteria[k] === "") delete criteria[k];
                }
                return angular.extend({
                    cert: criteria
                }, o);

            }
        };

        $scope.exports = function(e) {
            if ($scope.pagination.total > 60000) {
                e.preventDefault();
                alert('数量超过60000，无法导出低版本excel')
            }

        };

        $scope.pageChanged = function() {
            $scope.find(lastCriteria, $scope.pagination.currentPage);
        };

        /**
         * makeshift , I don't really understand the underlying system
         * see #http://stackoverflow.com/questions/15079779/how-to-clear-a-file-input-from-angular-js
         */
        $scope.resetInputFile = function(e) {
            angular.element(e.srcElement).val(null);
        };

        /* temp: USE directive instead:*/
        $('#file-upload').fileupload({
            url: UPLOAD_URL,
            dataType: 'json',
            done: function (e, data) {
                if(!(data.result && data.result.success)) return handleFailure(data.result);
                $scope.find(lastCriteria);
                showInfo();

                $modal.open({
                    templateUrl: 'view/info.html',
                    backdrop: 'static',
                    controller: InfoCtrl,
                    resolve: {
                        data: function() {
                            return data.result
                        },
                        DOWNLOAD_URL: function() {
                            return DOWNLOAD_URL
                        }
                    }
                });
                
            },
            fail: function(e, data) {handleFailure()}
        });        


        $scope.remove = function(cert) {
            if (!confirm('确定要删除么')) return;
            //using $http.delete() throws a parse error in IE8
            $http['delete'](url + '/' + cert._id)
                .success(function(data, status) {
                    if (!data.success) return handleFailure(data, status);

                    $scope.certs.splice($scope.certs.indexOf(cert), 1);
                    showInfo();

                }).error(handleFailure)
        };

        $scope.open = function(cert) {
            var copy, index;
            if (cert) {
                copy = angular.copy(cert);
                index = $scope.certs.indexOf(cert);
            }


            var modalInstance = $modal.open({
                templateUrl: 'view/editorView.html',
                controller: ModalInstanceCtrl,
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    cert: function() {
                        return copy;
                    }
                }
            });

            modalInstance.result.then(function(newCert) {
                if (cert) {
                    $scope.certs[index] = newCert;
                } else {
                    $scope.certs.push(newCert);
                }
                showInfo();

            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openModalSearch = function() {
            var modalInstance = $modal.open({
                templateUrl: 'view/advancedSearchView.html',
                controller: SearchCtrl,
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    criteria: function() {
                        return moreCriteria;
                    }
                }
            });
            modalInstance.result.then(function(criteria) {
                moreCriteria = criteria;
                $scope.find(criteria);
            }, function() {

            })


        }

        $scope.openLogin = function() {
            var modalInstance = $modal.open({
                templateUrl: 'view/login.html',
                controller: LoginCtrl,
                size: 'sm',

                resolve: {

                }
            });
            modalInstance.result.then(function(isLogged) {
                $scope.isLogged = isLogged;
                showInfo('登录成功');
            }, function() {

            })
        }

        $scope.logout = function() {
            $http.post('admin9/logout')
                .success(function(data) {
                    if (data.success) {
                        $scope.isLogged = false;
                        showInfo('成功退出');
                    }
                })
        }

        $scope.$watch('isLogged', function(val) {
            if (val) $scope.find({});
        });
        checkLogged();

        function checkLogged() {
            $http.post('admin9/isLogged')
                .success(function(data) {
                    if (data.isLogged) $scope.isLogged = true;
                })
        }

        function showInfo(msg, time) {
            $scope.msg = msg || "操作成功";
            $scope.msgVisible = true;

            if (time === 0) return; // time equals 0 means eternal.
            time = time || 1500;

            $timeout(function() {
                $scope.msgVisible = false;
            }, time);
        }


    });
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function($scope, $modalInstance, cert, $http) {

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

};



var SearchCtrl = function($scope, $modalInstance, $http, criteria) {

    $scope.criteria = criteria || {};

    $scope.ok = function() {

        $modalInstance.close($scope.criteria);

    }
    $scope.cancel = function() {
        $modalInstance.dismiss();
    };

};

var InfoCtrl = function($scope, $modalInstance, data, DOWNLOAD_URL) {
    $scope.data = data;
    if (data.href) data.href = DOWNLOAD_URL + '/' + data.href;

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
};

var LoginCtrl = function($scope, $modalInstance, $http) {
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
};

app.controller('mytestCtrl', function($http) {

    /*console.log($http.defaults.transformResponse);
    $http.defaults.transformResponse = [];*/
})
/*.factory('indicator', function($timeout) {
    return {
        success: function() {
            this.flag = true;
            var that = this;
            $timeout(function() {that.flag=undefined}, 2000);
        }
    }
})*/
.directive('indicator', function($http) {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="indicator"><img ng-show="spinnerVisible" src="img/ajax-loader.gif" width="20" height="20" />' +
            '<span class="label label-success" ng-show="msgVisible">{{msg}}</span>' +
            '</div>',
        link: function(scope, element, attr) {
            var img = element.children('img');

            scope.$watch(function() {
                return $http.pendingRequests.length > 0;
            }, function(hasPending) {
                if (hasPending) {
                    scope.spinnerVisible = true;
                } else {
                    scope.spinnerVisible = false;
                }
            });
        }
    }
})


function handleFailure(data, status, newMsg) {
    // should have made this block a service + directive
    // that way it could be reused throughout the entire app
    // now for a makeshift, I choose to alert every failure.
    var defaultFailure = '操作失败';
    var defaultException = '若不是网络问题，此为bug，请联系王希';
    var exception = !/^2/.test(status);

    // for easy use like .error(handleFailure):
    if (typeof newMsg === 'function') newMsg = '';

    var msg = newMsg ?
        newMsg :
        (data && data.message) ?
        data.message :
        exception ? defaultException : defaultFailure;

    alert(msg);
    //$modalInstance.dismiss();
}
