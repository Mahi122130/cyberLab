const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || "CYBERLAB{idor_profile_access_2026}";

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Fake database
|--------------------------------------------------------------------------
|
| The application represents a small banking portal.
|
| The currently logged-in user is John (1001).
|
| The vulnerability is that the API trusts the user-supplied
| object ID instead of verifying that the requested object
| belongs to the authenticated user.
|
*/

const users = {
  1: {
    id: 1,
    username: "admin",
    email: "admin@cyberlab.local",
    role: "administrator",
    department: "Security Operations",
    account_status: "active",
    flag: FLAG
  },

  1001: {
    id: 1001,
    username: "john",
    email: "john@cyberlab.local",
    role: "customer",
    department: "Retail Banking",
    account_status: "active"
  },

  1002: {
    id: 1002,
    username: "alice",
    email: "alice@cyberlab.local",
    role: "customer",
    department: "Retail Banking",
    account_status: "active"
  },

  1003: {
    id: 1003,
    username: "michael",
    email: "michael@cyberlab.local",
    role: "customer",
    department: "Business Banking",
    account_status: "active"
  }
};

const transactions = {
  1001: [
    {
      id: "TX-10001",
      type: "deposit",
      amount: 2500,
      currency: "ETB",
      status: "completed"
    },
    {
      id: "TX-10002",
      type: "payment",
      amount: 350,
      currency: "ETB",
      status: "completed"
    }
  ],

  1002: [
    {
      id: "TX-10003",
      type: "deposit",
      amount: 5200,
      currency: "ETB",
      status: "completed"
    }
  ],

  1003: [
    {
      id: "TX-10004",
      type: "withdrawal",
      amount: 700,
      currency: "ETB",
      status: "completed"
    }
  ],

  1: [
    {
      id: "TX-ADM01",
      type: "internal",
      amount: 0,
      currency: "ETB",
      status: "restricted"
    }
  ]
};


/*
|--------------------------------------------------------------------------
| Simulated authentication
|--------------------------------------------------------------------------
|
| For this training challenge, authentication is intentionally simplified.
| Every request is treated as the logged-in user John.
|
| This allows the learner to focus specifically on authorization.
|
*/

function getCurrentUser() {
  return users[1001];
}


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  req.user = getCurrentUser();
  next();
});


/*
|--------------------------------------------------------------------------
| Challenge landing page
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>CyberLab Bank</title>

  <style>

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family:
        Inter,
        Arial,
        sans-serif;

      background:
        linear-gradient(
          135deg,
          #020617,
          #0f172a
        );

      color: #e2e8f0;
      min-height: 100vh;
    }

    .navbar {
      height: 64px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 0 40px;

      background: #020617;
      border-bottom: 1px solid #1e293b;
    }

    .logo {
      font-weight: 700;
      font-size: 18px;
      color: #38bdf8;
    }

    .user {
      color: #94a3b8;
      font-size: 14px;
    }

    .container {
      max-width: 1000px;
      margin: 60px auto;
      padding: 0 20px;
    }

    .banner {
      padding: 30px;

      background:
        linear-gradient(
          135deg,
          #0f172a,
          #172554
        );

      border:
        1px solid
        #1e40af;

      border-radius: 14px;

      margin-bottom: 25px;
    }

    .banner h1 {
      margin: 0 0 10px;
      font-size: 30px;
    }

    .banner p {
      color: #94a3b8;
      line-height: 1.6;
    }

    .grid {
      display: grid;

      grid-template-columns:
        repeat(
          auto-fit,
          minmax(280px, 1fr)
        );

      gap: 20px;
    }

    .card {
      background: #0f172a;

      border:
        1px solid
        #1e293b;

      border-radius: 12px;

      padding: 25px;
    }

    .card h2 {
      margin-top: 0;
      font-size: 19px;
    }

    .profile-row {
      display: flex;
      justify-content: space-between;

      padding: 12px 0;

      border-bottom:
        1px solid
        #1e293b;
    }

    .profile-row:last-child {
      border-bottom: none;
    }

    .label {
      color: #64748b;
    }

    .value {
      color: #e2e8f0;
      font-weight: 600;
    }

    code {
      background: #020617;

      color: #38bdf8;

      padding:
        5px
        8px;

      border-radius: 5px;

      font-family:
        "Courier New",
        monospace;
    }

    .endpoint {
      margin-top: 15px;

      padding: 15px;

      background: #020617;

      border-radius: 8px;

      border:
        1px solid
        #1e293b;
    }

    .hint {
      margin-top: 25px;

      padding: 18px;

      background:
        rgba(
          245,
          158,
          11,
          0.08
        );

      border:
        1px solid
        rgba(
          245,
          158,
          11,
          0.3
        );

      border-radius: 8px;

      color: #fbbf24;
    }

    .objective {
      color: #cbd5e1;
      line-height: 1.7;
    }

  </style>

</head>

<body>

  <nav class="navbar">

    <div class="logo">
      CYBERLAB BANK
    </div>

    <div class="user">
      Logged in as:
      <strong>john</strong>
    </div>

  </nav>


  <main class="container">

    <section class="banner">

      <h1>
        Account Security Portal
      </h1>

      <p>
        Welcome back, John.
        Your account information is available
        through the banking API.
      </p>

    </section>


    <div class="grid">

      <section class="card">

        <h2>
          Your Profile
        </h2>

        <div class="profile-row">

          <span class="label">
            Username
          </span>

          <span class="value">
            john
          </span>

        </div>

        <div class="profile-row">

          <span class="label">
            Email
          </span>

          <span class="value">
            john@cyberlab.local
          </span>

        </div>

        <div class="profile-row">

          <span class="label">
            Account ID
          </span>

          <span class="value">
            1001
          </span>

        </div>

        <div class="profile-row">

          <span class="label">
            Role
          </span>

          <span class="value">
            customer
          </span>

        </div>

      </section>


      <section class="card">

        <h2>
          API
        </h2>

        <p class="objective">

          The web application retrieves account
          information from a backend API.

        </p>

        <div class="endpoint">

          <code>
            GET /api/me
          </code>

        </div>

        <div class="endpoint">

          <code>
            GET /api/profile/1001
          </code>

        </div>

        <div class="endpoint">

          <code>
            GET /api/transactions/1001
          </code>

        </div>

      </section>

    </div>


    <div class="hint">

      <strong>Security Notice</strong>

      <br><br>

      The banking application uses numeric identifiers
      when requesting account resources.

      Investigate how the API determines which account
      information a user is allowed to access.

    </div>

  </main>

</body>

</html>
  `);
});


/*
|--------------------------------------------------------------------------
| Current user
|--------------------------------------------------------------------------
|
| This endpoint tells the learner who they are authenticated as.
|
*/

