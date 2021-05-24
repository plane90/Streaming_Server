var express = require('express');
var router = express.Router();
var path = require('path');
var template = require('../lib/template');

router.get('/:video', (request, response) => {
    var video = path.parse(request.params.video).base;
    // "_IS_ -> /"
    var videoUrl = video.replace(/_IS_/g, "/");
    var html = template.html(
        `
        <div id="container"></div>
        <video id="video" loop muted crossOrigin="anonymous" playsinline style="display:none">
            <source id="videoSrc" src="https://${videoUrl}" type="application/x-mpegURL">
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
    );
    response.send(html);
})

module.exports = router;