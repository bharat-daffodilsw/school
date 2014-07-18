var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var find = function (queryInfos, callback) {
    var collection = queryInfos.collection;
    var model = db.model(collection);
    var conditions = queryInfos.conditions;
    var fields = queryInfos.fields;
    var options = queryInfos.options;
    var populates = queryInfos.populates;
    if (populates) {
        model.find(conditions, fields, options).populate(populates).exec(function (err, result) {
            var finalResult = err ? { "error": err, "status": "error", "code": 417 } : { "data": result, "status": "ok", "code": 200 };
            callback(finalResult);
        });
    } else {
        model.find(conditions, fields, options, function (err, result) {
            var finalResult = err ? { "error": err, "status": "error", "code": 417 } : { "data": result, "status": "ok", "code": 200 };
            callback(finalResult);
        });
    }
};
var remove = function (removeInfos, callback) {
    var collection = removeInfos.collection
    var model = db.model(collection);
    var conditions = removeInfos.conditions;
    model.remove(conditions, function (err, result) {
        callback(err ? { "error": err, "status": "error", "code": 417 } : { "status": "ok", "code": 200, "data": { "deleted": result }});
    });
}
var update = function (updateInfos, callback) {
    var collection = updateInfos.collection
    var model = db.model(collection);
    var operations = updateInfos.operations;
    var counter = 0;
    var total = operations.length;
    var resResult = [];
    for (var i in operations) {
        var operation = operations[i];
        var conditions = operation.__conditions;
        var options = operation.__options;
        delete operation["__conditions"];
        delete operation["__options"];
        model.update(conditions, operation, options, function (err, result) {
            counter++;
            resResult.push(err ? { "error": err } : { "updated": result });
            if (counter == total) {
                var finalResult = { "data": resResult, "status": "ok", "code": 200 };
                callback(finalResult);
            }
        });
    }
}
var insert = function (insertInfos, callback) {
    var collection = insertInfos.collection
    var model = db.model(collection);
    var operations = insertInfos.operations;
    var counter = 0;
    var total = operations.length;
    var resResult = [];
    for (var i in operations) {
        model.create(operations[i], function (err, result) {
            counter++;
            if (err) {
                resResult.push({error: err, status: "error", "code": 501});
            }
            else {
                resResult.push({data: result, status: "ok", "code": 200});
            }
            if (counter == total) {
                var finalResult = {"insert": resResult};
                callback(finalResult);
            }
        });
    }
}
var writeJSONResponse = function (req, res, result) {
    var jsonResponseType = {"Content Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Credentials": true};
    var errorStatus = {status: "error", code: 417};
    var successStatus = {status: "ok", code: 200};
    if (result instanceof Error) {
        res.writeHead(417, jsonResponseType);
        errorStatus['response'] = result
        res.write(JSON.stringify(errorStatus));
        res.end();
    } else {
        res.writeHead(200, jsonResponseType);
        successStatus['response'] = result
        res.write(JSON.stringify(successStatus));
        res.end();
    }
}
var done = function (result) {

}
var insertRecord = function (req, res) {
    var queryInfos = JSON.parse(req.param('query'));
    var collection = queryInfos.collection;
console.log("queryInfos"+JSON.stringify(queryInfos));
    if (collection == "model") {
        // Inserting the new schema infos and creating new schemas
        insert(queryInfos, function (result) {
            var records = result.insert;
            console.log(" very first before compile"+JSON.stringify(records));
            for (var i in records) {
                console.log("before compile"+JSON.stringify(records[i]));
                if (records[i].status == "ok" && records[i].code == 200) {
                    if (records[i]['data']) {
                        console.log("before compile");
                        var modelFields = records[i]['data'].fields;
                        var newModel = records[i]['data'].name;
                        mongoose.model(newModel, new Schema(modelFields));
                    }

                }
            }
            writeJSONResponse(req, res, result);
        });
    } else {
        // Inserting data
        insert(queryInfos, function (result) {
            writeJSONResponse(req, res, result);
        });
    }
};
var updateRecord = function (req, res) {
    var updateInfos = JSON.parse(req.param('query'));
    // Updating data
    update(updateInfos, function (result) {
        writeJSONResponse(req, res, result);
    });
};
var removeRecord = function (req, res) {
    var removeInfos = JSON.parse(req.param('query'));
    // Removing data
    remove(removeInfos, function (result) {
        writeJSONResponse(req, res, result);
    });
};
var findRecord = function (req, res) {
    var queryInfos = JSON.parse(req.param('query'));
    // Fetching the data
    find(queryInfos, function (result) {
        writeJSONResponse(req, res, result);
    });
};
exports.find = find;
exports.findRecord = findRecord;
exports.removeRecord = removeRecord;
exports.insertRecord = insertRecord;
exports.updateRecord = updateRecord;
exports.writeJSONResponse = writeJSONResponse;
