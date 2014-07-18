var http = require('http');
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var app = express();
var db = require('./config/db');
var functions=require('./dataBase/functions');
var port = process.env.PORT || 8888; // set our port
mongoose.connect(db.uri, db.opts);
var db = mongoose.connection;
var Schema = mongoose.Schema;
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
db.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});
db.on('disconnected', function () {
    console.log('Mongoose disconnected');
});
process.on('SIGINT', function() {
    db.close(function () {
        console.log('Mongoose disconnected through app termination');
        process.exit(0);
    });
});
db.once('open', function() {

    mongoose.model('model', new Schema({
        name:{type:String,unique:true},
        fields: {}
    }));
    // Creating schemas and models after fetch from database
    functions.find({"collection":"model"}, function(result){
        var schemas = result.data;
        for(var i in schemas){
            var schema = schemas[i];
                mongoose.model(schema.name, new Schema(schema.fields));
        }
    });
});
db.on('connected', function () {
    // Creating the fixed schema -- Model
    require('./app/routes')(app);
    app.listen(port);
    console.log('Magic happens on port ' + port);
    exports = module.exports = app;
});
