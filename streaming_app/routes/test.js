var express = require('express');
var router = express.Router();
var template = require('../lib/template');

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

module.exports = router;