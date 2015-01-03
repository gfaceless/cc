var app = angular.module('myApp', ['message', 'ui.bootstrap', 'ngSanitize', 'gfForm'])
    .factory("ArticleMgr", function($cacheFactory) {
        var cache = $cacheFactory("articles");
        cache.put("readme", {
            slug: "readme"
        });
        cache.put('help', {
            slug: "help"
        })
        cache.put('center', {
            slug: "center"
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
        $http.get("articles-meta")
            .success(function(data) {
                $scope.articlesMetaData = data.results;
            })

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
            
            // form creates a new scope
            // here 'this' is the new scope, its $parent is $scope
            // I can remove this logic if I put some stopPropagation in my custom form directive            
            if(this.caForm.$invalid){
                return;
            }

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

        $scope.back = function() {
            $scope.step = 1;
            $scope.template = templates[0];
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
                } else if (error.studNumber) {
                    return "学号无效";
                }
            }
        }

        $scope.open = function(id) {
            var article = ArticleMgr.get(id);

            var modalInstance = $modal.open({
                templateUrl: 'views/article.modal.html',
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


    })
    .controller('ModalInstanceCtrl', function($scope, $modalInstance, $http, $sce, article) {

        $http.get('articles/' + article.slug + '?ts=' + (+new Date))
            .success(function(data) {
                $scope.article = data.article;
                if(data.article && data.article.content) {
                    $scope.article.content = $sce.trustAsHtml(data.article.content);
                }
            })
        $scope.ok = function() {
            $modalInstance.close('has read');
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    })
// for validation
.directive('studNumber', function(FormError) {
    FormError.put("studNumber", "学号无效", 1);
    return {
        require: "ngModel",
        link: function(scope, el, attrs, ctrl) {
            
            
            ctrl.$parsers.push(function(value) {
                
                var re = /^20\d{2}\d{3}[1-3]\d{7}$/;
                if (ctrl.$isEmpty(value) || re.test(value)) {
                    ctrl.$setValidity('studNumber', true);
                    return value;
                }
                ctrl.$setValidity('studNumber', false);
                return undefined;

            })
        }
    }
})

