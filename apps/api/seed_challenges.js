const mysql = require('mysql2/promise');

async function seed() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'mahi2130',
    database: 'cyberlab'
  });

  console.log('Connected to MySQL database.');

  // 1. Update Labs with target URLs and Docker images
  const labUpdates = [
    { id: 1, target_url: 'http://localhost:8082', docker_image: 'cyberlab/forgotten-admin' },
    { id: 3, target_url: 'http://localhost:8083', docker_image: 'cyberlab/forgotten-admin-easy' },
    { id: 4, target_url: 'http://localhost:8084', docker_image: 'cyberlab/linux-basics' },
    { id: 5, target_url: 'http://localhost:8085', docker_image: 'cyberlab/security-basics' },
    { id: 6, target_url: 'http://localhost:8086', docker_image: 'cyberlab/network-recon' },
    { id: 7, target_url: 'http://localhost:8087', docker_image: 'cyberlab/crypto-basics' },
    { id: 8, target_url: 'http://localhost:8080', docker_image: 'cyberlab/idor-01' },
  ];

  for (const lab of labUpdates) {
    await conn.query('UPDATE labs SET target_url = ?, docker_image = ? WHERE id = ?', [
      lab.target_url,
      lab.docker_image,
      lab.id
    ]);
  }
  console.log('Updated 7 labs with target URLs and docker images.');

  // 2. Define challenges for each of the 7 labs
  const challenges = [
    {
      lab_id: 1,
      title: 'Admin Portal Discovery & Backup Exposure',
      description: 'An enterprise web portal has archived its legacy administration interfaces, but misconfigured crawler directives and orphaned configuration backups still remain publicly accessible.',
      task: 'Investigate the corporate employee portal. Discover the forgotten admin pathway, find the legacy emergency credentials, and access the restricted administrative console to retrieve the flag.',
      instructions: `STEP 1 — Start the challenge target and click "Open Target".
STEP 2 — Explore the employee portal. Note the system warning regarding legacy administrative infrastructure and crawler exclusions.
STEP 3 — Web crawlers look for exclusion rules in /robots.txt. Open /robots.txt on the target URL (e.g. http://localhost:8082/robots.txt).
STEP 4 — Identify the disallowed paths: notice /admin-portal/ and /admin-portal/system.bak.
STEP 5 — View the backup configuration file by navigating to /admin-portal/system.bak in your browser.
STEP 6 — Inspect the JSON configuration: locate the default_credentials containing the emergency_key.
STEP 7 — Navigate to /admin-portal and log in with username "admin" and the discovered emergency key.
STEP 8 — Once authenticated, copy the flag from the admin console and submit it to CyberLab.`,
      flag: 'CYBERLAB{forgotten_admin_portal_exposed}',
      walkthrough: `### Walkthrough: The Forgotten Admin

1. **What you were expected to find:**
   Organizations often deprecate or hide administrative portals without removing them entirely. Search engines and crawlers are guided by \`/robots.txt\`, which frequently lists sensitive paths administrators hoped would remain unseen.

2. **Where to start:**
   Open the target homepage at \`http://localhost:8082\`. Reviewing standard web assets begins with enumeration of \`/robots.txt\`.

3. **What to inspect:**
   Fetch \`http://localhost:8082/robots.txt\`. The file contains:
   \`\`\`
   User-agent: *
   Disallow: /admin-portal/
   Disallow: /admin-portal/system.bak
   \`\`\`

4. **What vulnerability exists:**
   - **Information Disclosure / Security through Obscurity:** \`/robots.txt\` reveals the existence of the secret admin portal.
   - **Exposed Backup File:** \`/admin-portal/system.bak\` contains unencrypted credentials:
     \`\`\`json
     {
       "default_credentials": {
         "username": "admin",
         "emergency_key": "cyberadmin2026"
       }
     }
     \`\`\`

5. **How the flag was obtained:**
   Navigate to \`/admin-portal\`, authenticate with \`admin\` / \`cyberadmin2026\`, and access the console to reveal \`CYBERLAB{forgotten_admin_portal_exposed}\`.

6. **Why the vulnerability exists:**
   Developers relied on obscurity to protect the legacy interface and left a development backup file in the web root.

7. **How the issue should be fixed:**
   - Require strong multi-factor authentication for administrative endpoints.
   - Restrict administrative portals to internal VPNs or trusted IP ranges.
   - Never store credentials in plaintext or backup files inside the web root.`,
      points: 250,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Web crawlers and search engine spiders consult a special text file in the web root to find disallowed paths. Try checking /robots.txt.' },
        { hint_order: 2, hint_text: 'Look at the paths listed in /robots.txt. Notice the backup file with the extension .bak.' },
        { hint_order: 3, hint_text: 'Open /admin-portal/system.bak in your browser to view the emergency credentials, then log in at /admin-portal.' }
      ]
    },
    {
      lab_id: 3,
      title: 'Emergency Password Recovery Leak',
      description: 'A developer left temporary debugging comments and an unsecured recovery endpoint enabled on the staff password recovery portal.',
      task: 'Inspect the recovery portal source code, identify the developer debugging notes, query the debug recovery endpoint, and redeem the administrator token to obtain the flag.',
      instructions: `STEP 1 — Start the challenge target and click "Open Target" to open http://localhost:8083.
STEP 2 — Right-click anywhere on the page and select "View Page Source" (or press Ctrl+U).
STEP 3 — Inspect the HTML comments at the top of the source code.
STEP 4 — Find the developer note explaining the emergency recovery endpoint: /debug/forgot-password?account=admin.
STEP 5 — Navigate to http://localhost:8083/debug/forgot-password?account=admin in your browser.
STEP 6 — Copy the emergency_token returned in the JSON response.
STEP 7 — Return to http://localhost:8083/redeem-token and paste the emergency token into the form.
STEP 8 — Submit the token to restore administrator access and view the challenge flag.`,
      flag: 'CYBERLAB{source_comments_leak_secrets}',
      walkthrough: `### Walkthrough: the forgoten admin

1. **What you were expected to find:**
   HTML source code and client-side comments often leak internal endpoints, debugging tools, and emergency bypass routines that should never be sent to production browsers.

2. **Where to start:**
   Open \`http://localhost:8083\` and view page source (Ctrl+U).

3. **What to inspect:**
   Inspect the HTML comment inside \`<head>\`:
   \`\`\`html
   <!-- DEVELOPER NOTE: Emergency admin password reset mechanism -->
   <!-- If the administrator forgot credentials, query the debug recovery endpoint: -->
   <!-- GET /debug/forgot-password?account=admin -->
   \`\`\`

4. **What vulnerability exists:**
   - **Sensitive Information in Comments:** Sensitive developer notes were left in client-facing HTML.
   - **Unauthenticated Debug Endpoint:** The debug endpoint returns valid emergency authentication tokens without verifying requester identity.

5. **How the flag was obtained:**
   - Query \`/debug/forgot-password?account=admin\` to get token: \`EMERGENCY_ADMIN_TOKEN_7749\`.
   - Submit token at \`/redeem-token\` to receive \`CYBERLAB{source_comments_leak_secrets}\`.

6. **Why the vulnerability exists:**
   Developers placed emergency workaround routines into code and commented them instead of disabling or removing them before deployment.

7. **How the issue should be fixed:**
   - Strip comments during the production build process.
   - Completely disable or remove all debug and emergency endpoints from production environments.`,
      points: 100,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Right-click the page and choose "View Page Source". Developers sometimes leave comments in the HTML.' },
        { hint_order: 2, hint_text: 'Read the developer comments in the page head. Notice the /debug/forgot-password endpoint mentioned.' },
        { hint_order: 3, hint_text: 'Visit /debug/forgot-password?account=admin to receive the emergency token, then submit it at /redeem-token.' }
      ]
    },
    {
      lab_id: 4,
      title: 'Command Line / File Discovery',
      description: 'Welcome to your first Linux challenge. Connect to a live Linux shell environment, navigate through directories, and discover a hidden file containing the challenge flag.',
      task: 'Use the interactive web terminal to navigate the Linux filesystem. Locate the hidden flag file inside the /home/ctf directory and read its contents to retrieve the flag.',
      instructions: `STEP 1 — Start the challenge target and click "Open Target" to access the live Linux Terminal.
STEP 2 — Verify your current user and directory by typing: pwd and whoami.
STEP 3 — Run: ls to see visible files. Notice that only ordinary files (like notes.txt) appear.
STEP 4 — In Linux, files whose names begin with a dot (.) are hidden. To view all files including hidden ones, run: ls -la /home/ctf
STEP 5 — Identify the hidden file named: .flag.txt
STEP 6 — Display the contents of the hidden file by running: cat /home/ctf/.flag.txt
STEP 7 — Copy the flag string and submit it to CyberLab.`,
      flag: 'CYBERLAB{linux_hidden_file_2026}',
      walkthrough: `### Walkthrough: Linux Fundamentals

1. **What you were expected to find:**
   In Linux systems, configuration files and sensitive tokens are frequently stored as hidden dotfiles (e.g. \`.bashrc\`, \`.env\`, \`.ssh\`). A standard \`ls\` command will not display these files.

2. **Where to start:**
   Open the web terminal at \`http://localhost:8084\`. You are greeted with a bash shell running as user \`ctf\` in \`/home/ctf\`.

3. **What to inspect:**
   Run \`ls\` -> only shows \`notes.txt\` and \`workspace\`.
   Run \`ls -la\` or \`ls -a\` -> displays:
   \`\`\`
   drwxr-xr-x 1 ctf ctf 4096 Sep 19 04:00 .
   drwxr-xr-x 1 root root 4096 Sep 19 04:00 ..
   -rw-r--r-- 1 ctf ctf   33 Sep 19 04:00 .flag.txt
   -rw-r--r-- 1 ctf ctf  102 Sep 19 04:00 notes.txt
   \`\`\`

4. **What concept exists:**
   Understanding standard Unix directory listing flags:
   - \`-a\` / \`--all\`: do not ignore entries starting with \`.\`
   - \`-l\`: use a long listing format showing permissions, ownership, and file size.

5. **How the flag was obtained:**
   Read the file using \`cat .flag.txt\` or \`cat /home/ctf/.flag.txt\` to reveal:
   \`CYBERLAB{linux_hidden_file_2026}\`.

6. **How to practice:**
   Familiarize yourself with navigation commands: \`cd\`, \`ls -la\`, \`cat\`, \`pwd\`, and \`find\`.`,
      points: 100,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Ordinary "ls" only displays non-hidden files. In Linux, files starting with a period (.) are hidden by default.' },
        { hint_order: 2, hint_text: 'Use the command "ls -la" to list all files, including hidden dotfiles.' },
        { hint_order: 3, hint_text: 'Once you see .flag.txt, display its contents using the command: cat .flag.txt' }
      ]
    },
    {
      lab_id: 5,
      title: 'HTTP Headers & Insecure Session Tokens',
      description: 'Learn how HTTP headers and browser cookies facilitate communication between clients and web servers, and how sensitive information or flawed access controls can be analyzed in browser developer tools.',
      task: 'Inspect the HTTP traffic generated by the web application. Examine response headers for leaked security flags, or inspect and modify the role cookie to gain administrative access and retrieve the flag.',
      instructions: `STEP 1 — Start the challenge and open the target URL (http://localhost:8085).
STEP 2 — Open your browser Developer Tools by pressing F12 or right-clicking and selecting "Inspect".
STEP 3 — Switch to the "Network" tab in Developer Tools.
STEP 4 — Click the "Trigger HTTP Request & Inspect Headers" button on the webpage.
STEP 5 — In the Network tab, click on the new request to "session-info".
STEP 6 — Look at the "Response Headers" section. Locate the custom security header: X-CyberLab-Flag.
STEP 7 — Alternatively, switch to the "Application" tab (or "Storage" tab in Firefox) > "Cookies".
STEP 8 — Notice the cookie "user_role" is set to "guest". Double-click and change the value to "admin".
STEP 9 — Click the "Visit Admin Panel" button to view the flag.
STEP 10 — Submit the discovered CYBERLAB{...} flag to complete the challenge.`,
      flag: 'CYBERLAB{http_headers_and_cookies_mastered}',
      walkthrough: `### Walkthrough: Web Security Basics

1. **What you were expected to find:**
   HTTP headers convey metadata between client and server. Developers occasionally leak internal flags, framework information, or security tokens in custom headers (\`X-...\`). Furthermore, client-side cookies that store authorization roles directly can be manipulated by users.

2. **Where to start:**
   Open the target at \`http://localhost:8085\` and open browser Developer Tools (F12).

3. **What to inspect:**
   Trigger the request to \`/api/session-info\` and inspect response headers:
   \`\`\`http
   HTTP/1.1 200 OK
   X-Powered-By: CyberLab-SecEngine/2.4
   X-CyberLab-Flag: CYBERLAB{http_headers_and_cookies_mastered}
   \`\`\`

4. **What vulnerability exists:**
   - **Information Disclosure in Response Headers:** Sensitive flag token embedded in an HTTP response header.
   - **Insecure Client-Side Authorization:** The application trusts a plaintext cookie \`user_role=admin\` without cryptographic signatures (such as HMAC or JWT).

5. **How the flag was obtained:**
   Read \`X-CyberLab-Flag\` from response headers, or edit cookie \`user_role=admin\` and visit \`/admin-panel\` to reveal \`CYBERLAB{http_headers_and_cookies_mastered}\`.

6. **How the issue should be fixed:**
   - Never place secret tokens in public HTTP headers.
   - Use cryptographically signed session identifiers stored on the server side instead of trusting client-writable role cookies.`,
      points: 150,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Open your browser Developer Tools (F12) and select the "Network" tab.' },
        { hint_order: 2, hint_text: 'Click "Trigger HTTP Request & Inspect Headers" on the page, then inspect the response headers of the session-info request.' },
        { hint_order: 3, hint_text: 'Look for custom headers starting with "X-". You will find X-CyberLab-Flag directly in the headers.' }
      ]
    },
    {
      lab_id: 6,
      title: 'Service Enumeration & Banner Grabbing',
      description: 'Discover how security analysts enumerate network services and collect service banners to identify running applications, version details, and exposed administrative interfaces.',
      task: 'Perform network reconnaissance against target 10.0.5.15. Conduct a port scan to identify open ports, then grab the service banner from the exposed internal service to discover the challenge flag.',
      instructions: `STEP 1 — Start the challenge target and open the Network Reconnaissance Station (http://localhost:8086).
STEP 2 — Under Step 1: Port Scan Target, click "Run TCP Port Scan".
STEP 3 — Review the port scan results in the console output. Notice the list of open ports: 21, 22, 80, and 8080.
STEP 4 — Notice that port 8080 is identified as an internal API / proxy service.
STEP 5 — Under Step 2: Service Banner Grab, enter port number 8080 in the "Port to Probe" input.
STEP 6 — Click "Grab Service Banner".
STEP 7 — Inspect the response banner returned by the service on port 8080.
STEP 8 — Locate the flag inside the service banner payload (CYBERLAB{...}) and submit it to CyberLab.`,
      flag: 'CYBERLAB{network_service_banner_recon}',
      walkthrough: `### Walkthrough: Network Reconnaissance

1. **What you were expected to find:**
   Network scanning is fundamental to mapping an attack surface. Services listening on non-standard ports (such as internal APIs on 8080 or management interfaces) frequently disclose service banners containing sensitive information.

2. **Where to start:**
   Open \`http://localhost:8086\`. The interface simulates port scanning and socket probing against host \`10.0.5.15\`.

3. **What to inspect:**
   Perform a port scan -> outputs:
   \`\`\`
   PORT       STATE    SERVICE
   21         open     ftp
   22         open     ssh
   80         open     http
   443        closed   https
   3306       filtered mysql
   8080       open     http-proxy / internal-api
   \`\`\`

4. **Banner Grabbing:**
   Connecting to port 8080 reveals:
   \`\`\`http
   HTTP/1.1 200 OK
   Server: CyberLab-Internal-Recon-Node/1.0
   X-Service-Secret: CYBERLAB{network_service_banner_recon}
   Content-Type: application/json

   {"status":"active","flag":"CYBERLAB{network_service_banner_recon}"}
   \`\`\`

5. **How the flag was obtained:**
   Grab the banner on port 8080 to extract \`CYBERLAB{network_service_banner_recon}\`.

6. **How the issue should be fixed:**
   - Restrict internal API ports from unauthorized network segments using firewalls.
   - Configure services to minimize banner disclosures (banner suppression).`,
      points: 200,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Start by clicking "Run TCP Port Scan" to discover which ports are currently open on the target.' },
        { hint_order: 2, hint_text: 'Notice that port 8080 is open and running an internal service. Non-standard ports often host sensitive tools.' },
        { hint_order: 3, hint_text: 'Enter port "8080" into the banner grabber and click "Grab Service Banner" to view the flag.' }
      ]
    },
    {
      lab_id: 7,
      title: 'Multi-Stage Cipher Decryption',
      description: 'Learn how to identify, analyze, and reverse common cryptographic encodings and classical ciphers including Base64 encoding and the ROT13 Caesar substitution cipher.',
      task: 'Analyze the intercepted transmission payload. Reconstruct the hidden flag by applying two-stage cryptanalysis: decode the Base64 outer layer, then decipher the inner ROT13 Caesar cipher.',
      instructions: `STEP 1 — Start the challenge target and open the Cryptographic Analysis Workshop (http://localhost:8087).
STEP 2 — Copy the intercepted payload: UExPQkVZTk97cGVsY2diX3poeWd2X3lseXJlX3FyY2JxdmFuZ19mYnlpcnF9
STEP 3 — Notice the character set consists of alphanumeric characters and ends with "= " or clean base64 padding. This is Base64 encoding.
STEP 4 — Under "Layer 1: Base64 Decoder", ensure the ciphertext is in the input box and click "Decode Base64".
STEP 5 — Observe the decoded string: PLOBEYNO{pelcgb_zhygv_ylyre_qrcbqvang_fbyirq}
STEP 6 — Notice the format looks like CYBERLAB{...}, but each letter is shifted. This is a ROT13 (Caesar) cipher!
STEP 7 — The decoded string is automatically copied to the "Layer 2: ROT13 Decipher" input box. Click "Apply ROT13 Shift".
STEP 8 — Read the resulting plaintext flag: CYBERLAB{crypto_multi_layer_decoding_solved}
STEP 9 — Submit the flag to CyberLab to earn your XP!`,
      flag: 'CYBERLAB{crypto_multi_layer_decoding_solved}',
      walkthrough: `### Walkthrough: Cryptography Fundamentals

1. **What you were expected to find:**
   Multi-layered obfuscation is frequently used in capture-the-flag competitions and real-world malware delivery. Recognizing encodings (like Base64) versus ciphers (like Caesar/ROT13) is a core foundational skill.

2. **Where to start:**
   Open \`http://localhost:8087\`. The intercepted message is:
   \`UExPQkVZTk97cGVsY2diX3poeWd2X3lseXJlX3FyY2JxdmFuZ19mYnlpcnF9\`

3. **Layer 1 - Base64 Decoding:**
   Decoding from Base64 gives ASCII:
   \`PLOBEYNO{pelcgb_zhygv_ylyre_qrcbqvang_fbyirq}\`

4. **Layer 2 - ROT13 Caesar Cipher:**
   Notice \`PLOBEYNO\` maps to \`CYBERLAB\`:
   - \`P\` (-13) -> \`C\`
   - \`L\` (-13) -> \`Y\`
   - \`O\` (-13) -> \`B\`
   - \`B\` (+13) -> \`E\`
   - \`E\` (+13) -> \`R\`
   Applying ROT13 produces the plaintext:
   \`CYBERLAB{crypto_multi_layer_decoding_solved}\`

5. **Key Takeaway:**
   - **Encoding** (Base64) is not encryption; it provides representation, not secrecy.
   - **ROT13** is a simple symmetric Caesar shift of 13 positions, trivially broken without any secret key.
   - Secure systems must use modern authenticated encryption algorithms like AES-GCM.`,
      points: 200,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'The intercepted string uses uppercase letters, lowercase letters, and digits. This is standard Base64 encoding.' },
        { hint_order: 2, hint_text: 'Decode the Base64 string first using the Layer 1 tool. You will receive a string starting with PLOBEYNO{...}.' },
        { hint_order: 3, hint_text: 'PLOBEYNO is ROT13 for CYBERLAB. Apply the ROT13 shift in the Layer 2 tool to reveal the plaintext flag.' }
      ]
    },
    {
      lab_id: 8,
      title: 'IDOR - Profile Access',
      description: 'A vulnerable customer profile portal trusts user-controlled identity parameters in cookies/requests without verifying whether the requested account belongs to the authenticated user.',
      task: 'Log into the customer banking portal as guest or john. Inspect your session identifier, change the user ID to access the administrator profile (ID: 1), and retrieve the administrator secret flag.',
      instructions: `STEP 1 — Start the challenge target and click "Open Target" to access http://localhost:8080.
STEP 2 — Log in using one of the provided test accounts:
         Username: guest  (or john)
STEP 3 — Once logged in, you are redirected to /profile displaying your User Profile (ID: 2, Role: user).
STEP 4 — Open browser Developer Tools (F12) and go to Application (or Storage) > Cookies > http://localhost:8080.
STEP 5 — Notice the cookie named "userId" with value "2".
STEP 6 — Double-click the value "2" and change it to "1" (the administrator ID).
STEP 7 — Refresh the /profile page in your browser.
STEP 8 — The profile now renders user ID 1 (admin) and reveals the Secret Data flag!
STEP 9 — Copy the flag CYBERLAB{...} and submit it to CyberLab.`,
      flag: 'CYBERLAB{idor_advanced_admin_access_xyz}',
      walkthrough: `### Walkthrough: IDOR Fundamentals

1. **What you were expected to find:**
   Insecure Direct Object Reference (IDOR) occurs when an application exposes a reference to an internal object (like a user account, document, or transaction) and trusts client input without verifying that the client has authorization to access that object.

2. **Where to start:**
   Open \`http://localhost:8080\`, login as \`guest\`.

3. **What to inspect:**
   Check cookies in Developer Tools (F12 > Application > Cookies):
   \`\`\`
   Name: userId
   Value: 2
   \`\`\`

4. **Vulnerability Analysis:**
   The server handler for \`/profile\` does:
   \`\`\`javascript
   app.get('/profile', (req, res) => {
     const userId = req.cookies.userId;
     const user = users[userId];
     ...
   });
   \`\`\`
   The server takes \`req.cookies.userId\` directly and fetches \`users[userId]\` without session validation.

5. **Exploitation:**
   Change \`userId=2\` to \`userId=1\` in cookie storage and reload \`/profile\`. The server returns:
   \`\`\`
   ID: 1
   Username: admin
   Role: admin
   Secret Data: CYBERLAB{idor_advanced_admin_access_xyz}
   \`\`\`

6. **How the issue should be fixed:**
   - Never use predictable client-controllable object IDs as authorization tokens.
   - Use server-side session stores or encrypted JWTs where the user identity is cryptographically signed.
   - Enforce access control checks: verify that \`currentUser.id === requestedProfile.id\` before returning data.`,
      points: 100,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Log in with username "guest" to reach the profile page.' },
        { hint_order: 2, hint_text: 'Open your browser Developer Tools (F12) > Application > Cookies. Notice the "userId" cookie set to "2".' },
        { hint_order: 3, hint_text: 'Change the "userId" cookie value to "1" and refresh the page to view the administrator profile.' }
      ]
    }
  ];

  for (const ch of challenges) {
    // Check if challenge exists for this lab
    const [existing] = await conn.query('SELECT id FROM challenges WHERE lab_id = ? LIMIT 1', [ch.lab_id]);
    let challengeId;

    if (existing.length > 0) {
      challengeId = existing[0].id;
      await conn.query(
        `UPDATE challenges SET
          title = ?,
          description = ?,
          task = ?,
          instructions = ?,
          flag = ?,
          walkthrough = ?,
          points = ?,
          order_number = ?,
          is_active = ?
        WHERE id = ?`,
        [
          ch.title,
          ch.description,
          ch.task,
          ch.instructions,
          ch.flag,
          ch.walkthrough,
          ch.points,
          ch.order_number,
          ch.is_active,
          challengeId
        ]
      );
      console.log(`Updated challenge ID ${challengeId} for lab ${ch.lab_id}`);
    } else {
      const [res] = await conn.query(
        `INSERT INTO challenges (
          lab_id, title, description, task, instructions, flag, walkthrough, points, order_number, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ch.lab_id,
          ch.title,
          ch.description,
          ch.task,
          ch.instructions,
          ch.flag,
          ch.walkthrough,
          ch.points,
          ch.order_number,
          ch.is_active
        ]
      );
      challengeId = res.insertId;
      console.log(`Created new challenge ID ${challengeId} for lab ${ch.lab_id}`);
    }

    // Set hints for this challenge
    await conn.query('DELETE FROM challenge_hints WHERE challenge_id = ?', [challengeId]);
    for (const hint of ch.hints) {
      await conn.query(
        'INSERT INTO challenge_hints (challenge_id, hint_text, hint_order) VALUES (?, ?, ?)',
        [challengeId, hint.hint_text, hint.hint_order]
      );
    }
    console.log(`Configured ${ch.hints.length} hints for challenge ID ${challengeId}`);
  }

  // Deactivate any extra challenges on lab 4 so only the main challenge is active
  await conn.query('UPDATE challenges SET is_active = 0 WHERE lab_id = 4 AND id != 3 AND id != 4');

  console.log('Seed completed successfully.');
  await conn.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
