# 🏠 Tenant Management System A complete web-based application for managing rental properties, tenants, leases, payments, and documents. ## 📋 Features - ✅ **Dashboard** - Overview of tenants, properties, revenue, and alerts - 👥 **Tenant Management** - Add, view, and manage tenant information - 🏢 **Property Management** - Track apartments, rooms, and availability - 📝 **Lease Management** - Create and monitor lease agreements - 💰 **Payment Tracking** - Record and view payment history - 📄 **Document Storage** - Upload and manage signatory files - 🔔 **Automated Reminders** - Rent due and lease expiry notifications ## 🚀 Getting Started ### Prerequisites You need to have **Node.js** installed on your computer. **Download Node.js here:** https://nodejs.org/ (Choose the LTS version) ### Installation Steps 1. **Open VSCode** and open the tenant-management-app folder 2. **Open Terminal in VSCode** (Menu: Terminal > New Terminal) 3. **Install dependencies** (Run this command in terminal):
bash
   npm install
4. **Start the application** (Run this command):
bash
   npm start
5. **Open your browser** and go to:
http://localhost:3000
That's it! Your application is now running! 🎉 ## 📁 Project Structure
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
└── uploads/               # Uploaded documents folder
## 🎨 Customization Guide ### Change Company Name **File:** public/index.html (Line 8)
html
<title>Your Company Name - Tenant Management</title>
**File:** public/index.html (Line 14)
html
<h1>🏠 Your Company Name</h1>
### Change Colors **File:** public/css/style.css Find these lines and change the colors:
css
/* Line 8 - Main gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your colors (use hex codes like #FF5733) */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
**Color generator tool:** https://cssgradient.io/ ### Change Server Port **File:** server.js (Line 12)
javascript
const PORT = 3000;  // Change to any number like 8080, 5000, etc.
### Add Your Logo 1. Put your logo image in public/ folder 2. **Edit:** public/index.html (Line 14)
html
<h1><img src="your-logo.png" width="50"> Your Company Name</h1>
## 💾 Database Information The database file tenant_management.db stores all your data. **To backup your data:** - Simply copy the tenant_management.db file to a safe location **To restore backup:** - Replace tenant_management.db with your backup file **To reset/start fresh:** - Delete tenant_management.db file - Restart the application (it will create a new empty database) ## 📱 Usage Guide ### Adding a Tenant 1. Click **"Tenants"** tab 2. Click **"+ Add Tenant"** button 3. Fill in the form 4. Click **"Save Tenant"** ### Adding a Property 1. Click **"Properties"** tab 2. Click **"+ Add Property"** button 3. Fill in property details 4. Click **"Save Property"** ### Creating a Lease 1. Click **"Leases"** tab 2. Click **"+ Create Lease"** button 3. Select tenant and property 4. Set start/end dates and rent amount 5. Click **"Create Lease"** ### Recording a Payment 1. Click **"Payments"** tab 2. Click **"+ Record Payment"** button 3. Select the lease 4. Enter payment details 5. Click **"Record Payment"** ### Uploading Documents 1. Click **"Documents"** tab 2. Click **"+ Upload Document"** button 3. Select tenant/lease (optional) 4. Choose document type 5. Select file and click **"Upload Document"** ### Setting Up Reminders 1. Click **"Reminders"** tab 2. Click **"🔄 Generate Reminders"** button 3. View upcoming reminders 4. Mark as sent when you contact tenants ## 🔧 Troubleshooting ### Error: "Port 3000 is already in use" **Solution:** Change the port number in server.js to 3001 or 8080 ### Error: "Cannot find module" **Solution:** Run npm install again in the terminal ### Database not saving data **Solution:** Check if you have write permissions in the folder ### Can't access from another computer **Solution:** 1. Find your computer's IP address 2. Change server.js line to: app.listen(PORT, '0.0.0.0') 3. Access from other computers using: http://YOUR_IP:3000 ## 📞 How to Stop the Server Press Ctrl + C in the terminal where the server is running ## 🔒 Security Notes - This is a local application (only accessible on your computer by default) - Database is stored locally in tenant_management.db - Upload files are stored in the uploads/ folder - For production use, add authentication and use HTTPS ## 📝 Notes - All dates are in format: YYYY-MM-DD (2024-01-15) - Amounts are in decimal format (1500.50) - Reminders auto-generate for rent due dates and lease expiry - Documents can be PDF, images, or any file type ## 🆘 Need Help? If you encounter any issues: 1. Check the terminal for error messages 2. Make sure Node.js is installed: node --version 3. Ensure all files are in the correct folders 4. Try deleting node_modules folder and run npm install again ## 📚 Tech Stack - **Backend:** Node.js + Express - **Database:** SQLite3 - **Frontend:** HTML, CSS, JavaScript - **File Upload:** Multer --- **Made with ❤️ for property managers**
