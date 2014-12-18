angular.module('liveCreate', [])

/*.factory('LiveCreate', function() {

    var obj = {};

    return {
        register: function(name, method, fn) {
            var obj2 = obj[name] = obj[name] || {};
            obj2[method] = fn;
        },
        create: function(name) {
            obj[name].create();
        }
    }


})*/

.directive('liveCreate', function(/*some services. eg.LiveCreate */) {
    return {

        restrict: 'EA',
        transclude: true,


        link: function(scope, el, attrs) {

        	var input = el.find('input')[0];
            var $btnOK;
            // IE9 will focus input even if it is hidden
            // so I disable this code for now
            // TODO: solve it in the future
            // input.focus();
            
            if(scope.myModel._isNew) {
        	   input.focus();
            }
            
        	// looking for a better way:
        	scope.hasChild = angular.isDefined(attrs.hasChild);
        	
            scope.someFn = function() {
                // we are passing a map, which override existing params
                // (note that even if we pass nothing, function would still succeed, because scope would
                // find the right 'major')
                var params = {};
                params[attrs.myModel] = scope.myModel;
                params.cb = function(err, data) {                    
                    if(err){
                        
                        return scope.removeFromDom()
                    }
                    // TODO: consider using extend, not such full replacing.
                    // attrs.myModel is a string
                    angular.extend(scope.myModel, data[attrs.myModel]);

                    // we don't need this code, just run it for clarification
                    scope.myModel._isNew = false;
                };

                scope.upsert(params)
            }

            scope.remove = function() {
                var c = confirm('确定要删除么？');
                if(!c) return;

                scope.removeFn();
            }

            scope.cancel = function() {
                if(scope.myModel._id) {
                    // then it is an editing
                    cancelEdit();
                    
                    return;
                }
                scope.removeFromDom();
            }

            scope.edit = function() {
                scope.myModel._isNew = true;
                scope.oldModel = angular.copy (scope.myModel);                
            }


            // I use to do it like this: (deprecated)
            // ng-keypress="pressEnter($event)"
            /*scope.pressEnter = function(event) {
                
                if(event.keyCode == 13) {
                    event.preventDefault();
                    console.log(event);
                    // $btnOK = $btnOK || el.find('button').eq(0);
                    //  TODO: I would love to code like this: $btnOK.triggerHandler('click');
                    // but '$apply already in progress' -- and I have no time.
                    // so a makeshift:
                    if(scope.myModel.name) scope.someFn();
                }
            }*/

            function cancelEdit() {
                
                angular.extend(scope.myModel, scope.oldModel);
                scope.myModel._isNew = false;
                
            }


        },
        scope: {
            myModel: "=",
            // modelName is for data retrieval
            modelName: "@",
            upsert: "&",
            removeFn: "&",
            addChild: "&",
            myPlaceholder: "@",
            myClass: "@",
            removeFromDom: "&",
            mode:"@"
        },
        templateUrl: "templates/major.html"
    }
})