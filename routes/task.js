﻿var View = require('../views/view'),
    logger = require('../logger').getLogger('routes/task'),
    route = require('./route'),
    extend = require('extend'),
    TaskService = require('../services/task'),
    Enumerable = require('linq'),
    uuid = require('node-uuid');

exports.register = function (app) {
    ///<summary>Registeres routes</summary>
    ///<param name="app">Application</param>

    app.get('/task/new', route.private({ 'task': ['create'] }), exports.new);
    app.get('/task/view/:id', route.private({ 'task': ['read'] }), exports.view);

    app.get('/task/task.json/:id', route.private({ 'task': ['read'] }), exports.getTask);
    app.post('/task/task.json', route.private({ 'task': ['create'] }), exports.createTask);

    app.get('/task/conditions.json/:id', route.private({ 'task': ['read']}), exports.getConditionById);
    app.get('/task/conditions.json', route.private({ 'task': ['read']}), exports.getConditions);

    app.get('/task/partners.json/:name', route.private({ 'task': ['read']}), exports.getPartners);

    app.get('/task/dependencies.json', route.private({ 'task': ['read']}), exports.getDependencies);

    return this;
};

exports.new = function (req, res) {
    ///<summary>New task view</summary>

    var view = new View('task/new');
    return view.render(req, res, {
        title: "Task | New"
    });
};

exports.view = function (req, res) {
    ///<summary>View task</summary>

    var view = new View('task/view');
    return view.render(req, res, {
        title: "Task | View",
        id: req.params.id
    });
};

exports.getTask = function (req, res, next) {
    ///<summary>Gets task by id</summary>
    
    var id = req.params.id;

    return new TaskService(req.user).getTaskById(id, function(err, task) {
        if (err) {
            next();
        }

        return res.json(task.toDto());
    });
};

exports.createTask = function (req, res) {
    var taskDto = extend(true, {}, req.body, {
        availability: {
            partners: Enumerable.from(req.body.availability.partners).select(function(partner) {
                return partner.text;
            }).toArray()
        }
    });

    return new TaskService(req.user).createTask(taskDto, function(err, task) {
        return res.json(task);
    });
};

exports.getConditionById = function (req, res) {
    ///<summary>Loads a condition by id</summary>

    return new TaskService(req.user).getConditionById(req.params.id, function(condition, tasks) {
        return {
                id: condition._id,
                text: condition.name,
                ui: condition.ui,
                api: condition.api,
                dependencies: Enumerable.from(tasks).select(function(task) {
                    return {
                        id: task._id,
                        text: task.name
                    };
                }).toArray()
            };
    }, function(err, condition) {
        if (err) {
            logger.error(err);

            return res.send(500);
        }

        return res.json(condition);
    });
};

exports.getConditions = function (req, res) {
    ///<summary>Loads list of conditions</summary>
    
    var params = req.query;

    return new TaskService(req.user).findConditionsByName(params.term, function(condition) {
        return {
                id: condition._id,
                text: condition.name
            };
    }, function(err, conditions) {
        if (err) {
            logger.error(err);

            return res.send(500);
        }

        conditions.push({
            id: uuid.v4(),
            text: params.term
        });

        return res.json(conditions);
    });
};

exports.getPartners = function (req, res) {
    ///<summary>Loads list of partners</summary>

    return new TaskService(req.user).findPartnersByName(req.params.name, function(partner) {
        return {
                id: partner,
                text: partner
            };
    }, function(err, partners) {
        if (err) {
            logger.error(err);

            return res.send(500);
        }

        partners.splice(0, 0, {
            id: req.params.name,
            text: req.params.name
        });

        return res.json(partners);
    });
};

exports.getDependencies = function (req, res) {
    ///<summary>Loads list of dependencies</summary>
    
    var params = req.query;

    return new TaskService(req.user).findTasksByName(params.term, function(task) {
        return {
                id: task._id,
                text: task.name
            };
    }, function(err, tasks) {
        if (err) {
            logger.error(err);

            return res.send(500);
        }

        return res.json(tasks);
    });
};