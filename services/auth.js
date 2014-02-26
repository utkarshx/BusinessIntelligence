﻿var $userService = require('../services/user');

exports.authenticate = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
};