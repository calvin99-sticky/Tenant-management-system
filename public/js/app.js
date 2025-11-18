const API_URL = 'http://localhost:3000/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadDashboard();
    loadTenants();
    loadProperties();
    loadLeases();
    loadPayments();
    loadDocuments();
    loadReminders();
    setupFormHandlers();
});

// Navigation
function setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    // Reload data for specific tabs
    if (tabName === 'dashboard') loadDashboard();
    if (tabName === 'reminders') loadReminders();
}

// Dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`);
        const stats = await response.json();
        
        document.getElementById('stat-tenants').textContent = stats.active_tenants;
        document.getElementById('stat-properties').textContent = stats.available_properties;
        document.getElementById('stat-revenue').textContent = `$${stats.monthly_revenue.toFixed(2)}`;
        document.getElementById('stat-expiring').textContent = stats.expiring_leases;
        
        loadUpcomingReminders();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadUpcomingReminders() {
    try {
        const response = await fetch(`${API_URL}/reminders/upcoming`);
        const reminders = await response.json();
        
        const container = document.getElementById('upcoming-reminders');
        
        if (reminders.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No upcoming reminders</p></div>';
            return;
        }
        
        container.innerHTML = reminders.map(r => `
            <div class="reminder-card ${r.priority}">
                <div class="reminder-header">
                    <span class="reminder-type">${formatReminderType(r.reminder_type)}</span>
                    <span class="reminder-date">${formatDate(r.reminder_date)}</span>
                </div>
                <div class="reminder-message">${r.message}</div>
                <div class="reminder-tenant">👤 ${r.tenant_name} - ${r.property_name}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading reminders:', error);
    }
}

// Tenants
async function loadTenants() {
    try {
        const response = await fetch(`${API_URL}/tenants`);
        const tenants = await response.json();
        
        const container = document.getElementById('tenants-list');
        
        if (tenants.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Tenants Yet</h3><p>Add your first tenant to get started</p></div>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tenants.map(t => `
                        <tr>
                            <td>${t.first_name} ${t.last_name}</td>
                            <td>${t.email || 'N/A'}</td>
                            <td>${t.phone || 'N/A'}</td>
                            <td><span class="badge badge-${t.status === 'active' ? 'success' : 'warning'}">${t.status}</span></td>
                            <td>
                                <button class="btn btn-danger" onclick="deleteTenant(${t.tenant_id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading tenants:', error);
    }
}

// Properties
async function loadProperties() {
    try {
        const response = await fetch(`${API_URL}/properties`);
        const properties = await response.json();
        
        const container = document.getElementById('properties-list');
        
        if (properties.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Properties Yet</h3><p>Add your first property to get started</p></div>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Address</th>
                        <th>Rent</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${properties.map(p => `
                        <tr>
                            <td>${p.property_name}</td>
                            <td>${p.property_type}</td>
                            <td>${p.address}</td>
                            <td>$${p.monthly_rent}</td>
                            <td><span class="badge badge-${p.status === 'available' ? 'success' : 'warning'}">${p.status}</span></td>
                            <td>
                                <button class="btn btn-danger" onclick="deleteProperty(${p.property_id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading properties:', error);
    }
}

// Leases
async function loadLeases() {
    try {
        const response = await fetch(`${API_URL}/leases`);
        const leases = await response.json();
        
        const container = document.getElementById('leases-list');
        
        if (leases.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Leases Yet</h3><p>Create your first lease agreement</p></div>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Tenant</th>
                        <th>Property</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Rent</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${leases.map(l => `
                        <tr>
                            <td>${l.tenant_name}</td>
                            <td>${l.property_name}</td>
                            <td>${formatDate(l.lease_start_date)}</td>
                            <td>${formatDate(l.lease_end_date)}</td>
                            <td>$${l.rent_amount}</td>
                            <td><span class="badge badge-${l.lease_status === 'active' ? 'success' : 'warning'}">${l.lease_status}</span></td>
                            <td>
                                ${l.lease_status === 'active' ? 
                                    `<button class="btn btn-warning" onclick="terminateLease(${l.lease_id})">Terminate</button>` : 
                                    ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        // Populate lease selects
        populateLeaseSelects(leases);
    } catch (error) {
        console.error('Error loading leases:', error);
    }
}

// Payments
async function loadPayments() {
    try {
        const response = await fetch(`${API_URL}/payments`);
        const payments = await response.json();
        
        const container = document.getElementById('payments-list');
        
        if (payments.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Payments Yet</h3><p>Record your first payment</p></div>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Tenant</th>
                        <th>Property</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.map(p => `
                        <tr>
                            <td>${formatDate(p.payment_date)}</td>
                            <td>${p.tenant_name}</td>
                            <td>${p.property_name}</td>
                            <td>$${p.amount_paid}</td>
                            <td>${p.payment_method}</td>
                            <td><span class="badge badge-success">${p.payment_status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

// Documents
async function loadDocuments() {
    try {
        const response = await fetch(`${API_URL}/documents`);
        const documents = await response.json();
        
        const container = document.getElementById('documents-list');
        
        if (documents.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Documents Yet</h3><p>Upload your first document</p></div>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Upload Date</th>
                        <th>Size</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${documents.map(d => `
                        <tr>
                            <td>${d.document_name}</td>
                            <td>${d.document_type}</td>
                            <td>${formatDate(d.upload_date)}</td>
                            <td>${formatFileSize(d.file_size)}</td>
                            <td>
                                <a href="/${d.file_path}" target="_blank" class="btn btn-success">View</a>
                                <button class="btn btn-danger" onclick="deleteDocument(${d.document_id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

// Reminders
async function loadReminders() {
    try {
        const response = await fetch(`${API_URL}/reminders`);
        const reminders = await response.json();
        
        const container = document.getElementById('reminders-list');
        
        if (reminders.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Pending Reminders</h3><p>Click "Generate Reminders" to create automatic reminders</p></div>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Tenant</th>
                        <th>Message</th>
                        <th>Priority</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${reminders.map(r => `
                        <tr>
                            <td>${formatDate(r.reminder_date)}</td>
                            <td>${formatReminderType(r.reminder_type)}</td>
                            <td>${r.tenant_name}<br><small>${r.phone}</small></td>
                            <td>${r.message}</td>
                            <td><span class="badge badge-${getPriorityColor(r.priority)}">${r.priority}</span></td>
                            <td>
                                <button class="btn btn-success" onclick="markReminderSent(${r.reminder_id})">Mark Sent</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading reminders:', error);
    }
}

// Form Handlers
function setupFormHandlers() {
    // Tenant form
    document.getElementById('add-tenant-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch(`${API_URL}/tenants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showAlert('Tenant added successfully!', 'success');
                e.target.reset();
                hideAddTenantForm();
                loadTenants();
                loadDashboard();
            }
        } catch (error) {
            showAlert('Error adding tenant', 'danger');
        }
    });
    
    // Property form
    document.getElementById('add-property-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch(`${API_URL}/properties`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showAlert('Property added successfully!', 'success');
                e.target.reset();
                hideAddPropertyForm();
                loadProperties();
                loadDashboard();
            }
        } catch (error) {
            showAlert('Error adding property', 'danger');
        }
    });
    
    // Lease form
    document.getElementById('add-lease-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch(`${API_URL}/leases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showAlert('Lease created successfully!', 'success');
                e.target.reset();
                hideAddLeaseForm();
                loadLeases();
                loadDashboard();
            }
        } catch (error) {
            showAlert('Error creating lease', 'danger');
        }
    });
    
    // Payment form
    document.getElementById('add-payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch(`${API_URL}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showAlert('Payment recorded successfully!', 'success');
                e.target.reset();
                hideAddPaymentForm();
                loadPayments();
                loadDashboard();
            }
        } catch (error) {
            showAlert('Error recording payment', 'danger');
        }
    });
    
    // Document upload form
    document.getElementById('upload-document-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch(`${API_URL}/documents`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                showAlert('Document uploaded successfully!', 'success');
                e.target.reset();
                hideUploadDocumentForm();
                loadDocuments();
            }
        } catch (error) {
            showAlert('Error uploading document', 'danger');
        }
    });
}

