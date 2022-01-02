/**
 * Title: is-alive service
 * Description: Small utility app. Main purpose is to check if
 * selected services are up and running.
 * 
 */

const http = require('http');
// const https = require('https');
const { StringDecoder } = require('string_decoder');
const conf = require('./config.json');


// Define all app handlers. @TODO: move to separate file
const handlers = {
    foo: (data, callback) => {
        callback(200, { fizz: 'buzz' });
    },
    notFound: (data, callback) => {
        callback(404);
    }
}

// Routes router
const router = {
    'foo': handlers.foo
}


const httpServer = http.createServer((request, response) => {

    const url = new URL(request.url, `http://${request.headers.host}/`);
    const method = request.method.toLowerCase();
    const headers = request.headers;

    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    request.on('data', (requestData) => {
        buffer += decoder.write(requestData);
    });
    request.on('end', () => {
        buffer += decoder.end();

        const path = url.pathname.replace(/^\/+|\/+/g, '');
        const pickedHandler = typeof (router[path]) !== 'undefined' ? router[path] : handlers.notFound;

        const data = {
            url,
            method,
            headers
        };

        pickedHandler(data, (statusCode = 200, payload = {}) => {
            const payloadJSON = JSON.stringify(payload);
            response.writeHead(statusCode);
            response.end(payloadJSON);
        });
    });


});

// Start server
httpServer.listen(3000, () => {
    console.log('Server is up and running!', conf);
});

