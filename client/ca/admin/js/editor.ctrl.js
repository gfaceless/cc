var app = angular.module('myApp')
app.factory("ArticleMgr", function($cacheFactory) {
	var cache = $cacheFactory("articles");
	cache.put("readme", {
		slug: "readme",
		url: '../articles/readme'
	});
	cache.put('help', {
		slug: "help",
		url: "../articles/help"
	})
	cache.put('center', {
		slug: "center",
		url: '../articles/center'
	})
	return cache;
})
app.controller('editorCtrl', function($scope, $http, MessageApi, angularLoad, $timeout, $q, $modal, $sce) {
	// freeze tab upon navigation
	var p1 = angularLoad.loadScript("vendors/tinymce/tinymce.min.js");

	$scope.articles = {};
	
	var slugMap = {
		"readme": 'readme',
		"help": 'help',
		"center": 'center'
	}

	$scope.$on('freeze', function(e, freezed) {
		$scope.freezed = freezed;
	})

	$scope.selectTab = function(id) {

		$scope.$emit('freeze', true);

		startTinymce(id);
		
	}

	// it also destroy the last instance
	// don't want to dive deep into tinymce. for now this is good enough
	function startTinymce(id) {

		var articlePromise = $http.get("articles/" + slugMap[id] + "?ts=" + (+new Date));

		$q.all([p1, articlePromise]).then(function(results) {

			// if returned value is null, this article has not been created
			// we give it created: false flag.
			$scope.articles[id] = results[1].data.article
			if(!results[1].data.article) {
				$scope.articles[id] = {
					_new: true
				}				
			} /*else {
				var order = $scope.articles[id].order;
				if(order) $scope.articles[id].order = $scope.orderArr[order-1]
				console.log($scope.articles[id].order);
			}*/


			var inst = tinymce.get(id);
			inst && inst.destroy();

			tinymce.init({
				selector: "#" + id,
				height: 400,
				theme: "modern",
				content_css: "../../vendors/bootstrap-3.2.0-dist/css/bootstrap.min.css",
				plugins: [
					"advlist autolink lists link image hr",
					"code",
					"table contextmenu",
					"paste textcolor colorpicker"
				],

				toolbar1: "insertfile undo redo paste pastetext | styleselect removeformat | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | code",
				toolbar2: "fontselect fontsizeselect bold italic | forecolor backcolor | table link image hr",

				table_default_styles: {
					// border: '1px solid #ddd'
				},
				contextmenu: "link image inserttable | tableprops cell row column deletetable",
				// image_advtab: true,
				language: 'zh_CN',
				menubar: false,
				statusbar: false,
				fontsize_formats: "8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 18pt 20pt 24pt 36pt",
				setup: function(editor) {
					editor.on('init', function(e) {
						$timeout(function() {
								$scope.$emit('freeze', false);
							})
							// article returned from server is possibly null
						if ($scope.articles[id]) {
							editor.setContent($scope.articles[id].content || "");
						}
					});
				},
				font_formats: '楷体=KaiTi,KaiTi_GB2312;' +
					'宋体=SimSun,FangSong,FangSong_GB2312;' +
					'微软雅黑=Microsoft YaHei;' +
					'黑体=SimHei;' +
					"Arial=arial,helvetica,sans-serif;" +
					"Arial Black=arial black,avant garde;" +
					"Courier New=courier new,courier;" +
					"Georgia=georgia,palatino;" +
					"Helvetica=helvetica;" +
					"Impact=impact,chicago;" +
					"Tahoma=tahoma,arial,helvetica,sans-serif;" +
					"Terminal=terminal,monaco;" +
					"Times New Roman=times new roman,times;" +
					"Trebuchet MS=trebuchet ms,geneva;" +
					"Verdana=verdana,geneva;"

			});


		})

	}

	$scope.submit = function(id) {

		var article = $scope.articles[id];
		article.content = tinymce.get(id).getContent();
		var p;
		if (article._new) {
			article.slug = slugMap[id];
			p = $http.post("articles", article);
		} else {
			p = $http.put("articles/" + slugMap[id], article);
		}
		p.success(function(r) {
			MessageApi.success('保存成功');
			$scope.articles[id] = r.article;
		})
	}

	$scope.preview = function(id) {

		var modalInstance = $modal.open({
			templateUrl: '../views/article.modal.html',
			controller: function($scope, $modalInstance, article) {
				$scope.article = article;

				$scope.ok = function() {
					$modalInstance.close();
				};

				$scope.cancel = function() {
					$modalInstance.dismiss('cancel');
				};
			},
			size: 'lg',
			resolve: {
				article: function() {
					var article = $scope.articles[id];
					var content = tinymce.get(id).getContent();
					article.content = $sce.trustAsHtml(content);
					return article
				}
			}
		});
	}



})
