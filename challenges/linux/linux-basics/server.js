const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8084;
const FLAG = process.env.FLAG || 'CYBERLAB{linux_hidden_file_2026}';

// Ensure /home/ctf and .flag.txt exist
const CTF_DIR = '/home/ctf';
if (!fs.existsSync(CTF_DIR)) {
  fs.mkdirSync(CTF_DIR, { recursive: true });
}
fs.writeFileSync(path.join(CTF_DIR, '.flag.txt'), FLAG + '\n');
fs.writeFileSync(path.join(CTF_DIR, 'notes.txt'), 'Welcome to Linux Fundamentals!\nRemember that in Linux, files beginning with a dot (.) are hidden by default.\n');
if (!fs.existsSync(path.join(CTF_DIR, 'workspace'))) {
  fs.mkdirSync(path.join(CTF_DIR, 'workspace'), { recursive: true });
}

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Linux Terminal - CyberLab</title>
      <style>
        body { margin: 0; background: #05080d; color: #34d399; font-family: 'Courier New', Courier, monospace; display: flex; flex-direction: column; height: 100vh; }
        #header { background: #0c1322; padding: 10px 20px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }
        #term-container { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; }
        .line { margin-bottom: 6px; line-height: 1.4; white-space: pre-wrap; word-break: break-all; }
        .cmd-line { color: #38bdf8; font-weight: bold; }
        .output { color: #e2e8f0; }
        .prompt { color: #34d399; font-weight: bold; }
        #input-row { display: flex; align-items: center; margin-top: 10px; }
        #cmd-input { flex: 1; background: transparent; border: none; outline: none; color: #38bdf8; font-family: inherit; font-size: 15px; margin-left: 8px; }
        .badge { background: #065f46; color: #a7f3d0; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
      </style>
    </head>
    <body>
      <div id="header">
        <div><strong>CYBERLAB LINUX TERMINAL</strong> &bull; Host: <code>cyberlab-alpine</code></div>
        <div><span class="badge">ONLINE</span> &bull; User: <code>ctf</code></div>
      </div>
      <div id="term-container" onclick="document.getElementById('cmd-input').focus()">
        <div class="line output">Linux cyberlab-linux 6.6.0-ctf #1 SMP Alpine Linux x86_64</div>
        <div class="line output">Welcome to CyberLab Linux Fundamentals challenge environment!</div>
        <div class="line output">Your current directory is: /home/ctf</div>
        <div class="line output">Type commands below (e.g. 'ls', 'ls -la', 'cat <filename>', 'pwd') to begin your investigation.</div>
        <div class="line output">--------------------------------------------------------------------------------</div>
        <div id="history"></div>
        <div id="input-row">
          <span class="prompt">ctf@cyberlab-linux:~$</span>
          <input type="text" id="cmd-input" autofocus autocomplete="off" spellcheck="false" />
        </div>
      </div>
      <script>
        const input = document.getElementById('cmd-input');
        const history = document.getElementById('history');
        const term = document.getElementById('term-container');
        let currentDir = '/home/ctf';

        input.addEventListener('keydown', async (e) => {
          if (e.key === 'Enter') {
            const command = input.value;
            input.value = '';
            if (!command.trim()) return;

            const cmdDiv = document.createElement('div');
            cmdDiv.className = 'line cmd-line';
            cmdDiv.textContent = 'ctf@cyberlab-linux:~$ ' + command;
            history.appendChild(cmdDiv);

            if (command.trim() === 'clear') {
              history.innerHTML = '';
              return;
            }

            try {
              const res = await fetch('/api/exec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command, cwd: currentDir })
              });
              const data = await res.json();
              if (data.cwd) currentDir = data.cwd;

              const outDiv = document.createElement('div');
              outDiv.className = 'line output';
              outDiv.textContent = data.output || (data.error ? '[Error] ' + data.error : '');
              history.appendChild(outDiv);
            } catch (err) {
              const errDiv = document.createElement('div');
              errDiv.className = 'line output';
              errDiv.style.color = '#ef4444';
              errDiv.textContent = 'Command execution failed: ' + err.message;
              history.appendChild(errDiv);
            }
            term.scrollTop = term.scrollHeight;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Safe execution API
app.post('/api/exec', (req, res) => {
  let { command, cwd } = req.body;
  if (!command) return res.json({ output: '' });

  const safeCwd = cwd && fs.existsSync(cwd) ? cwd : CTF_DIR;

  // Handle cd
  if (command.trim().startsWith('cd ')) {
    const target = command.trim().substring(3).trim();
    const newDir = path.resolve(safeCwd, target);
    if (fs.existsSync(newDir) && fs.statSync(newDir).isDirectory()) {
      return res.json({ output: '', cwd: newDir });
    } else {
      return res.json({ output: `cd: no such file or directory: ${target}`, cwd: safeCwd });
    }
  }

  exec(command, { cwd: safeCwd, timeout: 5000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
    const output = stdout || stderr || '';
    res.json({
      output: output.replace(/\r\n/g, '\n'),
      cwd: safeCwd,
      error: err && !output ? err.message : undefined
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Linux Fundamentals target running on port ${PORT}`);
});
