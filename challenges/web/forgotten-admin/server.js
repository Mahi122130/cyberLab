const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 8082;
const FLAG = process.env.FLAG || 'CYBERLAB{forgotten_admin_portal_exposed}';

// robots.txt exposing forgotten admin path and backup file
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nDisallow: /admin-portal/\nDisallow: /admin-portal/system.bak\n`);
});

// Leaked backup configuration
app.get('/admin-portal/system.bak', (req, res) => {
  res.type('application/json');
  res.send(JSON.stringify({
    portal: "CyberCorp Legacy Management Portal",
    environment: "production-deprecated",
    notice: "This legacy portal is maintained for emergency failover only.",
    default_credentials: {
      username: "admin",
      emergency_key: "cyberadmin2026"
    },
    last_audit: "2024-11-12"
  }, null, 2));
});

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>CyberCorp Employee Gateway</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f17; color: #e2e8f0; margin: 0; padding: 40px 20px; }
        .container { max-width: 800px; margin: 0 auto; background: #131c2d; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        h1 { color: #38bdf8; margin-top: 0; font-size: 24px; }
        p { line-height: 1.6; color: #94a3b8; }
        .badge { display: inline-block; background: #0369a1; color: #e0f2fe; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; }
        .info-box { background: #0f172a; border-left: 4px solid #38bdf8; padding: 16px; margin: 24px 0; border-radius: 4px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; }
        code { background: #1e293b; color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="badge">SECURE INTRANET</span>
        <h1>CyberCorp Staff Gateway</h1>
        <p>Welcome to the centralized internal resources gateway for CyberCorp staff and contractors.</p>
        
        <div class="info-box">
          <strong>System Notice:</strong> Routine infrastructure migrations are underway. Legacy administrative services have been archived. All web spiders and scrapers must respect established crawler exclusion standards.
        </div>

        <h3>Active Internal Services</h3>
        <ul>
          <li><span style="color:#94a3b8">Mail & Calendar Services (Exchange Online)</span></li>
          <li><span style="color:#94a3b8">HR Self-Service Portal</span></li>
          <li><span style="color:#94a3b8">Jira Project Management & Confluence Documentation</span></li>
        </ul>

        <div class="footer">
          CyberCorp Security Operations &copy; 2026. Standard robot crawlers index this portal following standard exclusions.
        </div>
      </div>
    </body>
    </html>
  `);
});

// Admin login portal
app.get('/admin-portal', (req, res) => {
  const session = req.cookies.admin_session;
  if (session === 'authorized_master_2026') {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CyberCorp Master Admin Portal</title>
        <style>
          body { font-family: monospace; background: #05080d; color: #4ade80; padding: 40px; }
          .panel { max-width: 700px; margin: 0 auto; background: #0a111a; border: 1px solid #22c55e; border-radius: 8px; padding: 30px; box-shadow: 0 0 20px rgba(34, 197, 94, 0.2); }
          .flag-box { background: #0f2415; border: 2px dashed #4ade80; padding: 20px; text-align: center; font-size: 18px; font-weight: bold; margin: 25px 0; border-radius: 6px; }
          .btn { background: #ef4444; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="panel">
          <h2>[+] CYBERCORP LEGACY ADMIN CONSOLE</h2>
          <p>Authentication Status: AUTHORIZED ROOT</p>
          <p>You have accessed the forgotten administrative portal for CyberCorp.</p>
          <div class="flag-box">
            FLAG: ${FLAG}
          </div>
          <p>Remember to submit this flag to the CyberLab challenge submission form!</p>
          <a href="/admin-portal/logout" class="btn">LOGOUT</a>
        </div>
      </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin Portal Login</title>
      <style>
        body { font-family: monospace; background: #0b0f17; color: #e2e8f0; padding: 40px; }
        .card { max-width: 450px; margin: 40px auto; background: #131c2d; border: 1px solid #334155; border-radius: 8px; padding: 30px; }
        h2 { color: #f59e0b; margin-top: 0; }
        input { width: 100%; box-sizing: border-box; padding: 10px; margin: 8px 0 20px; background: #0b0f17; border: 1px solid #475569; color: white; border-radius: 4px; }
        button { width: 100%; padding: 12px; background: #f59e0b; border: none; font-weight: bold; color: #000; border-radius: 4px; cursor: pointer; }
        button:hover { background: #d97706; }
        .err { color: #ef4444; margin-bottom: 12px; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>CyberCorp Legacy Admin</h2>
        <p style="font-size:12px; color:#94a3b8;">Restricted Access &bull; Authorized Personnel Only</p>
        <form method="POST" action="/admin-portal/login">
          <label>Username</label>
          <input type="text" name="username" placeholder="e.g. admin" required />
          <label>Emergency Key / Password</label>
          <input type="password" name="password" placeholder="Key or Password" required />
          <button type="submit">Sign In to Admin</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/admin-portal/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'cyberadmin2026') {
    res.cookie('admin_session', 'authorized_master_2026', { httpOnly: true });
    return res.redirect('/admin-portal');
  }
  res.status(401).send(`
    <body style="background:#0b0f17; color:#ef4444; font-family:monospace; padding:40px; text-align:center;">
      <h3>[!] Authentication Failed</h3>
      <p style="color:#94a3b8;">Invalid username or emergency key.</p>
      <a href="/admin-portal" style="color:#38bdf8;">Back to Login</a>
    </body>
  `);
});

app.get('/admin-portal/logout', (req, res) => {
  res.clearCookie('admin_session');
  res.redirect('/admin-portal');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`The Forgotten Admin target running on port ${PORT}`);
});
