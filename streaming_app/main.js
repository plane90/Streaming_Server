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
    var videoInfoes = {
        'fileCount': 0,
        'filePath': [],
        'common': []
    }
    var files = fs.readdirSync('public/recorded');
    files.forEach(file => {
        if (path.extname(file) === '.m3u8') {
            videoInfoes.fileCount += 1;
            videoInfoes.filePath.push(file);
        }
    });
    videoInfoes.common.push({ 'dir': 'recorded', 'format': 'm3u8', 'version': 0.0001 });
    response.json(videoInfoes);
});

app.get('/public/recorded/:filepath', (request, response) => {
    var filePath = path.join(__dirname, request.url);
    filePath = filePath.replace(/%20/g, " ");
    fs.stat(filePath, function (err, stat) {
        if(!stat || err){
            console.log(err);
            response.status(404).end();
        } else {
            switch (path.extname(request.url)) {
                case '.m3u8':
                    response.set('Content-Type', 'application/vnd.apple.mpegurl');
                    fs.createReadStream(filePath).pipe(response);
                    break;
                case '.ts':
                    response.setHeader('Content-Type', 'video/MP2T');
                    fs.createReadStream(filePath).pipe(response);
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