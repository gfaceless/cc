angular.module("myApp").run(["$templateCache", function($templateCache) {$templateCache.put("templates/live-edit.html","");
$templateCache.put("templates/major.html","<div class=\"{{myClass}}\">\r\n    <input type=\"text\" ng-model=\"myModel.name\" ng-show=\"myModel._isNew\" placeholder={{myPlaceholder||\'输入名称\'}} gf-enter=\"someFn()\" gf-escape=\"cancel()\">\r\n    <div class=\"btn-group\" ng-show=\"myModel._isNew\">\r\n	    <button type=\"button\" class=\"btn btn-primary\" ng-click=\"someFn()\" ng-disabled=\"!myModel.name\">\r\n	      	<span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>\r\n	    </button>\r\n	    <button type=\"button\" class=\"btn btn-primary\"  ng-click=\"cancel()\">\r\n	      	<span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span>\r\n	    </button>\r\n    </div>\r\n\r\n\r\n    <span ng-hide=\"myModel._isNew\" class=\"name\" title=\"{{myModel.name}}\">{{myModel.name}}</span>\r\n\r\n\r\n	<button type=\"button\" ng-click=\"remove()\" ng-show=\"mode==\'simple\'&&!myModel._isNew\" class=\"close btn-remove\">\r\n	    <span>&times</span>\r\n	</button>\r\n\r\n	<div class=\"btn-toolbar\" ng-show=\"mode!=\'simple\'\">\r\n		\r\n	    <div class=\"btn-group\" ng-hide=\"myModel._isNew\">\r\n			<button type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"edit()\">编辑</button>\r\n			<button type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"remove()\">删除</button>\r\n		</div>\r\n		<div class=\"btn-group\"> \r\n	    	<button class=\"btn btn-primary btn-sm\" ng-click=\"addChild(myModel)\" ng-hide=\"myModel._isNew|| !hasChild\">添加工种</button>\r\n    	</div>\r\n	</div>\r\n    \r\n</div>\r\n\r\n<div ng-transclude></div>");
$templateCache.put("views/ca-results.html","<div ng-controller=\"resultCtrl\">\r\n    <div class=\"control-panel\">\r\n        <form class=\"form-inline\" ng-submit=\"find(criteria)\">\r\n            <div class=\"form-group\">\r\n                <label class=\"sr-only\" for=\"crapId\">认证编号</label>\r\n                <input class=\"form-control\" id=\"crapId\" placeholder=\"认证编号\" ng-model=\"criteria._id\">\r\n            </div>\r\n            <div class=\"form-group\">\r\n                <label class=\"sr-only\" for=\"certnumber\">证书号</label>\r\n                <input class=\"form-control\" id=\"certnumber\" placeholder=\"证书号\" ng-model=\"criteria.certnumber\">\r\n            </div>\r\n\r\n            <div class=\"form-group\">\r\n                <label class=\"sr-only\" for=\"idnumber\">身份证号</label>\r\n                <input class=\"form-control\" id=\"idnumber\" placeholder=\"身份证号\" ng-model=\"criteria.idnumber\">\r\n            </div>\r\n            <div class=\"form-group\">\r\n                <label class=\"sr-only\" for=\"name\">姓名</label>\r\n                <input class=\"form-control name\" id=\"name\" placeholder=\"姓名\" ng-model=\"criteria.name\">\r\n            </div>\r\n            <div class=\"form-group\">\r\n                <label class=\"sr-only\" for=\"studNumber\">学号</label>\r\n                <input class=\"form-control\" id=\"studNumber\" placeholder=\"学号\" ng-model=\"criteria.studNumber\">\r\n            </div>\r\n            <div class=\"form-group\">\r\n                <select id=\"major\" class=\"form-control\" ng-model=\"criteria.major\" ng-options=\"major._id as major.name for major in majors\">\r\n                    <option value=\"\">选择专业</option>\r\n                </select>\r\n            </div>\r\n            <div class=\"form-group\">\r\n                <!-- sometimes worktype not using camelCase is due to my poor db design-->\r\n                <select class=\"form-control\" ng-model=\"criteria.worktype\" ng-options=\"workType.name as workType.name for workType in workTypes\">\r\n                    <option value=\"\">选择工种</option>\r\n                </select>\r\n            </div>\r\n\r\n\r\n            <div class=\"form-group\">\r\n                <label class=\"sr-only\">日期</label>\r\n                <div class=\"input-group\">\r\n                    <input type=\"text\" class=\"form-control from\" ng-model=\"criteria.from\" datepicker-popup is-open=\"datepicker.from.opened\" datepicker-options=\"datepicker.options\" placeholder=\"默认2014-12-01\" />\r\n                    <span class=\"input-group-btn\">\r\n                        <a class=\"btn btn-default\" ng-click=\"openDatepicker($event, \'from\')\"><i class=\"glyphicon glyphicon-calendar\"></i>\r\n                        </a>\r\n                    </span>\r\n                </div>\r\n                <span class=\"control-label to\">至</span>\r\n                <div class=\"input-group \">\r\n                    <input type=\"text\" class=\"form-control to\" ng-model=\"criteria.to\" datepicker-popup is-open=\"datepicker.to.opened\" datepicker-options=\"datepicker.options\" placeholder=\"默认今天\" />\r\n                    <span class=\"input-group-btn\">\r\n                        <a class=\"btn btn-default\" ng-click=\"openDatepicker($event, \'to\')\"><i class=\"glyphicon glyphicon-calendar\"></i>\r\n                        </a>\r\n                    </span>\r\n                </div>\r\n            </div>\r\n            \r\n\r\n            <div class=\"form-group\">\r\n                <input type=\"submit\" class=\"btn btn-primary\" value=\"查找\" ng-disabled=\"searching\">\r\n                <a class=\"btn btn-primary\" href=\"\" download ng-click=\"download($event)\" ng-href=\"{{dlUrl}}\">导出</a>\r\n                <button type=\"button\" class=\"btn btn-primary\" ng-disabled=\"!selectedIds.length\" ng-click=\"remove()\">删除</button>\r\n            </div>\r\n\r\n            <div class=\"form-group fuzzy\">\r\n                <label tooltip=\"开启后搜索速度可能较慢，请耐心等待\">\r\n                    <input type=\"checkbox\" ng-model=\"criteria.fuzzy\">模糊搜索\r\n                </label>\r\n\r\n            </div>\r\n\r\n\r\n        </form>\r\n\r\n    </div>\r\n    <div class=\"table-responsive ca-results\">\r\n        <table class=\"table table-bordered table-hover text-center\">\r\n            <thead>\r\n                <tr>\r\n                    <th>\r\n                        <label><input type=\"checkbox\" ng-model=\"allSelected\">全选</label>\r\n                    </th>\r\n                    <th class=\"text-center\">认证编号</th>\r\n                    <th class=\"text-center\">姓名</th>\r\n                    <th class=\"text-center\">身份证号</th>\r\n\r\n                    <th class=\"text-center\">证书号</th>\r\n                    <th class=\"text-center\">工种</th>\r\n                    <th class=\"text-center\">学号</th>\r\n\r\n                    <th class=\"text-center\">可置换专业层次</th>\r\n                    <th class=\"text-center\">申报专业</th>\r\n                    <th class=\"text-center\">申报日期</th>\r\n                    \r\n                </tr>\r\n            </thead>\r\n            <tbody>\r\n                <tr ng-repeat=\"result in results\">\r\n                    <td>\r\n                        <input type=\"checkbox\" ng-model=\"result.selected\">\r\n                    </td>\r\n                    <td>{{result._id}}</td>\r\n                    <td>{{result.name}}</td>\r\n                    <td>{{result.idnumber}}</td>\r\n                    <td>{{result.certnumber}}</td>\r\n                    <td>{{result.worktype}}</td>\r\n                    <td>{{result.studNumber}}</td>\r\n                    <td>{{result.applEduLvl}}</td>\r\n                    <td>{{result.major}}</td>\r\n                    <td>{{result.appliedDate}}</td>\r\n                    \r\n                </tr>\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n    <div class=\"pagin\">\r\n        <pagination total-items=\"pagination.total\" ng-model=\"pagination.currentPage\" items-per-page=\"pagination.itemsPerPage\" class=\"pagination-sm\" boundary-links=\"true\" previous-text=\"&lsaquo;\" next-text=\"&rsaquo;\" first-text=\"&laquo;\" last-text=\"&raquo;\" ng-change=\"pageChanged()\" max-size=\"pagination.maxSize\" num-pages=\"pagination.numPages\">\r\n        </pagination>\r\n\r\n        <span class=\"pager-info label label-primary\">共{{pagination.total}}条目，{{pagination.numPages}}页</span>\r\n    </div>\r\n\r\n\r\n</div>\r\n");
$templateCache.put("views/delete-major.modal.html","<div class=\"modal-body\">\r\n<form>\r\n    <label class=\"radio-inline\">\r\n        <input type=\"radio\" ng-model=\"delAppl\" value=\"yes\"> 删除该专业下所有申请信息\r\n    </label>\r\n    <label class=\"radio-inline\">\r\n        <input type=\"radio\" ng-model=\"delAppl\" value=\"\"> 保留申请信息（将会造成信息混乱，不推荐）\r\n    </label>\r\n    \r\n</form>\r\n</div>\r\n\r\n<div class=\"modal-footer\">\r\n    <button class=\"btn btn-primary\" ng-click=\"ok()\">删除</button>\r\n    <button class=\"btn btn-primary\" ng-click=\"cancel()\">取消</button>\r\n</div>\r\n");
$templateCache.put("views/editor.html","<div ng-controller=\"editorCtrl\">\r\n\r\n    <div tabset>\r\n        <div tab heading=\"学分制换办法\" select=\"selectTab(\'readme\')\">\r\n\r\n            <form ng-submit=\"submit(\'readme\')\">\r\n                <div class=\"form-group\">\r\n                    <label>标题(按钮):</label>\r\n                    <input type=\"text\" ng-model=\"articles.readme.title\">\r\n                </div>\r\n                <div class=\"form-group\">\r\n                    <label>次序</label>\r\n                    <select ng-options=\"o for o in [1,2,3]\" ng-model=\"articles.readme.order\">                   \r\n                        \r\n                    </select>\r\n                </div>\r\n                <textarea name=\"content\" style=\"width:100%;\" id=\"readme\"></textarea>\r\n                <input type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"freezed\" value=\"保存\">\r\n                <button type=\"button\" class=\"btn btn-primary\" ng-click=\"preview(\'readme\')\">预览</button>\r\n            </form>\r\n\r\n        </div>\r\n\r\n        <div tab select=\"selectTab(\'help\')\">\r\n            <tab-heading>我要帮助</tab-heading>\r\n            <form ng-submit=\"submit(\'help\')\">\r\n                <div class=\"form-group\">\r\n                    <label>标题(按钮):</label>\r\n                    <input type=\"text\" ng-model=\"articles.help.title\">\r\n                </div>\r\n                <div class=\"form-group\">\r\n                    <label>次序</label>\r\n                    <select ng-options=\"o for o in [1,2,3]\" ng-model=\"articles.help.order\">\r\n                        \r\n                    </select>\r\n                </div>\r\n                <textarea name=\"content\" style=\"width:100%;\" id=\"help\"></textarea>\r\n                <input type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"freezed\" value=\"保存\">\r\n                <button type=\"button\" class=\"btn btn-primary\" ng-click=\"preview(\'help\')\">预览</button>\r\n            </form>\r\n        </div>\r\n\r\n        <div tab heading=\"学习中心\" select=\"selectTab(\'center\')\">\r\n\r\n            <form ng-submit=\"submit(\'center\')\">\r\n                <div class=\"form-group\">\r\n                    <label>标题(按钮):</label>\r\n                    <input type=\"text\" ng-model=\"articles.center.title\">\r\n                </div>\r\n                <div class=\"form-group\">\r\n                    <select ng-options=\"o for o in [1,2,3]\" ng-model=\"articles.center.order\">\r\n                        \r\n                    </select>\r\n                </div>\r\n                \r\n                <textarea name=\"content\" id=\"center\" style=\"width:100%;\"></textarea>\r\n\r\n                <input type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"freezed\" value=\"保存\">\r\n                <button type=\"button\" class=\"btn btn-primary\" ng-click=\"preview(\'center\')\">预览</button>\r\n\r\n            </form>\r\n\r\n        </div>\r\n    </div>\r\n\r\n\r\n</div>\r\n");
$templateCache.put("views/err-msgs.html","<div ng-message=\"required\">必填</div>\r\n<div ng-message=\"minlength\">太短了</div>\r\n<div ng-message=\"equals\">两次输入不一样</div>");
$templateCache.put("views/login.html","<div class=\"modal-body\">\r\n    <form class=\"form-horizontal\" role=\"form\">\r\n        <div class=\"form-group\">\r\n            <label class=\"col-sm-4 control-label\">用户名</label>\r\n            <div class=\"col-sm-8\">\r\n                <input type=\"text\" ng-model=\"user.name\" class=\"form-control\"  gf-enter=\"ok()\" auto-focus>\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-sm-4 control-label\">密码</label>\r\n            <div class=\"col-sm-8\">\r\n                <input type=\"password\" ng-model=\"user.password\" class=\"form-control\"  gf-enter=\"ok()\">\r\n            </div>\r\n        </div>\r\n	</form>        \r\n        \r\n</div>\r\n\r\n<div class=\"modal-footer\">\r\n    <button class=\"btn btn-primary\" ng-click=\"ok()\" ng-disabled=\"!user\">登录</button>\r\n    <button class=\"btn btn-primary\" ng-click=\"cancel()\">取消</button>\r\n</div>\r\n");
$templateCache.put("views/major-and-work-type.html","<div ng-controller=\"mwCtrl\" ng-cloak>\r\n    <div class=\"control-panel\">\r\n        <button type=\"button\" class=\"btn btn-primary\" ng-click=\"addMajor()\" ng-disabled=\"!hasListed\">添加专业</button>\r\n    </div>\r\n    <div class=\"main-panel\">\r\n        <div class=\"major-container\">\r\n            <div ng-repeat=\"major in majors\">\r\n                <div live-create my-model=\"major\" upsert=\"upsertMajor(major, cb)\" remove-fn=\"removeMajor(major, $index, cb)\" remove-from-dom=\"rmFromCollection(majors, $index)\" add-child=\"addWT(major)\" has-child my-placeholder=\"输入专业名称\" my-class=\"major\">\r\n                    <div class=\"wt-container\">\r\n\r\n                        <div ng-repeat=\"workType in major.workTypes\">\r\n                            <div live-create mode=\"simple\" my-model=\"workType\" upsert=\"createWT(major._id, workType, cb)\" remove-from-dom=\"rmFromCollection(major.workTypes, $index)\" remove-fn=\"removeWT(major, workType, $index)\" my-placeholder=\"输入工种名称\" my-class=\"work-type\"></div>\r\n                        </div>\r\n\r\n                    </div>\r\n                </div>\r\n            </div>\r\n\r\n        </div>\r\n    </div>\r\n</div>\r\n");
$templateCache.put("views/sys-account.html","<div ng-controller=\"userCtrl\">\r\n    <button class=\"btn btn-primary\" ng-click=\"upsert()\">添加子管理员</button>\r\n    <span>子管理员无添加、编辑、删除功能，但可以查看、搜索</span>\r\n    <div class=\"user-panel\">\r\n        <table class=\"table table-bordered table-hover text-center\">\r\n            <thead>\r\n                <tr>\r\n                    <th class=\"text-center\">帐号名</th>\r\n                    <th></th>\r\n                </tr>\r\n            </thead>\r\n            <tbody>\r\n                <tr ng-repeat=\"user in users\">\r\n                    <td>{{user.name}}</td>\r\n                    <td>\r\n                        <button class=\"btn btn-xs\" ng-click=\"upsert(user)\">编辑</button>\r\n                        <button class=\"btn btn-xs\" ng-click=\"remove(user)\">删除</button>\r\n                    </td>\r\n                </tr>\r\n            </tbody>\r\n\r\n        </table>\r\n    </div>\r\n</div>\r\n");
$templateCache.put("views/upsert-user.html","\r\n<div class=\"modal-header\">\r\n    <h2 ng-show=\"!editing\">添加子管理员</h2>\r\n    <h2 ng-show=\"editing\">编辑子管理员</h2>\r\n</div>\r\n<div class=\"modal-body\">\r\n    <form class=\"form-horizontal\" role=\"form\" name=\"userForm\">\r\n        <div class=\"form-group\">\r\n            <label class=\"col-sm-3 control-label\">用户名</label>\r\n            <div class=\"col-sm-6\">\r\n                <input type=\"text\" ng-model=\"user.name\" class=\"form-control\" gf-enter=\"!userForm.$invalid && ok()\" auto-focus required name=\"name\">\r\n            </div>\r\n            <!-- <div class=\"text-danger col-sm-3 form-control-static\" ng-show=\"userForm.name.$invalid && userForm.name.$dirty\">\r\n                {{getError(userForm.name)}}\r\n            </div> -->\r\n            <div class=\"text-danger col-sm-3 form-control-static\" gf-val=\"name\" overwrite-msg=\"{required:\" 真的得必填 \"}\"></div>\r\n            <!-- <div class=\"text-danger col-sm-3 form-control-static\" ng-messages=\"userForm.name.$touched && userForm.name.$error\" ng-messages-include=\"views/err-msgs.html\"></div> -->\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-sm-3 control-label\">密码</label>\r\n            <div class=\"col-sm-6\">\r\n                <input type=\"password\" ng-model=\"user.password\" class=\"form-control\" gf-enter=\"!userForm.$invalid && ok()\" equals=\"{{p2}}\" name=\"password\" required ng-minlength=\"6\">\r\n            </div>\r\n            <div class=\"text-danger col-sm-3 form-control-static\" gf-val=\"password\">\r\n            </div>\r\n            <!-- <div class=\"text-danger col-sm-3 form-control-static\" ng-messages=\"userForm.password.$touched && userForm.password.$error\" ng-messages-include=\"views/err-msgs.html\"></div> -->\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-sm-3 control-label\">确认密码</label>\r\n            <div class=\"col-sm-6\">\r\n                <input type=\"password\" ng-model=\"p2\" class=\"form-control\" gf-enter=\"!userForm.$invalid && ok()\" equals=\"{{user.password}}\" name=\"p2\" required>\r\n            </div>\r\n            <div class=\"text-danger col-sm-3 form-control-static\" gf-val=\"p2\"></div>\r\n            \r\n        </div>\r\n    </form>\r\n\r\n</div>\r\n\r\n<div class=\"modal-footer\">\r\n    <button class=\"btn btn-primary\" ng-click=\"ok()\" ng-disabled=\"userForm.$invalid\">{{editing?\'确认\':\'添加\'}}</button>\r\n    <button class=\"btn btn-primary\" ng-click=\"cancel()\">取消</button>\r\n</div>\r\n");}]);