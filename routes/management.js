﻿var UserService = require('../services/user'),
    View = require('../views/view'),
    logger = require('../logger').getLogger(),
    route = require('./route'),
    extend = require('extend');

exports.register = function (app) {
    ///<summary>Registeres routes</summary>
    ///<param name="app">Application</param>

    app.get('/management/users', route.private({ 'management.user': ['read'] }), exports.index);
    app.get('/management/users/users.json', route.private({ 'management.user': ['read'] }), exports.getUsers);

    return this;
};

exports.index = function (req, res, next) {
    ///<summary>Default view</summary>

    var view = new View('management/users');
    return view.render(req, res, next, {
        title: "Management | Users"
    });
};

exports.getUsers = function (req, res, next) {
    ///<summary>Gets list of users</summary>

    return new UserService().getUsersDto(function(err, users) {
        if (err) return next(err);

        return res.json(users);
    });
};