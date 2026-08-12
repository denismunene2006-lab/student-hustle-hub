require('./instrument');
const { spawn } = require('child_process');

const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development' },
});

let serverOutput = '';
server.stdout.on('data', (d) => { serverOutput += d.toString(); });
server.stderr.on('data', (d) => { serverOutput += d.toString(); });

setTimeout(() => {
  fetch('http://localhost:5000/api/sentry-test')
    .then((res) => {
      console.log('ENDPOINT RESPONSE STATUS:', res.status);
      return res.json();
    })
    .then((body) => {
      console.log('ENDPOINT RESPONSE BODY:', JSON.stringify(body));
      server.kill();
      setTimeout(() => process.exit(0), 500);
    })
    .catch((e) => {
      console.error('REQUEST FAILED:', e.message);
      server.kill();
      process.exit(1);
    });
}, 1500);