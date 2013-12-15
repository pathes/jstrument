(function () {
    "use strict";

    angular.module('jstSlider', [])

        .directive('jstSlider', function () {
            return {
                require: 'ngModel',
                restrict: 'E',
                replace: false,
                scope: {
                    callback: '=',
                    direction: '=',
                    title: '='
                },
                templateUrl: '/app/widgets/slider/slider.html',
                link: function (scope, element, attrs, ngModel) {

                    var $bar = element.find('.bar'),
                        $window = $(window),
                        el = $(element)[0];
                    scope.down = false;

                    function resizeSlider() {
                        scope.position = element.position();
                        scope.width = element.width();
                        scope.height = element.height();
                    }
                    resizeSlider();

                    function changeValue(event) {
                        var parentOffset = $bar.parent().offset(),
                            x = event.pageX - parentOffset.left,
                            y = event.pageY - parentOffset.top;
                        switch (attrs.direction) {
                            case 'top':
                                scope.frac = (scope.height - y) / scope.height;
                                break;
                            case 'left':
                                scope.frac = (scope.width - x) / scope.width;
                                break;
                            case 'bottom':
                                scope.frac = y / scope.height;
                                break;
                            case 'right':
                                scope.frac = x / scope.width;
                                break;
                            default:
                                console.error('jstSlider: unknown direction: "' + scope.direction + '"');
                        }
                        if (scope.frac < 0) {
                            scope.frac = 0;
                        }
                        if (scope.frac > 1) {
                            scope.frac = 1;
                        }
                        scope.value = parseFloat(attrs.min) + (parseFloat(attrs.max) - parseFloat(attrs.min)) * scope.frac;
                        ngModel.$setViewValue(scope.value);
                        scope.callback();
                        switch (attrs.direction) {
                            case 'top':
                            case 'bottom':
                                $bar.css({
                                    height: (scope.frac * 100) + '%'
                                });
                                break;
                            case 'left':
                            case 'right':
                                $bar.css({
                                    width: (scope.frac * 100) + '%'
                                });
                                break;
                        }
                    }

                    if (Modernizr.touch) {
                        el.addEventListener('touchstart', function (event) {
                            event.preventDefault();
                            scope.down = true;
                            changeValue(event.changedTouches[0]);
                        }, false);
                        el.addEventListener('touchmove', function (event) {
                            if (!scope.down) {
                                return;
                            }
                            event.preventDefault();
                            changeValue(event.changedTouches[0]);
                        }, false);
                        el.addEventListener('touchend', function () {
                            event.preventDefault();
                            scope.down = false;
                        }, false);
                    } else {
                        element.mousedown(function (event) {
                            scope.down = true;
                            changeValue(event);
                        });
                        $window.mousemove(function (event) {
                            if (!scope.down) {
                                return;
                            }
                            changeValue(event);
                        }).mouseup(function () {
                            scope.down = false;
                        });
                    }
                    $window.resize(function () {
                        resizeSlider();
                    });
                }
            };
        });

})();
