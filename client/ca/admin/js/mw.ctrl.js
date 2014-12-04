// mw : major and workType
angular.module('myApp')
    .controller('mwCtrl', function($scope, $http, MessageApi, $log) {
        var majors;

        $http.get('majors',{mute: true})
            .success(function(data) {
                majors = $scope.majors = data.majors;
                $scope.hasListed = true;
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
                    }
                    cb(null, data);
                })
                .error(function(data, status) {

                    cb('fail', data);
                })
        }


        $scope.removeMajor = function(major, index) {

            $http
                .post('major' + '/' + major._id, {
                    major: major
                })
                .success(function(data) {
                    if (data.success) {
                        MessageApi.success('操作成功');
                    }
                    $scope.rmFromCollection(majors, index);
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
                    }
                    $scope.rmFromCollection(major.workTypes, index);
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
                    cb(null, data);
                    MessageApi.success('操作成功');
                })
                .error(function(data, status) {

                    //console.log('though status is 200, still here')
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
