// see #http://stackoverflow.com/questions/14883476/angularjs-call-method-in-directive-controller-from-other-controller

var MessageModule = angular.module('message', []);


MessageModule.factory('MessageApi', function($timeout, $rootScope) {

    // TODO: add animation for improved messaging.
    // move timetoClear logic to directive for possible DOM handling (and for animation-CSS add and removal)
    var DISPLAY_TIME = 2000;


    return {
        status: null,
        message: null,
        show: false,
        hasChanged: function() {
            var tmp = this._changed;
            this._changed = false;
            return tmp;
        },

        progress: function(msg) {

            this._clearPrevTimeout();

            this.status = 'info';
            this.message = msg || '操作中，请稍候';
            this.show = true;
            this._changed = true;

        },
        success: function(msg) {
            this._clearPrevTimeout();
            this._timeout();

            this.status = 'success';
            this.message = msg || '操作成功';
            this.show = true;
            this._changed = true;

        },

        // for now, when error, we force the "ugly alert"
        // and hide previous message

        error: function(msg) {
            // this._clearPrevTimeout();
            // this._timeout();

            this.show = false;
            this._changed = true;

            // TODO: make a popup
            var defaultMsg = '操作失败';

            alert(msg || defaultMsg);

        },

        // to think of a better name
        finish: function() {
            var api = this;

            api.show = false;
            this._changed = true;

        },
        _timeout: function(duration) {
            duration = duration || DISPLAY_TIME;

            var api = this;
            this.timeoutPromise = $timeout(function() {
                api.finish();
            }, duration);

        },

        // if next call starts before previous call's timeout, we cancel that timeout.
        _clearPrevTimeout: function() {
            if (this.timeoutPromise) {
                $timeout.cancel(this.timeoutPromise);
                this.timeoutPromise = null;
            }
        }
    }
});

MessageModule.directive('message', function(MessageApi, $timeout, $animate) {

    /* from https://github.com/angular/angular.js/blob/v1.2.28/src/ng/directive/ngShowHide.js#L237
    * Keep in mind that, as of AngularJS version 1.2.17 (and 1.3.0-beta.11), there is no need to change the display
    * property to block during animation states--ngAnimate will handle the style toggling automatically for you.
    */

    !window.angular.$$csp() &&
    window.angular.element(document).find('head').prepend(
        '<style type="text/css">@charset "UTF-8";.gmessage-hide{display:none!important}.gmessage-hide-add-active,.gmessage-hide-remove{display:inline!important}.gmessage-hide-remove{-webkit-animation:expand .7s ease-out;animation:expand .7s ease-out}.gmessage-hide.gmessage-hide-add{-webkit-animation:fadeOut 1s;animation:fadeOut 1s}@-webkit-keyframes fadeOut{from{opacity:1}to{opacity:0}}@keyframes fadeOut{from{opacity:1}to{opacity:0}}@-webkit-keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@-webkit-keyframes expand{50%{-webkit-transform:scale(1.08);transform:scale(1.08)}to{-webkit-transform:scale(1);transform:scale(1)}}@keyframes expand{50%{-webkit-transform:scale(1.08);transform:scale(1.08)}to{-webkit-transform:scale(1);transform:scale(1)}}</style>');


    return {
        restrict: 'AE',
        scope: {},
        replace: true,
        link: function(scope, el, attrs) {
            scope.api = MessageApi;

            scope.$watch(function() {
                return MessageApi.hasChanged()
            }, function(changed, oldVal) {
                if(changed || changed === oldVal/*first time run*/){
                    $animate.addClass(el, 'gmessage-hide');
                    if(MessageApi.show){
                        $animate.removeClass(el, 'gmessage-hide');
                    }
                }
            })

        },
        // todo: remove bootstrap class
        template: '<span class="label label-{{api.status}} gf-message">' +
            "{{api.message}}" +
            '</span>'
    }
})
.directive('spinner', function($http) {
    return {
        restrict: 'EA',
        scope: {},
        replace: true,
        // should be absoulte path
        template: '<span class="spinner"><img ng-show="spinnerVisible" src="/img/ajax-loader.gif" width="20" height="20" />' +

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

