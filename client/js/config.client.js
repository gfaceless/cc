// yes, this page is only for me.

angular.module('myApp', ["message"])
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
        })
    })
    .controller('appCtrl', function($scope, $http, $filter, filterFilter, MessageApi) {


        $scope.createSysAcct = function() {
            $http.post('config/sys-mgr', $scope.sysMgr)
                .success(function(data) {
                    MessageApi.success('成功');
                })
        }

        $scope.createCrapMgr = function() {
            $http.post('config/crap-mgr', $scope.crapMgr)
                .success(function(data) {
                    MessageApi.success('成功');
                })
        };

        // when init:
        $http.get('config/is-available')

    })
