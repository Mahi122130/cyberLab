CYBERLAB

CyberLab is a cybersecurity learning and Capture The Flag (CTF) platform where students can:

Create an account and log in
Browse cybersecurity labs
Open individual challenges
Read challenge missions
Launch challenge environments
Use hints
Solve practical cybersecurity tasks
Submit flags
Earn points/XP

Administrators can:

Create and manage labs
Create and manage challenges
Configure challenge flags
Add hints
Activate/deactivate labs and challenges
Configure challenge target environments
Review student submissions
1. Project Architecture

CyberLab is organized as a monorepo.

cyberlab/
│
├── apps/
│   ├── api/                  # NestJS backend
│   │
│   └── web/                  # Next.js frontend
│
├── challenges/
│   ├── web/                  # Web security challenge environments
│   │
│   └── linux/                # Linux challenge environments
│
├── labs/                     # Lab-related project resources
│
├── packages/                 # Shared packages
│
├── infrastructure/           # Infrastructure/configuration
│
├── node_modules/
│
├── package.json
└── README.md
Frontend
apps/web

Technology:

Next.js
React
TypeScript
Tailwind CSS

The frontend is responsible for:

Login/register UI
Dashboard
Lab listing
Challenge pages
Admin dashboard
Challenge creation UI
Flag submission UI
Backend
apps/api

Technology:

NestJS
TypeScript
MySQL

The backend is responsible for:

Authentication
Users
Labs
Challenges
Hints
Flag validation
Submissions
Database operations
Challenge environments
challenges/

These contain Docker-based environments where students actually perform cybersecurity tasks.

2. Requirements

Before starting CyberLab, install:

Node.js
npm
MySQL
Git
Docker Desktop
DBeaver (recommended)
VS Code (recommended)

Verify Node:

node --version

Verify npm:

npm --version

Verify Git:

git --version

Verify Docker:

docker --version
3. Clone the Project

Clone the repository:

git clone <YOUR_REPOSITORY_URL>

Enter the project:

cd cyberlab

Install dependencies:

npm install
4. Database Setup

CyberLab uses MySQL.

Create a database called:

cyberlab

For example:

CREATE DATABASE cyberlab;

Then select it:

USE cyberlab;

The project should contain the required database tables.

Important tables include:

users
labs
challenges
challenge_hints
submissions
5. Database Structure
users

Stores CyberLab users.

users
├── id
├── username
├── email
├── password
└── role

Roles currently include:

STUDENT
ADMIN
6. Labs Table

A lab represents a group/category of cybersecurity challenges.

Important fields:

labs
├── id
├── title
├── slug
├── description
├── category
├── difficulty
├── points
├── target_type
├── target_url
├── docker_image
├── is_active
└── created_at

Example:

Linux Fundamentals

could have:

category: Linux
difficulty: EASY
target_type: LINUX
docker_image: cyberlab/linux-fundamentals
7. Challenges Table

A challenge belongs to a lab.

challenges
├── id
├── lab_id
├── title
├── description
├── task
├── flag
├── points
├── order_number
├── is_active
└── created_at

Example:

Title:
Linux Navigation Basics

Points:
100

Flag:
CYBERLAB{linux_navigation_basics_2026}
IMPORTANT

The flag is stored in the database but is never returned by the student challenge API.

Students should discover the flag by solving the challenge.

8. Challenge Hints

CyberLab uses:

challenge_hints

Structure:

challenge_hints
├── id
├── challenge_id
├── hint_text
├── hint_order
└── created_at

Each challenge can have multiple hints.

Example:

Hint 1:
Hidden files are not normally shown.

Hint 2:
Try using ls with an option that displays hidden files.

Hint 3:
Look for files beginning with a dot.

Hints help students when they are stuck without revealing the flag directly.

9. Submissions Table

Student flag submissions are stored in:

submissions

Structure:

submissions
├── id
├── user_id
├── challenge_id
├── submitted_flag
├── is_correct
└── submitted_at

Every submission records whether the submitted flag was correct.

10. Start the Backend

Open a terminal in:

apps/api

Run:

npm run start:dev

The API should start on:

http://localhost:5001

The API base URL is:

