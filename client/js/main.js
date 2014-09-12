var app = angular.module('myApp', ['ui.bootstrap', 'angularFileUpload', "customFilters", 'taiPlaceholder', 'message'])
    .config(function($httpProvider, datepickerPopupConfig) {
        // see #http://stackoverflow.com/questions/16098430/angular-ie-caching-issue-for-http
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';


        angular.extend(datepickerPopupConfig, {
            currentText: '今天',
            clearText: '清除',
            closeText: '关闭'
        })
    })
    /*.config(function($httpProvider) {

        $httpProvider.interceptors.push(function(indicator) {
            return {
                request: function(config) {
                    return config;
                },
                response: function(response) {                    
                    return response;
                }
            }
        });
    })*/
    .controller('appCtrl', function($scope, $modal, $http, $log, $timeout, $q, $upload, $filter, MessageApi) {



        var url = 'certs';
        var EXPORT_URL = 'certs/export';
        var UPLOAD_URL = 'certs/upload';
        var DOWNLOAD_URL = 'certs/download';
        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            maxSize: 5
        }


        $scope.criteria = {};
        var lastCriteria;
        var lastScope;


        $scope.find = function(criteria, page, limit) {

            criteria = criteria || {};
            $http.get(url, {
                params: calcParams(criteria, page, limit)
            })
                .success(function(data, status) {
                    if (!data.success) return handleFailure(data, status);

                    $scope.certs = data.results;
                    $scope.pagination.total = data.total;

                    lastCriteria = criteria;
                    // reset currentPage:
                    $scope.pagination.currentPage = page;
                    $scope.exportUrl = EXPORT_URL + '?cert=' + angular.toJson(lastCriteria);
                })
                .error(handleFailure);

            function calcParams(criteria, page, limit) {
                var o = {
                    page: page || 1
                };

                for (var k in criteria) {
                    if (criteria[k] === "") delete criteria[k];
                }
                return angular.extend({
                    cert: criteria
                }, o);

            }
        };

        $scope.exports = function(e) {
            if ($scope.pagination.total > 60000) {
                e.preventDefault();
                alert('数量超过60000，无法导出低版本excel')
            }

        };

        $scope.pageChanged = function() {
            $scope.find(lastCriteria, $scope.pagination.currentPage);
        };

        /**
         * makeshift , I don't really understand the underlying system
         * see #http://stackoverflow.com/questions/15079779/how-to-clear-a-file-input-from-angular-js
         */
        $scope.resetInputFile = function(e) {
            angular.element(e.srcElement).val(null);
        };

        $scope.onFileSelect = function($files) {
            //$files: an array of files selected, each file has name, size, and type.

            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: UPLOAD_URL, //upload.php script, node.js route, or servlet url
                    //method: 'POST' or 'PUT',
                    //headers: {'header-key': 'header-value'},
                    //withCredentials: true,

                    file: file, // or list of files ($files) for html5 only
                    //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
                    // customize file formData name ('Content-Desposition'), server side file variable name. 
                    //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file' 
                    // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
                    //formDataAppender: function(formData, key, val){}
                })

                .success(function(data, status, headers, config) {
                    $scope.find(lastCriteria);
                    showInfo();

                    $modal.open({
                        templateUrl: 'view/info.html',
                        backdrop: 'static',
                        controller: 'infoCtrl',
                        resolve: {
                            data: function() {
                                return data
                            },
                            DOWNLOAD_URL: function() {
                                return DOWNLOAD_URL
                            }
                        }
                    });

                })
                    .error(handleFailure)

                MessageApi.progress("上传处理中...");

                //.then(success, error, progress); 
                // access or attach event listeners to the underlying XMLHttpRequest.
                //.xhr(function(xhr){xhr.upload.addEventListener(...)})
            }
            /* alternative way of uploading, send the file binary with the file's content-type.
               Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
               It could also be used to monitor the progress of a normal http post/put request with large data*/
            // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
        };


        $scope.remove = function(cert) {
            if (!confirm('确定要删除么')) return;
            //using $http.delete() throws a parse error in IE8
            $http['delete'](url + '/' + cert._id)
                .success(function(data, status) {
                    if (!data.success) return handleFailure(data, status);

                    $scope.certs.splice($scope.certs.indexOf(cert), 1);
                    showInfo();

                }).error(handleFailure)
        };

        $scope.open = function(cert) {
            var copy, index;
            if (cert) {
                copy = angular.copy(cert);
                index = $scope.certs.indexOf(cert);
            }


            var modalInstance = $modal.open({
                templateUrl: 'view/editorView.html',
                controller: 'editCtrl',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    cert: function() {
                        return copy;
                    }
                    /*,
                    cert2: function($q) {
                        var d = $q.defer();
                        $timeout(function() {d.resolve('hey')}, 1000)
                        return d.promise;
                    }*/
                }
            });

            modalInstance.result.then(function(newCert) {
                if (cert) {
                    $scope.certs[index] = newCert;
                } else {
                    $scope.certs.push(newCert);
                }
                showInfo();

            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openModalSearch = function() {
            var modalInstance = $modal.open({
                templateUrl: 'view/advancedSearchView.html',
                controller: 'searchCtrl',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    lastScope: function() {
                        return lastScope
                    }
                }
            });
            modalInstance.result.then(function(scope) {
                
                $scope.find(scope.criteria);
                lastScope = scope;
            }, function() {

            })


        }

        $scope.openLogin = function() {
            var modalInstance = $modal.open({
                templateUrl: 'view/login.html',
                controller: 'loginCtrl',
                size: 'sm',

                resolve: {

                }
            });
            modalInstance.result.then(function(isLogged) {
                $scope.isLogged = isLogged;
                showInfo('登录成功');
            }, function() {

            })
        }

        $scope.logout = function() {
            $http.post('admin9/logout')
                .success(function(data) {
                    if (data.success) {
                        $scope.isLogged = false;
                        showInfo('成功退出');
                    }
                })
        }

        $scope.$watch('isLogged', function(val) {
            if (val) $scope.find({});
        });
        checkLogged();

        function checkLogged() {
            $http.post('admin9/isLogged')
                .success(function(data) {
                    if (data.isLogged) $scope.isLogged = true;
                })
        }

        function showInfo(msg, time) {
            MessageApi.success(msg);
        }

        function handleFailure(msg) {
            MessageApi.error(msg);
        }

    });







