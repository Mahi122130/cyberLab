const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

const FLAG =
  process.env.FLAG ||
  "CYBERLAB{idor_basic_001}";

const users = {
  1: {
    id: 1,
    username: "student",
  },

  2: {
    id: 2,
    username: "admin",
  },
};

const notes = {
  1: {
    id: 1,
    owner_id: 1,
    title: "Welcome",
    content:
      "Welcome to CyberLab. Your first challenge starts here.",
  },

  2: {
    id: 2,
    owner_id: 2,
    title: "Admin Secret",
    content:
      `Internal administrator note. FLAG: ${FLAG}`,
  },
};

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CyberLab Notes</title>

        <style>
          body {
            font-family: monospace;
            background: #05080d;
            color: white;
            max-width: 800px;
            margin: 60px auto;
            padding: 20px;
          }

          a {
            color: #34d399;
          }

          .card {
            border: 1px solid #1f2937;
            padding: 20px;
            margin-top: 20px;
            background: #0a1019;
          }
        </style>
      </head>

      <body>

        <h1>CyberLab Notes</h1>

        <p>
          Welcome to the internal notes system.
        </p>

        <div class="card">
          <h2>Your Notes</h2>

          <p>
            <a href="/notes/1">
              View note #1
            </a>
          </p>
        </div>

      </body>
    </html>
  `);
});


/*
 * INTENTIONALLY VULNERABLE
 *
 * The application does not verify whether
 * the requested note belongs to the current user.
 */
app.get("/notes/:id", (req, res) => {
  const id = Number(req.params.id);

  const note = notes[id];

  if (!note) {
    return res.status(404).send("Note not found");
  }

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${note.title}</title>

        <style>
          body {
            font-family: monospace;
            background: #05080d;
            color: white;
            max-width: 800px;
            margin: 60px auto;
            padding: 20px;
          }

          .card {
            border: 1px solid #1f2937;
            padding: 20px;
            background: #0a1019;
          }

          .flag {
            color: #34d399;
            font-weight: bold;
          }
        </style>
      </head>

      <body>

        <div class="card">

          <h1>${note.title}</h1>

          <p>
            ${note.content}
          </p>

        </div>

      </body>
    </html>
  `);
});


app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `IDOR challenge running on port ${PORT}`
  );
});