/* angular-load.js / v0.2.0 / (c) 2014 Uri Shaked / MIT Licence */

(function () {
	'use strict';

	angular.module('angularLoad', [])
		.service('angularLoad', ['$document', '$q', '$timeout', '$cacheFactory', function ($document, $q, $timeout, $cacheFactory) {

			/**
			 * Dynamically loads the given script
			 * @param src The url of the script to load dynamically
			 * @returns {*} Promise that will be resolved once the script has been loaded.
			 */
			
			var cache = $cacheFactory('angularLoad');

			this.loadScript = function (src) {

				var deferred = $q.defer();
				var p = cache.get(src);
				
				if(p){
					return p;
				}

				cache.put(src, deferred.promise);

				var script = $document[0].createElement('script');
				script.onload = script.onreadystatechange = function (e) {
					$timeout(function () {
						deferred.resolve(e);
					});
				};
				script.onerror = function (e) {
					$timeout(function () {
						deferred.reject(e);
						// if failed, re-loading is enabled
						cache.remove(src);
					});
				};
				script.src = src;
				$document[0].body.appendChild(script);


				return deferred.promise;
			};

			/**
			 * Dynamically loads the given CSS file
			 * @param href The url of the CSS to load dynamically
			 * @returns {*} Promise that will be resolved once the CSS file has been loaded.
			 */
			this.loadCSS = function (href) {
				var deferred = $q.defer();
				var style = $document[0].createElement('link');
				style.rel = 'stylesheet';
				style.type = 'text/css';
				style.href = href;
				style.onload = style.onreadystatechange = function (e) {
					$timeout(function () {
						deferred.resolve(e);
					});
				};
				style.onerror = function (e) {
					$timeout(function () {
						deferred.reject(e);
					});
				};
				$document[0].head.appendChild(style);
				return deferred.promise;
			};
		}]);
})();