http://localhost:5001/api/v1

For example:

GET http://localhost:5001/api/v1/labs
11. Start the Frontend

Open another terminal.

Go to:

cd apps/web

Run:

npm run dev

The frontend should normally be available at:

http://localhost:3000

Open it in your browser.

12. Environment Variables

The frontend uses:

NEXT_PUBLIC_API_URL

Recommended value:

NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1

Make sure there is no accidental duplication:

Correct:

http://localhost:5001/api/v1

Incorrect:

http://localhost:5001/api/v1/api/v1
13. User Registration

A new student starts by opening:

/register

They enter:

Username
Email
Password

After registration, they can log in.

14. User Login

Open:

/login

Enter:

Email
Password

The backend authenticates the user.

After successful login, CyberLab stores:

cyberlab_token
cyberlab_user

in browser local storage.

Students are redirected to:

/dashboard

Administrators are redirected to:

/admin
15. Student Workflow

A normal student workflow is:

Register
   ↓
Login
   ↓
Dashboard
   ↓
Labs
   ↓
Choose Lab
   ↓
Choose Challenge
   ↓
Read Mission
   ↓
Open Target
   ↓
Solve Challenge
   ↓
Use Hints if Necessary
   ↓
Find Flag
   ↓
Submit Flag
   ↓
Correct / Incorrect
   ↓
Earn XP
16. Browse Labs

Students open:

/labs

The frontend requests:

GET /labs

Only active labs should be displayed to students.

17. Open a Lab

A lab URL looks like:

/labs/4

The frontend requests:

GET /labs/4

and:

GET /labs/4/challenges

The challenge list contains:

Challenge title
Description
Points
Order
Status

The actual flag is never included.

18. Open a Challenge

A challenge URL looks like:

/labs/4/challenge/10

The frontend requests:

GET /labs/4/challenges/10

The response contains:

Challenge information
Task
Points
Hints

It must NOT contain:

flag
19. Challenge Target

A challenge can have a target environment.

For example:

target_type:
WEB

and:

target_url:
http://localhost:8080

The student can use:

OPEN TARGET

to open the environment.

20. Linux Challenge Example

Suppose we create:

Linux Navigation Basics

The task might be:

Connect to the Linux environment and navigate through the filesystem.

Find the hidden file inside /home/student/
and read its contents to obtain the flag.

The student launches the Linux environment and uses commands such as:

pwd
ls
ls -la
cd /home/student

They eventually locate the hidden file and read it.

21. Web Challenge Example

A web challenge might provide:

http://localhost:8080

The student opens the target and investigates the application.

For an IDOR challenge, the page might expose:

/api/profile/1001

The student investigates whether another user's profile can be accessed.

The challenge should ultimately reveal a flag such as:

CYBERLAB{idor_profile_access_2026}

The student copies that flag into CyberLab.

22. Hints

A challenge can contain multiple hints.

Example:

HINT 1
Look at how the application identifies users.

HINT 2
The profile endpoint contains a numeric identifier.

HINT 3
Try changing the identifier.

Hints should progressively help the student.

Avoid putting the actual flag inside a hint.

23. Flag Submission

The frontend sends the student's flag to:

POST /submissions

Example request:

{
  "userId": 3,
  "challengeId": 10,
  "flag": "CYBERLAB{linux_navigation_basics_2026}"
}

The backend:

Finds the challenge.
Checks that it exists.
Checks that it is active.
Retrieves the stored flag.
Compares the submitted flag.
Stores the submission.
Returns the result.
24. Correct Flag

If correct, the backend returns approximately:

{
  "success": true,
  "correct": true,
  "message": "Correct flag! Challenge completed.",
  "points": 100
}

The frontend should display something like:

✓ CORRECT FLAG

Challenge completed.

+100 XP
25. Incorrect Flag

If incorrect:

{
  "success": false,
  "correct": false,
  "message": "Incorrect flag",
  "points": 0
}

The frontend should display:

✕ INCORRECT FLAG

Try again.
26. Creating an Admin Lab

Administrators create labs through the admin interface.

A lab needs:

Title
Slug
Description
Category
Difficulty
Points
Target Type
Target URL
Docker Image
Active/Inactive

