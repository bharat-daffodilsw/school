
var appStrapServices = angular.module('$appstrap.services', []);
/**
 * App Services
 */
appStrapServices.factory('$appService', [
    '$rootScope',
    '$http',
    '$timeout',
    function ($rootScope, $http, $timeout) {
        var $appService = {
        };
        $appService.login = function (username, password, callback) {
            var params = {};
            params.username = username;
            params.password = password;
            params.usergroup = 'baas';

            this.getDataFromJQuery(BAAS_SERVER + "/login", params, "GET", "JSON", "Loading...", function (callBackData) {
                callback(callBackData);
            }, function (jqxhr, error) {
                alert("Error:" + JSON.stringify(jqxhr));
            });
        };


        $appService.save = function (data, ask, osk, usk, callBack) {
            //var timeZone = new Date().getTimezoneOffset();
            //timeZone = timeZone * 60000;
            if (!ask) {
                throw "No ask found for saving";
            }
            // return;
            var params;
            if (usk) {

                params = {"updates": JSON.stringify(data), "ask": ask, "osk": osk, "usk": usk};
            }
            else {
                params = {"updates": JSON.stringify(data), "ask": ask, "osk": osk};

            }
            var that = this;

            var url = BAAS_SERVER + "/data";
            this.getDataFromJQuery(url, params, "POST", "JSON", function (callBackData) {
                callBack(callBackData);
            });
        }
        $appService.sendNotification = function (data, ask, osk, usk, callBack) {
            if (!ask) {
                throw "No ask found for saving";
            }
            // return;
            var params;
            if (usk) {

                params = {"mailContent": data, "ask": ask, "osk": osk, "usk": usk};
            }
            else {
                params = {"mailContent": data, "ask": ask, "osk": osk};

            }
            var that = this;

            var url = BAAS_SERVER + "/mail";
            this.getDataFromJQuery(url, params, "POST", "JSON", function (callBackData) {
                callBack(callBackData);
            });
        }
        $appService.delete_cookie = function (name) {
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        };

        $appService.checkCookie = function () {
            return $appService.getCookie("usk");

        }
        $appService.getCookie = function (usk) {
            var c_value = document.cookie;
            var c_start = c_value.indexOf(" " + usk + "=");
            // alert('c_start='+c_start+" c_value="+c_value+" usk="+usk);
            if (c_start == -1) {
                c_start = c_value.indexOf(usk + "=");
            }
            if (c_start == -1) {
                c_value = null;
            }
            else {
                c_start = c_value.indexOf("=", c_start) + 1;
                var c_end = c_value.indexOf(";", c_start);
                if (c_end == -1) {
                    c_end = c_value.length;
                }
                c_value = unescape(c_value.substring(c_start, c_end));
            }
            return c_value;
        }

        $appService.getDataFromJQuery = function (url, requestBody, callType, dataType, callback, errcallback) {
            $.support.cors = true;

            $.ajax({
                type: callType,
                url: url,
                data: requestBody,
                crossDomain: true,
                success: function (returnData, status, xhr) {
                    callback(returnData);
                    $rootScope.showbusymessage = false;
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                },
                error: function (jqXHR, exception) {
                    if (jqXHR.status == 417 && jqXHR.responseText) {
                        var error_resp = JSON.parse(jqXHR.responseText);
                        if (error_resp.code && error_resp.code == 34) {
                            $appService.delete_cookie('usk');
                            window.location.href = "/login";
                        }
                    }
                    $rootScope.showbusymessage = false;
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                    if (errcallback) {
                        errcallback(jqXHR, exception);
                    } else {

                        callback(jqXHR);
                        console.log("exception in making [" + url + "] :[" + exception + "]");
                    }

                },
                timeout: 1200000,
                dataType: dataType,
                async: true
            });
        }
        $appService.createPayment=function(url,requestBody,calltype,dataType,callback,errcallback){
            $.ajax({
                url: url,
                type: calltype,
                timeout:1200000,
                dataType:dataType,
                async:true,
                crossDomain:true,
                data:requestBody,
                success:function (returnData, status, xhr) {
                    callback(returnData);
                    var result = returnData;
                    var links = result.response.links;
                    var paymentId = result.response.id;
                    var redirectUrl;
                    for (var index=0; index < links.length; index++) {
                        //Redirect user to this endpoint for redirect url
                        if (links[index].rel == 'approval_url') {
                            redirectUrl = links[index].href;
                            break;
                        }
                    }
                    // Need to save paymentId and tokenId in application database table
                    //window.location.href=redirectUrl;
                },
                error: function (jqXHR, exception) {
                    if (errcallback) {
                        errcallback(jqXHR, exception);
                    } else {
                        callback(jqXHR);
                        console.log("exception in making [" + url + "] :[" + exception + "]");
                    }

                }
            });
        }
        $appService.executePayment = function (paymentId, payerId, mode, ask, osk, usk, callBack) {
            if (!ask) {
                throw "No ask found for saving";
            }
            var params;
            if (usk) {

                params = {"paymentId": paymentId, "payerId": payerId, "mode":mode, "ask": ask, "osk": osk, "usk": usk};
            }
            else {
                params = {"paymentId": paymentId, "payerId": payerId,"mode":mode, "ask": ask, "osk": osk};

            }


            var url = BAAS_SERVER + "/execute/payment";
            this.getDataFromJQuery(url, params, "POST", "JSON", function (callBackData) {
                callBack(callBackData);
            });
        }
        $appService.setUrls = function (data, size, height) {

            for (var i = 0; i < data.length; i++) {
                if (data[i]["image"]) {
                    if (size) {
                        if (height) {
                            data[i]["imageUrl"] = BAAS_SERVER + "/file/render?filekey=" + data[i]["image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK + '&resize={"width":' + size + ',"height":' + height + '}&convert={"type":"png"}';
                        }
                        else {

                            data[i]["imageUrl"] = BAAS_SERVER + "/file/render?filekey=" + data[i]["image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK + '&resize={"width":' + size + '}&convert={"type":"png"}';
                        }
                    }
                    else {
                        if (height) {
                            data[i]["imageUrl"] = BAAS_SERVER + "/file/render?filekey=" + data[i]["image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK + '&resize={"width":216,"height":' + height + '}&convert={"type":"png"}';
                        }

                        else {
                            data[i]["imageUrl"] = BAAS_SERVER + "/file/render?filekey=" + data[i]["image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK + '&resize={"width":216}&convert={"type":"png"}';
                        }
                    }

                    //console.log(data[i]["imageUrl"]);

                }
                if (data[i]["display_image"]) {
                    if (size) {
                        if (height) {
                            data[i]["displayImageUrl"] = BAAS_SERVER + "/file/render?filekey=" + data[i]["display_image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK + '&resize={"width":' + size + ',"height":' + height + '}&convert={"type":"png"}';
                            data[i]["downloadImageUrl"]= BAAS_SERVER + "/file/render?filekey=" + data[i]["display_image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK;
                        }
                        else {

                            data[i]["displayImageUrl"] = BAAS_SERVER + "/file/render?filekey=" + data[i]["display_image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK + '&resize={"width":' + size + '}&convert={"type":"png"}';
                            data[i]["downloadImageUrl"]= BAAS_SERVER + "/file/render?filekey=" + data[i]["display_image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK;
                        }
                    }
                    else {
                        if (height) {
                            data[i]["displayImageUrl"] = BAAS_SERVER + "/file/render?filekey=" + data[i]["display_image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK + '&resize={"width":216,"height":' + height + '}&convert={"type":"png"}';
                            data[i]["downloadImageUrl"]= BAAS_SERVER + "/file/render?filekey=" + data[i]["display_image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK;
                        }

                        else {
                            data[i]["displayImageUrl"] = BAAS_SERVER + "/file/render?filekey=" + data[i]["display_image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK + '&resize={"width":216}&convert={"type":"png"}';
                            data[i]["downloadImageUrl"]= BAAS_SERVER + "/file/render?filekey=" + data[i]["display_image"][0]["key"] + '&ask=' + ASK + '&osk=' + OSK;
                        }
                    }

                    //console.log(data[i]["imageUrl"]);

                }
            }
            return angular.copy(data);
        }

        $appService.getSession = function () {
            var currentSession = {};
            if (!$appService.getCookie("usk")) {
                return null;
            }
            currentSession["usk"] = $appService.getCookie("usk");
            currentSession["roleid"] = $appService.getCookie("roleid");
            currentSession["userid"] = $appService.getCookie("userid");
            currentSession["firstname"] = $appService.getCookie("firstname");
            currentSession["username"] = $appService.getCookie("username");
            if ($appService.getCookie("storeid")) {
                currentSession["storeid"] = $appService.getCookie("storeid");
                currentSession["companyLogoUrl"] = $appService.getCookie("companyLogoUrl");
                currentSession["programid"] = $appService.getCookie("programid");
            }
            if ($appService.getCookie("programid")) {
                currentSession["programid"] = $appService.getCookie("programid");
            }
            return currentSession;
        }
        $appService.getLocation = function () {
            var currentLocation = {};
            if (!$appService.getCookie("usk")) {
                return null;
            }
            currentLocation["selectedLoc"] = $appService.getCookie("selectedLoc");
            return  currentLocation;
        }
        $appService.deleteAllCookie = function () {
            $appService.delete_cookie("usk");
            $appService.delete_cookie("role");
            $appService.delete_cookie("userid");
            $appService.delete_cookie("firstname");
            $appService.delete_cookie("storeid");
            $appService.delete_cookie("storename");
            $appService.delete_cookie("adminView");
            $appService.delete_cookie("companyLogoUrl");
            $appService.delete_cookie("selectedLoc");
            $appService.delete_cookie("username");
            $appService.delete_cookie("programid");
        }


        $appService.auth = function () {
            if ($appService.getSession() == null || $appService.getSession() == "null") {
                window.location.href = "#!/login";
            }
        }
        $appService.unauth = function () {
            //console.log(JSON.stringify($appService.getCookie("usk")));
            if ($appService.getCookie("usk")) {
                window.location.href = "/";
                return false;
            }
        }
        $appService.createFile = function (storeId, programId, promos, ask, osk, usk, callBack) {
            if (!ask) {
                throw "No ask found for saving";
            }
            var params;
            if (usk) {
                params = {"storeId": storeId, "programId": programId, "ask": ask, "osk": osk, "usk": usk, "promos": JSON.stringify(promos)};
            }
            else {
                params = {"storeId": storeId, "programId": programId, "ask": ask, "osk": osk, "promos": JSON.stringify(promos)};

            }
            var url = BAAS_SERVER + "/create/file/cstore";
            this.getDataFromJQuery(url, params, "POST", "JSON", function (callBackData) {
                callBack(callBackData);
            });
        }
        $appService.getCountries = function () {
            var countries = {};
            var query = {"table": "countries__cstore"};
            query.columns = ["name", "_id"];
            var queryParams = {query: JSON.stringify(query), "ask": ASK, "osk": OSK};
            var serviceUrl = "/rest/data";
            this.getDataFromJQuery(serviceUrl, queryParams, "GET", "JSON", function (countryData) {
                countries = countryData.response.data;
            }, function (jqxhr, error) {
            })
            return countries;
        }
        return $appService;
    }
]);
getURLParam = function (strParamName) {
    var strReturn = "";
    var strHref = window.location.href;
    if (strHref.indexOf("?") > -1) {
        var strQueryString = strHref.substr(strHref.indexOf("?"));
        var aQueryString = strQueryString.split("&");
        for (var iParam = 0; iParam < aQueryString.length; iParam++) {
            if (
                aQueryString[iParam].indexOf(strParamName.toLowerCase() + "=") > -1) {
                var aParam = aQueryString[iParam].split("=");
                strReturn = aParam[1];
                break;
            }
        }
    }
    return unescape(strReturn);
}