// Form Show/Hide Functions
function showAddTenantForm() {
    document.getElementById('tenant-form').style.display = 'block';
}

function hideAddTenantForm() {
    document.getElementById('tenant-form').style.display = 'none';
}

function showAddPropertyForm() {
    document.getElementById('property-form').style.display = 'block';
}

function hideAddPropertyForm() {
    document.getElementById('property-form').style.display = 'none';
}

async function showAddLeaseForm() {
    document.getElementById('lease-form').style.display = 'block';
    await populateTenantSelect();
    await populatePropertySelect();
}

function hideAddLeaseForm() {
    document.getElementById('lease-form').style.display = 'none';
}

async function showAddPaymentForm() {
    document.getElementById('payment-form').style.display = 'block';
    await populateLeaseSelectForPayment();
}

function hideAddPaymentForm() {
    document.getElementById('payment-form').style.display = 'none';
}

async function showUploadDocumentForm() {
    document.getElementById('document-form').style.display = 'block';
    await populateTenantSelectForDoc();
    await populateLeaseSelectForDoc();
}

function hideUploadDocumentForm() {
    document.getElementById('document-form').style.display = 'none';
}

// Populate Select Dropdowns
async function populateTenantSelect() {
    const response = await fetch(`${API_URL}/tenants`);
    const tenants = await response.json();
    const select = document.getElementById('lease-tenant-select');
    select.innerHTML = '<option value="">Select Tenant</option>' +
        tenants.map(t => `<option value="${t.tenant_id}">${t.first_name} ${t.last_name}</option>`).join('');
}

