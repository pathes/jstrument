#!/usr/bin/env node
/* global require: false, __dirname: false, console: false */
'use strict';

const _ = require('lodash');

function Server(config) {

    // Load required libraries.
    const http = require('http');
    const io = require('socket.io');
    const fs = require('fs');
    const osc = require('node-osc');

    const Server = this;
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

    Server.canStart = true;

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

    _(Server).assign({
        onRequest: function onRequest(request, response) {
            var url = request.url;
            if (url == '/') {
                url = '/client.html';
            }
            fs.readFile(
                __dirname + url,
                function (err, data) {
                    if (err) {
                        response.writeHead(500);
                        return response.end('Error loading file');
                    }
                    response.writeHead(200);
                    response.end(data);
                }
            );
        },
        run: function run() {
            if (!Server.canStart) {
                return;
            }
            // Run socket.io.
            Server.io = io.listen(Server.server, {log: false});
            // Run HTTP server.
            Server.server.listen(Server.config.httpPort);
            // Run OSC client
            Server.oscClient = new osc.Client(
                Server.config.oscHost,
                Server.config.oscPort
            );

            // Set socket.io's reactions.
            Server.io.sockets.on('connection', function onConnection(socket) {
                socket.on('foo', function foo(freq, vol) {
                    Server.oscClient.send('/foo', freq, vol);
                });
                socket.on('log', function log(x) {
                    console.log(x);
                });
            });
        },
    });
    Server.server = http.createServer(Server.onRequest);
}

const server = new Server();
server.run();
