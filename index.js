const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const busboy = require('busboy');

const hostName = '127.0.0.1'
const port = 3000

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/plain');

  if (req.method === 'POST') {
    const bb = busboy({ headers: req.headers });
    bb.on('file', (name, file, info) => {
      // destructuring the info object to get the filename, encoding and mimeType
      const { filename, encoding, mimeType } = info;
      console.log(
        `File [${name}]: filename: ${filename}, encoding: ${encoding}, mimeType: ${mimeType}}`);

      // set the path to save the file  
      const saveTo = path.join(`${os.homedir()}/Downloads`, `${filename}`);

      console.log(`File [${name}] is saving to ${saveTo}`)

      // save the file
      file.pipe(fs.createWriteStream(saveTo));

      file.on('data', (data) => {
        console.log(`File [${name}] got ${data.length} bytes`);
      }).on('close', () => {
        console.log(`File [${name}] done`);
      });
    });
    bb.on('field', (name, val, info) => {
      console.log(`Field [${name}]: value: `, val);
    });
    bb.on('close', () => {
      console.log('Done parsing form!');
      res.end('Done parsing form!');
    });

    // pipe the request to busboy to parse the form data
    req.pipe(bb);
  } else if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    // send a form with a two text inputs and one file input
    res.end(`
      <form action="/" method="post" enctype="multipart/form-data">
        <input type="text" name="name" placeholder="name">
        <input type="text" name="email" placeholder="email">
        <input type="file" name="avatar">
        <button type="submit">Submit</button>
      </form>`);
  }
});

// start the server and listen on port 3000
server.listen(port, hostName, () => {
  console.log(`Server running at http://${hostName}:${port}/`);
})