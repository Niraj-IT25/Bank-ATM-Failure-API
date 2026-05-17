# 🏦 Bank ATM Failure Management System

The **Bank ATM Failure Management System** is a comprehensive RESTful API solution designed to solve a critical problem facing modern banking: **the inability to track and respond to ATM failures in real-time**.


## 🔴 The Problem Statement

Banks across Sri Lanka face significant operational challenges when ATMs malfunction. Currently, failures are discovered only when customers attempt to use broken machines, leading to wasted time, frustration, and potential loss of business. Bank staff have no centralized system to track which ATMs are down, where technicians should go, or when repairs are complete.

---

## ✅ Proposed Solution

### System Overview

We propose **Bank ATM Failure Management System**—a centralized digital platform where:

1. **Customers can instantly report failures** via a simple web form
2. **Bank staff see a live dashboard** of all active failures
3. **Technicians know exactly which ATMs need repair** and can update progress
4. **Management has complete visibility** into ATM network health
5. **Historical data is preserved** for analysis and improvement

### Key Solution Features

1. **Public Failure Reporting**
   - Any customer can report a failed ATM
   - No login required
   - Simple form: Location, Issue Type, Contact Info
   - Instant confirmation

2. **Admin Dashboard**
   - Login with JWT authentication
   - See all active failures at a glance
   - Status indicators: Pending, In Progress, Resolved
   - Update failure status and add notes
   - Delete resolved failures from system

3. **Role-Based Access**
   - **Super Admin**: Full system control, delete records
   - **Admin**: Manage technicians, update failures, view reports
   - **Technician**: View assigned failures, update status
   - **Viewer**: Read-only access

4. **Real-Time Updates**
   - Dashboard refreshes automatically
   - Changes visible to all users instantly
   - No manual refresh needed

5. **Security**
   - JWT tokens for authentication
   - bcryptjs for password hashing
   - Role-based permission checks
   - Audit trail of all actions

---

## ✨ Key Features

### 🟢 For Customers (Public)
- ✅ Report ATM failures instantly via web form
- ✅ View all currently reported failures
- ✅ See failure status and resolution timeline
- ✅ No login or registration required
- ✅ Works on any device (mobile, tablet, desktop)

### 🟠 For Bank Administrators (Admin)
- ✅ Real-time dashboard of all ATM failures
- ✅ Filter failures by status (Pending, In Progress, Resolved)
- ✅ Update failure status with technician notes
- ✅ View failure history and patterns
- ✅ Manage technician accounts
- ✅ Generate reports for management

### 🔴 For Management (Super Admin)
- ✅ All admin features
- ✅ Delete resolved failures from system
- ✅ Manage admin user accounts
- ✅ View complete audit trail
- ✅ System-wide analytics and reporting
- ✅ Set user permissions

---

## 👥 User Roles

| Role | Delete | Manage Users | Access |
|------|--------|------------|--------|
| 🔴 Super Admin | ✅ | ✅ | All |
| 🟠 Admin | ✅ | ✅ | Most |
| 🟡 Technician | ❌ | ❌ | View/Report |
| 🟢 Viewer | ❌ | ❌ | View Only |

---

## 📋 Quick Start

```bash
# Backend
cd atm-backend
npm install
npm start

# Frontend (new terminal)
cd atm-solver-frontend
npm install
npm start
```

Open http://localhost:3000

---

## 🚀 Complete File Structure 

```
Bank-ATM-Management-System/
│
├── .gitignore
├── README.md
├── SETUP.md
├── ARCHITECTURE.md
│
├── atm-backend/
│   ├── .gitignore
│   ├── .env.example
│   ├── .env (NOT committed)
│   ├── package.json
│   ├── server.js
│   ├── api.js
│   │
│   ├── models/
│   │   ├── Failure.js
│   │   └── Admin.js
│   │
│   ├── controllers/
│   │   ├── failureController.js
│   │   └── adminAuthController.js
│   │
│   ├── routes/
│   │   ├── failureRoutes.js
│   │   └── adminAuthRoutes.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   └── node_modules/ (NOT committed, in .gitignore)
│
├── atm-solver-frontend/
│   ├── .gitignore
│   ├── .env.example
│   ├── .env (NOT committed)
│   ├── package.json
│   │
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── api.js
│   │   │
│   │   └── components/
│   │       ├── FailureForm.js
│   │       ├── FailureList.js
│   │       ├── FailureItem.js
│   │       ├── AdminLogin.js
│   │       ├── AdminLogin.css
│   │       ├── UserManagement.js
│   │       └── UserManagement.css
│   │
│   └── node_modules/ (NOT committed, in .gitignore)
```

## ✨ Features

✅ JWT Authentication  
✅ Role-Based Access Control (4 roles)  
✅ ATM Failure Reporting  
✅ User Management  
✅ Admin Dashboard  
✅ Real-time Updates  
✅ Permission-Based Deletions  
✅ Activity Logging  

---

## 📦 Tech Stack

**Backend**: Node.js, Express, MongoDB, JWT, bcryptjs  
**Frontend**: React, Axios, React Router  
**Auth**: JWT Token, bcrypt Hashing  

---

## ⚙️ Configuration

### Backend .env
```
MONGO_URL=mongodb://localhost:27017/bankSystem
PORT=5000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Frontend .env
```
REACT_APP_API_URL=http://localhost:5000
```

---

## 📚 API Routes

### Authentication
- `POST /admin/auth/register` - Create account
- `POST /admin/auth/login` - Login
- `GET /admin/auth/profile` - Get profile
- `GET /admin/auth/all-admins` - View users (admin only)

### Failures
- `GET /failures` - View all
- `POST /failures` - Report new
- `PUT /failures/:id` - Update (resolve)
- `DELETE /failures/:id` - Delete (admin only)

---

## 🆘 Common Issues

### MongoDB not running
```bash
mongod  # Start MongoDB
```

### Port already in use
```bash
PORT=5001 npm start  # Use different port
```

### Dependencies missing
```bash
npm install  # Reinstall
```

## 🔐 Security Features

✅ JWT tokens with 7-day expiry  
✅ Passwords hashed with bcrypt  
✅ Account lockout after 5 failed attempts  
✅ Permission checks on every route  
✅ Role-based access control  
✅ Activity logging  
✅ No sensitive data in tokens  

## 📝 Licence

- This Bank ATM Failure Solver System Created by N P Joseph.
- © 2026 Bank Management System. All rights reserved.