Example:

Title:
Linux Fundamentals

Slug:
linux-fundamentals

Category:
LINUX

Difficulty:
EASY

Points:
500

Target Type:
LINUX

Docker Image:
cyberlab/linux-fundamentals
27. Creating a Challenge

From the admin dashboard, create a challenge.

Required information:

Lab
Title
Description
Task
Flag
Points
Order Number
Active

Hints can also be added.

Example:

Challenge:
Linux Navigation Basics

Description:
Learn how to navigate the Linux filesystem.

Task:
Find the hidden file inside /home/student/.

Flag:
CYBERLAB{linux_navigation_basics_2026}

Points:
100

Order:
1
28. Adding Hints

Add hints in increasing levels of assistance.

Example:

Hint 1:
Hidden files are not normally shown.

Hint 2:
Try using ls with an option that displays hidden files.

Hint 3:
Look inside /home/student/ for a file beginning with a dot.

The hints are stored in:

challenge_hints

They are linked to the challenge using:

challenge_id
29. Creating a Linux Docker Challenge

A Linux challenge environment can be organized like:

challenges/
└── linux/
    └── linux-01/
        ├── Dockerfile
        └── start.sh

Example Dockerfile:

FROM ubuntu:24.04

RUN apt-get update && \
    apt-get install -y \
    bash \
    coreutils \
    procps \
    net-tools \
    iproute2 && \
    rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash student

RUN mkdir -p /home/student/.secret

RUN echo "CYBERLAB{linux_navigation_basics_2026}" \
    > /home/student/.secret/flag.txt

RUN chown -R student:student /home/student

WORKDIR /home/student

USER student

CMD ["bash"]
30. Build the Linux Docker Image

From the project root:

docker build \
  -t cyberlab/linux-fundamentals \
  ./challenges/linux/linux-01

Check that the image exists:

docker images

You should see:

cyberlab/linux-fundamentals
31. Run the Linux Container

For example:

docker run -it \
  --name cyberlab-linux-01 \
  cyberlab/linux-fundamentals

Inside the container:

whoami

should show:

student

Then:

cd /home/student

and:

ls -la

The hidden directory should be visible.

32. Web Docker Challenge

Web challenges can have their own folder.

Example:

challenges/
└── web/
    └── idor-01/
        ├── Dockerfile
        ├── package.json
        └── server.js

Build:

docker build \
  -t cyberlab/idor-01 \
  ./challenges/web/idor-01

Run:

docker run \
  --name cyberlab-idor-01 \
  -p 8080:3000 \
  cyberlab/idor-01

The challenge should then be accessible at:

http://localhost:8080
33. Configure the Lab Target

In the lab configuration, set:

Target Type:
WEB

Target URL:

http://localhost:8080

Docker image:

cyberlab/idor-01

Now the student challenge page can show:

TARGET

Challenge environment

http://localhost:8080

[ OPEN TARGET ]
34. Important Flag Security Rule

Never return the flag from:

GET /labs/:labId/challenges

or:

GET /labs/:labId/challenges/:challengeId

Do NOT do this:

SELECT
    id,
    title,
    task,
    flag
FROM challenges

The student could simply inspect the browser's network response and obtain the answer.

Instead:

SELECT
    id,
    lab_id,
    title,
    description,
    task,
    points,
    order_number,
    is_active,
    created_at
FROM challenges

The flag should only be accessed internally by the submission service.

35. Current Submission Security Note

The current submission API accepts:

{
  "userId": 3,
  "challengeId": 10,
  "flag": "..."
}

This is useful for development, but it is not the final production security model.

A malicious user could potentially change:

userId

in the request.

The production implementation should eventually derive the user from the authenticated JWT rather than trusting:

body.userId

Recommended future flow:

JWT
 ↓
Authenticated user
 ↓
user ID from JWT
 ↓
Submit flag

rather than:

Request body
 ↓
userId
36. Admin Security Note

The current frontend checks:

cyberlab_user.role === "ADMIN"

before showing the admin page.

This is useful for the UI, but it is not sufficient backend security.

A user should not be able to call admin endpoints directly just because they know the URL.

