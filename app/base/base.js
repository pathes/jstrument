(function () {
    'use strict';

    angular.module('jstrument', ['jstBasic'])

        .run(function ($rootScope) {
            var socket = io.connect();
            $rootScope.socket = socket;
        });

})();
