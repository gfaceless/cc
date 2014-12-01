var app = angular.module('myApp', ['message', 'misc', 'liveCreate', 'ui.bootstrap'])
    .controller('appCtrl', function($scope, $http, $modal, MessageApi, $timeout) {
               


        $scope.onClickTab = function(tab) {
            $scope.currentTab = tab;
        }

        $scope.isActive = function(tab) {
            if (!$scope.currentTab) return false;
            return tab.url == $scope.currentTab.url;
        }
        $scope.openLogin = function() {
            $modal.open({
                templateUrl: 'views/login.html',
                controller: 'loginCtrl',
                size: 'sm',
                backdrop: false
            }).result.then(function(data) {
                $scope.logged = true;
                MessageApi.success('登录成功');
            }, function(data) {

            })
        }
        $scope.logout = function() {
            // yes, we should use a global error handler to handle every $http.error
            $http.post('logout')
                .success(function(data) {
                    if (data.success) {
                        $scope.logged = false;
                        MessageApi.success('成功退出');
                        $timeout(clearScope, 3000);
                        
                    }
                })
        }

        function startApp() {
            // TODO: use a better tab system. shouldn't write it here
            // maybe use ng-bootstrap
            $scope.tabs  = [{
                title: '专业和工种管理',
                url: 'views/major-and-work-type.html'
            }, {
                title: '申请结果查询',
                url: 'views/ca-results.html',

            }, {
                title: '系统帐号管理',
                url: 'views/sys-account.html'
            }];
            $scope.currentTab = $scope.tabs[0];
        }
        function clearScope() {
            $scope.tabs = null;
            delete $scope.currentTab;
        }

        function checkLogged() {
            $http.post('isLogged')
                .success(function(data) {
                    if (data.logged) {
                        $scope.logged = data.logged
                    } else {
                        $scope.openLogin();
                    }
                })
        }

        $scope.$watch('logged', function(val) {
            if (val) {
                startApp();
            }
        });
        checkLogged();

    });


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
                else fail(data.message);
            })
            .error(function(data) {
                fail(data.message);
            })

    };
    $scope.cancel = function() {
        $modalInstance.dismiss();
    };

    function fail(msg) {
        MessageApi.error(msg || "登录失败");
    }
})

// mw : major and workType
app.controller('mwCtrl', function($scope, $http, MessageApi, $log) {
    var majors;

    $http.get('major')
        .success(function(data) {
            majors = $scope.majors = data.majors;
            $scope.hasListed = true;

        })
        .error(function(data) {

        })




    $scope.addMajor = function() {
        majors.unshift({
            name: '',
            _isNew: true
        })

    };


    $scope.addWT = function(major) {

        major.workTypes.push({
            _isNew: true
        })

    };



    $scope.upsertMajor = function(major, cb) {
        // relative to ca/admin/ca.admin.html
        var promise;
        if (!major._id) {
            promise = $http.post('major', {
                major: major
            })
        } else {
            promise = $http.put('major/' + major._id, {
                major: major
            })
        }

        promise.success(function(data) {
                if (data.success) {
                    MessageApi.success('操作成功');
                } else {
                    fail(data);
                }
                cb(null, data);
            })
            .error(function(data, status) {
                fail(data);
                cb('fail', data);
            })
    }


    function fail(data, cb) {
        var msg = '操作失败';

        if (data.message) msg += (" " + data.message);
        MessageApi.error(msg);

    }

    $scope.removeMajor = function(major, index) {

        $http
            .post('major' + '/' + major._id, {
                major: major
            })
            .success(function(data) {
                if (data.success) {
                    MessageApi.success('操作成功');
                } else {
                    fail(data);
                }
                $scope.rmFromCollection(majors, index);
            })
            .error(function(data, status) {
                fail(data);

            })
    }

    $scope.removeWT = function(major, workType, index) {
        // relative to ca/admin/ca.admin.html

        $http['post']('work-type/' + workType._id, {
                majorId: major._id,
                workType: workType
            })
            .success(function(data) {
                if (data.success) {
                    MessageApi.success('操作成功');
                } else {
                    fail(data);
                }
                $scope.rmFromCollection(major.workTypes, index);
            })
            .error(function(data, status) {
                fail(data);

            })
    }


    // We should definitely make live-create a component
    // doing so many interweaving things is tiresome:
    $scope.rmFromCollection = function(collection, index) {
        collection.splice(index, 1);
    }




    $scope.createWT = function(majorId, workType, cb) {
        // relative to ca/admin/ca.admin.html

        $http.post('work-type', {
                majorId: majorId,
                workType: workType
            })
            .success(function(data) {
                var err = null;
                if (data.success) {
                    MessageApi.success('操作成功');

                } else {
                    fail(data);
                    // I should have a clearer definition of 500 error and 200 but success: false
                    err = 'fail (success: false)'
                }

                cb(err, data);

            })
            .error(function(data, status) {
                fail(data);
                cb('fail', data);
            })
    }


})



function selectElementText(el, win) {
    win = win || window;
    var doc = win.document,
        sel, range;
    if (win.getSelection && doc.createRange) {
        sel = win.getSelection();
        range = doc.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}