Eventually the backend should use:

JWT authentication
+
ADMIN role guard

for administrative endpoints.

37. Useful API Endpoints
Authentication
POST /api/v1/auth/login
Labs
POST /api/v1/labs
GET /api/v1/labs
GET /api/v1/labs/active
GET /api/v1/labs/slug/:slug
GET /api/v1/labs/:id
PUT /api/v1/labs/:id
PATCH /api/v1/labs/:id/status
DELETE /api/v1/labs/:id
Challenges
GET /api/v1/labs/:labId/challenges
GET /api/v1/labs/:labId/challenges/all
GET /api/v1/labs/:labId/challenges/:challengeId
POST /api/v1/labs/:labId/challenges
PUT /api/v1/labs/:labId/challenges/:challengeId
PATCH /api/v1/labs/:labId/challenges/:challengeId/status
DELETE /api/v1/labs/:labId/challenges/:challengeId
Submissions
POST /api/v1/submissions
GET /api/v1/submissions
GET /api/v1/submissions/user/:userId
38. Testing the API

You can test the backend using:

Browser
Postman
Thunder Client
curl

For example:

curl http://localhost:5001/api/v1/labs

Challenge list:

curl http://localhost:5001/api/v1/labs/4/challenges

Specific challenge:

curl http://localhost:5001/api/v1/labs/4/challenges/1

The last response should contain hints but not the flag.

39. Check Database

Using DBeaver:

Database
└── cyberlab
    ├── users
    ├── labs
    ├── challenges
    ├── challenge_hints
    └── submissions

To inspect challenges:

SELECT *
FROM challenges;

To inspect hints:

SELECT *
FROM challenge_hints
ORDER BY challenge_id, hint_order;

To inspect submissions:

SELECT *
FROM submissions
ORDER BY submitted_at DESC;
40. Common Problems
Backend doesn't start

Run:

cd apps/api
npm install
npm run start:dev

Check the terminal for the actual error.

Frontend doesn't start

Run:

cd apps/web
npm install
npm run dev
Frontend cannot reach API

Check:

NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1

Then restart Next.js.

Challenge list is empty

Check:

SELECT *
FROM challenges
WHERE lab_id = 4;

Make sure:

is_active = 1
Hints don't appear

Check:

SELECT *
FROM challenge_hints
WHERE challenge_id = YOUR_CHALLENGE_ID
ORDER BY hint_order;

Also test:

GET /api/v1/labs/:labId/challenges/:challengeId
Flag submission fails

Check that the challenge has a flag:

SELECT
    id,
    title,
    flag,
    is_active
FROM challenges;

Make sure the flag isn't NULL.

Docker target doesn't open

Check running containers:

docker ps

Check stopped containers:

docker ps -a

Check logs:

docker logs <container-name>

For example:

docker logs cyberlab-idor-01
41. Recommended Development Workflow

When adding a new challenge, follow this exact order:

1. Design the challenge
        ↓
2. Create Docker environment
        ↓
3. Test Docker environment
        ↓
4. Build Docker image
        ↓
5. Run Docker container
        ↓
6. Solve the challenge yourself
        ↓
7. Determine the correct flag
        ↓
8. Create the lab/challenge in CyberLab
        ↓
9. Add the flag
        ↓
10. Add hints
        ↓
11. Configure target URL
        ↓
12. Open CyberLab as a student
        ↓
13. Launch target
        ↓
14. Solve challenge
        ↓
15. Submit flag
        ↓
16. Verify XP/submission
42. Recommended Challenge Design

Every challenge should have:

Title
Description
Task
Target
Flag
Points
Difficulty
Hints

A good challenge should require the student to actually perform the intended security task.

Avoid challenges where the flag is simply displayed on the first page.

43. Example Challenge Template
Title:
Linux File Permissions

Description:
Linux uses file permissions to control who can
read, write, and execute files.

Task:
Inspect the files in /home/student/permissions/.
Identify the file that is accessible to the current
user and read it to find the flag.

Difficulty:
EASY

Points:
100

Target:
Linux Docker environment

Hint 1:
Start by inspecting the permissions.

Hint 2:
Use ls -l.

