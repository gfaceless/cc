var f,d;

angular.module('app', [])
    .factory('ExampleService', function() {
        console.log('first');
        this.f1 = function(world) {
            return 'Hello ' + world;
        }
        return this;
    })
    .directive('we', function() {

        return {
            scope: {
                v: "@"
            },
            transclude: true,
            template: '<div class="we"><span>1st</span><span>{{v}}</span></div>',
            controller: function($scope, $element, $attrs, $transclude, $rootScope) {
                console.log('in controller');
                console.log('this directive scope $id is', $scope.$id);
                console.log('root scope is', $rootScope);

            },
            compile: function(tEl, tAttr) {
                console.log('in compile');
                tEl.find("span").eq(0).html('hty me');
                return {
                    pre: function(scope, iEl, iAttrs, ctrl, transcludeFn) {
                        console.log('in pre link!!');
                    },
                    post: function(scope, iEl, iAttrs, ctrl, transcludeFn) {
                        console.log('this directive scope $id is', scope.$id);
                        transcludeFn(function(clone, scope) {
                            console.log('transclude\'s parent id:', scope.$parent.$id);
                            iEl.append(clone);

                        })
                    }
                }
            },
            link: function() {
                console.log('never here');
            }
        }
    })
    .controller('heyCtrl', function($scope) {

    })

// the concept I want to illustrate here is that whether the directive is in the original html
// or is from template, we compile them in the same sequence of DOM.
/*

parent (compile) 
..first-child (compile) 
..second-child (compile) 
I'm log2 (compile) 
..log in log2 (compile) 

parent (controller) 
parent (pre-link) 
..first-child (controller) 
..first-child (pre-link) 
..first-child (post-link) 
..second-child (controller) 
..second-child (pre-link) 
..second-child (post-link) 
parent (post-link) 
I'm log2 (controller)
I'm log2 (pre-link)
..log in log2 (controller) 
..log in log2 (pre-link) 
..log in log2 (post-link) 
I'm log2 (post-link) 
 */



.directive('conflict', function() {
        return {
            /*[$compile:multidir] Multiple directives [conflict, someParent] asking for template*/
            // template: "<div>in conflict</div>",
            controller: function($scope, $element, $attrs, $transclude) {
                console.log('conflict' + ' (controller)');
            },
            compile: function compile(tElement, tAttributes) {
                console.log('conflict' + ' (compile)');
                return {
                    pre: function preLink(scope, element, attributes) {
                        console.log('conflict' + ' (pre-link)');
                    },
                    post: function postLink(scope, element, attributes, ctrl, transcludeFn) {
                        console.log('conflict' + ' (post-link)');

                        if (f) {
                            console.log('equal?', transcludeFn === f)
                        } else {
                            f = transcludeFn;
                        }

                        if(d){
                            console.log('el equal? ', transcludeFn() === d);

                        } else {
                            d = transcludeFn();
                        }
                    }
                };
            }
        };
    })
    .directive('log', function() {
        return {
            controller: function($scope, $element, $attrs, $transclude) {
                console.log($attrs.log + ' (controller)');
            },
            compile: function compile(tElement, tAttributes) {
                console.log(tAttributes.log + ' (compile)');
                return {
                    pre: function preLink(scope, element, attributes) {
                        console.log(attributes.log + ' (pre-link)');
                    },
                    post: function postLink(scope, element, attributes, ctrl, transcludeFn) {
                        console.log(attributes.log + ' (post-link)');
                        if(!transcludeFn) return;
                        // NOTE: actually transcludeFn here is not the same as its parent's
                        // but returns the exact same dom. (if not cloned (passing a function would result a clone) )
                        if(d){
                            console.log('el equal? ', transcludeFn() === d);

                        } else {
                            d = transcludeFn();
                        }
                    }
                };
            }
        };
    })

.directive('someParent', function() {

    return {
        transclude: true,
        template: "<div>hi, i'm someParent<span log='....log in someParent'></span> </div>",
        controller: function($scope, $element, $attrs, $transclude) {
            console.log('some parent' + ' (controller)');
        },
        compile: function compile(tElement, tAttributes) {
            console.log('some parent' + ' (compile)');
            return {
                pre: function preLink(scope, element, attributes) {
                    console.log('some parent' + ' (pre-link)');
                },
                post: function postLink(scope, element, attributes, ctrl, transcludeFn) {
                    console.log('some parent' + ' (post-link)');
                    if (f) {
                        console.log('equal?', transcludeFn === f)
                    } else {
                        f = transcludeFn;
                    }

                    if(d){
                        console.log('el equal? ', transcludeFn() === d);

                    } else {
                        d = transcludeFn();
                    }
                    

                }
            };
        }
    }
})
.directive('tryLive', function($compile) {

    return {
        template: '<div class="wa"></div>',
        controller: function($scope, $element, $attrs, $transclude) {

            console.log('try live' + ' (controller)');
        },
        compile: function compile(tElement, tAttributes) {
            console.log('try live' + ' (compile)');
            // here we do something tricky
            // so even live-created child element would still be treated as if it was in the original HTML
            tElement.children('div').eq(0).attr('log', 'i\'m with try-live');
            return {
                pre: function preLink(scope, element, attributes) {
                    console.log('try live' + ' (pre-link)');
                },
                post: function postLink(scope, element, attributes, ctrl, transcludeFn) {
                    console.log('try live' + ' (post-link)');

                }
            };
        }
    }
})
