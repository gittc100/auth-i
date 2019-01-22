const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);
const db = require("./database/dbCon.js");

const server = express();

const sessionConfig = {
  name: "Session Identification", // default sid
  secret: "anything34k534kjhksdfpo",
  cookie: {
    maxAge: 1000 * 60 * 10, // 10 min
    secure: false // only send cookie over https, should be true in production process.env variable false for developement
  },
  httpOnly: true, // js can't touch this,
  resave: false, // check laws
  saveUninitialized: false, // check docs
  store: new KnexSessionStore({
    tablename: "sessions",
    sidfieldname: "sid",
    knex: db,
    createtable: true,
    clearInterval: 1000 * 60 * 10
  })
};

server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(session(sessionConfig));
// Helper functions

const serverError = res => err => {
  res.status(500).json(err);
};

const postSuccess = res => id => {
  res.status(201).json(id);
};

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

  db("users")
    .where("username", user.username)
    .then(users => {
      // comparison between hashes
      if (
        users.length &&
        bcrypt.compareSync(user.password, users[0].password)
      ) {
        req.session.user = user;
        res.status(200).json({ Logged_In: `welcome ${user.username}` });
      } else {
        res.status(404).json({ err: "Invalid Username or Password you shall not pass!" });
      }
    })
    .catch(serverError(res));
});

function protect(req, res, next){
  if(req.session && req.session.user){
    next();
  } else {
    res.status(401).json({ message: "Not Authenticated you shall not pass!" });
  }
}

// protect this route, only authenticated users should see it
server.get("/api/users", protect, (req, res) => {
  // const user = await db("users");
  // res.status(200).json(user);
  db("users")
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => res.send(err));
});

server.get("/api/logout", (req, res) => {
  if(req.session){
    req.session.destroy(err=>{
      if(err){
        res.status(500).send('did not log out');
      }else{
        res.status(200).json('bye');
      }
    });
  }else {
    res.json({message: 'logged out already'});
  }
});

const port = 2345;
server.listen(port, () => {
  console.log(`server runnig on ${port}`);
});
