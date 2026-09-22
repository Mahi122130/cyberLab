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

  // 1. Update Labs with target URLs and Docker images (existing labs only)
  const labUpdates = [
    { id: 1, target_url: 'http://localhost:8082', docker_image: 'cyberlab/forgotten-admin' },
    { id: 3, target_url: 'http://localhost:8083', docker_image: 'cyberlab/forgotten-admin-easy' },
    { id: 4, target_url: 'http://localhost:8084', docker_image: 'cyberlab/linux-basics' },
    { id: 5, target_url: 'http://localhost:8085', docker_image: 'cyberlab/security-basics' },
    { id: 6, target_url: 'http://localhost:8086', docker_image: 'cyberlab/network-recon' },
    { id: 7, target_url: 'http://localhost:8087', docker_image: 'cyberlab/crypto-basics' },
    { id: 8, target_url: 'http://localhost:8080', docker_image: 'cyberlab/idor-advanced' },
  ];

  for (const lab of labUpdates) {
    await conn.query('UPDATE labs SET target_url = ?, docker_image = ? WHERE id = ?', [
      lab.target_url,
      lab.docker_image,
      lab.id
    ]);
  }
  console.log('Updated existing labs with target URLs and docker images.');

  // 2. One beginner challenge per existing lab. Hints match the Docker apps exactly.
  const challenges = [
    {
      lab_id: 1,
      title: 'The Forgotten Admin',
      description: 'An old admin portal was accidentally left accessible on the CyberCorp staff website. Find the portal, log in with the leaked emergency credentials, and retrieve the flag.',
      task: 'Open the challenge website, find the forgotten admin portal from robots.txt, log in with the backup credentials, and copy the flag that starts with CYBERLAB{.',
      flag: 'CYBERLAB{forgotten_admin_portal_exposed}',
      points: 100,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Start the lab target, then click Open Target. The CyberCorp Staff Gateway homepage should load (http://localhost:8082).' },
        { hint_order: 2, hint_text: 'In the address bar, go to http://localhost:8082/robots.txt and press Enter.' },
        { hint_order: 3, hint_text: 'Read the file. It lists two disallowed paths: /admin-portal/ and /admin-portal/system.bak.' },
        { hint_order: 4, hint_text: 'Open the backup file in your browser: http://localhost:8082/admin-portal/system.bak' },
        { hint_order: 5, hint_text: 'In the JSON, copy the emergency_key value. The username is admin and the emergency key is cyberadmin2026.' },
        { hint_order: 6, hint_text: 'Open the login page at http://localhost:8082/admin-portal' },
        { hint_order: 7, hint_text: 'Type username admin and password cyberadmin2026, then click Sign In to Admin.' },
        { hint_order: 8, hint_text: 'The green admin console shows FLAG: CYBERLAB{forgotten_admin_portal_exposed}. Copy that entire value (including CYBERLAB{ and }) and submit it on the CyberLab challenge page.' }
      ]
    },
    {
      lab_id: 3,
      title: 'Emergency Password Recovery Leak',
      description: 'A staff account recovery page still contains a developer comment that points to a debug password-reset endpoint. Use that endpoint to get an emergency token and redeem it for the flag.',
      task: 'View the page source, open the debug recovery URL for account=admin, redeem the emergency token, and copy the CYBERLAB{ flag.',
      flag: 'CYBERLAB{source_comments_leak_secrets}',
      points: 100,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Start the lab target, then click Open Target. You should see Emergency Staff Account Recovery at http://localhost:8083' },
        { hint_order: 2, hint_text: 'On that page, press Ctrl+U (or right-click and choose View Page Source).' },
        { hint_order: 3, hint_text: 'In the HTML <head>, read the DEVELOPER NOTE comments. They say to query GET /debug/forgot-password?account=admin and then redeem the token at /redeem-token.' },
        { hint_order: 4, hint_text: 'Open this exact URL in your browser: http://localhost:8083/debug/forgot-password?account=admin' },
        { hint_order: 5, hint_text: 'The JSON response contains emergency_token. Copy the value EMERGENCY_ADMIN_TOKEN_7749' },
        { hint_order: 6, hint_text: 'Open http://localhost:8083/redeem-token (there is also a Redeem Token Here link on the homepage).' },
        { hint_order: 7, hint_text: 'Paste EMERGENCY_ADMIN_TOKEN_7749 into the Emergency Token field and click Verify Token.' },
        { hint_order: 8, hint_text: 'The success page shows FLAG: CYBERLAB{source_comments_leak_secrets}. Copy that entire flag and submit it on CyberLab.' }
      ]
    },
    {
      lab_id: 4,
      title: 'Find the Hidden Linux File',
      description: 'You have a web terminal as user ctf in /home/ctf. A hidden Linux file in that folder contains the flag.',
      task: 'In the CyberLab Linux Terminal, list hidden files in /home/ctf and read .flag.txt to get the flag.',
      flag: 'CYBERLAB{linux_hidden_file_2026}',
      points: 100,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Start the lab target, then click Open Target. You should see a black terminal that says ctf@cyberlab-linux:~$' },
        { hint_order: 2, hint_text: 'Click the command box next to the prompt. Type pwd and press Enter. It should print /home/ctf' },
        { hint_order: 3, hint_text: 'Type ls and press Enter. You will only see notes.txt and workspace. The flag file is hidden, so it will not appear yet.' },
        { hint_order: 4, hint_text: 'Type ls -la and press Enter. The -la flags show all files, including names that start with a dot.' },
        { hint_order: 5, hint_text: 'In the list, find the file named .flag.txt' },
        { hint_order: 6, hint_text: 'Type cat .flag.txt and press Enter.' },
        { hint_order: 7, hint_text: 'The terminal prints CYBERLAB{linux_hidden_file_2026}. Copy that entire value and submit it on CyberLab.' }
      ]
    },
    {
      lab_id: 5,
      title: 'Read the Hidden HTTP Header',
      description: 'This website sends a secret flag in a custom HTTP response header. Use browser Developer Tools to read it.',
      task: 'Open Developer Tools, inspect the Network tab, trigger the session-info request, and copy the X-CyberLab-Flag header value.',
      flag: 'CYBERLAB{http_headers_and_cookies_mastered}',
      points: 100,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Start the lab target, then click Open Target. You should see HTTP Security Inspector at http://localhost:8085' },
        { hint_order: 2, hint_text: 'Press F12 to open Developer Tools. Click the Network tab. Leave it open.' },
        { hint_order: 3, hint_text: 'On the webpage, click the blue button labeled Trigger HTTP Request & Inspect Headers.' },
        { hint_order: 4, hint_text: 'In the Network tab, click the new request named session-info (the URL is /api/session-info).' },
        { hint_order: 5, hint_text: 'Open the Headers section for that request. Scroll to Response Headers.' },
        { hint_order: 6, hint_text: 'Find the header named X-CyberLab-Flag. Its value is CYBERLAB{http_headers_and_cookies_mastered}' },
        { hint_order: 7, hint_text: 'Copy that entire CYBERLAB{...} value and submit it on CyberLab. (You do not need the admin panel for this challenge.)' }
      ]
    },
    {
      lab_id: 6,
      title: 'Grab the Internal Service Banner',
      description: 'Use the Network Reconnaissance Station to scan host 10.0.5.15, then grab the banner from the internal service on port 8080. The banner contains the flag.',
      task: 'Run the TCP port scan, probe port 8080 with Grab Service Banner, and copy the CYBERLAB{ flag from the banner.',
      flag: 'CYBERLAB{network_service_banner_recon}',
      points: 100,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Start the lab target, then click Open Target. You should see Service Discovery & Port Enumeration at http://localhost:8086' },
        { hint_order: 2, hint_text: 'Under Step 1: Port Scan Target, the Target IP is already 10.0.5.15. Click Run TCP Port Scan.' },
        { hint_order: 3, hint_text: 'Read the console. Open ports include 21, 22, 80, and 8080. Port 8080 is listed as http-proxy / internal-api.' },
        { hint_order: 4, hint_text: 'Under Step 2: Service Banner Grab, the Port to Probe box is already filled with 8080. Leave it as 8080.' },
        { hint_order: 5, hint_text: 'Click Grab Service Banner.' },
        { hint_order: 6, hint_text: 'The console shows an HTTP banner. Look at the line X-Service-Secret and the JSON field "flag". Both contain CYBERLAB{network_service_banner_recon}' },
        { hint_order: 7, hint_text: 'Copy CYBERLAB{network_service_banner_recon} and submit it on CyberLab.' }
      ]
    },
    {
      lab_id: 7,
      title: 'Decode the Intercepted Message',
      description: 'The Cryptographic Analysis Workshop already has the intercepted payload filled in. Use the on-page Base64 button, then the ROT13 button, to recover the flag. You do not need any other tools.',
      task: 'Click Decode Base64, then click Apply ROT13 Shift, and copy the plaintext CYBERLAB{ flag.',
      flag: 'CYBERLAB{crypto_multi_layer_decoding_solved}',
      points: 100,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Start the lab target, then click Open Target. You should see Cryptographic Analysis Workshop at http://localhost:8087' },
        { hint_order: 2, hint_text: 'Look at Layer 1: Base64 Decoder. The Input Base64 String box is already filled with the intercepted payload. Do not change it.' },
        { hint_order: 3, hint_text: 'Click the Decode Base64 button.' },
        { hint_order: 4, hint_text: 'The Layer 1 result should look like PLOREYNO{...}. That text is automatically copied into the Layer 2: ROT13 Decipher input box.' },
        { hint_order: 5, hint_text: 'Click Apply ROT13 Shift in Layer 2.' },
        { hint_order: 6, hint_text: 'The Plaintext Flag box shows CYBERLAB{crypto_multi_layer_decoding_solved}. Copy that entire value and submit it on CyberLab.' }
      ]
    },
    {
      lab_id: 8,
      title: 'Change the Profile User ID',
      description: 'The Secure Portal stores your identity in a browser cookie named userId. Log in as guest, change that cookie from 2 to 1, and load the admin profile to get the flag.',
      task: 'Log in as guest, change the userId cookie to 1, refresh /profile, and copy the Secret Data flag.',
      flag: 'CYBERLAB{idor_advanced_admin_access_xyz}',
      points: 100,
      order_number: 1,
      is_active: 1,
      hints: [
        { hint_order: 1, hint_text: 'Start the lab target, then click Open Target. You should see Welcome to the Secure Portal at http://localhost:8080' },
        { hint_order: 2, hint_text: 'In the Username box, type guest (there is no password field). Click Login.' },
        { hint_order: 3, hint_text: 'You should land on User Profile. It will show ID 2 and Username guest. That is your own account, not the flag yet.' },
        { hint_order: 4, hint_text: 'Press F12 to open Developer Tools. Click the Application tab (Chrome/Edge) or Storage tab (Firefox).' },
        { hint_order: 5, hint_text: 'In the left sidebar, expand Cookies, then click http://localhost:8080' },
        { hint_order: 6, hint_text: 'Find the cookie named userId. Its value is 2. Double-click the value 2 and change it to 1, then press Enter.' },
        { hint_order: 7, hint_text: 'Refresh the profile page (press F5) while still on http://localhost:8080/profile' },
        { hint_order: 8, hint_text: 'The page should now show Username admin. The Secret Data line is CYBERLAB{idor_advanced_admin_access_xyz}. Copy that entire value and submit it on CyberLab.' }
      ]
    }
  ];

  for (const ch of challenges) {
    const [existing] = await conn.query(
      'SELECT id FROM challenges WHERE lab_id = ? ORDER BY id ASC LIMIT 1',
      [ch.lab_id]
    );
    let challengeId;

    if (existing.length > 0) {
      challengeId = existing[0].id;
      await conn.query(
        `UPDATE challenges SET
          title = ?,
          description = ?,
          task = ?,
          flag = ?,
          points = ?,
          order_number = ?,
          is_active = ?
        WHERE id = ?`,
        [
          ch.title,
          ch.description,
          ch.task,
          ch.flag,
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
          lab_id, title, description, task, flag, points, order_number, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ch.lab_id,
          ch.title,
          ch.description,
          ch.task,
          ch.flag,
          ch.points,
          ch.order_number,
          ch.is_active
        ]
      );
      challengeId = res.insertId;
      console.log(`Created new challenge ID ${challengeId} for lab ${ch.lab_id}`);
    }

    await conn.query('DELETE FROM challenge_hints WHERE challenge_id = ?', [challengeId]);
    for (const hint of ch.hints) {
      await conn.query(
        'INSERT INTO challenge_hints (challenge_id, hint_text, hint_order) VALUES (?, ?, ?)',
        [challengeId, hint.hint_text, hint.hint_order]
      );
    }
    console.log(`Configured ${ch.hints.length} hints for challenge ID ${challengeId}`);

    // Keep only this challenge active on the lab so beginners are not shown extra/broken rows.
    await conn.query(
      'UPDATE challenges SET is_active = 0 WHERE lab_id = ? AND id != ?',
      [ch.lab_id, challengeId]
    );
  }

  console.log('Seed completed successfully.');
  await conn.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
