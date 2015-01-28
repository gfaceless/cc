var app = angular.module('myApp', ['taiPlaceholder', 'message', 'misc', 'liveCreate', 'ui.bootstrap', 'angularLoad', 'ngSanitize','ngAnimate'])
    .config(function($httpProvider) {
        // $httpProvider.interceptors.push(b);
        $httpProvider.interceptors.push(function($q, MessageApi) {
            function getMessage(res) {
                var msg = res && res.data && res.data.message

                // msg may be undefined, but that's ok.
                // MessageApi will handle that
                return msg;
            }

            return {
                /*'request': function(config) {

                    return config;
                },*/
                'response': function(res) {

                    // thought status is 200, if success is false,
                    // we redirect it as a responseError
                    if (res.data && res.data.success === false) {
                        var msg = getMessage(res);
                        // if no msg, we suppress notification.
                        // and only when not mute.
                        if (msg && !res.config.mute) {
                            MessageApi.error(msg);
                        }
                        return $q.reject(res);
                    }
                    return res;
                },
                responseError: function(res) {

                    var msg = getMessage(res);
                    // if no msg, we suppress notification.
                    if (msg) {
                        MessageApi.error(msg);
                    }
                    // if simply returning res, it is recovered, would be handled in success handler
                    return $q.reject(res);
                }
            };
        });

    })
    .controller('appCtrl', function($scope, $http, $modal, MessageApi, $timeout) {

        $scope.testMessage= function() {
            MessageApi.success('hey!');
        }

        $scope.$on('freeze', function(e, freezed) {
            $scope.freezed = freezed;
        })

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
                backdrop: false,
                windowClass: "login-modal"
            }).result.then(function(user) {
                $scope.logged = true;
                // temp, I'll recode user part
                $scope.role = user.role;
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
                        delete $scope.role;
                        MessageApi.success('成功退出');
                        $timeout(clearScope, 500);

                    }
                })
        }

        function startApp() {
            // TODO: use a better tab system. shouldn't write it here
            // maybe use ng-bootstrap
            $scope.tabs = [{
                title: '专业和工种管理',
                url: 'views/major-and-work-type.html'
            }, {
                title: '申请结果查询',
                url: 'views/ca-results.html',

            }, {
                title: '系统帐号管理',
                url: 'views/sys-account.html'
            }, {
                title: "展示信息编辑",
                url: 'views/editor.html'
            }];
            if($scope.role == "crapSubMgr"){
                $scope.tabs = [$scope.tabs[1]]
            }
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
                        $scope.role = data.role;
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
