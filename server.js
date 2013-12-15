#!/usr/bin/env node
/* global require: false, __dirname: false, console: false */
'use strict';

const _ = require('lodash');

function Server(config) {

    // Internal libraries

    // External libraries
    const express = require('express');
    const io = require('socket.io');
    const osc = require('node-osc');
    const sass = require('node-sass');

    // Reference to this object
    const server = this;
    _(server).assign({
        canStart: true,
        debugList: [
            'socket.io',
        ]
    });

    // Set default settings.
    const defaultConfig = {
        httpPort: 8888,
        oscPort: 57120,
        oscHost: '127.0.0.1'
    };

    // Load custom settings.
    server.config = _(defaultConfig).clone();
    if (_.isObject(config)) {
        _(server.config).assign(config);
    }

    // Validate ports.
    function validatePort(portName) {
        server.config[portName] = _.parseInt(server.config[portName]);
        if (server.config[portName] < 1 || server.config[portName] > 65535) {
            console.error(portName + ' should be an integer in range [1..65535].');
            server.canStart = false;
        }
    }
    validatePort('httpPort');
    validatePort('oscPort');

    // Create app
    server.app = express();

    // Configure app
    server.app.configure(function () {
        server.app.use(sass.middleware({
            src: __dirname + '/app',
            dest: __dirname + '/static',
            debug: true,
        }));
    });

    // Routing
    server.app.get('/', function(req, res) {
        res.sendfile(__dirname + '/app/base/base.html');
    });
    _.forEach([
        '*.html',
        '*.js',
        '*.svg',
    ], function (dir) {
        server.app.get('/app' + dir, function (req, res) {
            res.sendfile(__dirname + req.url);
        });
    });
    server.app.use(express.compress());
    server.app.use(express.static(__dirname + '/static'));
    server.app.use('/components', express.static(__dirname + '/bower_components'));

    // Public methods
    server.run = function run() {
        if (!server.canStart) {
            return;
        }
        // Run HTTP server.
        server.http = server.app.listen(server.config.httpPort);
        // Run socket.io.
        server.io = io.listen(server.http, {
            log: _(server.debugList).contains('socket.io'),
        });
        // Run OSC client.
        server.oscClient = new osc.Client(
            server.config.oscHost,
            server.config.oscPort
        );

        // Set socket.io's reactions.
        server.io.sockets.on('connection', function onConnection(socket) {
            _.forIn({
                oscOn: function foo(id, freq, vol) {
                    console.log(freq);
                    server.oscClient.send('/oscOn', id, freq, vol);
                },
                oscOff: function foo(id) {
                    server.oscClient.send('/oscOff', id);
                },
                log: function log(x) {
                    console.log(x);
                }
            }, function (callback, key) {
                socket.on(key, callback);
            });
        });
    };
    
}

const server = new Server();
server.run();
