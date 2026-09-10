const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || "CYBERLAB{idor_profile_access_2026}";

const users = {
  1: {
    id: 1,
    username: "admin",
    email: "admin@cyberlab.local",
    role: "admin",
    flag: FLAG
  },

  1001: {
    id: 1001,
    username: "john",
    email: "john@cyberlab.local",
    role: "user"
  },

  1002: {
    id: 1002,
    username: "alice",
    email: "alice@cyberlab.local",
    role: "user"
  }
};

app.use(express.json());

/*
 * Challenge homepage
 */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>CyberLab Bank</title>

  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0f172a;
      color: white;
    }

    .container {
      max-width: 800px;
      margin: 80px auto;
      padding: 20px;
    }

    .card {
      background: #1e293b;
      padding: 35px;
      border-radius: 12px;
    }

    h1 {
      margin-top: 0;
    }

    .profile {
      margin-top: 25px;
      padding: 20px;
      background: #0f172a;
      border-radius: 8px;
    }

    code {
      background: #020617;
      padding: 5px 8px;
      border-radius: 5px;
      color: #38bdf8;
    }

    .hint {
      margin-top: 25px;
      color: #94a3b8;
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="card">

      <h1>🏦 CyberLab Bank</h1>

      <p>Welcome to your account.</p>

      <div class="profile">

        <h2>Your Profile</h2>

        <p>
          Username:
          <strong>john</strong>
        </p>

        <p>
          Email:
          <strong>john@cyberlab.local</strong>
        </p>

        <p>
          Account ID:
          <code>1001</code>
        </p>

      </div>

      <div class="hint">

        <p>
          Your profile is loaded from:
        </p>

        <code>/api/profile/1001</code>

      </div>

    </div>

  </div>

</body>
</html>
  `);
});


/*
 * INTENTIONALLY VULNERABLE ENDPOINT
 *
 * The application does not verify whether
 * the requested profile belongs to the
 * currently authenticated user.
 */
app.get("/api/profile/:id", (req, res) => {

  const userId = Number(req.params.id);

  const user = users[userId];

  if (!user) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  res.json(user);
});


/*
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`IDOR challenge running on port ${PORT}`);
});