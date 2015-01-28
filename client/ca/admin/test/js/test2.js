angular.element.prototype.pureText = function() {
    var text = "";
    var node = this[0];
    for (var child = node.firstChild; !!child; child = child.nextSibling) {
        if (child.nodeType === 3) {
            text += child.nodeValue;
        }
    }
    return text;
}




angular.module('app', [])
    .factory('ExampleService', function() {

        this.f1 = function(world) {
            return 'Hello ' + world;
        }
        return this;
    })
    .controller('myCtrl', function($scope, $timeout, $q) {
        $scope.blah = function(value) {
            console.log('value is', value);
            var d = $q.defer();
            $timeout(function() {
                d.resolve(value.toUpperCase());
            }, 550);

            return d.promise;
        }

        $scope.majors = [
            {name: 'wang', id: 1},
            {name: 'dong', id: 2},
            {name: 'xi', id: 3}
        ]
    })
    .directive('liveEdit', function($compile, $q, $timeout, $interpolate) {
        return {
            scope: {
                confirmFn: "&",
                // the question mark is important
                $model: "=?liveEdit"
            },
            // if the following does not exists, then console.error
            // Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found. Element: <span ng-transclude="">
            transclude: true,

            template: '<span ng-bind="$model" ng-show="!editing"></span><button ng-hide="editing" class="btn btn-primary" ng-click="edit()">编辑</button><div we></div>',

            compile: function(tEl, tAttrs) {

                // the biggest issue using this method
                // is that it results different scopes between parent and live-created children
                // (children use controller's scope)
                // TODO: use template (saving lots of trouble!)
                // use it only on plain-text element!
                /*var btn = angular.element('<div btn-edit></div>')
                tEl.css({
                    position: "relative"
                });
                tEl.append(btn);*/



                return function(scope, el, attrs, ctrl, transcludeFn) {
                    var inited;

                    transcludeFn(function(clone, iScope) {
                        // currently only support plain text,
                        // but we can also do some dom->text transformation here
                        var fn = $interpolate(clone.text())


                        scope.$model = scope.$model || fn(iScope);
                    });
                    function createInput() {
                        if(inited) return;
                        inited = true;

                        var str = '<div ng-show="editing"><input type="text" gf-enter="confirm()" ng-model="$model"><button class="btn btn-primary" ng-click="confirm()">y</button><button class="btn btn-primary" ng-click="remove()">x</button></div>'
                        var input = angular.element(str);

                        el.append(input);

                        $compile(input)(scope);

                        scope.confirm = function() {
                            var params = {
                                $model: scope.$model
                            }
                            $q.when(scope.confirmFn(params))
                                .then(function(model) {
                                    scope.editing = false;
                                    // do we need blur?
                                    if(model) scope.$model = model;
                                })
                        }
                    }
                    scope.edit = function() {
                        scope.editing = true;
                        createInput();
                        $timeout(function() {
                            el.find('input')[0].focus();

                        })
                    }

                }
            }

        }
    })
    .factory('$$liveCreate', function() {
        var map = {};

        function generateId(arguments) {
            generateId._id = generateId._id || 0;

            return "lc" + generateId._id++;
        }
        return {
            get: function(id) {
                return map[id];
            },

            startEdit: function(id) {
                var instance;
                // if not id is pass, we create a new instance and then start editing
                if (!id || !map[id]) {
                    instance = this["create"]()
                } else {
                    instance = map[id];
                }
                instance.editing = true;
                return instance;
            },
            dismiss: function(id) {
                map[id].editing = false;

            },

            "create": function() {
                var id = generateId();
                return map[id] = {
                    id: id
                };
            }

        }
    })
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
                    element[0].blur();
                }
            });
        };
    })