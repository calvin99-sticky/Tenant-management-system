const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Database setup
const db = new sqlite3.Database('./tenant_management.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Tenants table
    db.run(`CREATE TABLE IF NOT EXISTS tenants (
      tenant_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      national_id TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      date_of_birth DATE,
      occupation TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Properties table
    db.run(`CREATE TABLE IF NOT EXISTS properties (
      property_id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_name TEXT NOT NULL,
      property_type TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT,
      state TEXT,
      room_number TEXT,
      bedrooms INTEGER,
      bathrooms REAL,
      monthly_rent REAL NOT NULL,
      security_deposit REAL,
      amenities TEXT,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Leases table
    db.run(`CREATE TABLE IF NOT EXISTS leases (
      lease_id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      property_id INTEGER NOT NULL,
      lease_start_date DATE NOT NULL,
      lease_end_date DATE NOT NULL,
      rent_amount REAL NOT NULL,
      security_deposit_paid REAL,
      payment_due_day INTEGER DEFAULT 1,
      lease_status TEXT DEFAULT 'active',
      terms_conditions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
      FOREIGN KEY (property_id) REFERENCES properties(property_id)
    )`);

    // Payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      lease_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      payment_date DATE NOT NULL,
      amount_paid REAL NOT NULL,
      payment_period_start DATE NOT NULL,
      payment_period_end DATE NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_reference TEXT,
      payment_status TEXT DEFAULT 'completed',
      late_fee REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lease_id) REFERENCES leases(lease_id),
      FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
    )`);

    // Documents table
    db.run(`CREATE TABLE IF NOT EXISTS documents (
      document_id INTEGER PRIMARY KEY AUTOINCREMENT,
      lease_id INTEGER,
      tenant_id INTEGER,
      property_id INTEGER,
      document_type TEXT NOT NULL,
      document_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      uploaded_by TEXT,
      description TEXT,
      FOREIGN KEY (lease_id) REFERENCES leases(lease_id),
      FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
      FOREIGN KEY (property_id) REFERENCES properties(property_id)
    )`);

    // Reminders table
    db.run(`CREATE TABLE IF NOT EXISTS reminders (
      reminder_id INTEGER PRIMARY KEY AUTOINCREMENT,
      lease_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      reminder_type TEXT NOT NULL,
      reminder_date DATE NOT NULL,
      message TEXT,
      is_sent INTEGER DEFAULT 0,
      sent_at DATETIME,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lease_id) REFERENCES leases(lease_id),
      FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
    )`);

    console.log('Database tables initialized');
  });
}

// ============= API ENDPOINTS =============

// TENANTS
app.get('/api/tenants', (req, res) => {
  db.all('SELECT * FROM tenants ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/tenants/:id', (req, res) => {
  db.get('SELECT * FROM tenants WHERE tenant_id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/api/tenants', (req, res) => {
  const { first_name, last_name, email, phone, national_id, emergency_contact_name, 
          emergency_contact_phone, date_of_birth, occupation } = req.body;
  
  const sql = `INSERT INTO tenants (first_name, last_name, email, phone, national_id, 
                emergency_contact_name, emergency_contact_phone, date_of_birth, occupation) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [first_name, last_name, email, phone, national_id, emergency_contact_name,
               emergency_contact_phone, date_of_birth, occupation], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ tenant_id: this.lastID, message: 'Tenant created successfully' });
  });
});

app.put('/api/tenants/:id', (req, res) => {
  const { first_name, last_name, email, phone, national_id, emergency_contact_name,
          emergency_contact_phone, date_of_birth, occupation, status } = req.body;
  
  const sql = `UPDATE tenants SET first_name=?, last_name=?, email=?, phone=?, national_id=?,
                emergency_contact_name=?, emergency_contact_phone=?, date_of_birth=?, 
                occupation=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE tenant_id=?`;
  
  db.run(sql, [first_name, last_name, email, phone, national_id, emergency_contact_name,
               emergency_contact_phone, date_of_birth, occupation, status, req.params.id], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Tenant updated successfully' });
    });
});

app.delete('/api/tenants/:id', (req, res) => {
  db.run('DELETE FROM tenants WHERE tenant_id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Tenant deleted successfully' });
  });
});