app.directive('rangeToggler', function($compile) {

    function createUniqName() {
        createUniqName.counter = createUniqName.counter || 0;
        return 'm' + createUniqName.counter++;
    }

    return {
        scope: {
            modelName: "="
        },
        template: '<div class="col-sm-1"><input class="form-control" ng-model="modelName" ng-disabled="checked"></div>' +
            '<div class="col-sm-2 checkbox"><label><input type="checkbox" ng-model="checked">指定范围</label><div>',
        compile: function(tElement, tAttr) {

            return function(scope, element, attr, ctrl, transcludeFn) {
                element.addClass('input-indent');


                var clone1 = element.children().eq(0).clone();
                var clone2 = clone1.clone();

                var arrModel, singleModel;

                modelNames = [createUniqName(), createUniqName()];

                clone1.find('input').attr('ng-model', modelNames[0]).attr('ng-disabled', '!checked')
                clone2.find('input').attr('ng-model', modelNames[1]).attr('ng-disabled', '!checked')

                element.append($compile(clone1)(scope));
                element.append($compile(clone2)(scope));

                scope.$watch('checked', function(newValue, oldValue) {

                    if (newValue === oldValue) return;

                    if (newValue) {
                        singleModel = scope.modelName;
                        scope.modelName = arrModel || [];
                    } else {
                        arrModel = scope.modelName;
                        scope.modelName = singleModel;
                    }


                })

                angular.forEach(modelNames, function(name, i) {

                    scope.$watch(name, function(newValue, oldValue) {
                        if (angular.isUndefined(scope.modelName)) return;

                        // maybe init: 
                        if (newValue === oldValue) return;
                        if (!angular.isArray(scope.modelName)) return; // we ensured it would be an array in `checked` watch
                        scope.modelName[i] = newValue;

                        // force update:
                        scope.modelName = scope.modelName.concat();

                    })
                })


            }
        }
    }
})
