// app/routes.js

module.exports = function(app) {

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes

    // sample api route
//    app.get('/api/nerds', function(req, res) {
//        // use mongoose to get all nerds in the database
//        Nerd.find(function(err, nerds) {
//
//            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
//            if (err)
//                res.send(err);
//
//            res.json(nerds); // return all nerds in JSON format
//        });
//    });

    // route to handle creating (app.post)
    // route to handle delete (app.delete)

    // frontend routes =========================================================
    // route to handle all angular requests
    app.all('/page/:name', function(req, res) {
        console.log("page "+req.params.name);
//        res.sendfile(('../public/views/'+req.params.name)); // load our public/index.html file
        res.sendfile('./public/views/'+req.params.name);
    });
    app.get('/login', function(req, res) {
        console.log("login");
        res.sendfile('../public/views/login.html'); // load our public/index.html file
    });
    app.get('/home', function(req, res) {
        console.log("home");
        res.sendfile('../public/views/home.html'); // load our public/index.html file
    });
    app.get('/', function(req, res) {
        console.log("index");
        res.sendfile('./public/index.html'); // load our public/index.html file
    });

};

