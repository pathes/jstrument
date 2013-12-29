(function () {
    'use strict';

    angular.module('jstBasic', ['jstSlider', 'jstTabs'])

        .directive('jstBasic', function ($rootScope) {
            return {
                restrict: 'E',
                replace: false,
                scope: {},
                templateUrl: '/app/synths/basic/basic.html',
                link: function (scope) {
                    scope.freq = 440;
                    scope.vol = 0;
                    scope.callback = function callback() {
                        $rootScope.socket.emit('oscOn', 1, scope.freq, scope.vol);
                    };
                }
            };
        });

})();
