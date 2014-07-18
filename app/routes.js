// app/routes.js

module.exports = function (app) {
    var functions=require('../dataBase/functions');
    app.get('/page/:name', function (req, res) {
        res.sendfile('./public/views/' + req.params.name);
    });
    /*Rest Api for DataBase Query*/
    app.get('/rest/data/insert',functions.insertRecord);
    app.get('/rest/data/update',functions.updateRecord);
    app.get('/rest/data/find',functions.findRecord);
    app.get('/rest/data/remove',functions.removeRecord);
    /*End Here Rest DataBase Api*/
    app.get('*', function (req, res) {
        res.sendfile('./public/index.html');
    });

};

