/* global window: false, document: false, jQuery: false, io: false, console: false */
(function($, io) {

    $(document).ready(function() {
        var socket = io.connect();

        function foo(freq, vol) {
            freq = Math.pow(2, 2 * freq) * 440;
            socket.emit('foo', freq, vol);
        }

        function touch(event) {
            var i;
            event.preventDefault();
            for (i = 0; i < event.touches.length; ++i) {
                foo(
                    event.touches[i].pageX / window.innerWidth,
                    event.touches[i].pageY / window.innerHeight
                );
            }
        }
        function mouse(event) {
            foo(
                event.pageX / window.innerWidth,
                event.pageY / window.innerHeight
            );
        }

        if ('ontouchstart' in document.documentElement) {
            window.addEventListener('touchstart', touch, false);
            window.addEventListener('touchmove', touch, false);
        } else {
            $(window).on('mousedown', mouse);
        }

    });

})(jQuery, io);
