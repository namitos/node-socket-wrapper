const { server, request } = require('.');

let testData = [];

for (let i = 0; i < 1000; i++) {
  testData.push({
    a: Math.random(),
    b: Math.random(),
    c: Math.random(),
    d: Math.random(),
    e: Math.random(),
    f: Math.random(),
    g: Math.random(),
    h: Math.random(),
    i: Math.random(),
    j: Math.random(),
    k: Math.random(),
    l: Math.random(),
    m: Math.random(),
    n: Math.random(),
    o: Math.random(),
    p: Math.random(),
    q: Math.random(),
    r: Math.random(),
    s: Math.random(),
    t: Math.random()
  });
}

// require('fs').writeFile('testData.json', JSON.stringify(testData), () => {});

server(8000, async ({ data, type }) => {
  console.log(`data from client ${data.length} type ${type}`);
  return { data, type: 123 };
});

(async () => {
  try {
    let { data, type } = await request({ host: '127.0.0.1', port: 8000 }, {});
    console.log(`data from server ${data.length} type ${type}`);

  } catch (err) {
    console.log('request err', err);
  }
})();

(async () => {
  try {
    let { data, type } = await request({ host: '127.0.0.1', port: 8000 }, { data: testData, type: 12345 });
    console.log(`data from server ${data.length} type ${type}`);
  } catch (err) {
    console.log('request err', err);
  }
})();
