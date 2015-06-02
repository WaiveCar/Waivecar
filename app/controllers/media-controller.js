var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var path = require('path');
var Blueprint = require(path.join(process.env.PWD, 'lib', 'controller-blueprint'));

exports = module.exports = function(Model, config) {

  var methods = {
    meta: {
      config: config,
      controllerName: 'media',
      model: Model,
      modelName: 'media',
      routes: {
        index: {
          policies: [ 'tokenPassThrough' ]
        }
      }
    },

    afterCreate: function(model, req, res, next) {

      var response = function(err) {
        if (err) return next(err);
        return res.format({
          html: function() {
            if (req.flash) req.flash('success', '%s %s successfully created', methods.meta.modelName, model.id);
            res.redirect([ '', methods.meta.controllerName, model.id, 'edit' ].join('/'));
          },
          json: function() {
            res.json(model);
          }
        });
      };

      // if (!req.body.report) return response();

      // Report.findById(req.body.report).exec(function(err, report) {
      //   if (err) return next(err);
      //   report.media.push(model);
      //   report.save(response);
      // });
    },

    // beforeDestroy: function(model, req, res, next) {
    //   model.state = 'completed';
    //   return next();
    // },

    // afterDestroy: function(model, req, res, next) {
    //   var response = function(err) {
    //     res.format({
    //       html: function() {
    //         if (req.flash) req.flash('success', 'Successfully removed %s with id %s', methods.meta.modelName, model.id);
    //         res.redirect([ '', methods.meta.controllerName ].join('/'));
    //       },
    //       json: function() {
    //         res.json({
    //           id: model.id,
    //           deleted: true
    //         });
    //       }
    //     });
    //   };

    //   async.parallel([
    //     function(nextTask) {
    //       if (!req.body.report) return nextTask();
    //       Report.findById(req.body.report).exec(function(err, report) {
    //         console.log(err);
    //         console.log(report);
    //         if (err) return nextTask(err);
    //         if (!report) return nextTask();
    //         var indexOf = _.indexOf(report.media, model.id);
    //         var indexOfCompleted = _.indexOf(report.completedMedia, model.id);
    //           console.log(indexOf);
    //           console.log(indexOfCompleted);
    //         if (indexOf >= 0) report.media.splice(indexOf, 1);
    //         if (indexOfCompleted >= 0) report.completedMedia.splice(indexOfCompleted, 1);
    //         report.save(nextTask);
    //       });
    //     },
    //     function(nextTask) {
    //       console.log(model.id);
    //       Model.find({ children: model.id }).exec(function(err, parents) {
    //         console.log(err);
    //         console.log(parents);
    //         if (err) return next(err);
    //         if (parents && parents.length === 1) {
    //           var parent = parents[0];
    //           var indexOf = _.indexOf(parent.children, model.id);
    //           var indexOfCompleted = _.indexOf(parent.completedChildren, model.id);
    //           console.log(indexOf);
    //           console.log(indexOfCompleted);
    //           if (indexOf >= 0) parent.children.splice(indexOf, 1);
    //           if (indexOfCompleted >= 0) parent.completedChildren.splice(indexOfCompleted, 1);
    //           parent.save(nextTask);
    //         } else {
    //           return nextTask();
    //         }
    //       });
    //     }
    //   ], response);
    // },

  };

  return _.merge(new Blueprint(methods.meta), methods);
};

exports['@singleton'] = true;
exports['@require'] = [ 'models/media', 'igloo/settings' ];
