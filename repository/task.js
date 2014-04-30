﻿var Base = require('./base'),
    Task = require('../models/task'),
    TaskSnapshot = require('../models/task.snapshot'),
    Enumerable = require('linq');

var TaskRepository = Base.extend(function (user) {
        this.user = user;
    })
    .methods({
        findByName: function(name, done) {
            ///<summary>Finds tasks by name</summary>
            ///<param name="id">Task partial name</param>
            ///<param name="done">Done callback</param>

            return Task.find({
                name: new RegExp(name, 'i')
            }, done);
        },

        getById: function(id, done) {
            ///<summary>Gets task by id</summary>
            ///<param name="id">Task identifier</param>
            ///<param name="done">Done callback</param>
            
            return Task.findById(id, done);
        },

        getByIds: function(ids, done) {
            ///<summary>Gets tasks by ids</summary>
            ///<param name="ids">collection of identifiers</param>
            ///<param name="done">Done callback</param>

            return Task.find({
                _id: {
                    $in: ids
                }
            }, done);
        },

        create: function(taskDto, done) {
            ///<summary>Creates task</summary>
            ///<param name="taskDto">Task DTO</param>
            ///<param name="done">Done callback</param>
            
            var user = this.user;
            var task = new Task({
                name: taskDto.name,
                description: taskDto.description,
                external_id: taskDto.external_id,
                availability: {
                    availability_type: taskDto.availability.availability_type,
                    partners: taskDto.availability.partners
                },
                audit: {
                    modified_date: new Date(),
                    modified_by: user.getIdentity()
                }
            });

            return task.save(function (err) {
                return done(err, task);
            });
        },

        findPartnersByName: function(name, done) {
            ///<summary>Finds partners by name</summary>
            ///<param name="id">Task partial name</param>
            ///<param name="done">Done callback</param>

            return Task.distinct('availability.partners', function(err, partners) {
                if (err) return done(err);

                return done(err, Enumerable.from(partners).where(function(partner) {
                    return partner.match(new RegExp(name, 'i'));
                }).toArray());
            });
        }
    });

module.exports = TaskRepository;