const net = require('net');

const headerSize = 4; //for 32bit int

function constructData(socket, cb) {
  let parts = [];
  let partI = 0;
  let sizeExpected = 0;
  let sizeActual = 0;
  socket.on('data', (part) => {
    // console.log('constructData ondata', part.toString());
    sizeActual += part.length;
    if (partI === 0) {
      sizeExpected = part.readUInt32BE(0);
      sizeActual -= headerSize;
      part = part.slice(headerSize, part.length);
      // console.log('part', part.toString());
    }
    parts.push(part);
    partI++;
    if (sizeActual >= sizeExpected) {
      let resultBuffer = Buffer.concat(parts);
      cb(JSON.parse(resultBuffer.toString()));
    }
  });
}

function writeData(socket, data) {
  let body = Buffer.from(JSON.stringify(data));
  let header = Buffer.alloc(headerSize);
  header.writeUInt32BE(body.length, 0);
  socket.write(Buffer.concat([header, body]));
}

/**
 *
 * @param {Number} port
 * @param {Function} cb
 */
function server(port, cb) {
  let server = net.createServer((socket) => {
    constructData(socket, async (data) => {
      try {
        let r = await cb(data);
        if (r) {
          writeData(socket, r);
        }
      } catch (err) {
        console.error('constructData cb exception', err);
      }
    });
    socket.on('server error', (err) => {
      console.log('server error', err);
    });
    //TODO: disconnect by timeout
  });
  server.listen(port);
}

/**
 *
 * @param {Object} param0
 * @param {Object} data
 */
async function request({ host, port }, data) {
  if (!data) {
    throw { type: 'SocketError', text: 'data is required' };
  }
  return new Promise((resolve, reject) => {
    try {
      let socket = new net.Socket();
      socket.connect(port, host, () => {
        writeData(socket, data);
      });

      constructData(socket, async (data) => {
        resolve(data);
        socket.destroy();
      });

      socket.on('error', (err) => {
        reject({ type: 'SocketError', err });
      });
    } catch (err) {
      reject({ type: 'SocketError', err, catch: true });
    }
  });
}

module.exports = { server, request };
