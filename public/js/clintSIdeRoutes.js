schoolApp.config(function ($routeProvider, $locationProvider) { $locationProvider.hashPrefix('!');
        $routeProvider.
            when('/home', {
                templateUrl: 'http://localhost:8888/page/home.html',
                controller: 'homeCtrl'
            }).when('/login', {
        templateUrl: 'http://localhost:8888/page/login.html',
        controller: 'homeCtrl'
    }).otherwise(
            {"redirectTo":"/"}
        );
    });
