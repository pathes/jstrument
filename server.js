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
    const Server = this;
    _(Server).assign({
        canStart: true,
        debugList: [
            'socket.io',
        ],
    })

    // Set default settings.
    const defaultConfig = {
        httpPort: 8888,
        oscPort: 57120,
        oscHost: '127.0.0.1',
    };

    // Load custom settings.
    Server.config = _(defaultConfig).clone();
    if (_.isObject(config)) {
        _(Server.config).assign(config);
    }



    // Validate ports.
    function validatePort(portName) {
        Server.config[portName] = _.parseInt(Server.config[portName]);
        if (Server.config[portName] < 1 || Server.config[portName] > 65535) {
            console.error(portName + ' should be an integer in range [1..65535].');
            Server.canStart = false;
        }
    }
    validatePort('httpPort');
    validatePort('oscPort');

    // Create app
    Server.app = express();

    // Configure app
    Server.app.configure(function () {
        Server.app.use(sass.middleware({
            src: __dirname + '/app',
            dest: __dirname + '/static',
            debug: true,
        }));
    });

    // Routing
    Server.app.get('/', function(req, res) {
       res.sendfile(__dirname + '/app/base.html');
    });
    Server.app.get('/js/*', function(req, res) {
        res.sendfile(__dirname + '/app' + req.url);
    });
    Server.app.use(express.compress());
    Server.app.use(express.static(__dirname + '/static'));

    // Public methods
    Server.run = function run() {
        if (!Server.canStart) {
            return;
        }
        // Run HTTP server.
        Server.server = Server.app.listen(Server.config.httpPort);
        // Run socket.io.
        Server.io = io.listen(Server.server, {
            log: _(Server.debugList).contains('socket.io'),
        });
        // Run OSC client.
        Server.oscClient = new osc.Client(
            Server.config.oscHost,
            Server.config.oscPort
        );

        // Set socket.io's reactions.
        Server.io.sockets.on('connection', function onConnection(socket) {
            socket.on('oscOn', function foo(id, freq, vol) {
                Server.oscClient.send('/oscOn', id, freq, vol);
            });
            socket.on('oscOff', function foo(id) {
                Server.oscClient.send('/oscOff', id);
            });
            socket.on('log', function log(x) {
                console.log(x);
            });
        });
    };
    
}

const server = new Server();
server.run();
