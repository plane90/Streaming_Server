const express = require('express');
const app = express();
const port = 8080;

var helmet = require('helmet');
var csp = require('helmet-csp');
var compression = require('compression');
var fs = require('fs');
var path = require('path');

app.use(express.static('public'));
app.use(helmet());
app.use(
    helmet.frameguard({
        action: "sameorigin",
    })
);
app.use(
    csp({
        directives: {
            defaultSrc: ["'self'", "'unsafe-inline'", "https:", "blob:"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https:", "blob:"],
        },
    })
);
app.use(compression());

var testRouter = require('./routes/test');

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    //res.setHeader('X-Frame-Options','Allow-From http://10.112.59.112:8000');
    res.setHeader('X-Frame-Options','sameorigin');
    next();
});

app.get('/*', (request, response, next) => {
    next();
});

app.get('/get/videos_info', (request, response, next) => {
    response.json({ filePath: ['2021-05-12 14-37-58.m3u8', 'master.m3u8'] });
    //response.status(500).json({ error: 'message' })
});

app.get('/public/recorded/:seq', (request, response) => {
    var filename = path.join(__dirname, request.url);
    filename = filename.replace(/%20/g, " ");
    fs.stat(filename, function (err, stat) {
        console.log('sending file: ' + filename);
        console.log(path.extname(request.url));
        if(!stat || err){
            console.log(err);
            response.status(404).end();
        } else {
            switch (path.extname(request.url)) {
                case '.m3u8':
                    response.set('Content-Type', 'application/vnd.apple.mpegurl');
                    fs.createReadStream(filename).pipe(response);
                    break;
                case '.ts':
                    response.setHeader('Content-Type', 'video/MP2T');
                    fs.createReadStream(filename).pipe(response);
                    break;
            }
        }
    });
})

app.use('/test', testRouter);

app.use(function (req, res, next) {
    res.status(404).send("404 there's no page you requested ...")
})

app.listen(port, () => {
    console.log(`streaming test app listening at http://localhost:${port}`);
})