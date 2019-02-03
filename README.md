# socket-wrapper

custom lightweight protocol based on sockets

###server

```javascript
const { server } = require('socket-wrapper');

server(8000, async (data) => {
  console.log('data from client', data.length);
  return data;
});
```

###client

```javascript
const { request } = require('socket-wrapper');

let testData = { foo: 'bar' };
try {
  let data = await request({ host: '127.0.0.1', port: 8000 }, testData);
  console.log('data from server', data.length);
} catch (err) {
  console.log('request err', err);
}
```
