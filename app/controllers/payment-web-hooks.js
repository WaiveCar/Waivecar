var paginate = require('express-paginate');

exports = module.exports = function(model,config) {
  function create(req, res, next) {
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
    };
    function index(req,res,next){
        var readCb=function(err,pageCount,models,itemCount){
            console.log(err);
            console.log(models);
            console.log(itemCount);
            console.log(pageCount);
            res.json(models);
        }
        var sort = '-updatedAt';
        model.paginate({},0,0,readCb,{ sortBy : sort });
    };
    return {
        create: create,
        index:index
    };
};

exports['@require'] = [ 'models/payment-web-hooks', 'igloo/settings' ];
exports['@singleton'] = true;