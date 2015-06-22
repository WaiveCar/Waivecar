var paginate = require('express-paginate');

exports = module.exports = function(model,config) {
  function index(req, res, next) {
    var data=req.body;
    if(typeof data !== 'string'){
        data=JSON.stringify(data);
    }
    model.create({content:data}, function(err, model) {
        if(err){
            res.status(200).send('error');
        }
        else{
            res.json(model);
        }
     });
    }
    return {
        index: index,
    };
};

exports['@require'] = [ 'models/payment-web-hooks', 'igloo/settings' ];
exports['@singleton'] = true;