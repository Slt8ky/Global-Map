import { createServer } from 'https';
import { readFileSync } from 'fs';
import next from 'next';

const port = parseInt(process.env.PORT || '443', 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: readFileSync('certs/privkey.pem'),
    cert: readFileSync('certs/fullchain.pem'),
}

app.prepare().then(() => {
    createServer(httpsOptions, (req, res) => {
        handle(req, res);
    }).listen(port)

    console.log(`> Server listening at https://slt8ky.mooo.com:${port}`);
});