var util = require('util');
var async = require('async');
var _ = require('lodash');
var paginate = require('express-paginate');
var Qs = require('qs');
var mongoose = require('mongoose');

exports = module.exports = function(options) {

  options = options || {};
  var config = options.config;
  var Model = options.model;

  var getViewPath = function(view) {
    return methods.meta.controllerName + '/' + view;
  };

  var apiDefaultPolicy = [ 'tokenPassThrough', 'isAuthenticated' ];

  var methods = {
    meta: {
      isRoot: options.isRoot || false,
      isApi: options.isApi || true,
      controllerName: options.controllerName || '',
      modelName: options.modelName || '',
      routes: {
        show: {
          enabled: true,
          method: 'get',
          path: '/:id',
          policies: options.routes && options.routes.show && options.routes.show.policies ? options.routes.show.policies : (options.isApi === false ? [ 'tokenPassThrough' ] : apiDefaultPolicy),
          action: 'show',
          view: 'show'
        },
        index: {
          enabled: true,
          method: 'get',
          path: '/',
          policies: options.routes && options.routes.index && options.routes.index.policies ? options.routes.index.policies : (options.isApi === false ? [ 'tokenPassThrough' ] : apiDefaultPolicy),
          action: 'index',
          view: 'index'
        },
        'new': {
          enabled: false,
          method: 'get',
          path: '/new',
          policies: options.isApi === false ? [ 'tokenPassThrough' ] : apiDefaultPolicy,
          action: 'new',
          view: 'new'
        },
        create: {
          enabled: true,
          method: 'post',
          path: '/',
          policies: options.isApi === false ? [ 'tokenPassThrough' ] : apiDefaultPolicy,
          action: 'create'
        },
        edit: {
          enabled: false,
          method: 'get',
          path: '/:id/edit',
          policies: options.isApi === false ? [ 'tokenPassThrough' ] : apiDefaultPolicy,
          action: 'edit',
          view: 'edit'
        },
        update: {
          enabled: true,
          method: 'put',
          path: '/:id',
          policies: options.isApi === false ? [ 'tokenPassThrough' ] : apiDefaultPolicy,
          action: 'update'
        },
        destroy: {
          enabled: true,
          method: 'delete',
          path: '/:id',
          policies: options.isApi === false ? [ 'tokenPassThrough' ] : apiDefaultPolicy,
          action: 'destroy'
        }
      }
    },

    index: function(req, res, next) {
      var view = getViewPath(methods.meta.routes.index.view);
      var location = methods.meta.controllerName + '-index';

      if (Model) {
        // limit result set to owned items
        var query = (Model.schema.paths.user && req.user) ? { user: req.user.id } : {};
        if (req.permissions && _.contains(req.permissions, 'can-fetch-all')) {
          query = {};
        }

        var q = _.omit(req.query, 'page', 'limit', 'sort');

        if (!_.isEmpty(q)) {
          _.forOwn(q, function(value, key) {
            if (key === 'id') {
              if (!mongoose.Types.ObjectId.isValid(value)) {
                return res.status(400).send({ message: 'Invalid ' + key + ' passed. Please try again.' });
              }
            } else if (Model.schema.paths[key] && Model.schema.paths[key].instance === 'ObjectID') {
              if (!mongoose.Types.ObjectId.isValid(value)) {
                return res.status(400).send({ message: 'Invalid ' + key + ' passed. Please try again.' });
              }
            } else if (value.indexOf(':') > -1) {
              var mongoQ = value.split(':');
              q[key] = { };
              q[key][mongoQ[0]] = mongoQ[1];
            } else {
              var valueAsNumber = +value;
              if (_.isNumber(valueAsNumber) && !_.isNaN(valueAsNumber) ) {
                q[key] = valueAsNumber;
              } else if (_.isString(value)) {
                q[key] = new RegExp(value, 'i');
              }
            }
          });

          query = _.extend({}, query, Qs.parse(q));
        }

        var sort = '-updatedAt';
        if (req.query.sort) sort = req.query.sort;

        if (_.isEmpty(query)) {
          req.query.page = req.query.page || 1;
          req.query.limit = req.query.limit || 100;
        }

        Model.paginate(query, req.query.page, req.query.limit, function(err, pageCount, models, itemCount) {
          if (err) return next(err);

          res.format({
            html: function() {
              res.render(view, {
                models: models,
                pageCount: pageCount,
                itemCount: itemCount,
                meta: methods.meta,
                location: location,
                clientApp: methods.meta.routes.index.clientApp || undefined
              });
            },
            json: function() {
              res.json({
                object: 'list',
                has_more: paginate.hasNextPages(req)(pageCount, models.length),
                pageCount: pageCount,
                itemCount: itemCount,
                data: models
              });
            }
          });
        }, { sortBy : sort });
      } else {
        res.format({
          html: function() {
            res.render(view, {
              meta: methods.meta,
              location: location,
              clientApp: methods.meta.routes.index.clientApp || undefined
            });
          }
        });
      }
    },

    new: function(req, res, next) {
      var view = getViewPath(methods.meta.routes.new.view);
      var location = methods.meta.controllerName + '-new';
      res.format({
        html: function() {
          res.render(view, { meta: methods.meta, location: location });
        }
      });
    },

    beforeCreate: function(req, res, next) {
      // Implement this function in your concrete controller to validate/clean the model.
      return next(null, req.body);
    },

    afterCreate: function(model, req, res, next) {
      res.format({
        html: function() {
          if (req.flash) req.flash('success', '%s %s successfully created', methods.meta.modelName, model.id);
          res.redirect([ '', methods.meta.controllerName, model.id, 'edit' ].join('/'));
        },
        json: function() {
          res.json(model);
        }
      });
    },

    create: function(req, res, next) {
      methods.beforeCreate(req, res, function(err, cleanModel) {
        if (err) return next(err);

        Model.create(cleanModel, function(err, model) {
          if (err) return next(err);
          return methods.afterCreate(model, req, res, next);
        });
      });
    },

    show: function(req, res, next) {
      var id = req.params.id || req.user.id;
      Model.findById(id).exec(function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error(util.format('%s %s does not exist.', methods.meta.modelName, id)));

        var view = getViewPath(methods.meta.routes.show.view);
        var location = methods.meta.controllerName + '-show';
        res.format({
          html: function() {
            res.render(view, { model: model, meta: methods.meta, location: location });
          },
          json: function() {
            res.json(model);
          }
        });
      });
    },

    edit: function(req, res, next, meta) {
      meta = _.merge({}, methods.meta, meta);
      var id = req.params.id || req.user.id;
      Model.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error(util.format('%s %s does not exist.', meta.modelName, id)));

        var view = getViewPath(methods.meta.routes.edit.view);
        var location = methods.meta.controllerName + '-edit';
        res.format({
          html: function() {
            res.render(view, { model: model, location: location });
          },
          json: function() {
            res.json(model);
          }
        });
      });
    },

    beforeUpdate: function(model, req, res, next) {
      _.extend(model, req.body);
      return next(null, model);
    },

    afterUpdate: function(model, req, res, next) {
      res.format({
        html: function() {
          if (req.flash) req.flash('success', 'Successfully updated %s with id %s', methods.meta.modelName, model.id);
          res.redirect([ '', methods.meta.controllerName, model.id, 'edit' ].join('/'));
        },
        json: function() {
          res.json(model);
        }
      });
    },

    update: function(req, res, next) {
      async.waterfall([
        function(taskComplete) {
          Model.findById(req.params.id, taskComplete);
        },
        function(existingModel, taskComplete) {
          methods.beforeUpdate(existingModel, req, res, taskComplete);
        },
        function(model, taskComplete) {
          model.save(taskComplete);
        },
        function(updatedModel, taskComplete) {
          methods.afterUpdate(updatedModel, req, res, taskComplete);
        }
      ], function(err) {
        next(err);
      });
    },

    beforeDestroy: function(model, req, res, next) {
      return next();
    },

    afterDestroy: function(model, req, res, next) {
      res.format({
        html: function() {
          if (req.flash) req.flash('success', 'Successfully removed %s with id %s', methods.meta.modelName, model.id);
          res.redirect([ '', methods.meta.controllerName ].join('/'));
        },
        json: function() {
          res.json({
            id: model.id,
            deleted: true
          });
        }
      });
    },

    destroy: function(req, res, next) {
      var model;
      async.waterfall([
        function(next) {
          Model.findById(req.params.id, next);
        },
        function(_model, next) {
          model = _model;
          methods.beforeDestroy(model, req, res, next);
        },
        function(next) {
          model.remove(next);
        },
        function(_model, next) {
          methods.afterDestroy(model, req, res, next);
        }
      ], function(err) {
        next(err);
      });
    }
  };

  return methods;
};
