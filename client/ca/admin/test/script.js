(function(angular) {
  'use strict';
  angular.module('ngRouteExample', ['ngRoute', 'ui.bootstrap'])

  .controller('MainController', function($scope, $route, $routeParams, $location) {
    $scope.func = function(path) {
      $location.path(path);
    }
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;



  })

  .controller('BookController', function($scope, $routeParams, hey, delay) {
    console.log('in BookController', 'hey is ', hey, 'delay is ', delay);
    $scope.name = "BookController";
    $scope.params = $routeParams;
  })

  .controller('ChapterController', function($scope, $routeParams) {
    console.log('in ChaperController');
    $scope.name = "ChapterController";
    $scope.params = $routeParams;
  })

  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/Book/:bookId', {
        templateUrl: 'book.html',
        controller: 'BookController',
        resolve: {
          // I will cause a 1 second delay
          delay: function($q, $timeout) {
            var delay = $q.defer();
            $timeout(function() {
              delay.resolve(3);
            }, 1000);
            return delay.promise;
          },
          hey: function() {
            return 1
          }
        }
      })
      .when('/test/:id', {
        template: "<div>test</div>",
        controller: function($scope, $routeParams) {
          console.log('in controller test')
        }
      })
      .when('/Book/:bookId/ch/:chapterId', {
        templateUrl: 'chapter.html',
        controller: 'ChapterController'
      })
      .when('/wang/:article?', {
        templateUrl: 'try-route.html',

        controller: function($scope, $routeParams, $modal, $location) {
          console.log('in wang\'s controller');
          $scope.p = $routeParams
          $scope.open = function() {
            $location.path('/wang/loveit')
          }
          if ($routeParams.article) {
            $modal.open({
              template: "<div>{{article}}</div>",
              controller: function($scope, article) {$scope.article = article;console.log('in modal\'s controller')},
              
              resolve: {
                article: function() {
                  return $routeParams.article
                }
              }
            })
            .result["finally"](function() {
              $location.path('/wang');
            })
          }

        }
      })

    // configure html5 to get links working on jsfiddle
    $locationProvider.hashPrefix('!');
    // $locationProvider.html5Mode(true);
  });
})(window.angular);