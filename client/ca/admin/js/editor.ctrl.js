var app = angular.module('myApp')
app.factory("ArticleMgr", function($cacheFactory) {
	var cache = $cacheFactory("articles");
	cache.put("readme", {
		slug: "readme",
		title: "学分置换范围及置换办法"
	});
	cache.put('help', {
		slug: "help"
	})
	cache.put('center', {
		slug: "center"
	})
	return cache;
})
app.controller('editorCtrl', function($scope, $http, MessageApi, angularLoad, $timeout, $q, $modal, ArticleMgr, $sce) {
	// freeze tab upon navigation
	var p1 = angularLoad.loadScript("vendors/tinymce/tinymce.min.js");
	var article;
	$scope.$on('freeze', function(e, freezed) {
		$scope.freezed = freezed;
	})

	$scope.selectTab = function(id) {
		article = null;
		$scope.$emit('freeze', true);
		startTinymce(id);
	}

	var urlMap = {
		"readme": '../articles/readme',
		"help": '../articles/help',
		"center": '../articles/center'
	}

	function startTinymce(id) {
		var articlePromise = $http.get(urlMap[id] + "?ts=" + (+new Date));

		$q.all([p1, articlePromise]).then(function(results) {

			article = results[1].data.article;
			// makeshift
			// I'll see to router and ngView		    

			var inst = tinymce.get(id);
			inst && inst.destroy();

			// temp:
			var height;
			if(id=="center"){height=300}

			tinymce.init({
				selector: "#" + id,
				height: height||500,
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
				image_advtab: true,
				language: 'zh_CN',
				menubar: false,
				statusbar: false,
				fontsize_formats: "8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 18pt 20pt 24pt 36pt",
				setup: function(editor) {
					editor.on('init', function(e) {
						$timeout(function() {
							$scope.$emit('freeze', false);
						})

						if (article) {
							editor.setContent(article.content);
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





	// this function only exec after article

	$scope.submit = function(id) {
		var content = tinymce.get(id).getContent();
		var art = ArticleMgr.get(id);
		var p;
		if (!article) {
			p = $http.post('articles', {
				content: content,
				slug: art.slug
			})
		} else {
			// if article is truthy, it is surely an object
			p = $http.put('articles/' + article.slug, {
				content: content
			})
		}

		p.success(function(r) {
			MessageApi.success('保存成功');
			article = r.article;
		})
	}

	$scope.preview = function(id) {
		var content = tinymce.get(id).getContent();
		var art = ArticleMgr.get(id);

		var modalInstance = $modal.open({
			templateUrl: art.templateUrl || '../views/modal-readme.html',
			controller: function($scope, content, $modalInstance, $sce, art) {
				$scope.article = art;

				$scope.content = $sce.trustAsHtml(content);
				$scope.ok = function() {
					$modalInstance.close();
				};

				$scope.cancel = function() {
					$modalInstance.dismiss('cancel');
				};
			},
			size: 'lg',
			resolve: {
				content: function() {
					return content;
				},
				art: function() {
					return art
				}
			}
		});
	}

	$scope.tmpPreview = function(id, e) {
		
		var content = tinymce.get(id).getContent();

		$scope.ttContent = $sce.trustAsHtml(content)
		

	}

})
