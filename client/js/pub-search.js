if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/ ) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

var map = {
    "身份证号": 'idnumber',
    "考生姓名": "name",
    "申报工种": "worktype",
    "鉴定级别": "certlevel",
    "证书号": "certnumber",
    "出生日期": "birth",
    "性别": "sex",
    "文化程度": "edu",
    "理论成绩": 'tscore',
    "实操成绩": 'pscore',
    "评定成绩": 'record',
    "颁证日期": "certdate",
    "有效至": "expire",
    "单位名称": "danwei",
    "鉴定机构": "certfacility",
    "证书类别": "certcat",
};
var dbKeys = _.values(map);
var chineseKeys = _.keys(map);

var app = angular.module('myApp', ['ui.bootstrap', "customFilters"])
    .controller('appCtrl', function($scope, $http, $location) {
        var url = 'certs/p';

        var qsMap = {
            'KSXM': 'name',
            'SFZH': 'idnumber'
        }

        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 1
        }
        var dbMap = {
            'idnumber': "身份证号",
            "name": "考生姓名",
            "worktype": "申报工种",
            "certlevel": "鉴定级别",
            "certnumber": "证书号",
            "birth": "出生日期",
            "sex": "性别",
            "edu": "文化程度",
            'tscore': "理论成绩",
            'pscore': "实操成绩",
            'record': "评定成绩",
            "certdate": "颁证日期",
            "expire": "有效至",
            "danwei": "单位名称",
            "certfacility": "鉴定机构",
            "certcat": "证书类别",
        }

        $scope.dbKeys = ['idnumber', 'name', 'sex', 'certnumber', 'worktype', 'certlevel', 'record', 'certdate'];

        $scope.toChineseKey = function (key) {
        	return dbMap[key] || key;
        }
        var qs = (function(a) {
            if (a == "") return {};
            var b = {};
            for (var i = 0; i < a.length; ++i) {
                var p = a[i].split('=');
                if (p.length != 2) continue;
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
            return b;
        })(window.location.search.substr(1).split('&'));


        var params = {
            cert: {}
        };
        angular.forEach(qs, function(v, k) {
            if (qsMap[k]) params.cert[qsMap[k]] = v;
        })


        $http.get(url, {
            params: params
        })
            .success(function(data, status) {
                if (!data.success) return handleError(data, status);
                $scope.certs = data.results;
                $scope.pagination.total = data.total;
                $scope.isQueried = true;                
            })
            .error(function(data) {                
                $scope.isQueried = true;
            })


        function handleError(data, status) {
            $scope.isQueried = true;
        }



        $scope.isVisible = function(k) {
            return _.contains(dbKeys, k)
        }
    })
    .filter("map", function() {
        return function(data) {
            var index = _.indexOf(dbKeys, data)
            if (index > -1 && chineseKeys[index]) return chineseKeys[index];
            return data;
        }
    })
