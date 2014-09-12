// see #http://stackoverflow.com/questions/14883476/angularjs-call-method-in-directive-controller-from-other-controller

var MessageModule = angular.module('message', []);


MessageModule.factory('MessageApi', function($timeout, $rootScope) {

    var DISPLAY_TIME = 2000;

    return {
        status: null,
        message: null,
        progress: function(msg, timetoShow) {
            
            var api = this;
            
            api.status = 'info';
            api.message = msg || '操作中，请稍候';
            
            this.clear(false);

        },
        success: function(msg) {
            this.status = 'success';
            this.message = msg || '操作成功';
            this.clear();
            
        },
        error: function(msg) {

            // TODO: make a popup
            var defaultMsg = '操作失败';
            /*var defaultException = '若不是网络问题，此为bug，请联系王希';
            var exception = !/^2/.test(status);*/
            alert(msg && msg.message || defaultMsg);

        },
        clear: function(timetoClear) {
            var api = this;
            api.clearPrevTimeout();

            // if first param if false, then just clear previous $timeout
            if(timetoClear === false) return;

            // if undefined, default time is:
            timetoClear = timetoClear || DISPLAY_TIME;

            api.timeoutPromise = $timeout( function() {
                api.status = null;
                api.message = null;         
            }, timetoClear);

        },
        // if the next call is before $timeout finished, then cancel previous $timeout
        clearPrevTimeout: function() {
            if(this.timeoutPromise) {
                $timeout.cancel(this.timeoutPromise);
            }
        }
    }
});

MessageModule.directive('message', function() {
    return {
        restrict: 'AE',
        scope: {},
        replace: true,
        controller: function($scope, MessageApi, $timeout) {
            $scope.show = false;
            $scope.api = MessageApi;
            
            $scope.$watch('api.status', toggledisplay)
            $scope.$watch('api.message', toggledisplay)
            
            /*$scope.hide = function() {
                $scope.show = false;
                $scope.api.clear();
            };*/

            function toggledisplay() {
                
                $scope.show = !!($scope.api.status && $scope.api.message);
                
            }
        },
        template: '<span class="label label-{{api.status}}" ng-show="show">' +
                    '{{api.message}}' +
                  '</span>'
    }
})

.directive('spinner', function($http) {
    return {
        restrict: 'EA',
        scope: {},
        replace: true,
        template: '<span class="spinner"><img ng-show="spinnerVisible" src="img/ajax-loader.gif" width="20" height="20" />' +
            
            '</span>',
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

