angular.module('myApp')
    .controller('resultCtrl', function($scope, $http, $log, MessageApi) {
        var lastCriteria;
        // note: it is ok to remove the following code, angularjs would dynamically create an entire object
        // even ng-model is a named string like "criteria.date"

        /*$scope.criteria = {};*/

        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            maxSize: 5
        }

        $scope.$watch("searching", function(val, oldVal) {

            if (val) {
                MessageApi.progress('查找中..');
            } else {
                // pass 0 to clear progress info right away 
                MessageApi.clear(0);
            }
        });

        /**
         * after field is touched, angular will add the related key to the model object
         * so when we do some query, it would cause some misunderstanding
         * (whether it is a query of items whose field is empty or a query of items that does not have that field)
         * @param  {[type]} criteria [description]
         * @param  {[type]} pagin    should be an object {page: .., limit:..} if not passed, it is an entire export
         *                           most likely to be an excel output
         * @return {[type]}          an object ready to be passed into buildUrl (a private function of $http, I implemented
         *                           it here too)
         */
        function makeParams(criteria, pagin) {
            // we don't want pagination info get into criteria obj, 
            // so copy it
            var ret = angular.extend({}, criteria);

            if (pagin) {
                ret.page = pagin.page || 1;
                ret.limit = pagin.limit || $scope.pagination.itemsPerPage
            }
            // remove empty props:
            angular.forEach(ret, function(val, key) {
                // the following senarios:
                // undefined, null, ''
                if (!val && val !== 0) {
                    delete this[key]
                }
            }, ret)
            // we add some timestamp, here for now
            // consider adding some header to prevent IE from caching ( not cache by default)
            // it is so-called back-end, everything can be un-cached
            ret.ts = +new Date;

            return ret;
        }

        $scope.download = function(e) {

            var urlPart = buildUrl(makeParams(lastCriteria));

            $scope.dlUrl = "ca-results/to-excel" + urlPart;

            // TODO: we should have MessageApi.info()
            MessageApi.success('即将开始下载..');

            function buildUrl(obj) {
                var arr = [];
                var ret;
                angular.forEach(obj, function(val, key) {
                    arr.push(key + '=' + encodeURIComponent(val))
                })
                if (!arr.length) {
                    ret = "";
                } else {
                    ret = "?" + arr.join("&")
                }
                return ret;
            }
        }

        $scope.find = function(criteria, page, mute) {
            // it may desync,
            // so we make a copy of criteria
            criteria = angular.copy(criteria);

            $http.get('ca-results', {
                    params: makeParams(criteria, {
                        page: page
                    }),
                    mute: mute
                })
                .success(function(data) {

                    $scope.results = data.results;
                    $scope.pagination.total = data.total;
                    // criteria is already a copied version, so it's ok to just equal them
                    lastCriteria = criteria;
                    $scope.searching = false;
                }).error(function(data) {
                    $scope.searching = false;
                });

            $scope.searching = true;

        }
        $scope.remove = function(item, index) {


            var selectedIds = getSelectedIds($scope.results)

            var confirmed = confirm('确定要删除这' + selectedIds.length + '项么');
            if (!confirmed) return;

            // just not confident enough, may never run this
            if(!$scope.selectedIds.length) return;

            // copy it for future removal (it could changed during http request)
            var copy = angular.copy(selectedIds);

            // seems DELETE cannot send data with it (except using url)
            $http["post"]('ca-results', {ids: $scope.selectedIds}, {
                    headers: {
                        "X-HTTP-Method-Override": "DELETE"
                    }
                })
                .success(function(data) {

                    if (data.success) {
                        MessageApi.success('删除成功');
                        // forEach will succeed but I doubt if it is cross-browser,
                        // angular is most likely to implement it using native forEach delegation

                        /*angular.forEach($scope.results, function(r, i) {
                            if( ~copy.indexOf(r._id) ){
                                $scope.results.splice(i, 1);
                            }
                        })*/

                        // so I do it like this:
                        // #http://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
                        var i = $scope.results.length;
                        while(i--){
                            if (~copy.indexOf($scope.results[i]._id)){
                                $scope.results.splice(i, 1);
                            }
                        }

                    }
                })
        }

        $scope.pageChanged = function() {
            $scope.find(lastCriteria, $scope.pagination.currentPage);
        };

        $scope.datepicker = {
            formats: ['yyyy-MM-dd'],
            options: {
                startingDay: 1,
                showWeeks: false
            }
        }
        $scope.openDatepicker = function($event, dir) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.datepicker[dir] = $scope.datepicker[dir] || {};
            $scope.datepicker[dir].opened = true;
        }


        $scope.$watch("allSelected", function(newVal, oldVal) {
            if (newVal === oldVal) return;

            angular.forEach($scope.results, function(r) {
                r.selected = newVal;
            })

        });

        $scope.$watch(function() {
            return getSelectedIds($scope.results).length
        }, function(newVal, oldVal) {
            if (newVal === oldVal) return;
            if (newVal === 0) {
                $scope.allSelected = false;
                return;
            }
            if (newVal === $scope.results.length) {
                $scope.allSelected = true;
            }
        })


        function getSelectedIds(items) {
            getSelectedIds._count = (getSelectedIds._count || 0) + 1;
            
            
            var arr = [];
            angular.forEach(items, function(item) {
                if (item.selected) arr.push(item._id);
            })

            // the following is important, mainly for improving perfermance.
            $scope.selectedIds = arr;
            return arr;
        }

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
