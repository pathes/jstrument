(function () {
    'use strict';

    angular.module('jstTabs', [])

        .directive('jstTabs', function () {
            return {
                restrict: 'E',
                transclude: true,
                replace: false,
                scope: {},
                templateUrl: '/app/widgets/tabs/tabs.html',
                controller: function ($scope) {
                    var panes = $scope.panes = [];

                    $scope.selectPane = function (selectedPane) {
                        _.forEach(panes, function (pane) {
                            pane.selected = false;
                        });
                        selectedPane.selected = true;
                    };

                    this.addPane = function (pane) {
                        panes.push(pane);
                        if (panes.length === 1) {
                            $scope.selectPane(pane);
                        }
                    };
                }
            };
        })

        .directive('jstPane', function () {
            return {
                require: '^jstTabs',
                restrict: 'E',
                transclude: true,
                scope: {
                    title: '@'
                },
                link: function (scope, element, attrs, jstTabsCtrl) {
                    jstTabsCtrl.addPane(scope);
                },
                templateUrl: '/app/widgets/tabs/pane.html'
            };
        });

})();
