var app = angular.module('myApp', ['message', 'liveCreate'])
    .controller('appCtrl', function($scope, $http) {
        var tabs;

        // TODO: use a better tab system. shouldn't write it here
        // maybe use ng-bootstrap
        $scope.tabs = tabs = [{
                title: '专业和工种管理',
                url: 'views/major-and-work-type.html'
            }, {
                title: '申请结果查询',
                url: 'views/we.html'
            }, {
                title: '系统帐号管理',
                url: 'three.tpl.html'
            }
            /*,{
            			title: 'maybe thy agreement',
            			url: 'three.tpl.html'
            		}*/
        ];

        $scope.currentTab = tabs[0];

        $scope.onClickTab = function(tab) {
            $scope.currentTab = tab;
        }

        $scope.isActive = function(tab) {
            return tab.url == $scope.currentTab.url;
        }


    });

// mw : major and workType
app.controller('mwCtrl', function($scope, $http, MessageApi, LiveCreate) {
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

    LiveCreate.register('major', {
    	create: function(cb) {
    		console.log('first')
    		cb();
    	}

    })

    $scope.addWT = function(major) {

        major.workTypes.push({
            name: '输入工种',
            _isNew: true
        })

    };
    $scope.removeWT = function(major, workType, index) {
        // relative to ca/admin/ca.admin.html
        console.log('here');
        $http['post']('work-type/' + workType._id, {
                majorId: major._id,
                workType: workType
            })
            .success(function(data) {
                console.log(data);
                major.workTypes.splice(index, 1);
            })
            .error(function() {})
    }


    $scope.upsertMajor = function(major) {
        // relative to ca/admin/ca.admin.html
        if (!major._id) {
            return $http.post('major', {
                major: major
            });
        }
        return $http.put('major/' + major._id, {
            major: major
        });
    }





    $scope.removeMajor = function(index) {
        // relative to ca/admin/ca.admin.html
        console.log('in removeMjaor, index is ', index);
        majors.splice(index, 1);
    }




    $scope.createWT = function(majorId, workType) {
        // relative to ca/admin/ca.admin.html

        return $http.post('work-type', {
            majorId: majorId,
            workType: workType
        });
    }


})



function selectElementText(el, win) {
    win = win || window;
    var doc = win.document,
        sel, range;
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
