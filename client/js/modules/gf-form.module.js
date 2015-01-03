var app = angular.module('gfForm', [])

var formDirective = function() {

	return {
		// a priority lower than angular build-in form directive is very important
		// or else we cannot have access to ctrl
		priority: -400,
		restrict: "E",
		require: "form",
		link: function(scope, el, attrs, ctrl) {

			el.on('submit', function(e) {

				scope.$apply(function() {
						ctrl.attempted = true;
					})
				// actually we could do something like this
				// e.stopPropagation()
			})
		}
	}
}

function inputAndSelectDirective() {
	return {
		restrict: "E",
		require: '?ngModel',
		link: function(scope, el, attr, ctrl) {
			if (!ctrl) {
				return;
			}

			/*el.on('focus', function () {
			    el.addClass('has-focus');

			    scope.$apply(function () {
			        ctrl.hasFocus = true;
			    });
			});*/

			el.one('blur', function() {
				/*el.removeClass('has-focus');
				el.addClass('has-visited');*/
				scope.$apply(function() {
					// angularjs 1.3 implements $touched
					// see https://github.com/angular/angular.js/blob/3e42b22b0e9df95994624d45502e612398d2fc1d/src/ng/directive/ngModel.js#L1042
					// here I just do the minimum.
					ctrl.touched = true;
				});
			});

			/*el.closest('form').on('submit', function () {
			    el.addClass('has-visited');

			    scope.$apply(function () {
			        ctrl.hasFocus = false;
			        ctrl.hasVisited = true;
			    });
			});*/

		}
	};
}

app.directive("form", formDirective)
app.directive('input', inputAndSelectDirective)
app.directive('select', inputAndSelectDirective)

app.directive('gfFormError', function(FormError) {
	return {
		restrict: "EA",
		require: "^form",
		scope: {},
		link: function(scope, elem, attrs, formCtrl) {
			// I used to do: ng-show="userForm.name.$invalid && userForm.name.$dirty"
			var fieldName = attrs.gfFormError;
			var fieldCtrl = formCtrl[fieldName];
			if (!fieldCtrl) throw new Error("no such field name");

			// note that the following watches may not be necessary
			// considering there's no need to change the message content if it is hidden

			// control message content
			scope.$watchCollection(function() {
				return fieldCtrl.$error
			}, function(errors, oldErrors) {
				scope.message = FormError.getErrMsg(errors);
			})

			// control message visibility
			scope.$watch(function() {
				return fieldCtrl.$invalid && (fieldCtrl.$dirty && fieldCtrl.touched || formCtrl.attempted)
			}, function(val, oldVal) {
				if (val) {
					scope.visible = true;
				} else {
					scope.visible = false;
				}
			})

		},
		template: '<span ng-show="visible">{{message}}</span>'
	}

})

// a service for form validation message
// can be applied like this:
// FormError.put("studNumber", "学号无效", 1);

app.factory("FormError", function() {
	var errMessages = [{
		"required": "必填"
	}, {
		"equals": "两次输入不一致"
	}, {
		"minlength": "字符太少"
	}, {
		"maxlength": "字符太多"
	}];

	function put(name, msg, order) {
		var err = {};
		err[name] = msg;
		if (order === undefined) {
			errMessages.push(err);
		} else {
			errMessages[order] = err;
		}
	}


	return {
		put: put,
		getErrMsg: function(formCtrlErrors) {

			var ret;
			// angularjs forEach does not support break
			// maybe I should use Array.some (and shim IE8)
			for (var i = 0, err; i < errMessages.length; i++) {
				err = errMessages[i]
				angular.forEach(err, function(msg, key) {
					if (formCtrlErrors[key]) {
						ret = msg
					}
				})
				if (ret) break;
			}
			return ret;
		}
	}

})
