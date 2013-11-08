/* global window: false, document: false, jQuery: false, io: false, console: false */
(function($, io) {

    $(document).ready(function() {
        var socket = io.connect();
        var mouseDown = false;

        function oscOn(id, freq, vol) {
            freq = Math.pow(2, 2 * freq) * 440;
            socket.emit('oscOn', id, freq, vol);
        }
        function oscOff(id) {
            socket.emit('oscOff', id);
        }

        function touchstart(event) {
            var i;
            event.preventDefault();
            for (i = 0; i < event.changedTouches.length; ++i) {
                oscOn(
                    event.changedTouches[i].identifier,
                    event.changedTouches[i].pageX / window.innerWidth,
                    event.changedTouches[i].pageY / window.innerHeight
                );
            }
        }
        function touchend(event) {
            var i;
            event.preventDefault();
            for (i = 0; i < event.changedTouches.length; ++i) {
                oscOff(
                    event.changedTouches[i].identifier
                );
            }
        }
        function mousemove(event) {
            if (!mouseDown) {
                return;
            }
            oscOn(
                9,
                event.pageX / window.innerWidth,
                event.pageY / window.innerHeight
            );
        }
        function mousedown(event) {
            mouseDown = true;
            mousemove(event);
        }
        function mouseup(event) {
            mouseDown = false;
            oscOff(9);
        }

        if ('ontouchstart' in document.documentElement) {
            window.addEventListener('touchstart', touchstart, false);
            window.addEventListener('touchmove', touchstart, false);
            window.addEventListener('touchend', touchend, false);
        } else {
            $(window).on('mousedown', mousedown);
            $(window).on('mousemove', mousemove);            
            $(window).on('mouseup', mouseup);
        }

    });

})(jQuery, io);
