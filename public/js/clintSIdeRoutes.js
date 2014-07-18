var DOMAIN="http://localhost:8888";
schoolApp.config(function ($routeProvider, $locationProvider) { $locationProvider.hashPrefix('!');
        $routeProvider.
            when('/home', {
                templateUrl: DOMAIN+'/page/home.html',
                controller: 'homeCtrl'
            }).when('/login', {
        templateUrl: DOMAIN+'/page/login.html',
        controller: 'loginCtrl'
    }).when('/create-user', {
                templateUrl: DOMAIN+'/page/createUser.html',
                controller: 'createUserCtrl'
            })
//            .otherwise(
//            {"redirectTo":"/login"}
//        );
    });
