// http://stackoverflow.com/questions/17470790/how-to-use-a-keypress-event-in-angularjs/17472118#17472118
// also note the comment:
// http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs#comment-38317115
angular.module('misc', [])
    .directive('gfEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.gfEnter, {
                            'event': event
                        });
                    });
                    event.preventDefault();
                }
            });
        };
    })
// http://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field
.directive('focusMe', function($timeout, $parse) {
    return {
        //scope: true,   // optionally create a child scope
        link: function(scope, element, attrs) {

            // gf: I think it's better to use some scope
            // like {model: "=focusMe"}
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function(value) {
                
                if (value === true) {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
            // to address @blesh's comment, set attribute value to 'false'
            // on blur event:
            element.bind('blur', function() {
                
                scope.$apply(model.assign(scope, false));
            });
        }
    };
}).directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 100);
        }
    };
});