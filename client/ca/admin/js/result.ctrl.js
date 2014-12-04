angular.module('myApp')
    .controller('resultCtrl', function($scope, $http, $log, MessageApi) {
        var lastCriteria;
        $scope.criteria = {};
        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            maxSize: 5
        }

        $scope.$watch("searching", function(val, oldVal) {
            
            if(val){
                MessageApi.progress('查找中..');
            }else {
                // pass 0 to clear progress info right away 
                MessageApi.clear(0);
            }
        });
        $scope.find = function(criteria, page, mute) {

            $http.get('ca-results', {
                    params: makeParams(),
                    mute: mute
                })
                .success(function(data) {
                    
                    $scope.results = data.results;
                    $scope.pagination.total = data.total;
                    lastCriteria = angular.copy(criteria);
                    $scope.searching = false;
                }).error(function(data) {
                    $scope.searching = false;
                });

            $scope.searching = true;

            function makeParams() {
                var ret = angular.extend({}, criteria);
                ret.page = page;
                ret.limit = $scope.pagination.itemsPerPage

                // remove empty props:
                angular.forEach(ret, function(val, key) {
                    // the following senarios:
                    // undefined, null, ''
                    if (!val && val !== 0) {
                        delete this[key]
                    }

                }, ret)
                return ret;

            }
        }
        $scope.remove = function(item, index) {
            var confirmed = confirm('确定要删除么');
            if (!confirmed) return;
            $http["delete"]('ca-results/' + item._id)
                .success(function(data) {

                    if (data.success) {
                        MessageApi.success('删除成功');
                        $scope.results.splice(index, 1);
                    }
                })
        }

        $scope.pageChanged = function() {
            $scope.find(lastCriteria, $scope.pagination.currentPage);
        };

        function init() {
            $http
                .get('majors')
                .success(function(data) {
                    $scope.majors = data.majors;
                });
            $http.get('work-types')
                .success(function(data) {
                    $scope.workTypes = data.workTypes;
                })
            // if first load, we mute the query.
            // (if no result was found, we speak nothing)
            $scope.find($scope.criteria, 1, true);
        }
        init();

    })
