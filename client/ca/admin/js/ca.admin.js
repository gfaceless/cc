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
                url: 'views/ca-results.html',

            }, {
                title: '系统帐号管理',
                url: 'views/sys-account.html'
            }
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
app.controller('mwCtrl', function($scope, $http, MessageApi, $log) {
    var majors;

    $http.get('major')
        .success(function(data) {
            majors = $scope.majors = data.majors;
            $scope.hasListed = true;

        })
        .error(function(data) {
            
        })




    $scope.addMajor = function() {
        majors.unshift({
            name: '',
            _isNew: true
        })
        
    };


    $scope.addWT = function(major) {

        major.workTypes.push({
            _isNew: true
        })

    };
    


    $scope.upsertMajor = function(major, cb) {
        // relative to ca/admin/ca.admin.html
        var promise;
        if (!major._id) {
            promise = $http.post('major', {
                major: major
            })
        } else {
            promise = $http.put('major/' + major._id, {
                major: major
            })
        }

        promise.success(function(data) {
                if (data.success) {
                    MessageApi.success('操作成功');
                } else {
                    fail(data);
                }
                cb(null, data);
            })
            .error(function(data, status) {
                fail(data);
                cb('fail', data);
            })
    }


    function fail(data, cb) {
        var msg = '操作失败';
        
        if (data.message) msg += (" " + data.message);
        MessageApi.error(msg);

    }

    $scope.removeMajor = function(major, index) {

        $http
            .post('major' + '/' + major._id, {
                major: major
            })
            .success(function(data) {
                if (data.success) {
                    MessageApi.success('操作成功');
                } else {
                    fail(data);
                }
                $scope.rmFromCollection(majors, index);
            })
            .error(function(data, status) {
                fail(data);

            })
    }

    $scope.removeWT = function(major, workType, index) {
        // relative to ca/admin/ca.admin.html
        
        $http['post']('work-type/' + workType._id, {
                majorId: major._id,
                workType: workType
            })
            .success(function(data) {
                if (data.success) {
                    MessageApi.success('操作成功');
                } else {
                    fail(data);
                }
                $scope.rmFromCollection(major.workTypes, index);
            })
            .error(function(data, status) {
                fail(data);

            })
    }


    // We should definitely make live-create a component
    // doing so many interweaving things is tiresome:
    $scope.rmFromCollection = function(collection, index) {
        collection.splice(index, 1);
    }




    $scope.createWT = function(majorId, workType, cb) {
        // relative to ca/admin/ca.admin.html

        $http.post('work-type', {
                majorId: majorId,
                workType: workType
            })
            .success(function(data) {
            	var err = null;
                if (data.success) {
                    MessageApi.success('操作成功');

                } else {
                    fail(data);
                    // I should have a clearer definition of 500 error and 200 but success: false
                    err = 'fail (success: false)'
                }

                cb(err, data);
                
            })
            .error(function(data, status) {
                fail(data);
                cb('fail', data);
            })
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
