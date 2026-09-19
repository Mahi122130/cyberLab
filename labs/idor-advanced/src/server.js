const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const FLAG = process.env.FLAG || 'CYBERLAB{dummy_flag}';

// Simulated database
const users = {
  1: { id: 1, username: 'admin', role: 'admin', secret: FLAG },
  2: { id: 2, username: 'guest', role: 'user', secret: 'guest_secret' },
  3: { id: 3, username: 'john', role: 'user', secret: 'john_secret' }
};

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Secure Portal</title></head>
      <body style="font-family: monospace; background: #111; color: #eee; padding: 20px;">
        <h2>Welcome to the Secure Portal</h2>
        <p>Please login.</p>
        <form method="POST" action="/login">
          <input type="text" name="username" placeholder="Username" style="padding: 5px;"/>
          <button type="submit" style="padding: 5px 10px;">Login</button>
        </form>
        <p>Try logging in as 'guest' or 'john'</p>
      </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  let userId = null;
  
  if (username === 'guest') userId = 2;
  else if (username === 'john') userId = 3;

  if (userId) {
    res.cookie('userId', userId.toString());
    res.redirect('/profile');
  } else {
    res.send('Invalid user. <a href="/">Go back</a>');
  }
});

app.get('/profile', (req, res) => {
  const userId = req.cookies.userId;
  
  if (!userId) {
    return res.redirect('/');
  }

  // IDOR Vulnerability: We trust the user-provided cookie without verifying session/auth
  const user = users[userId];

  if (user) {
    res.send(`
      <body style="font-family: monospace; background: #111; color: #eee; padding: 20px;">
        <h2>User Profile</h2>
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Secret Data:</strong> ${user.secret}</p>
        <br>
        <a href="/" style="color: cyan;">Log out</a>
      </body>
    `);
  } else {
    res.status(404).send('User not found');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
