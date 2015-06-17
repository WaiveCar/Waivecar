// 'use strict';

// /**
//  * jobService.enqueue('process-payment', { id: });
//  */
// var _ = require('lodash');
// var async = require('async');
// var handlerName = 'process-payment';

// exports = module.exports = function(Case, User, Transaction, paymentService, settings, logger) {
//   var svc = {

//     concurrency: 10,

//     handleError: function(err, job, next) {
//       err = new Error(handlerName + ': ' + err);
//       job.failed().error(err);
//       return next(err);
//     },

//     process: function (job, next) {
//       if (_.contains(settings.jobs.skipProcessingIn, settings.server.env)) {
//         logger.debug('Skipping ' + handlerName + ' job');
//         return next();
//       }

//       if (!job.data.id) return next(new Error(handlerName + ': Case Id not provided.'));

//       async.series([
//         function(taskComplete) {
//           Transaction.find({ 'case': job.data.id, type: 'back', status: 'new' }).populate('user').populate('case').exec(function(err, pledges) {
//             if (err) return svc.handleError(err, job, taskComplete);
//             async.each(pledges, paymentService.processPledge, taskComplete);
//           });
//         },
//         function(taskComplete) {
//           Transaction.find({ 'case': job.data.id, type: 'back', status: 'back-failed' }).populate('user').populate('case').exec(function(err, pledges) {
//             if (err) return svc.handleError(err, job, taskComplete);
//             async.each(pledges, paymentService.processPledge, taskComplete);
//           });
//         },
//         function(taskComplete) {
//           Transaction.find({ 'case': job.data.id, type: 'back', status: 'backed' }).exec(function(err, backs) {
//             if (err) return svc.handleError(err, job, taskComplete);
//             if (backs && backs.length === 0) return taskComplete(new Error('No backs'));
//             Case.findById(job.data.id).exec(function(err, caseModel) {
//               if (err) return svc.handleError(err, job, taskComplete);
//               caseModel.fundedAt = new Date();
//               caseModel.fundingReceived = 0;
//               _.each(backs, function(back) {
//                 caseModel.fundingReceived += back.amount;
//               });
//               return caseModel.save(taskComplete);
//             });
//           });
//         }
//       ], next);
//     }
//   };

//   return svc;
// };

// exports['@singleton'] = true;
// exports['@require'] = [ 'models/case', 'models/user', 'models/transaction', 'services/payment-service', 'igloo/settings', 'igloo/logger' ];
