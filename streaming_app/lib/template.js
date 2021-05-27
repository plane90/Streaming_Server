module.exports = {
    html: function (body) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>My first three.js app</title>
                <link rel="shortcut icon" href="#">
            </head>
            <body>
            </video>
                ${body}
            </body>
            </html>`;
    },

    withoutThreeHtml: function (videoNodes, script) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>My first app</title>
            <link rel="shortcut icon" href="#">
        </head>
        <body>
            <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
            <div id="container">${videoNodes}</div>
            ${script}
        </body>
        </html>`;
    },

    createVideoNodeHtml: function (videoNum, src) {
        return `
        <div id=${videoNum}>
        <video id="video_${videoNum}" loop muted crossOrigin="anonymous" playsinline>
            <source id="videoSrc_${videoNum}" src="${src}" type="application/x-mpegURL">
        </video>
        </div>`;
    },

}