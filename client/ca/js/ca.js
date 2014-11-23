var app = angular.module('myApp', [])
    .controller('appCtrl', function($scope, $http) {
        var urlCA = '/ca/credit-apply';

        var templates = [
            {url: 'views/step1.html'},
            {url: 'views/step2.html'},
            {url: 'views/success.html'},
            {url: 'views/failure.html'}
        ];

        var currentTemplate = 0;
        $scope.template = templates[currentTemplate];
        $scope.ca = {cert: {}};
        
        $http.get('major')
        .success(function(data) {
            $scope.workTypes = data.majors;
        })
        .error(function() {

        })

        $scope.submit = function() {
            $http.post(urlCA, $scope.ca)
                .success(function(data) {
                    if(data.success) {
                        $scope.template = templates[2];
                        $scope.report = {
                            idnumber:"654324199104120035",
                            name:  "张志伟" ,
                            worktype:"装备钳工",
                            certnumber: "1449003012300160",
                            applidDate: "2014-11-20",
                            sex: '男',
                            major: "电工电子专业",
                            edu: "大专"
                        }
                    } else {
                        $scope.template = templates[3];
                    }
                })
                .error(function(a, b) {
                    $scope.template = templates[3];
                })
        }

        $scope.start = function() {
            $scope.template = templates[++currentTemplate];
        }

    });
