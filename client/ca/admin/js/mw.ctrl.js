// mw : major and workType
angular.module('myApp')
    .controller('mwCtrl', function($scope, $http, MessageApi, $log, $modal) {
        var majors;

        $http.get('majors', {
                mute: true
            })
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
            $modal.open({
                    templateUrl: 'views/delete-major.modal.html',
                    controller: 'delMajorCtrl',
                    backdrop: 'static',
                    backdropClass: "try"
                })
                .result
                .then(function(delAppl) {
                    var url = 'major' + '/' + major._id + (delAppl ? "/" + delAppl : "");
                    $http["delete"](url)
                        .success(function(data) {
                            if (data.success) {
                                MessageApi.success('操作成功');
                            }
                            $scope.rmFromCollection(majors, index);
                        })
                });
        }

        $scope.removeWT = function(major, workType, index) {
            var confirmed = confirm("符合该专业和该工种的所有申请者信息将被删除，是否继续？")
            if(!confirmed) return;
            // the url is relative to ca/admin/ca.admin.html
            // remember it is actually a delete operation
            $http['post']('work-type/delete', {
                    majorId: major._id,
                    workType: workType,
                    delAppl: true
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
    .controller('delMajorCtrl', function($scope, $modalInstance) {
        // default:
        $scope.delAppl = "yes";

        $scope.ok = function() {
            $modalInstance.close($scope.delAppl);
        }
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
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
