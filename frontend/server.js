const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Accept connections from any IP
const port = 3000;

// SSL certificates from mkcert
const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', '152.168.1.34+2-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', '152.168.1.34+2.pem')),
};

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(httpsOptions, async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    }).listen(port, hostname, (err) => {
        if (err) throw err;
        console.log(`> Ready on https://${hostname}:${port}`);
        console.log(`> Also available on https://152.168.1.34:${port}`);
    });
});
