const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8086;
const FLAG = process.env.FLAG || 'CYBERLAB{network_service_banner_recon}';

const mockServices = {
  21: { service: 'ftp', state: 'open', banner: '220 ProFTPD 1.3.5 Server (CyberLab Internal FTP Ready)' },
  22: { service: 'ssh', state: 'open', banner: 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6' },
  80: { service: 'http', state: 'open', banner: 'HTTP/1.1 200 OK\r\nServer: nginx/1.18.0 (Ubuntu)\r\nContent-Type: text/html' },
  443: { service: 'https', state: 'closed', banner: null },
  3306: { service: 'mysql', state: 'filtered', banner: null },
  8080: { service: 'http-proxy / internal-api', state: 'open', banner: `HTTP/1.1 200 OK\r\nServer: CyberLab-Internal-Recon-Node/1.0\r\nX-Service-Secret: ${FLAG}\r\nContent-Type: application/json\r\n\r\n{"status":"active","flag":"${FLAG}"}` }
};

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Network Reconnaissance Station</title>
      <style>
        body { font-family: monospace; background: #05080d; color: #f1f5f9; padding: 40px; }
        .card { max-width: 800px; margin: 0 auto; background: #0b1320; border: 1px solid #1e293b; border-radius: 8px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        h1 { color: #38bdf8; font-size: 22px; margin-top: 0; }
        p { color: #94a3b8; line-height: 1.6; font-size: 13px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .panel { background: #070b12; border: 1px solid #1e293b; border-radius: 6px; padding: 20px; }
        label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
        input, select { width: 100%; box-sizing: border-box; padding: 10px; background: #05080d; border: 1px solid #334155; color: white; border-radius: 4px; font-family: monospace; margin-bottom: 15px; }
        button { width: 100%; padding: 12px; background: #38bdf8; color: black; border: none; font-weight: bold; border-radius: 4px; cursor: pointer; font-family: monospace; }
        button:hover { background: #7dd3fc; }
        #results { background: #020408; border: 1px solid #1e293b; padding: 20px; border-radius: 6px; margin-top: 25px; white-space: pre-wrap; color: #4ade80; font-size: 13px; min-height: 120px; }
        .badge { background: #0369a1; color: #e0f2fe; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">NETWORK RECON WORKSTATION</span>
        <h1>Service Discovery &amp; Port Enumeration</h1>
        <p>
          Network reconnaissance is the first phase in any security assessment. Use this interactive probing workstation to enumerate services on target <code>10.0.5.15</code> (CyberLab Internal Gateway) and inspect response service banners.
        </p>

        <div class="grid">
          <div class="panel">
            <h3>Step 1: Port Scan Target</h3>
            <label>Target IP</label>
            <input type="text" id="targetIp" value="10.0.5.15" readonly />
            <button type="button" onclick="runPortScan()">Run TCP Port Scan</button>
          </div>

          <div class="panel">
            <h3>Step 2: Service Banner Grab</h3>
            <label>Port to Probe</label>
            <input type="number" id="probePort" placeholder="e.g. 21, 22, 80, 8080" value="8080" />
            <button type="button" onclick="runBannerGrab()">Grab Service Banner</button>
          </div>
        </div>

        <label>Console Output:</label>
        <div id="results">// Ready. Click "Run TCP Port Scan" or enter a port to grab service banner...</div>
      </div>

      <script>
        async function runPortScan() {
          const resEl = document.getElementById('results');
          resEl.textContent = '[*] Scanning 10.0.5.15 for common ports...\n';
          const res = await fetch('/api/scan?ip=10.0.5.15');
          const data = await res.json();
          let out = '[+] Port Scan Report for 10.0.5.15:\\n';
          out += 'PORT       STATE    SERVICE\\n';
          out += '-------------------------------------\\n';
          for (const item of data.ports) {
            out += item.port.toString().padEnd(11) + item.state.padEnd(9) + item.service + '\\n';
          }
          out += '\\n[*] Notice open internal service on port 8080! Probe port 8080 to inspect its banner.';
          resEl.textContent = out;
        }

        async function runBannerGrab() {
          const port = document.getElementById('probePort').value;
          const resEl = document.getElementById('results');
          resEl.textContent = '[*] Connecting to 10.0.5.15:' + port + '...\\n';
          const res = await fetch('/api/banner?port=' + port);
          const data = await res.json();
          if (data.banner) {
            resEl.textContent = '[+] Banner Grab Successful on port ' + port + ':\\n\\n' + data.banner;
          } else {
            resEl.textContent = '[-] Port ' + port + ' is ' + data.state + '. No banner received.';
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/api/scan', (req, res) => {
  const portsList = Object.keys(mockServices).map(p => ({
    port: Number(p),
    state: mockServices[p].state,
    service: mockServices[p].service
  }));
  res.json({
    target: req.query.ip || '10.0.5.15',
    scan_type: 'SYN Stealth',
    ports: portsList
  });
});

app.get('/api/banner', (req, res) => {
  const port = Number(req.query.port);
  const target = mockServices[port];
  if (!target) {
    return res.json({ port, state: 'closed', banner: null });
  }
  res.json({
    port,
    state: target.state,
    service: target.service,
    banner: target.banner
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Network Reconnaissance target running on port ${PORT}`);
});
