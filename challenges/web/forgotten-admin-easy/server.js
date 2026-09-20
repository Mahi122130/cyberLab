const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 8083;
const FLAG = process.env.FLAG || 'CYBERLAB{source_comments_leak_secrets}';

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Staff Account Recovery</title>
      <style>
        body { font-family: monospace; background: #080c14; color: #f1f5f9; padding: 40px; }
        .card { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
        h1 { color: #38bdf8; font-size: 20px; }
        p { color: #94a3b8; font-size: 13px; line-height: 1.6; }
        input { width: 100%; box-sizing: border-box; padding: 10px; margin: 8px 0 16px; background: #080c14; border: 1px solid #334155; color: white; border-radius: 4px; }
        button { width: 100%; padding: 12px; background: #38bdf8; border: none; font-weight: bold; color: #000; border-radius: 4px; cursor: pointer; }
        .alert { background: #1e293b; border-left: 3px solid #f59e0b; padding: 12px; margin: 20px 0; font-size: 12px; color: #cbd5e1; }
      </style>
      <!-- ========================================================================= -->
      <!-- DEVELOPER NOTE: Emergency admin password reset mechanism                   -->
      <!-- If the administrator forgot credentials, query the debug recovery endpoint:-->
      <!-- GET /debug/forgot-password?account=admin                                  -->
      <!-- Token can be redeemed at /redeem-token                                    -->
      <!-- ========================================================================= -->
    </head>
    <body>
      <div class="card">
        <h1>[!] Emergency Staff Account Recovery</h1>
        <p>This portal is intended for employees who have forgotten their administrator or staff credentials.</p>
        
        <div class="alert">
          Notice: Standard password resets are forwarded to the Help Desk queue (24-48 hr turnaround). Inspect developer console or page source for troubleshooting guidelines.
        </div>

        <form method="POST" action="/request-reset">
          <label>Employee Username or Email</label>
          <input type="text" name="account" placeholder="e.g. admin" required />
          <button type="submit">Submit Recovery Request</button>
        </form>

        <p style="margin-top: 25px; text-align: center;">
          Already have an emergency recovery token? <a href="/redeem-token" style="color: #38bdf8;">Redeem Token Here</a>
        </p>
      </div>
    </body>
    </html>
  `);
});

app.post('/request-reset', (req, res) => {
  const account = req.body.account;
  res.send(`
    <body style="background:#080c14; color:#94a3b8; font-family:monospace; padding:40px; text-align:center;">
      <div style="max-width:500px; margin:0 auto; background:#0f172a; padding:30px; border:1px solid #1e293b; border-radius:8px;">
        <h3 style="color:#f59e0b;">Reset Request Queued</h3>
        <p>A recovery ticket has been logged for <code>${account}</code>.</p>
        <p style="font-size:12px;">Standard users must wait for Help Desk validation. Developers can check internal debug comments in page source.</p>
        <a href="/" style="color:#38bdf8;">Return</a>
      </div>
    </body>
  `);
});

app.get('/debug/forgot-password', (req, res) => {
  const account = req.query.account;
  if (account === 'admin') {
    return res.json({
      status: 'debug_success',
      account: 'admin',
      role: 'superadmin',
      emergency_token: 'EMERGENCY_ADMIN_TOKEN_7749',
      instructions: 'Submit this token at /redeem-token to claim administrative access and recover the flag.'
    });
  }
  res.status(400).json({
    status: 'error',
    message: 'Debug endpoint active. Please supply query parameter ?account=admin'
  });
});

app.get('/redeem-token', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redeem Recovery Token</title>
      <style>
        body { font-family: monospace; background: #080c14; color: #f1f5f9; padding: 40px; }
        .card { max-width: 500px; margin: 40px auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 30px; }
        h2 { color: #4ade80; margin-top: 0; }
        input { width: 100%; box-sizing: border-box; padding: 10px; margin: 8px 0 16px; background: #080c14; border: 1px solid #334155; color: white; border-radius: 4px; }
        button { width: 100%; padding: 12px; background: #4ade80; border: none; font-weight: bold; color: #000; border-radius: 4px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Redeem Emergency Token</h2>
        <p style="font-size:12px; color:#94a3b8;">Enter the emergency recovery token found via debug notes:</p>
        <form method="POST" action="/redeem-token">
          <label>Emergency Token</label>
          <input type="text" name="token" placeholder="EMERGENCY_..." required />
          <button type="submit">Verify Token</button>
        </form>
        <p style="text-align:center; margin-top:20px;"><a href="/" style="color:#38bdf8;">Back to Home</a></p>
      </div>
    </body>
    </html>
  `);
});

app.post('/redeem-token', (req, res) => {
  const token = req.body.token?.trim();
  if (token === 'EMERGENCY_ADMIN_TOKEN_7749') {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Account Restored</title>
        <style>
          body { font-family: monospace; background: #05080d; color: #4ade80; padding: 40px; text-align: center; }
          .panel { max-width: 600px; margin: 40px auto; background: #0a111a; border: 2px solid #22c55e; border-radius: 8px; padding: 30px; box-shadow: 0 0 25px rgba(34, 197, 94, 0.25); }
          .flag { background: #0f2415; border: 2px dashed #4ade80; padding: 20px; font-size: 18px; font-weight: bold; margin: 25px 0; }
        </style>
      </head>
      <body>
        <div class="panel">
          <h2>[+] RECOVERY SUCCESSFUL</h2>
          <p style="color:#94a3b8;">Admin account credentials recovered from source code leakage.</p>
          <div class="flag">
            FLAG: ${FLAG}
          </div>
          <p style="color:#cbd5e1; font-size:13px;">Submit this flag into CyberLab to complete the challenge!</p>
          <a href="/" style="color:#38bdf8;">Return to Home</a>
        </div>
      </body>
      </html>
    `);
  }

  res.status(401).send(`
    <body style="background:#080c14; color:#ef4444; font-family:monospace; padding:40px; text-align:center;">
      <h3>Invalid Recovery Token</h3>
      <p style="color:#94a3b8;">The token supplied does not match any active emergency reset token.</p>
      <a href="/redeem-token" style="color:#38bdf8;">Try Again</a>
    </body>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`the forgoten admin target running on port ${PORT}`);
});