async function populatePropertySelect() {
    const response = await fetch(`${API_URL}/properties`);
    const properties = await response.json();
    const availableProps = properties.filter(p => p.status === 'available');
    const select = document.getElementById('lease-property-select');
    select.innerHTML = '<option value="">Select Property</option>' +
        availableProps.map(p => `<option value="${p.property_id}">${p.property_name} - ${p.address}</option>`).join('');
}

async function populateLeaseSelectForPayment() {
    const response = await fetch(`${API_URL}/leases`);
    const leases = await response.json();
    const activeLeases = leases.filter(l => l.lease_status === 'active');
    const select = document.getElementById('payment-lease-select');
    select.innerHTML = '<option value="">Select Lease</option>' +
        activeLeases.map(l => `<option value="${l.lease_id}" data-tenant="${l.tenant_id}">${l.tenant_name} - ${l.property_name}</option>`).join('');
}

function populateLeaseSelects(leases) {
    const activeLeases = leases.filter(l => l.lease_status === 'active');
    
    // For payments
    const paymentSelect = document.getElementById('payment-lease-select');
    if (paymentSelect) {
        paymentSelect.innerHTML = '<option value="">Select Lease</option>' +
            activeLeases.map(l => `<option value="${l.lease_id}" data-tenant="${l.tenant_id}">${l.tenant_name} - ${l.property_name}</option>`).join('');
    }
}

async function populateTenantSelectForDoc() {
    const response = await fetch(`${API_URL}/tenants`);
    const tenants = await response.json();
    const select = document.getElementById('doc-tenant-select');
    select.innerHTML = '<option value="">Select Tenant (Optional)</option>' +
        tenants.map(t => `<option value="${t.tenant_id}">${t.first_name} ${t.last_name}</option>`).join('');
}

async function populateLeaseSelectForDoc() {
    const response = await fetch(`${API_URL}/leases`);
    const leases = await response.json();
    const select = document.getElementById('doc-lease-select');
    select.innerHTML = '<option value="">Select Lease (Optional)</option>' +
        leases.map(l => `<option value="${l.lease_id}">${l.tenant_name} - ${l.property_name}</option>`).join('');
}

function updatePaymentTenant() {
    const leaseSelect = document.getElementById('payment-lease-select');
    const selectedOption = leaseSelect.options[leaseSelect.selectedIndex];
    const tenantId = selectedOption.getAttribute('data-tenant');
    document.getElementById('payment-tenant-id').value = tenantId;
}

// Delete Functions
async function deleteTenant(id) {
    if (!confirm('Are you sure you want to delete this tenant?')) return;
    
    try {
        const response = await fetch(`${API_URL}/tenants/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Tenant deleted successfully', 'success');
            loadTenants();
            loadDashboard();
        }
    } catch (error) {
        showAlert('Error deleting tenant', 'danger');
    }
}

async function deleteProperty(id) {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
        const response = await fetch(`${API_URL}/properties/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Property deleted successfully', 'success');
            loadProperties();
            loadDashboard();
        }
    } catch (error) {
        showAlert('Error deleting property', 'danger');
    }
}

async function terminateLease(id) {
    if (!confirm('Are you sure you want to terminate this lease?')) return;
    
    try {
        const response = await fetch(`${API_URL}/leases/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lease_status: 'terminated' })
        });
        if (response.ok) {
            showAlert('Lease terminated successfully', 'success');
            loadLeases();
            loadDashboard();
        }
    } catch (error) {
        showAlert('Error terminating lease', 'danger');
    }
}

async function deleteDocument(id) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
        const response = await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Document deleted successfully', 'success');
            loadDocuments();
        }
    } catch (error) {
        showAlert('Error deleting document', 'danger');
    }
}

// Reminders
async function generateReminders() {
    try {
        const response = await fetch(`${API_URL}/reminders/generate`, { method: 'POST' });
        if (response.ok) {
            showAlert('Reminders generated successfully!', 'success');
            loadReminders();
            loadDashboard();
        }
    } catch (error) {
        showAlert('Error generating reminders', 'danger');
    }
}

async function markReminderSent(id) {
    try {
        const response = await fetch(`${API_URL}/reminders/${id}/mark-sent`, { method: 'PUT' });
        if (response.ok) {
            showAlert('Reminder marked as sent', 'success');
            loadReminders();
        }
    } catch (error) {
        showAlert('Error marking reminder', 'danger');
    }
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatFileSize(bytes) {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatReminderType(type) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getPriorityColor(priority) {
    const colors = {
        'low': 'info',
        'medium': 'warning',
        'high': 'warning',
        'urgent': 'danger'
    };
    return colors[priority] || 'info';
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
