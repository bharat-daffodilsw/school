var http = require('http');
var path = require('path');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uri = "mongodb://localhost:27017/test";
var opts = { mongos: true };
mongoose.connect(uri, opts);
var db = mongoose.connection;

var express= require('express');
var bodyParser = require('body-parser')
var app=express();
app.use(bodyParser());

db.on('error', console.error);
db.once('open', function() {

    // Creating the fixed schema -- Model
    mongoose.model('model', new Schema({
        name: String,
        fields: {}
    }));

    // Creating schemas and models after fetch from database
    find({"collection":"model"}, function(result){
        var schemas = result.data;
        for(var i in schemas){
            var schema = schemas[i];
            mongoose.model(schema.name, new Schema(schema.fields));
        }
    });
});

app.get('/rest/data/insert', function(req, res){
    var insertInfos = JSON.parse(req.param('info'));

    var collection = insertInfos.collection;
    if(collection == "model"){
        // Inserting the new schema infos and creating new schemas
        insert(insertInfos, function(result){
            var records = result.data;
            for(var i in records){
                var modelFields = records[i].fields;
                var newModel = records[i].name;
                mongoose.model(newModel, new Schema(modelFields));
            }
            res.send(result);
        });
    } else {
        // Inserting data
        insert(insertInfos, function(result){
            res.send(result);
        });
    }
});

app.get('/rest/data/update', function(req, res){
    var updateInfos = JSON.parse(req.param('info'));
    // Updating data
    update(updateInfos, function(result){
        res.send(result);
    });
});

app.get('/rest/data/remove', function(req, res){
    var removeInfos = JSON.parse(req.param('info'));
    // Removing data
    remove(removeInfos, function(result){
        res.send(result);
    });
});

app.get('/rest/data/find', function(req, res){
    var queryInfos = JSON.parse(req.param('info'));
    // Fetching the data
    find(queryInfos, function(result){
        res.send(result);
    });
});

var insert = function(insertInfos, callback){
    var collection = insertInfos.collection
    var model = db.model(collection);
    var operations = insertInfos.operations;
    var counter = 0;
    var total = operations.length;
    var resResult = [];
    for (var i in operations){
        model.create(operations[i], function(err, result){
            counter++;
            resResult.push(err ? { "error":err } : result);
            if(counter == total){
                var finalResult = { "data":resResult, "status":"ok", "code":200 };
                callback(finalResult);
            }
        });
    }
}

var update = function(updateInfos, callback){
    var collection = updateInfos.collection
    var model = db.model(collection);
    var operations = updateInfos.operations;
    var counter = 0;
    var total = operations.length;
    var resResult = [];
    for (var i in operations){
        var operation = operations[i];
        var conditions = operation.__conditions;
        var options = operation.__options;
        delete operation["__conditions"];
        delete operation["__options"];
        model.update(conditions, operation, options, function(err, result){
            counter++;
            resResult.push(err ? { "error":err } : { "updated":result });
            if(counter == total){
                var finalResult = { "data":resResult, "status":"ok", "code":200 };
                callback(finalResult);
            }
        });
    }
}

var remove = function(removeInfos, callback){
    var collection = removeInfos.collection
    var model = db.model(collection);
    var conditions = removeInfos.conditions;
    model.remove(conditions, function(err, result){
        callback(err ? { "error":err, "status":"error", "code":417 } : { "status":"ok", "code":200, "data":{ "deleted":result }});
    });
}

var find = function(queryInfos, callback){
    var collection = queryInfos.collection;
    var model = db.model(collection);
    var conditions = queryInfos.conditions;
    var fields = queryInfos.fields;
    var options = queryInfos.options;
    var populates = queryInfos.populates;

    if(populates){
        model.find(conditions, fields, options).populate(populates).exec(function(err, result){
            var finalResult = err ? { "error":err, "status":"error", "code":417 } : { "data":result, "status":"ok", "code":200 };
            callback(finalResult);
        });
    } else {
        model.find(conditions, fields, options, function(err, result){
            var finalResult = err ? { "error":err, "status":"error", "code":417 } : { "data":result, "status":"ok", "code":200 };
            callback(finalResult);
        });
    }
}

app.listen(5400);
console.log("Server is running....");
