const http = require('http');
const https = require('https');

function getName(name, path, callback){
    return new Promise(((resolve, reject) => {
        var get_data = '';
        
        var headers = {
        'Connection': 'keep-alive',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'http://directorio.uva.es',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'http://directorio.uva.es/search',
        'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7'
        };
        
        var get_options = {
            hostname: 'albergueweb1.uva.es',
            path: path,
            method: 'GET',
            agent: new https.Agent({ rejectUnauthorized: false }),
            headers: headers
        };
        
        var responseString = '';
        
         // Request set up
        var get_req = https.request(get_options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                responseString += chunk;
                console.log(chunk);
            });
            res.on('end', function () {
                // Correct authentication
                if (res.statusCode === 200) {
                    resolve(callback(null, JSON.parse(responseString)));
                }
                // Unknown error
                else {
                    console.log(responseString);
                    let error = "Unknown problem while reaching the cloud server." +
                        "Please check the address configuration or contact the server administrator.";
                    reject(callback(error, null));
                }
            });
        });
        get_req.write(get_data);
        get_req.end();
    }));
}



function getWebPage(path, callback){
    //console.log(path);
    return new Promise(((resolve, reject) => {
        var get_data = '';
        
        var headers = {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
        };
        
        var get_options = {
            hostname: 'www.uva.es',
            path: path,
            method: 'GET',
            agent: new https.Agent({ rejectUnauthorized: false }),
            headers: headers
        };
        
        var responseString = '';
        
         // Request set up
        var get_req = https.request(get_options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                responseString += chunk;
//                console.log(chunk);
            });
            res.on('end', function () {
                // Correct authentication
                if (res.statusCode === 200) {
//                    console.log(responseString);
                    resolve(callback(null, responseString));
                }
                // Unknown error
                else {
                    console.log(responseString);
                    let error = "Unknown problem while reaching the cloud server." +
                        "Please check the address configuration or contact the server administrator.";
                    reject(callback(error, null));
                }
            });
        });
        get_req.write(get_data);
        get_req.end();
    }));
}

module.exports = {
    getName,
    getWebPage,
}
