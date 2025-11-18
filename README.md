🏠 Tenant Management System

A complete web-based application for managing rental properties, tenants, leases, payments, and documents. Perfect for property managers to streamline operations and track tenants efficiently.

📋 Features

✅ Dashboard – Overview of tenants, properties, revenue, and alerts

👥 Tenant Management – Add, view, and manage tenant information

🏢 Property Management – Track apartments, rooms, and availability

📝 Lease Management – Create and monitor lease agreements

💰 Payment Tracking – Record and view payment history

📄 Document Storage – Upload and manage signatory files

🔔 Automated Reminders – Rent due and lease expiry notifications

🚀 Getting Started
Prerequisites

Node.js (LTS version recommended)
Download Node.js here

Installation Steps

Open VSCode and open the tenant-management-app folder

Open a terminal (Menu → Terminal → New Terminal)

Install dependencies:

npm install


Start the application:

npm start


Open your browser and go to:

http://localhost:3000


Your application should now be running! 🎉

📁 Project Structure
tenant-management-app/
├── server.js              # Backend server (Database + API)
├── package.json           # Project dependencies
├── tenant_management.db   # Database (auto-created)
├── public/               
│   ├── index.html         # Main webpage
│   ├── css/
│   │   └── style.css      # Styling
│   └── js/
│       └── app.js         # Frontend logic
└── uploads/               # Uploaded documents

🎨 Customization
Change Company Name

File: public/index.html

<title>Your Company Name - Tenant Management</title>
<h1>🏠 Your Company Name</h1>

Change Colors

File: public/css/style.css

/* Main gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);


Use your preferred hex codes (e.g., #FF5733). Color tool: CSS Gradient

Change Server Port

File: server.js

const PORT = 3000; // Change to any port (8080, 5000, etc.)

Add Your Logo

Place logo in public/ folder

Update in index.html:

<h1><img src="your-logo.png" width="50"> Your Company Name</h1>

💾 Database

Database file: tenant_management.db

Backup: Copy the file to a safe location

Restore: Replace with backup file

Reset: Delete the file; app will auto-create a new database

📱 Usage Guide
Adding a Tenant

Click Tenants tab

Click + Add Tenant

Fill form → Save Tenant

Adding a Property

Click Properties tab

Click + Add Property

Fill details → Save Property

Creating a Lease

Click Leases tab

Click + Create Lease

Select tenant & property, set dates & rent → Create Lease

Recording a Payment

Click Payments tab

Click + Record Payment

Select lease → Enter details → Record Payment

Uploading Documents

Click Documents tab

Click + Upload Document

Select tenant/lease → Choose file → Upload Document

Setting Up Reminders

Click Reminders tab

Click 🔄 Generate Reminders

View and mark reminders as sent

🔧 Troubleshooting

Port 3000 in use: Change port in server.js

Cannot find module: Run npm install

Database not saving: Ensure write permissions

Access from another computer:

Set app.listen(PORT, '0.0.0.0') in server.js

Use http://YOUR_IP:3000

Stop Server

Press Ctrl + C in terminal

🔒 Security Notes

Local app (default localhost access)

Database: tenant_management.db

Uploads stored in uploads/

For production: add authentication + HTTPS

📚 Tech Stack

Backend: Node.js + Express

Database: SQLite3

Frontend: HTML, CSS, JavaScript

File Uploads: Multer

Made with ❤️ for property managers
