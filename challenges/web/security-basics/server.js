const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 8085;
const FLAG = process.env.FLAG || 'CYBERLAB{http_headers_and_cookies_mastered}';

// Custom header on all responses
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'CyberLab-SecEngine/2.4');
  res.setHeader('X-CyberLab-Flag', FLAG);
  next();
});

app.get('/', (req, res) => {
  let role = req.cookies.user_role;
  if (!role) {
    role = 'guest';
    res.cookie('user_role', 'guest', { path: '/' });
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Web Security Fundamentals - Inspect & Learn</title>
      <style>
        body { font-family: monospace; background: #080c14; color: #f1f5f9; padding: 40px; }
        .card { max-width: 700px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 30px; }
        h1 { color: #38bdf8; font-size: 22px; }
        p { color: #94a3b8; line-height: 1.6; }
        .box { background: #1e293b; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #38bdf8; }
        .btn { display: inline-block; background: #38bdf8; color: #000; padding: 10px 18px; border-radius: 4px; text-decoration: none; font-weight: bold; margin-right: 10px; cursor: pointer; border: none; }
        .btn-outline { background: transparent; border: 1px solid #38bdf8; color: #38bdf8; }
        .badge { background: #334155; color: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
        #audit-log { margin-top: 20px; background: #05080d; padding: 15px; border-radius: 6px; font-size: 12px; display: none; color: #34d399; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>[+] HTTP Security Inspector</h1>
        <p>This web application demonstrates how browsers communicate with servers via HTTP headers and cookies.</p>

        <div class="box">
          <div><strong>Current Session Role:</strong> <span class="badge" id="role-display">${role}</span></div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">
            Servers send client cookies and custom headers. When you open your browser Developer Tools (F12) and inspect the <strong>Network</strong> tab or <strong>Application &gt; Cookies</strong> tab, examine the HTTP headers returned by the server.
          </p>
        </div>

        <button class="btn" onclick="fetchAudit()">Trigger HTTP Request &amp; Inspect Headers</button>
        <a href="/admin-panel" class="btn btn-outline">Visit Admin Panel</a>

        <div id="audit-log"></div>
      </div>

      <script>
        async function fetchAudit() {
          const res = await fetch('/api/session-info');
          const data = await res.json();
          const log = document.getElementById('audit-log');
          log.style.display = 'block';
          log.innerHTML = '<strong>[+] Request complete!</strong> Check DevTools Network tab for response headers (Look for <code>X-CyberLab-Flag</code>) or inspect the payload:<br><br>' + JSON.stringify(data, null, 2);
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/api/session-info', (req, res) => {
  const role = req.cookies.user_role || 'guest';
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    client_role: role,
    tip: 'Did you check the HTTP response headers in the Network tab? Notice X-CyberLab-Flag!'
  });
});

app.get('/admin-panel', (req, res) => {
  const role = req.cookies.user_role;
  if (role === 'admin') {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Area - Authorized</title>
        <style>
          body { font-family: monospace; background: #05080d; color: #4ade80; padding: 40px; text-align: center; }
          .panel { max-width: 600px; margin: 0 auto; background: #0a111a; border: 2px solid #22c55e; border-radius: 8px; padding: 30px; }
          .flag { background: #0f2415; border: 2px dashed #4ade80; padding: 20px; font-size: 18px; font-weight: bold; margin: 25px 0; }
        </style>
      </head>
      <body>
        <div class="panel">
          <h2>[+] ADMIN ACCESS GRANTED</h2>
          <p style="color:#94a3b8;">Cookie <code>user_role=admin</code> verified successfully!</p>
          <div class="flag">
            FLAG: ${FLAG}
          </div>
          <a href="/" style="color:#38bdf8;">Return Home</a>
        </div>
      </body>
      </html>
    `);
  }

  res.status(403).send(`
    <body style="background:#080c14; color:#ef4444; font-family:monospace; padding:40px; text-align:center;">
      <h3>[!] 403 Forbidden</h3>
      <p style="color:#94a3b8;">Current cookie role is: <code>${role || 'none'}</code>.</p>
      <p style="color:#64748b; font-size:12px;">Only users with cookie <code>user_role=admin</code> can access this administrative console directly.</p>
      <a href="/" style="color:#38bdf8;">Return Home</a>
    </body>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web Security Basics target running on port ${PORT}`);
});
