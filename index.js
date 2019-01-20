const express = require('express');

const server = express();
server.use(express.json());


const port = 2345;
server.listen(port, ()=>{
    console.log(`server runnig on ${port}`);
});