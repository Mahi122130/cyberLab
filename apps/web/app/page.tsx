import Link from "next/link";

const labs = [
  {
    title: "Linux Fundamentals",
    category: "LINUX",
    difficulty: "Beginner",
    points: 100,
    description:
      "Learn essential Linux commands, permissions, users, and file systems.",
  },
  {
    title: "Web Reconnaissance",
    category: "WEB SECURITY",
    difficulty: "Easy",
    points: 150,
    description:
      "Discover how attackers gather information about web applications.",
  },
  {
    title: "SQL Injection",
    category: "WEB SECURITY",
    difficulty: "Medium",
    points: 250,
    description:
      "Understand SQL injection vulnerabilities through a controlled lab.",
  },
];

const paths = [
  {
    number: "01",
    title: "Cybersecurity Fundamentals",
    description:
      "Build your foundation in networking, Linux, security concepts, and ethical hacking.",
    labs: 12,
  },
  {
    number: "02",
    title: "Web Application Security",
    description:
      "Learn reconnaissance, authentication attacks, SQL injection, XSS, and more.",
    labs: 18,
  },
  {
    number: "03",
    title: "Penetration Testing",
    description:
      "Follow a practical penetration testing methodology from reconnaissance to reporting.",
    labs: 24,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070b12] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#070b12]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/10 font-mono text-emerald-400">
              &gt;_
            </div>

            <div>
              <div className="font-mono text-lg font-bold tracking-wider">
                CYBER<span className="text-emerald-400">LAB</span>
              </div>

              <div className="font-mono text-[9px] tracking-[0.3em] text-gray-500">
                LEARN // PRACTICE // SECURE
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <a
              href="#labs"
              className="transition hover:text-emerald-400"
            >
              Labs
            </a>

            <a
              href="#paths"
              className="transition hover:text-emerald-400"
            >
              Learning Paths
            </a>

            <a
              href="#about"
              className="transition hover:text-emerald-400"
            >
              About
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white sm:block"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-lg border border-emerald-400/50 bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.12),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">
          {/* Hero Content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 font-mono text-xs text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              CYBERSECURITY TRAINING PLATFORM
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Learn security.
              <br />
              <span className="text-emerald-400">Break things.</span>
              <br />
              Build skills.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-400">
              A hands-on cybersecurity laboratory where you learn by solving
              realistic challenges, exploiting vulnerabilities, and defending
              systems.
            </p>

            {/* Hero Buttons */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-7 py-3.5 font-semibold text-black transition hover:bg-emerald-300"
              >
                Start Hacking →
              </Link>

              <a
                href="#labs"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-7 py-3.5 font-semibold text-gray-200 transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                Explore Labs
              </a>
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap gap-8 font-mono text-xs text-gray-500">
              <div>
                <div className="text-2xl font-bold text-white">50+</div>
                <div>HANDS-ON LABS</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-white">10+</div>
                <div>SECURITY TOPICS</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div>PRACTICAL</div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="relative">
            <div className="rounded-xl border border-white/10 bg-[#0c121c] shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />

                <span className="ml-3 font-mono text-xs text-gray-600">
                  cyberlab@terminal
                </span>
              </div>

              <div className="p-6 font-mono text-sm leading-8">
                <div>
                  <span className="text-emerald-400">
                    student@cyberlab
                  </span>

                  <span className="text-gray-500">:</span>

                  <span className="text-blue-400">~</span>

                  <span className="text-gray-400">$</span>{" "}

                  <span className="text-white">
                    start-lab web-recon
                  </span>
                </div>

                <div className="mt-3 text-gray-500">
                  [*] Starting CyberLab environment...
                </div>

                <div className="text-gray-500">
                  [*] Target: 10.10.24.17
                </div>

                <div className="text-gray-500">
                  [*] Checking environment...
                </div>

                <div className="text-emerald-400">
                  [+] Lab environment ready
                </div>

                <div className="mt-4">
                  <span className="text-emerald-400">
                    student@cyberlab
                  </span>

                  <span className="text-gray-500">:</span>

                  <span className="text-blue-400">~</span>

                  <span className="text-gray-400">$</span>{" "}

                  <span className="animate-pulse text-white">
                    nmap -sV target
                  </span>
                </div>

                <div className="mt-3 border-l border-emerald-400/30 pl-4 text-gray-400">
                  <div>PORT     STATE    SERVICE</div>
                  <div>22/tcp   open     ssh</div>
                  <div>80/tcp   open     http</div>
                  <div>443/tcp  open     https</div>
                </div>
              </div>
            </div>

            {/* Current Level */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-lg border border-emerald-400/20 bg-[#0c121c] px-5 py-4 shadow-xl sm:block">
              <div className="font-mono text-[10px] text-gray-500">
                CURRENT LEVEL
              </div>

              <div className="mt-1 font-mono font-bold text-emerald-400">
                SECURITY NOVICE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Labs */}
      <section
        id="labs"
        className="border-t border-white/10 bg-[#090e17]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="font-mono text-xs tracking-[0.3em] text-emerald-400">
                // HANDS-ON TRAINING
              </div>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Featured Labs
              </h2>

              <p className="mt-3 max-w-xl text-gray-400">
                Stop watching tutorials. Start solving real security problems.
              </p>
            </div>

            <a
              href="#labs"
              className="text-left font-mono text-sm text-emerald-400 hover:text-emerald-300"
            >
              VIEW ALL LABS →
            </a>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {labs.map((lab) => (
              <div
                key={lab.title}
                className="group rounded-xl border border-white/10 bg-[#0c121c] p-6 transition hover:-translate-y-1 hover:border-emerald-400/30"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 font-mono text-[10px] text-emerald-400">
                    {lab.category}
                  </span>

                  <span className="font-mono text-xs text-gray-500">
                    {lab.points} XP
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold group-hover:text-emerald-400">
                  {lab.title}
                </h3>

                <p className="mt-3 min-h-14 text-sm leading-6 text-gray-500">
                  {lab.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-xs text-gray-500">
                    Difficulty:{" "}
                    <span className="text-gray-300">
                      {lab.difficulty}
                    </span>
                  </span>

                  <Link
                    href="/register"
                    className="font-mono text-xs text-emerald-400 transition hover:text-emerald-300"
                  >
                    START →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section id="paths">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="font-mono text-xs tracking-[0.3em] text-emerald-400">
            // STRUCTURED LEARNING
          </div>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Learning Paths
          </h2>

          <div className="mt-12 grid gap-5">
            {paths.map((path) => (
              <div
                key={path.number}
                className="group grid gap-6 rounded-xl border border-white/10 bg-[#0c121c] p-6 transition hover:border-emerald-400/30 md:grid-cols-[80px_1fr_auto] md:items-center"
              >
                <div className="font-mono text-3xl font-bold text-gray-700 group-hover:text-emerald-400/50">
                  {path.number}
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    {path.title}
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                    {path.description}
                  </p>
                </div>

                <Link
                  href="/register"
                  className="font-mono text-xs text-gray-500 transition hover:text-emerald-400"
                >
                  {path.labs} LABS →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="about"
        className="border-t border-white/10"
      >
        <div className="mx-auto max-w-5xl px-6 py-28 text-center">
          <div className="font-mono text-xs tracking-[0.3em] text-emerald-400">
            // YOUR JOURNEY STARTS HERE
          </div>

          <h2 className="mt-5 text-4xl font-bold sm:text-5xl">
            Ready to enter the lab?
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-gray-400">
            Build practical cybersecurity skills through challenges designed
            to make you think, experiment, and solve.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex rounded-lg bg-emerald-400 px-8 py-4 font-semibold text-black transition hover:bg-emerald-300"
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#05080d]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="font-mono transition hover:text-gray-400"
          >
            CYBER<span className="text-emerald-400">LAB</span>
          </Link>

          <div>LEARN // PRACTICE // SECURE</div>

          <div>© 2026 CyberLab</div>
        </div>
      </footer>
    </main>
  );
}