Hint 3:
Look for a file your current user can read.

Flag:
CYBERLAB{linux_permissions_2026}
44. Suggested Linux Fundamentals Lab

The first Linux lab can contain:

Linux Fundamentals
│
├── 01 Linux Navigation Basics       100 XP
├── 02 Linux File Permissions        100 XP
├── 03 Find the Hidden Flag          150 XP
├── 04 Linux Process Investigation   150 XP
└── 05 Linux Network Recon           200 XP

Total:

700 XP
45. Suggested Student Experience

A student should eventually experience CyberLab like this:

CYBERLAB

Dashboard
│
├── Labs
│
│   └── Linux Fundamentals
│       │
│       ├── Linux Navigation Basics
│       │
│       ├── Linux File Permissions
│       │
│       ├── Find the Hidden Flag
│       │
│       ├── Linux Process Investigation
│       │
│       └── Linux Network Recon
│
└── Progress

When opening a challenge:

LINUX FUNDAMENTALS

CHALLENGE 01

Linux Navigation Basics

MISSION
──────────────

Your task...

TARGET
──────────────

Challenge environment

[ OPEN TARGET ]

HINTS
──────────────

[ REVEAL HINT 1 ]
[ REVEAL HINT 2 ]
[ REVEAL HINT 3 ]

SUBMIT FLAG
──────────────

[ Enter flag ]

[ SUBMIT FLAG ]

REWARD
──────────────

+100 XP
46. Development Rules

When modifying CyberLab:

Do
Keep flags out of student API responses.
Validate backend input.
Test Docker challenges independently.
Test challenges as a student before publishing.
Keep challenge order numbers organized.
Use meaningful slugs.
Keep hints progressive.
Keep Docker images reproducible.
Check API responses after backend changes.
Don't
Put flags in frontend source code.
Put flags inside publicly accessible static files.
Return flags from challenge GET endpoints.
Trust frontend admin checks as backend security.
Trust userId from the request body in the final production version.
Hard-code production credentials.
Publish an untested challenge.
47. Git Workflow

Before making changes:

git status

Create a branch:

git checkout -b feature/challenge-hints

After changes:

git status

Add files:

git add .

Commit:

git commit -m "Add challenge hints support"

Push:

git push origin feature/challenge-hints
48. Quick Start

For an experienced developer, the shortest startup process is:

Terminal 1 — Backend
cd apps/api
npm install
npm run start:dev
Terminal 2 — Frontend
cd apps/web
npm install
npm run dev
Browser
http://localhost:3000
API
http://localhost:5001/api/v1
49. Complete CyberLab Flow
                    CYBERLAB
                       │
             ┌─────────┴─────────┐
             │                   │
          STUDENT              ADMIN
             │                   │
          Register             Login
             │                   │
           Login             Admin Panel
             │                   │
         Dashboard         ┌─────┴─────┐
             │             │           │
            Labs         Labs      Challenges
             │             │           │
          Choose Lab    Create      Create
             │             │           │
        Choose Challenge Update     Hints
             │             │           │
        Read Mission     Target      Flag
             │             │
        Launch Target
             │
          Solve
             │
          Hints
             │
        Find Flag
             │
       Submit Flag
             │
       ┌─────┴─────┐
       │           │
    Incorrect    Correct
       │           │
      Retry       XP
                   │
               Submission
50. Final Checklist for a New Developer

Before considering the application ready:

[ ] MySQL is running
[ ] cyberlab database exists
[ ] Required tables exist
[ ] challenge_hints exists
[ ] Backend starts successfully
[ ] Frontend starts successfully
[ ] Registration works
[ ] Login works
[ ] Student dashboard works
[ ] Labs load
[ ] Challenges load
[ ] Challenge details load
[ ] Hints load
[ ] Flag is NOT exposed through API
[ ] Target opens
[ ] Docker challenge works
[ ] Flag submission works
[ ] Correct flag gives points
[ ] Incorrect flag is rejected
[ ] Submission is stored
[ ] Admin can create labs
[ ] Admin can create challenges
[ ] Admin can add hints
[ ] Admin can activate/deactivate challenges
[ ] Challenge deletion works
[ ] Docker environment was tested