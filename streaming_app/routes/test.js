var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var fs = require('fs');
var path = require('path');

router.get('/recorded/', (request, response) => {
    var videoNode = `
    <div id=recorded_play>
    <video id="video" loop muted crossOrigin="anonymous" playsinline>
        <source id="videoSrc" src="/recorded/2021-05-12 14-37-58.m3u8" type="application/x-mpegURL">
    </video>
    </div>`;
    var script = `
        <script type="module">
        var hls = new Hls();
        var video = document.getElementById('video');
        hls.loadSource(document.getElementById('videoSrc').getAttribute('src'));
        hls.attachMedia(video);
        video.play();
        video.setAttribute('height', window.innerHeight);
        video.setAttribute('width', window.innerWidth);

        window.addEventListener( 'resize', onWindowResize );
        function onWindowResize() {
            video.setAttribute('height', window.innerHeight);
            video.setAttribute('width', window.innerWidth);
        }

        </script>`;
    html = template.withoutThreeHtml(videoNode, script);
    response.set({
        'access-control-allow-origin': '*'
    });
    response.send(html);
});


router.get('/live', function (req, res) {
    var files = fs.readdirSync('public/live');
    console.log(files[0]);
    const filePath = path.join('public/live', files[0]);
    const head = {
        'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(filePath).pipe(res)
    // const stat = fs.statSync(filePath)
    // const fileSize = stat.size
    // const range = req.headers.range
    // console.log("req.headers.range " + req.headers.range);
    // console.log("fileSize " + fileSize);
    // if (range) {
    //     const parts = range.replace(/bytes=/, "").split("-")
    //     const start = parseInt(parts[0], 10)
    //     const end = parts[1] ?
    //         parseInt(parts[1], 10) :
    //         fileSize - 1
    //     const chunksize = (end - start) + 1
    //     const file = fs.createReadStream(filePath, {
    //         start,
    //         end
    //     })
    //     const head = {
    //         'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    //         'Accept-Ranges': 'bytes',
    //         'Content-Length': chunksize,
    //         'Content-Type': 'video/mp4',
    //     }
    //     console.log("chunksize " + chunksize);
    //     console.log("start " + start);
    //     console.log("end " + end);
    //     res.writeHead(206, head);
    //     file.pipe(res);
    // } else {
    //     const head = {
    //         'Content-Length': fileSize,
    //         'Content-Type': 'video/mp4',
    //     }
    //     console.log("else ");
    //     res.writeHead(200, head)
    //     fs.createReadStream(filePath).pipe(res)
    // }
});

module.exports = router;