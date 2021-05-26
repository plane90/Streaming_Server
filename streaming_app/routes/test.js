var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var path = require('path');

router.get('/test-streaming', (request, response) => {

    var html = template.testHtml(
        `
        <div id="container"></div>
        <video id="video" loop muted crossOrigin="anonymous" playsinline style="display:none">
            <source id="videoSrc" src="/master.m3u8" type="application/x-mpegURL">
        </video>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
        <script type="module">
            // Our Javascript will go here.

            import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 24;

            // create renderer(=add <canvas>)
            const container = document.getElementById('container');
            const renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            container.appendChild(renderer.domElement);

            // create geometry
            const geometry = new THREE.PlaneGeometry(60, 32);

            // create material
            const video = document.getElementById('video');
            var hls = new Hls();
            hls.loadSource(document.getElementById('videoSrc').getAttribute('src'));
            hls.attachMedia(video);
            video.play();
            const texture = new THREE.VideoTexture(video);
            const material = new THREE.MeshBasicMaterial({
                map: texture
            });

            // create mesh
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            }
            animate();

            window.addEventListener( 'resize', onWindowResize );

			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}

        </script>`
    )
    response.send(html);
});

router.get('/test-multiview/:screenNum', (request, response) => {
    var screenNum = path.parse(request.params.screenNum).base;
    console.log(screenNum);

    var html = template.multiViewHtml(
        `
        <div id="${screenNum}">
        <video id="video" loop muted crossOrigin="anonymous" playsinline style="display:none">
            <source id="videoSrc" src="/2021-05-12 14-37-58.m3u8" type="application/x-mpegURL">
        </video>
        
        <script type="module">
            import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 24;

            // create renderer(=add <canvas>)
            const container = document.getElementById('container');
            const renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth / ${screenNum}, window.innerHeight / ${screenNum} );
            container.appendChild(renderer.domElement);

            // create geometry
            const geometry = new THREE.PlaneGeometry(80, 40);

            // create material
            const video = document.getElementById('video');
            var hls = new Hls();
            hls.loadSource(document.getElementById('videoSrc').getAttribute('src'));
            hls.attachMedia(video);
            video.play();
            const texture = new THREE.VideoTexture(video);
            const material = new THREE.MeshBasicMaterial({
                map: texture
            });

            // create mesh
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            }
            animate();

            window.addEventListener( 'resize', onWindowResize );

			function onWindowResize() {
				camera.aspect = window.innerWidth / ${screenNum} / window.innerWidth / ${screenNum};
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth / ${screenNum}, window.innerWidth / ${screenNum} );
			}

        </script>
        </div>`
    )
    response.send(html);
});

router.get('/multi_view/:screenCnt', (request, response) => {
    var screenCnt = path.parse(request.params.screenCnt).base;
    var videoNodes = "";
    for (var i = 0; i < screenCnt; i++) {
        if (i == 0) {
            videoNodes += template.createVideoNode(i, "/recorded/2021-05-12 14-37-58.m3u8");
        } else if (i == 1) {
            videoNodes += template.createVideoNode(i, "/recorded/master.m3u8");
        } else if (i == 2) {
            videoNodes += template.createVideoNode(i, "https://192.168.0.85/api/holographic/stream/live.mp4?holo=true&pv=true&mic=false&loopback=false&RenderFromCamera=false");
        }
    };
    var script = `
        <script type="module">
        for (var i = 0; i < ${screenCnt}; i++) {
            var hls = new Hls();
            var video = document.getElementById('video_' + i);
            hls.loadSource(document.getElementById('videoSrc_' + i).getAttribute('src'));
            hls.attachMedia(video);
            video.play();
        }
        </script>`;
    html = template.multiViewWithoutThree(videoNodes, script);
    response.set({
        'access-control-allow-origin': '*'
    });
    response.send(html);
});

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
    html = template.multiViewWithoutThree(videoNode, script);
    response.set({
        'access-control-allow-origin': '*'
    });
    response.send(html);
});

module.exports = router;