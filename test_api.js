const fetch = require('node-fetch');

async function test() {
    const res = await fetch('http://localhost:3000/api/user/69a66d48f6f76233d373e674/posts');
    const data = await res.json();
    console.log(data);
}
test();
