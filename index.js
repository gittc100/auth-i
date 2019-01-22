const express = require('express');
const bcrypt = require('bcryptjs');

const db = require('./database/dbCon.js');

const server = express();

server.use(express.json());

// Helper functions

const serverError = res => err => {
    res.status(500).json(err);
};

const postSuccess = res => id => {
    res.status(201).json(id);
};


// protect this route, only authenticated users should see it
server.get("/api/users", (req, res) => {
    db("users")
      .select("id", "username")
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send(err));
  });
  
  // Registry post
  
  server.post("/api/register", (req, res) => {
    const user = req.body;
    user.password = bcrypt.hashSync(user.password, 16);
    db("users")
      .insert(user)
      .then(postSuccess(res))
      .catch(serverError(res));
  });
  
  // Login post
  
  server.post("/api/login", (req, res) => {
    // check user and pass match
    const user = req.body;
    
    db("users").where('username', user.username)
      .then(users=>{
        // comparison between hashes
        if(users.length && bcrypt.compareSync(user.password, users[0].password)){
          res.json({info: "correct"});
        }else{
          res.status(404).json({err: "invalid username or password"});
        }
      })
      .catch(serverError(res));
  });

const port = 2345;
server.listen(port, ()=>{
    console.log(`server runnig on ${port}`);
});