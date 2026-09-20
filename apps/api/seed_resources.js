const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'mahi2130',
    database: 'cyberlab',
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS lab_resources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lab_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      url VARCHAR(500) NULL,
      description TEXT NULL,
      resource_type ENUM('DOCUMENTATION', 'TOOL', 'CHEATSHEET', 'EXTERNAL_LINK', 'VIDEO') DEFAULT 'DOCUMENTATION',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('Created or verified lab_resources table.');

  const [existing] = await conn.query('SELECT COUNT(*) as c FROM lab_resources');
  if (existing[0].c === 0) {
    const defaultResources = [
      {
        lab_id: 8,
        title: 'PortSwigger Web Security: Insecure Direct Object References',
        url: 'https://portswigger.net/web-security/access-control/idor',
        description: 'Comprehensive guide explaining IDOR vulnerabilities, parameter manipulation, and prevention strategies.',
        resource_type: 'DOCUMENTATION',
      },
      {
        lab_id: 8,
        title: 'OWASP Top 10: Broken Access Control Guide',
        url: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
        description: 'Official OWASP standard guide covering access control failures, horizontal privilege escalation, and mitigations.',
        resource_type: 'CHEATSHEET',
      },
      {
        lab_id: 4,
        title: 'Linux Journey: System Administration & CLI Guide',
        url: 'https://linuxjourney.com/',
        description: 'Interactive reference covering command-line fundamentals, file permissions, shell navigation, and user management.',
        resource_type: 'DOCUMENTATION',
      },
      {
        lab_id: 4,
        title: 'Linux Command-Line Cheat Sheet',
        url: 'https://cheatography.com/davechild/cheat-sheets/linux-command-line/',
        description: 'Fast reference card for bash navigation, grep, piping, chmod, chown, systemctl, and process inspection.',
        resource_type: 'CHEATSHEET',
      },
      {
        lab_id: 1,
        title: 'Robots.txt & Information Leakage Vulnerabilities',
        url: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/01-Conduct_Search_Engine_Discovery_Reconnaissance_for_Information_Leakage',
        description: 'OWASP WSTG guide on discovering exposed backup endpoints, crawler disallow lists, and sensitive file disclosure.',
        resource_type: 'DOCUMENTATION',
      },
      {
        lab_id: 1,
        title: 'Burp Suite Community Edition: HTTP Proxy & Analyzer',
        url: 'https://portswigger.net/burp/communitydownload',
        description: 'Industry standard web application security analysis proxy for intercepting and inspecting HTTP requests.',
        resource_type: 'TOOL',
      },
      {
        lab_id: 6,
        title: 'Nmap Official Reference Guide & Port Scanning Cheatsheet',
        url: 'https://nmap.org/book/man.html',
        description: 'Comprehensive reference for network enumeration, TCP SYN scanning (-sS), service detection (-sV), and scripts.',
        resource_type: 'CHEATSHEET',
      },
      {
        lab_id: 7,
        title: 'CryptoHack: Modern Cryptography Learning Platform',
        url: 'https://cryptohack.org/',
        description: 'Interactive platform teaching modern cryptography, XOR ciphers, hashing, and public key encryption.',
        resource_type: 'DOCUMENTATION',
      },
    ];

    for (const r of defaultResources) {
      await conn.query(
        'INSERT INTO lab_resources (lab_id, title, url, description, resource_type) VALUES (?, ?, ?, ?, ?)',
        [r.lab_id, r.title, r.url, r.description, r.resource_type]
      );
    }
    console.log(`Successfully seeded ${defaultResources.length} learning resources.`);
  } else {
    console.log(`Already have ${existing[0].c} learning resources.`);
  }

  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
