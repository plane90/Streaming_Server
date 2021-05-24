const express = require('express');
const app = express();
const port = 8000;

var helmet = require('helmet');
var csp = require('helmet-csp');
var compression = require('compression');

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

var normalRouter = require('./routes/normal');
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

app.use('/normal', normalRouter);
app.use('/test', testRouter);

app.use(function (req, res, next) {
    res.status(404).send("404 there's no page you requested ...")
})

app.listen(port, () => {
    console.log(`streaming test app listening at http://localhost:${port}`);
})