require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const http = require('http');
const path = require('path');

const port = 8080;

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      fontSrc: [
        '\'self\'',
        'https://fonts.gstatic.com',
      ],
      objectSrc: ['\'none\''],
      scriptSrc: [
        '\'self\'',
        process.env.NODE_ENV === 'development' && '\'unsafe-inline\'',
      ].filter(Boolean),
      styleSrc: [
        '\'self\'',
        'https://fonts.googleapis.com/css',
        process.env.NODE_ENV === 'development' && '\'unsafe-inline\'',
      ].filter(Boolean),
      upgradeInsecureRequests: true,
    },
  },
  referrerPolicy: {
    policy: 'same-origin',
  },
}));

app.use(express.static(path.join(__dirname, 'wwwroot')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'wwwroot/index.html'));
});

const server = http.createServer(app);
server.on('listening', () => {
  const address = server.address();
  const binding = typeof addr === 'string'
    ? 'pipe ' + address
    : 'port ' + address.port;
  console.log('Listening on %s', binding);
});

server.listen(port);