// PROPERTIES
app.get('/api/properties', (req, res) => {
  db.all('SELECT * FROM properties ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/properties', (req, res) => {
  const { property_name, property_type, address, city, state, room_number, 
          bedrooms, bathrooms, monthly_rent, security_deposit, amenities } = req.body;
  
  const sql = `INSERT INTO properties (property_name, property_type, address, city, state,
                room_number, bedrooms, bathrooms, monthly_rent, security_deposit, amenities)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [property_name, property_type, address, city, state, room_number,
               bedrooms, bathrooms, monthly_rent, security_deposit, amenities], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ property_id: this.lastID, message: 'Property created successfully' });
  });
});

app.put('/api/properties/:id', (req, res) => {
  const { property_name, property_type, address, city, state, room_number,
          bedrooms, bathrooms, monthly_rent, security_deposit, amenities, status } = req.body;
  
  const sql = `UPDATE properties SET property_name=?, property_type=?, address=?, city=?,
                state=?, room_number=?, bedrooms=?, bathrooms=?, monthly_rent=?,
                security_deposit=?, amenities=?, status=?, updated_at=CURRENT_TIMESTAMP 
                WHERE property_id=?`;
  
  db.run(sql, [property_name, property_type, address, city, state, room_number,
               bedrooms, bathrooms, monthly_rent, security_deposit, amenities, status, 
               req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Property updated successfully' });
  });
});

app.delete('/api/properties/:id', (req, res) => {
  db.run('DELETE FROM properties WHERE property_id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Property deleted successfully' });
  });
});

// LEASES
app.get('/api/leases', (req, res) => {
  const sql = `SELECT l.*, 
                t.first_name || ' ' || t.last_name as tenant_name,
                p.property_name, p.address
                FROM leases l
                JOIN tenants t ON l.tenant_id = t.tenant_id
                JOIN properties p ON l.property_id = p.property_id
                ORDER BY l.created_at DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/leases', (req, res) => {
  const { tenant_id, property_id, lease_start_date, lease_end_date, rent_amount,
          security_deposit_paid, payment_due_day, terms_conditions } = req.body;
  
  const sql = `INSERT INTO leases (tenant_id, property_id, lease_start_date, lease_end_date,
                rent_amount, security_deposit_paid, payment_due_day, terms_conditions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [tenant_id, property_id, lease_start_date, lease_end_date, rent_amount,
               security_deposit_paid, payment_due_day, terms_conditions], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Update property status to occupied
    db.run('UPDATE properties SET status = "occupied" WHERE property_id = ?', [property_id]);
    
    res.json({ lease_id: this.lastID, message: 'Lease created successfully' });
  });
});

app.put('/api/leases/:id', (req, res) => {
  const { lease_status } = req.body;
  
  db.run('UPDATE leases SET lease_status=?, updated_at=CURRENT_TIMESTAMP WHERE lease_id=?',
    [lease_status, req.params.id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Lease updated successfully' });
    });
});

// PAYMENTS
app.get('/api/payments', (req, res) => {
  const sql = `SELECT p.*, 
                t.first_name || ' ' || t.last_name as tenant_name,
                pr.property_name
                FROM payments p
                JOIN tenants t ON p.tenant_id = t.tenant_id
                JOIN leases l ON p.lease_id = l.lease_id
                JOIN properties pr ON l.property_id = pr.property_id
                ORDER BY p.payment_date DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/payments/tenant/:tenant_id', (req, res) => {
  const sql = `SELECT p.*, pr.property_name
                FROM payments p
                JOIN leases l ON p.lease_id = l.lease_id
                JOIN properties pr ON l.property_id = pr.property_id
                WHERE p.tenant_id = ?
                ORDER BY p.payment_date DESC`;
  
  db.all(sql, [req.params.tenant_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/payments', (req, res) => {
  const { lease_id, tenant_id, payment_date, amount_paid, payment_period_start,
          payment_period_end, payment_method, transaction_reference, notes } = req.body;
  
  const sql = `INSERT INTO payments (lease_id, tenant_id, payment_date, amount_paid,
                payment_period_start, payment_period_end, payment_method,
                transaction_reference, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [lease_id, tenant_id, payment_date, amount_paid, payment_period_start,
               payment_period_end, payment_method, transaction_reference, notes], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ payment_id: this.lastID, message: 'Payment recorded successfully' });
    });
});

// DOCUMENTS
app.get('/api/documents', (req, res) => {
  db.all('SELECT * FROM documents ORDER BY upload_date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/documents/tenant/:tenant_id', (req, res) => {
  db.all('SELECT * FROM documents WHERE tenant_id = ? ORDER BY upload_date DESC', 
    [req.params.tenant_id], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
});

app.post('/api/documents', upload.single('document'), (req, res) => {
  const { tenant_id, lease_id, property_id, document_type, description } = req.body;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const sql = `INSERT INTO documents (tenant_id, lease_id, property_id, document_type,
                document_name, file_path, file_size, file_type, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [tenant_id, lease_id, property_id, document_type, file.originalname,
               file.path, file.size, file.mimetype, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ document_id: this.lastID, message: 'Document uploaded successfully' });
  });
});

app.delete('/api/documents/:id', (req, res) => {
  db.get('SELECT file_path FROM documents WHERE document_id = ?', [req.params.id], 
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Delete file from disk
      if (row && fs.existsSync(row.file_path)) {
        fs.unlinkSync(row.file_path);
      }
      
      // Delete from database
      db.run('DELETE FROM documents WHERE document_id = ?', [req.params.id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Document deleted successfully' });
      });
    });
});

// REMINDERS
app.get('/api/reminders', (req, res) => {
  const sql = `SELECT r.*, 
                t.first_name || ' ' || t.last_name as tenant_name,
                t.phone, t.email
                FROM reminders r
                JOIN tenants t ON r.tenant_id = t.tenant_id
                WHERE r.status = 'pending'
                ORDER BY r.reminder_date ASC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/reminders/upcoming', (req, res) => {
  const sql = `SELECT r.*, 
                t.first_name || ' ' || t.last_name as tenant_name,
                t.phone, t.email,
                p.property_name
                FROM reminders r
                JOIN tenants t ON r.tenant_id = t.tenant_id
                JOIN leases l ON r.lease_id = l.lease_id
                JOIN properties p ON l.property_id = p.property_id
                WHERE r.reminder_date >= date('now') 
                AND r.reminder_date <= date('now', '+30 days')
                AND r.status = 'pending'
                ORDER BY r.reminder_date ASC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/reminders/generate', (req, res) => {
  // Generate rent due reminders for active leases
  const sql = `INSERT INTO reminders (lease_id, tenant_id, reminder_type, reminder_date, message, priority)
                SELECT l.lease_id, l.tenant_id, 'rent_due',
                  date('now', '+' || (l.payment_due_day - cast(strftime('%d', 'now') as integer)) || ' days'),
                  'Rent payment due on ' || date('now', '+' || (l.payment_due_day - cast(strftime('%d', 'now') as integer)) || ' days'),
                  'high'
                FROM leases l
                WHERE l.lease_status = 'active'
                AND NOT EXISTS (
                  SELECT 1 FROM reminders r
                  WHERE r.lease_id = l.lease_id
                  AND r.reminder_type = 'rent_due'
                  AND strftime('%Y-%m', r.reminder_date) = strftime('%Y-%m', 'now')
                )`;
  
  db.run(sql, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Generate lease expiry reminders
    const expirySql = `INSERT INTO reminders (lease_id, tenant_id, reminder_type, reminder_date, message, priority)
                        SELECT l.lease_id, l.tenant_id, 'lease_expiry',
                          date(l.lease_end_date, '-30 days'),
                          'Lease expires on ' || l.lease_end_date,
                          'urgent'
                        FROM leases l
                        WHERE l.lease_status = 'active'
                        AND date(l.lease_end_date) <= date('now', '+60 days')
                        AND NOT EXISTS (
                          SELECT 1 FROM reminders r
                          WHERE r.lease_id = l.lease_id
                          AND r.reminder_type = 'lease_expiry'
                        )`;
    
    db.run(expirySql, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Reminders generated successfully' });
    });
  });
});

app.put('/api/reminders/:id/mark-sent', (req, res) => {
  db.run(`UPDATE reminders SET is_sent = 1, status = 'sent', 
          sent_at = CURRENT_TIMESTAMP WHERE reminder_id = ?`,
    [req.params.id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Reminder marked as sent' });
    });
});

// DASHBOARD STATS
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {};
  
  db.get('SELECT COUNT(*) as total FROM tenants WHERE status = "active"', (err, row) => {
    stats.active_tenants = row ? row.total : 0;
    
    db.get('SELECT COUNT(*) as total FROM properties WHERE status = "available"', (err, row) => {
      stats.available_properties = row ? row.total : 0;
      
      db.get(`SELECT SUM(amount_paid) as total FROM payments 
              WHERE strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')`, 
        (err, row) => {
          stats.monthly_revenue = row ? (row.total || 0) : 0;
          
          db.get(`SELECT COUNT(*) as total FROM leases 
                  WHERE lease_status = 'active' 
                  AND date(lease_end_date) <= date('now', '+30 days')`,
            (err, row) => {
              stats.expiring_leases = row ? row.total : 0;
              res.json(stats);
            });
        });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Tenant Management System is running!`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📊 Open your browser and go to: http://localhost:${PORT}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
