var app = angular.module('myApp', ['message', 'ui.bootstrap', 'ngSanitize', 'gfForm', 'ngRoute'/*, 'ngAnimate'*/])
	.config(['$routeProvider', '$locationProvider',
		function($routeProvider, $locationProvider) {
			var routeStep1 = {
				templateUrl: 'views/step1.html',
				controller: 'Step1Ctrl',
				reloadOnSearch: false
			}


			$routeProvider
			// .when('/', routeStep1)
				.when('/step1', routeStep1)
				.when('/step2', {
					templateUrl: 'views/step2.html',
					controller: 'Step2Ctrl'
				})
				.when('/step3', {
					templateUrl: 'views/step3.html',
					controller: 'Step3Ctrl'
				})

				.otherwise(routeStep1)

		}
	])
	.factory("CrapService", function() {
		var _step;
		return {
			step: function(step) {
				// setter + getter
				if (!step) return _step;
				_step = step;
				return this;
			},
			rechoose: function() {
				this.crapInfo.updating = true;
			}
		}
	})
	.controller('appCtrl', function($scope, $http, $modal, $log, $window, $timeout, CrapService, $animate) {



		$scope.$watch(function() {
			return CrapService.step();
		}, function(newVal, oldVal) {
			if(newVal === oldVal) return;
			// step could be undefined, which is expected
			$scope.step = newVal || 1;
		})


		return;

		$scope.$watch("updating", function(val, oldVal) {
			if (val === true) {
				$scope.hasApplied = false;
			}
		})

	})
	.controller('Step1Ctrl', function($scope, $http, $location, $routeParams, $modal, CrapService, $timeout, $route) {
		CrapService.step(1);
		init();
		$scope.$on('$routeUpdate', function() {
			init();
		})

		function init(arguments) {
			renderArticle($location.hash())
		}

		function renderArticle(slug) {
			if (!slug) return;

			$http.get('articles/' + slug + '?ts=' + (+new Date))
				.success(function(data) {
					var article = data.article;

					$modal.open({
						templateUrl: 'views/article.modal.html',
						controller: 'ModalInstanceCtrl',
						size: article.size || "lg",
						resolve: {
							article: function() {
								return article
							}
						}
					})

				})

		}


		$http.get("articles-meta")
			.success(function(data) {
				$scope.articlesMetaData = data.results;
			})
		$scope.open = function(slug) {
			$location.path('/step1')
			.hash(slug);
		}
		$scope.start = function() {
			$location.path('/step2');
		}

	})
	.controller('ModalInstanceCtrl', function($scope, $modalInstance, article, $sce, $location) {
		if (article && article.content) {
			article.content = $sce.trustAsHtml(article.content);
		}
		$scope.article = article;

		$modalInstance.result.then(onClose, onClose)

		// maybe there is memory leak.
		var deregistration = $scope.$on('$locationChangeStart', function() {

			$scope.$close();
		})

		function onClose(reason) {

			// if no reason is supplied, it is a navigation (locationChangeStart) trigger, we do nothing
			if (reason) {
				// if reason is provided, the close is mannually triggered, we first deregistrate $locationChangeStart
				// and then navigate, to avoid double modal-close (modal itself cannot handle multiple close)
				// it would be cleanner if I forked angular-bootstrap-modal making it idempotent
				// (I could have also wrapped $close in try/catch)
				deregistration();
				$location.hash('');
			}
		}

	})
	.controller('Step2Ctrl', function($rootScope, $scope, $http, $location, CrapService, $window, $timeout) {

		CrapService.step(2);
		$scope.ca = CrapService.crapInfo || {};


		$http
			.get('major')
			.success(function(data) {
				$scope.majors = data.majors;
			});

		$scope.submit = function() {
			// form creates a new scope
			// here 'this' is the new scope, its $parent is $scope
			// I can remove this logic if I put some stopPropagation in my custom form directive
			if (this.caForm.$invalid) {
				return;
			}


			// disable button to prevent double submit
			// consider making it a directive
			$scope.submitting = true;

			// for later use by other controller
			CrapService.crapInfo = $scope.ca;

			$http.post('/ca/credit-apply', $scope.ca)
				.success(function(data) {
					// step3 can know if we've attemped submitting or not by checking crapResult
					// it can also know if succeed or not
					$rootScope.crapResult = data;
				})
				.error(function(data) {
					// TODO: try to make it more iso
					$rootScope.crapResult = {
						success: false,
						reason: 0
					};
				})['finally'](function() {
					$location.path('/step3')
					$scope.submitting = false;
				})

		}

		$scope.back = function() {
			CrapService.crapInfo = $scope.ca;
			$location.path('/step1');
		}

		// tmp:
		test = $window.test = function() {
			$timeout(function() {
				$scope.ca = {
					cert: {
						name: "张志伟",
						idnumber: "654324199104120035",
						certnumber: "1449003012300160"
					},
					studNumber: "201299919911111"
				};
			})
		}
	})
	.controller('Step3Ctrl', function($scope, $rootScope, $location, CrapService, $window) {

		CrapService.step(3);
		if (!$rootScope.crapResult) {
			// maybe we should also override history
			// $location.replace();
			$scope.redirect = function() {
				$location.path('/step1')
			}

		}
		// I didn't use service to handle ctrl communication
		// instead I used $rootScope
		angular.extend($scope, $rootScope.crapResult);
		// yes, there is a word 'reapply', you should not use 'reApply'
		$scope.reapply = function() {
			$location.path('/step2');
		}
		$scope.print = function() {
			$window.print();
		}
		$scope.rechooseMajor = function() {
			//
			CrapService.rechoose();
			$location.path('/step2');
		}

	})



.directive('countdown', function($timeout) {
		return {
			// TODO: find adding class BCP
			template: '<span ng-bind="count"></span>',
			scope: {
				countEnd: "&"
			},
			link: function(scope, el, attrs) {

				scope.count = +attrs['countdown'];
				if (isNaN(scope.count)) throw new Error('countdown should be a number or string that can be transformed into a number')
				countdown();

				function countdown(arguments) {
					$timeout(function() {
						scope.count--;
						if (scope.count) {
							countdown();
						} else {
							scope.countEnd && scope.countEnd();
						}
					}, 1000)
				}
			}
		}
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
	})/*
	.animation('.current-step', function() {
	  return {
	    enter: function(element, done) {
	    	console.log('in js animation enter');
	      //run the animation here and call done when the animation is complete
	      return function(cancelled) {
	        //this (optional) function will be called when the animation
	        //completes or when the animation is cancelled (the cancelled
	        //flag will be set to true if cancelled).
	      };
	    },
	    leave: function(element, done) {console.log('in js animation leave'); },
	    move: function(element, done) {console.log('in js animation move'); },

	    //animation that can be triggered before the class is added
	    // beforeAddClass: function(element, className, done) {console.log('in js animation beforeAddClass'); },

	    //animation that can be triggered after the class is added
	    addClass: function(element, className, done) {console.log('in js animation addClass'); done();},

	    //animation that can be triggered before the class is removed
	    beforeRemoveClass: function(element, className, done) {console.log('in js animation beforeRemoveClass'); done();},

	    //animation that can be triggered after the class is removed
	    removeClass: function(element, className, done) {console.log('in js animation removeClass'); done(); }
	  };
	});*/