app.get("/api/me", (req, res) => {

  const user = req.user;

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  });

});


/*
|--------------------------------------------------------------------------
| VULNERABLE PROFILE ENDPOINT
|--------------------------------------------------------------------------
|
| INTENTIONALLY VULNERABLE
|
| The application accepts an object identifier from the URL:
|
|     /api/profile/:id
|
| However, it does NOT verify that the requested ID belongs
| to the authenticated user.
|
| This is the core IDOR / Broken Object Level Authorization
| vulnerability.
|
*/

app.get("/api/profile/:id", (req, res) => {

  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {

    return res.status(400).json({
      error: "Invalid account identifier"
    });

  }

  const user = users[userId];

  if (!user) {

    return res.status(404).json({
      error: "Account not found"
    });

  }

  /*
   * INTENTIONAL VULNERABILITY
   *
   * Missing authorization check:
   *
   * if (userId !== req.user.id) {
   *   return res.status(403).json({
   *     error: "Forbidden"
   *   });
   * }
   *
   * Because that check is missing,
   * another user's profile can be accessed.
   */

  res.json(user);

});


/*
|--------------------------------------------------------------------------
| VULNERABLE TRANSACTIONS ENDPOINT
|--------------------------------------------------------------------------
|
| This endpoint demonstrates that the same authorization mistake
| exists in another object.
|
*/

app.get("/api/transactions/:id", (req, res) => {

  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {

    return res.status(400).json({
      error: "Invalid account identifier"
    });

  }

  if (!transactions[userId]) {

    return res.status(404).json({
      error: "Transactions not found"
    });

  }

  /*
   * INTENTIONAL AUTHORIZATION FLAW
   */

  res.json({
    account_id: userId,
    transactions: transactions[userId]
  });

});


/*
|--------------------------------------------------------------------------
| Account search
|--------------------------------------------------------------------------
|
| This endpoint gives the learner some realistic application
| behavior without directly exposing the administrator account.
|
*/

app.get("/api/accounts", (req, res) => {

  const accounts = Object.values(users)
    .filter(user => user.id !== 1)
    .map(user => ({
      id: user.id,
      username: user.username,
      email: user.email
    }));

  res.json({
    accounts
  });

});


/*
|--------------------------------------------------------------------------
| Health check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {

  res.json({
    status: "ok",
    service: "cyberlab-banking-api",
    version: "1.0.0"
  });

});


/*
|--------------------------------------------------------------------------
| 404 handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {

  res.status(404).json({
    error: "Endpoint not found"
  });

});


/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `CyberLab Bank IDOR challenge running on port ${PORT}`
  );

});