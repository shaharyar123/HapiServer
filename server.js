'use strict';

const Hapi = require('hapi');
const Good = require('good');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

const Sequelize = require('sequelize');
const sequelize = new Sequelize('test', 'root');

const User = sequelize.define('user', {
    username: Sequelize.STRING,
    birthday: Sequelize.DATE
});

sequelize.sync()
    .then(() => User.create({
        username: 'autoCreated',
        birthday:  Date.now()
    }));

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});
server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
            reply.file('./public/hello.html');
        }
    });
});
server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});
server.route({
    method: 'GET',
    path: '/get/{id}',
    handler: function (request, reply) {
        User.findOne({
                where: {
                    id: request.params.id
                }
            })
            .then((usr) => {
                reply('Username: ' + usr.username + '  id : ' + usr.id);
            },(err) => {
                reply(err);
            })
    }
});

server.route({
    method: 'POST',
    path: '/post',
    handler: function (request, reply) {
        User.create({
            username: request.payload.name,
            birthday:  Date.now()
        }).then(() => {
                reply('User successfully added');
            },(err) => {
                reply(err);
            })
    }
});
server.route({
    method: 'GET',
    path: '/all',
    handler: function (request, reply) {
        User.findAll().then((usr) => {
            console.log('////',usr);
                reply(usr);
            },(err) => {
                reply(err);
            })
    }
});
server.register({
    register: Good,
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{
                    response: '*',
                    log: '*'
                }]
            }, {
                module: 'good-console'
            }, 'stdout']
        }
    }
}, (err) => {

    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start((err) => {

        if (err) {
            throw err;
        }
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});