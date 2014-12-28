var app = angular.module('myApp')

app.controller('editorCtrl', function($scope, $http, MessageApi, angularLoad, $timeout, $q, $modal) {

    // Script loaded succesfully.
    // We can now start using the functions from someplugin.js
    var p1 = angularLoad.loadScript("vendors/tinymce/tinymce.min.js");
    var p2 = $http.get('../articles/readme');
    var article;

    p2.then(function(r) {
            article = $scope.article = r.data.article;
        })
        ['finally'](function() {
            
            $scope.requested = true;
        })

    $q.all([p1, p2]).then(function(results) {
        

        // article is possibly already set (e.g. by promise2's `then`)
        article = article || results[1].data.article;
        // makeshift
        // I'll see to router and ngView
        var inst = tinymce.get('oops');
        inst && inst.destroy();

        tinymce.init({
            selector: "#oops",
            height: "500px",
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

                if (!article) return;

                editor.on('init', function(e) {
                    editor.setContent(article.content)
                });
            },
            font_formats: 
                '楷体=KaiTi,KaiTi_GB2312;' +
                '宋体=SimSun,FangSong,FangSong_GB2312;' +
                '微软雅黑=Microsoft YaHei;' +
                '黑体=SimHei;'+
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

    // this function only exec after article

    $scope.submit = function() {
        var content = tinymce.get('oops').getContent();
        var p;
        if (!article) {
            p = $http.post('articles', {
                content: content,
                slug: "readme"
            })
        } else {
            // if article is truthy, it is surely an object
            p = $http.put('articles/' + article.slug, {
                content: content
            })
        }

        p.success(function(r) {
            MessageApi.success('保存成功');
            article = $scope.article = r.article;
        })
    }

    $scope.preview = function() {
        var content = tinymce.get('oops').getContent();


        var modalInstance = $modal.open({
            templateUrl: '../views/modal-readme.html',
            controller: function($scope, content, $modalInstance, $sce) {
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
                }
            }
        });


    }

})
