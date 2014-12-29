var app = angular.module('myApp', ['message', 'ui.bootstrap', 'ngSanitize'])
    .factory("ArticleMgr", function($cacheFactory) {
        var cache = $cacheFactory("articles");
        cache.put("readme", {
            slug: "readme",
            title: "学分置换范围及置换办法"
        });
        cache.put('help', {
            slug: "help"
        })

        return cache;
    })
    .controller('appCtrl', function($scope, $http, $modal, $log, $window, $timeout, ArticleMgr, $sce) {
        var urlCA = '/ca/credit-apply';

        var templates = [{
            url: 'views/step1.html'
        }, {
            url: 'views/step2.html'
        }, {
            url: 'views/success.html'
        }, {
            url: 'views/failure.html'
        }];

        var currentTemplate = 0;
        $scope.template = templates[currentTemplate];
        $scope.ca = {};
        $scope.step = 1;
        // tmp:
        test = $window.test = function() {
            $timeout(function() {
                $scope.ca = {
                    cert: {
                        name: "张志伟",
                        idnumber: "654324199104120035",
                        certnumber: "1449003012300160"
                    }
                };
            })
        }


        $http
            .get('major')
            .success(function(data) {
                $scope.majors = data.majors;
            });

        $scope.$watch("updating", function(val, oldVal) {
            if (val === true) {
                $scope.hasApplied = false;
            }
        })

        $scope.submit = function() {
            var data = angular.extend({}, $scope.ca, {
                updating: $scope.updating
            })
            $http.post(urlCA, data)
                .success(function(data) {

                    if (data.success) {
                        $scope.template = templates[2];
                    } else {
                        $scope.template = templates[3];
                    }
                    $scope.step = 3;
                    angular.extend($scope, data);
                })
                .error(function(data) {
                    $scope.template = templates[3];
                    // network failure
                    $scope.reason = 0
                })
        }

        $scope.restart = $scope.start = function(updating) {
            // updating only happens when an already-applied student wants to change his choice of major
            $scope.updating = updating;

            $scope.template = templates[1];
            $scope.step = 2;
        }

        $scope.getError = function(error) {

            if (angular.isDefined(error)) {
                if (error.required) {
                    return "必填";
                } else if (error.email) {
                    return "Please enter a valid email address";
                }
            }
        }

        $scope.open = function(id) {
            var article = ArticleMgr.get(id);            

            var modalInstance = $modal.open({
                templateUrl: 'views/modal-readme.html',
                controller: 'ModalInstanceCtrl',
                size: article.size || "lg",
                resolve: {
                    article: function() {
                        return article
                    }
                }
            });

            modalInstance.result.then(function(param) {
                $log.info(param);
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        $scope.alert = function(msg) {
            alert(msg);
        }

        $scope.print = function() {
            $window.print();
        }

        // temp:
        function getCenters(arguments) {
            $http.get('articles/center' + '?ts=' + (+new Date))
                .success(function(data) {
                    $scope.ttContent = $sce.trustAsHtml(data.article.content);
                })
        }
        getCenters();
    })
    .controller('ModalInstanceCtrl', function($scope, $modalInstance, $http, $sce, article) {

        $http.get('articles/' + article.slug + '?ts=' + (+new Date))
            .success(function(data) {
                $scope.article = data.article;

                var content = data.article && data.article.content;

                $scope.content = $sce.trustAsHtml(content);
            })
        $scope.ok = function() {
            $modalInstance.close('has read');
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });
