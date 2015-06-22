var db;
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
exports = module.exports = function(config) {
    var methods={
        connect:function(next) {
          if (db){
            return next();
          } 
          var uri="mongodb://"+config.mongo.host+":"+config.mongo.port+"/"+config.mongo.dbname;
          MongoClient.connect(uri, function(err, dbInstance) {
            if (err){
              return next(err)
            } 
            db=dbInstance;
            next()
          })
        },
        close:function(next) {
          if (db) {
            db.close(function(err, result) {
              db = null
              next(err)
            })
          }
        },
        clearAndLoad:function(fixtures,next){
          var collecionNames=Object.keys(fixtures);
          var self=this;
          async.series(
            [
              function(asyncCb){
                self.drop(collecionNames,asyncCb);
              },
              function(asyncCb){
                self.insert(fixtures,asyncCb);
              }
            ],
            function(err,data){
              next(err);
            }
          )
        },
        drop:function(collections,next){
          if(!Array.isArray(collections)){
            collections=[collections];
          }
          var filterNames=[];
          collections.forEach(function(c){
            filterNames.push(
                {
                  $and: [
                      {name: c}, 
                      {name:/^((?!\$).)*$/}
                    ]
                }
            );
          });
            
          if(filterNames.length>1){
            filterNames={$or:filterNames};
          }
          else{
            filterNames=filterNames[0];
          }
          db.listCollections(filterNames).toArray(function(err,data){
            var asyncFunctions=[];
            data.forEach(function(d){
              var collection=db.collection(d.name);
              asyncFunctions.push(function(asyncCb){
                collection.drop(asyncCb);
              });

            });
            if(asyncFunctions.length==0){
              return next();
            }
            async.parallel(asyncFunctions,function(err,data){
              next(err);
            })
          })
        },
        insert:function(collectionsData,next){
          var asyncFunctions=[];
          for(var collectionName in collectionsData){
              var collection=db.collection(collectionName);
              var data=collectionsData[collectionName];
              var dataToInsert=[];
              for(var k in data){
                dataToInsert.push(data[k]);
              }
              asyncFunctions.push(function(asyncCb){
                  collection.insert(data, asyncCb);
              });
          }
          async.parallel(asyncFunctions,function(err,data){
            next(err);
          })
        }
    }
    return methods;
}
module.exports['@singleton'] = true;
module.exports['@require'] = [
  'igloo/settings'
];