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
                    scope.synthParams = {
                        freq: 440,
                        vol: 0,
                    };
                    scope.callback = function callback() {
                        $rootScope.socket.emit('oscOn', 1, scope.synthParams.freq, scope.synthParams.vol);
                    };
                }
            };
        });

})();
