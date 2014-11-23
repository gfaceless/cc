angular.module('liveCreate', [])

.factory('LiveCreate', function() {

    var obj = {};

    return {
        register: function(name, fn) {
            obj[name] = fn;
        }
    }


})

.directive('liveCreate', function() {
    return {

        restrict: 'EA',
        transclude: true,
        controller: function($scope, LiveCreate) {
            $scope.create = function() {
                LiveCreate.create
            }

        },

        link: function(scope, el, attrs) {

        	var input = el.find('input')[0];
        	input.focus();

        	// looking for a better way:
        	scope.hasChild = angular.isDefined(attrs.hasChild);
        	
            scope.someFn = function() {
                // we are passing a map, which override existing params
                // (note that even we pass nothing, function would still succeed, because of scope would
                // find the right 'major')
                scope.upsert({model: scope.myModel})
                    .success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        // after res from the sever, we will:
                        console.log(data, status, headers, config);

                        // attrs.myModel is a string
                        // TODO: consider using extend, not such full replacing.
                        scope.myModel = data[scope.modelName || attrs.myModel];

                        // we don't need it, but run it for clarification
                        delete scope.myModel._isNew;
                		
                    })
                    .error(function(data, status, headers, config) {
                    	console.log(data, status, headers, config);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        scope.remove()
                    });
            }

            
            scope.edit = function() {

                scope.myModel._isNew = true;

            }

        },
        scope: {
            myModel: "=",
            // modelName is for data retrieval
            modelName: "@",
            upsert: "&upsertFn",
            remove: "&removeFn",
            addChild: "&addChildFn",
            myPlaceholder: "@",
            myClass: "@"
            
        },
        templateUrl: "templates/major.html"
    }
})