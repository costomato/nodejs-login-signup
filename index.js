const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongooseConnect = require("./public/utils/mongooseConnect");
const {
  sendResetLink,
  resetPassword,
  validateLink,
} = require("./public/controller/resetPassword");
const createUser = require("./public/controller/createUser");
const { updateUser, sendEmailUpdateLink } = require("./public/controller/updateUser");
const { readUsers, getId, getUserByToken } = require("./public/controller/readUsers");
const deleteUser = require("./public/controller/deleteUser");
const authenticateUser = require("./public/controller/authenticateUser");
const { sendVerificationOtp, verifyOtp, verifyNewEmail } = require("./public/controller/verifyUser");

const sendMail = require("./public/utils/sendMail");
const sendMailOld = require("./public/utils/sendMailOld");

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.API_KEY;
const PRIMARY_ENDPOINT = "/api/v1";
mongooseConnect();

const app = express();
const server = require('http').createServer(app)
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

async function checkAuthentication(req, res) {
  console.log("Incoming")
  const response = await getUserByToken(req.cookies['user'], req.cookies['sessionToken']);
  if (response.statusOk && response.data.isVerified) {
    res.render("landing", {
      username: response.statusString
    }); return true
  }
  else if (response.statusOk) {
    res.render("verify-email", {
      email: response.data.email
    }); return true
  }
  return false
}

app.get('/', async (req, res, next) => {
  if (!await checkAuthentication(req, res))
    next() // if user is not in login session
})

app.get('/signup', async (req, res, next) => {
  b = false;
  if (req.cookies.sessionToken)
    b = await checkAuthentication(req, res)
  if (!b)
    next()
})

app.get('/forgot-password', async (req, res, next) => {
  b = false;
  if (req.cookies.sessionToken)
    b = await checkAuthentication(req, res)
  if (!b)
    next()
})

app.use('/', express.static('frontend/login'));
app.use('/signup', express.static('frontend/signup'));
app.use('/forgot-password', express.static('frontend/forgot-password'));

app.get(PRIMARY_ENDPOINT, (req, res) => {
  res.send("The Rest Api is working!");
});

app.get(`${PRIMARY_ENDPOINT}/getAllUsers`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    res.send(await readUsers());
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});


app.post(`${PRIMARY_ENDPOINT}/getId`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    res.send(await getId(req.body.email, req.body.password));
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});


app.post(`${PRIMARY_ENDPOINT}/createNewUser`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    const created = await createUser(
      req.body.name,
      req.body.email,
      req.body.password
    );
    res.send(created);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.post(`${PRIMARY_ENDPOINT}/updateUser`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    const response = await updateUser(req.body._id, req.body.password, req.body.sessionToken, req.body.update);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.get('/updateEmail', async (req, res) => {
  const response = await verifyNewEmail(req.query.fromEmail, req.query.toEmail, req.query.link);
  res.send(response.statusString);
})

app.post(`${PRIMARY_ENDPOINT}/getEmailUpdateLink`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    const response = await sendEmailUpdateLink(req.body.oldEmail, req.body.password, req.body.sessionToken || req?.cookies?.sessionToken, req.body.newEmail);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
})

app.post(`${PRIMARY_ENDPOINT}/authenticateUser`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    const response = await authenticateUser(req.body.email, req.body.password, req.body.sessionToken || req?.cookies?.sessionToken);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.post(`${PRIMARY_ENDPOINT}/getResetLink`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    const response = await sendResetLink(req.body.email);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.get(`/resetPassword`, async (req, res) => {
  const response = await validateLink(req.query.user, req.query.link);
  res.render("reset-password", {
    link: req.query.link,
    email: req.query.user,
    statusOk: response.statusOk,
    statusString: response.statusString
  });
});

app.post(`/resetPassword`, async (req, res) => {
  if (req.headers["api-key"] === "different") {
    const response = await resetPassword(
      req.body.email,
      req.body.link,
      req.body.password
    );
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.delete(`${PRIMARY_ENDPOINT}/deleteUser`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    const response = await deleteUser(req.body._id, req.body.email, req.body.password);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.post(`${PRIMARY_ENDPOINT}/sendOtp`, async (req, res) => {
  /*
    req.body contains:
    email, name, _id, 
     */
  if (req.headers["api-key"] === API_KEY) {
    const response = await sendVerificationOtp(req.body);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.post(`${PRIMARY_ENDPOINT}/verifyOtp`, async (req, res) => {
  /*
  req.body contains
  _id, email, _otp  
  */
  if (req.headers["api-key"] === API_KEY) {
    const response = await verifyOtp(req.body);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.post(`${PRIMARY_ENDPOINT}/sendMail`, async (req, res) => {
  /*
  req.body contains
  first name, last name, email, message, phone
  */
  if (req.headers["api-key"] === API_KEY) {
    const response = await sendMail(req.body);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.post(`${PRIMARY_ENDPOINT}/sendMailOld`, async (req, res) => {
  /*
  req.body contains
  first name, last name, email, message, phone
  */
  if (req.headers["api-key"] === API_KEY) {
    const response = await sendMailOld(req.body);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});


/*
// -start- handling messages

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

const { setMessage, setRoomMessage, getMessage, getRoomMessages, deleteRoomMessage } = require('./public/controller/messageController')
app.post(`${PRIMARY_ENDPOINT}/setMessage`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    const response = await setMessage(req.body);
    io.emit('message', req.body)
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.post(`${PRIMARY_ENDPOINT}/getMessage`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    const response = await getMessage(req.body);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});

app.post(`${PRIMARY_ENDPOINT}/getRoomMessages`, async (req, res) => {
  if (req.headers["api-key"] === API_KEY) {
    const response = await getRoomMessages(req.body);
    res.send(response);
  } else {
    res.send({ statusOk: false, statusString: "API authentication failed" });
  }
});
// upto here

// Public chatting
io.on('connection', (socket) => {
  socket.on("room-message", async (message) => {
    if (typeof message == 'string')
      message = JSON.parse(message)
    const response = await setRoomMessage(message);
    if (response.statusOk)
      message._id = response._id
    io.emit("room-message", message);
  });

  socket.on('room-message-delete', (id) => {
    deleteRoomMessage(id)
    io.emit('room-message-delete', id)
  })
});

// upto here


// Private chatting

const sockets = {};
const getChatSocket = (socket) => {
  return sockets['chat-user-' + socket];
}

const setChatSocket = (socket, data) => {
  sockets['chat-user-' + socket] = data;
}

const deleteChatSocket = (socket) => {
  delete sockets["chat-user-" + socket];
}

io.on('private-connection', (socket) => {
  console.log("New user connected to private connection")
  socket.on('connect-user', (userId) => {
    socket.socketid = userId;
    setChatSocket(socket.socketid, socket);
    console.log(sockets);
  });

  socket.on('disconnect', () => {
    deleteChatSocket(socket.socketid);
  });

  socket.on('message', (message) => {
    const receiver = getChatSocket(message.receiver)
    if (receiver)
      receiver.emit('message', { body: message.body, sender: message.sender });
  });
})

// upto here
// -end- handling messages
*/

app.all('*', (_, res) => {
  res.redirect('/')
});

server.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`);
});
