const express = require('express');
const app = express();
const port = 10081;

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
    res.setHeader('X-Frame-Options', 'sameorigin');
    next();
});

app.get('/*', (request, response, next) => {
    next();
});

app.get('/video', function (req, res) {
    var files = fs.readdirSync('public/live');
    console.log(files[0]);
    const filePath = path.join('public/live', files[0]);
    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const range = req.headers.range
    console.log("req.headers.range " + req.headers.range);
    console.log("fileSize " + fileSize);
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ?
            parseInt(parts[1], 10) :
            fileSize - 1
        const chunksize = (end - start) + 1
        const file = fs.createReadStream(filePath, {
            start,
            end
        })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        console.log("chunksize " + chunksize);
        console.log("start " + start);
        console.log("end " + end);
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        console.log("else ");
        res.writeHead(200, head)
        fs.createReadStream(filePath).pipe(res)
    }
});

app.get('/videos/info', (request, response, next) => {
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
    videoInfoes.common.push({
        'dir': 'recorded',
        'format': 'm3u8',
        'version': 0.0001
    });
    response.json(videoInfoes);
});

app.get('/public/recorded/:filepath', (request, response) => {
    var filePath = path.join(__dirname, request.url);
    filePath = filePath.replace(/%20/g, " ");
    fs.stat(filePath, function (err, stat) {
        if (!stat || err) {
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