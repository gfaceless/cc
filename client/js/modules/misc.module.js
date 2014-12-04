// http://stackoverflow.com/questions/17470790/how-to-use-a-keypress-event-in-angularjs/17472118#17472118
// also note the comment:
// http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs#comment-38317115
angular.module('misc', [])
    .directive('gfEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keypress", function(event) {
                
                if (event.keyCode === 13) {
                    
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
            }, 500);
        }
    };
})
// http://stackoverflow.com/questions/14012239/password-check-directive-in-angularjs
.directive('equals', function() {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function(scope, elem, attrs, ngModel) {
      if(!ngModel) return; // do nothing if no ng-model

      // watch own value and re-validate on change
      scope.$watch(attrs.ngModel, function() {
        validate();
      });

      // observe the other value and re-validate on change
      attrs.$observe('equals', function (val) {
        validate();
      });

      var validate = function() {
        // values
        var val1 = ngModel.$viewValue;
        var val2 = attrs.equals;

        // set validity
        ngModel.$setValidity('equals', ! val1 || ! val2 || val1 === val2);
      };
    }
  }
});