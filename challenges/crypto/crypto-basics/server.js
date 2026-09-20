const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8087;
const FLAG = process.env.FLAG || 'CYBERLAB{crypto_multi_layer_decoding_solved}';

function rot13(str) {
  return str.replace(/[a-zA-Z]/g, function(c) {
    const code = c.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

const rot13Flag = rot13(FLAG);
const base64Cipher = Buffer.from(rot13Flag).toString('base64');

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Cryptographic Decryption Station</title>
      <style>
        body { font-family: monospace; background: #05080d; color: #f1f5f9; padding: 40px; }
        .card { max-width: 800px; margin: 0 auto; background: #0c121d; border: 1px solid #1e293b; border-radius: 8px; padding: 30px; }
        h1 { color: #38bdf8; font-size: 22px; margin-top: 0; }
        p { color: #94a3b8; line-height: 1.6; font-size: 13px; }
        .cipher-box { background: #020408; border: 1px dashed #f59e0b; padding: 20px; border-radius: 6px; margin: 20px 0; color: #fbbf24; font-size: 16px; word-break: break-all; }
        .tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px; }
        .tool { background: #070b12; border: 1px solid #1e293b; padding: 20px; border-radius: 6px; }
        label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
        textarea, input { width: 100%; box-sizing: border-box; padding: 10px; background: #05080d; border: 1px solid #334155; color: white; border-radius: 4px; font-family: monospace; margin-bottom: 12px; }
        button { width: 100%; padding: 10px; background: #38bdf8; color: black; border: none; font-weight: bold; border-radius: 4px; cursor: pointer; font-family: monospace; }
        .output-box { background: #020408; border: 1px solid #1e293b; padding: 10px; min-height: 40px; color: #4ade80; font-size: 13px; word-break: break-all; margin-top: 10px; border-radius: 4px; }
        .badge { background: #854d0e; color: #fef08a; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">INTERCEPTED TRANSMISSION</span>
        <h1>Cryptographic Analysis Workshop</h1>
        <p>
          Intelligence operators intercepted an encoded message transmitted over an untrusted satellite relay.
          Analysis indicates the message was encoded using a <strong>two-layer scheme: Base64 encoding over a ROT13 Caesar cipher</strong>.
        </p>

        <label>Intercepted Payload:</label>
        <div class="cipher-box" id="rawCipher">${base64Cipher}</div>

        <div class="tool-grid">
          <div class="tool">
            <h3>Layer 1: Base64 Decoder</h3>
            <label>Input Base64 String:</label>
            <textarea id="b64In" rows="3">${base64Cipher}</textarea>
            <button type="button" onclick="decodeB64()">Decode Base64</button>
            <label style="margin-top:12px;">Result (ROT13 Encrypted):</label>
            <div class="output-box" id="b64Out"></div>
          </div>

          <div class="tool">
            <h3>Layer 2: ROT13 Decipher</h3>
            <label>Input ROT13 Ciphertext:</label>
            <textarea id="rotIn" rows="3" placeholder="Paste decoded Base64 text here..."></textarea>
            <button type="button" onclick="decodeROT()">Apply ROT13 Shift</button>
            <label style="margin-top:12px;">Plaintext Flag:</label>
            <div class="output-box" id="rotOut"></div>
          </div>
        </div>

        <p style="margin-top: 25px; font-size: 12px; color: #64748b;">
          Once decoded, submit the recovered <code>CYBERLAB{...}</code> flag into the CyberLab platform to claim your points.
        </p>
      </div>

      <script>
        function decodeB64() {
          try {
            const raw = document.getElementById('b64In').value.trim();
            const decoded = atob(raw);
            document.getElementById('b64Out').textContent = decoded;
            document.getElementById('rotIn').value = decoded;
          } catch(e) {
            document.getElementById('b64Out').textContent = '[!] Invalid Base64 string';
          }
        }

        function decodeROT() {
          const str = document.getElementById('rotIn').value;
          const res = str.replace(/[a-zA-Z]/g, function(c) {
            const code = c.charCodeAt(0);
            const base = code >= 97 ? 97 : 65;
            return String.fromCharCode(((code - base + 13) % 26) + base);
          });
          document.getElementById('rotOut').textContent = res;
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cryptography Fundamentals target running on port ${PORT}`);
});
