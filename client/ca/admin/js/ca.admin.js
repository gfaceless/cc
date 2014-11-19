var app = angular.module('myApp', ['message'])
    .controller('appCtrl', function($scope, $http) {
        var tabs;

        $scope.tabs = tabs = [{
            title: 'One',
            url: 'views/major-and-work-type.html'
        }, {
            title: 'Two',
            url: 'views/we.html'
        }, {
            title: 'Three',
            url: 'three.tpl.html'
        }];

        $scope.currentTab = tabs[0];

        $scope.onClickTab = function(tab) {
            $scope.currentTab = tab;
        }

        $scope.isActive = function(tab) {
            return tab.url == $scope.currentTab.url;
        }



        $scope.submit = function() {
            $http.post(urlCa, {
                    cert: $scope.cert
                })
                .success(function(data) {
                    if (data.success) {
                        $scope.template = templates[2];
                    } else {
                        $scope.template = templates[3];
                    }
                })
                .error(function(a, b) {
                    console.log(a, b)
                })
        }

        $scope.start = function() {
            $scope.template = templates[++currentTemplate];
        }

    });

// mw : major and workType
app.controller('mwCtrl', function($scope, $http) {
        var majors;

        $http.get('major')
        	.success(function(data) {
        		majors = $scope.majors = data.majors;
        		$scope.hasListed = true;
        		
        	})
        	.error(function(data) {
        		console.log(data);
        	})


        $scope.addMajor = function() {
            majors.push({
                name: '',
                _isNew: true
            })
        };

        $scope.addWT = function(major) {
        	
            major.workTypes.push({
                name: '输入工种',
                _isNew: true
            })
            
        };


        $scope.upsertMajor = function(major) {
        	// relative to ca/admin/ca.admin.html
        	if(!major._id){
        	   return $http.post('major', {major: major});
            }
            return $http.put('major/'+major._id, {major: major});
        }

    



        $scope.removeMajor = function(index) {
        	// relative to ca/admin/ca.admin.html
    		console.log('in removeMjaor, index is ', index);
        	majors.splice(index,1);
        }


        

        $scope.createWT = function(majorId, workType) {
        	// relative to ca/admin/ca.admin.html
        	
        	return $http.post('work-type', {majorId: majorId, workType: workType });
        }
       

    })
    .directive('liveCreate', function() {
        return {

            restrict: 'EA',
            transclude: true,
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
                            // TODO: consider use extend, not such full replacing.
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
                myPlaceholder: "@"
                
            },
            templateUrl: "templates/major.html"
        }
    })


function selectElementText(el, win) {
    win = win || window;
    var doc = win.document, sel, range;
    if (win.getSelection && doc.createRange) {
        sel = win.getSelection();
        range = doc.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}