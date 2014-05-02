﻿var Task = require('../models/task'),
    Condition = require('../models/condition'),
    ConditionRepository = require('../repository/condition'),
    TaskRepository = require('../repository/task'),
    Base = require('./base'),
    klass = require('klass'),
    extend = require('extend'),
    logger = require('../logger').getLogger('services/task'),
    util = require('util'),
    Enumerable = require('linq');


var TaskService = Base.extend(function (user) {
        this.user = user;
    })
    .methods({
        findConditionsByName: function(name, map, done) {
            ///<summary>Finds conditions by name</summary>
            ///<param name="name">Name of a conditions</param>
            ///<param name="map">Map function</param>
            ///<param name="done">Done callback</param>

          return new ConditionRepository().findByName(name, function(err, conditions) {
              if (err) return done(err);

              return done(err, Enumerable.from(conditions).select(map).toArray());
          });
        },

        getConditionById: function(id, map, done) {
            ///<summary>Gets condition by id</summary>
            ///<param name="name">Condition identifier</param>
            ///<param name="map">Map function</param>
            ///<param name="done">Done callback</param>

          return new ConditionRepository().getById(id, function(err, condition) {
              if (err) return done(err);

              return new TaskRepository(this.user).getByIds(condition.dependencies, function(err, tasks) {
                  if (err) return done(err);
                  
                  return done(err, map(condition, tasks));
              });
          });
        },

        findTasksByName: function(name, map, done) {
            ///<summary>Finds tasks by name</summary>
            ///<param name="name">Name of a task</param>
            ///<param name="map">Map function</param>
            ///<param name="done">Done callback</param>

          return new TaskRepository(this.user).findByName(name, function(err, tasks) {
              if (err) return done(err);

              return done(err, Enumerable.from(tasks).select(map).toArray());
          });
        },

        saveTask: function(taskDto, done) {
            ///<summary>Saves task</summary>
            ///<param name="taskDtor">Task DTO</param>
            ///<param name="done">Done callback</param>
            
            return new TaskRepository(this.user).save(taskDto, function(err, user) {
                if (err) return done(err);

                return done(err, user.toDto());
            });
        },

        findPartnersByName: function(name, map, done) {
            ///<summary>Finds partners by name</summary>
            ///<param name="name">Name of a partner</param>
            ///<param name="map">Map function</param>
            ///<param name="done">Done callback</param>

            return new TaskRepository(this.user).findPartnersByName(name, function(err, partners) {
              if (err) return done(err);

              return done(err, Enumerable.from(partners).select(map).toArray());
          });
        },

        getTaskById: function(id, done) {
            ///<summary>Gets task by id</summary>
            ///<param name="id">Task identifier</param>
            ///<param name="done">Done callback</param>
            
            return new TaskRepository(this.user).getById(id, done);
        },

        searchTasks: function(criteria, map, done) {
            ///<summary>Searches tasks</summary>
            ///<param name="criteria">Criteria</param>
            ///<param name="map">Map function</param>
            ///<param name="done">Done callback</param>

          return new TaskRepository(this.user).search(criteria, function(err, tasks) {
              if (err) return done(err);

              return done(err, Enumerable.from(tasks).select(map).toArray());
          });
        },
    });

module.exports = TaskService;