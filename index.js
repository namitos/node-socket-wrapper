const net = require('net');

const headerSize = 8 * 3; //for 3 64bit ints

function constructData(socket, cb) {
  let parts = [];
  let partI = 0;
  let sizeExpected = 0;
  let sizeActual = 0;
  socket.on('data', (part) => {
    sizeActual += part.length;
    if (partI === 0) {
      sizeExpected = part.readBigUInt64BE(0);
      type = part.readBigUInt64BE(8);
      sizeActual -= headerSize;
      part = part.slice(headerSize, part.length);
    }
    parts.push(part);
    partI++;
    if (sizeActual >= sizeExpected) {
      try {
        let resultBuffer = Buffer.concat(parts).toString();
        cb({data: JSON.parse(resultBuffer), type});
      } catch (err) {
        console.log(err, resultBuffer.substr(0, 1000))
      }
    }
  });
}

function writeData(socket, {data = {}, type = 0}) {
  let body = Buffer.from(JSON.stringify(data));
  let header = Buffer.alloc(headerSize);
  header.writeBigUInt64BE(BigInt(body.length), 0);
  header.writeBigUInt64BE(BigInt(type), 8);
  socket.write(Buffer.concat([header, body]));
}

/**
 *
 * @param {Number} port
 * @param {Function} cb
 */
function server(port, cb) {
  let server = net.createServer((socket) => {
    constructData(socket, async ({data, type}) => {
      try {
        let r = await cb({data, type});
        if (r) {
          writeData(socket, r);
        }
      } catch (err) {
        console.error('constructData cb exception', err);
      }
    });
    socket.on('error', (err) => {
      console.log('socket error', err);
    });

    //TODO: disconnect by timeout
  });
  server.on('error', (err) => {
    console.log('server error', err);
  });
  server.listen(port);
}

/**
 *
 * @param {Object} param0
 * @param {Object} data
 */
async function request({host, port}, {data, type}) {
  if (!data) {
    throw {type: 'SocketError', text: 'data is required'};
  }
  return new Promise((resolve, reject) => {
    try {
      let socket = new net.Socket();
      socket.connect(port, host, () => {
        writeData(socket, {data, type});
      });
      alreadyClosed = false;
      constructData(socket, async ({data, type}) => {
        resolve({data, type});
        socket.destroy();
        alreadyClosed = true;
      });
      socket.on('error', (err) => {
        console.error(err);
        reject({type: 'SocketError', err});
      });
      socket.on('close', (err) => {
        if (!alreadyClosed) {
          reject({type: 'SocketError', text: 'socket closed', err});
        }
      });
    } catch (err) {
      reject({type: 'SocketError', err, catch: true});
    }
  });
}

module.exports = {server, request};
