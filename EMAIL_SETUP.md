# Email Service Setup Guide for Brew & Co

## Overview
The admin dashboard includes an email notification system that automatically sends login credentials to users when their registration is approved.

## Prerequisites
- Gmail account

- Google 2-Step Verification enabled
- Gmail App Password generated

---

## Step-by-Step Setup

### 1. Enable 2-Step Verification (if not already enabled)

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable it (you'll need your phone)

### 2. Generate Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. In the "Select app" dropdown, choose **Mail**
3. In the "Select device" dropdown, choose **Other (Custom name)**
4. Enter: `Brew & Co Admin Dashboard`
5. Click **Generate**
6. Google will display a **16-character password** like: `abcd efgh ijkl mnop`
7. **Copy this password** (you'll need it in the next step)

### 3. Update application.properties

**File location:** `backend/src/main/resources/application.properties`

**Current configuration (line 17-27):**
```properties
# Email Configuration (SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
```

**What to change:**
- Replace `your-app-password-here` on line 21 with your 16-character app password
- **Remove all spaces** from the app password (e.g., `abcdefghijklmnop`)

**Example:**
```properties
spring.mail.password=abcdefghijklmnop
```

### 4. Restart the Backend Server

After saving the file:

**Option A: Using the terminal**
```bash
# Kill the old process
lsof -ti:8080 | xargs kill -9

# Start the backend
cd /home/raviteja/Projects/KumarSpringBoot/backend
mvn spring-boot:run
```

**Option B: Using the start script**
```bash
cd /home/raviteja/Projects/KumarSpringBoot
./start.sh
```

---

## How It Works

### When an Admin Approves a User:

1. **Admin clicks "Approve" button** in the dashboard
2. **Backend generates a random password** (10 characters with uppercase, lowercase, digits, and special characters)
3. **User account is activated** (`isActive` set to `true`)
4. **Email is sent** to the user's registered email address with:
   - Welcome message
   - Login credentials (email + generated password)
   - Link to login page
5. **Admin sees confirmation** with the generated password

### Email Template

The user receives an email like this:

```
Subject: ☕ Brew & Co — Your Account Has Been Approved!

Hello [FirstName],

Great news! Your Brew & Co account has been approved by our admin team.

Here are your login credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Email:    user@example.com
  Password: Xy9$mK2pL@
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please change your password after your first login for security.

Login at: http://localhost:5173/login

Welcome to the Brew & Co family! ☕

Best regards,
Brew & Co Admin Team
```

---

## Testing the Email Service

### Test 1: Register a New User

1. Go to: http://localhost:5173/register
2. Complete all registration steps with a **real email address you can access**
3. Submit the registration

### Test 2: Approve the User as Admin

1. Login as admin: http://localhost:5173/login
   - Email: `admin@example.com` (from your .env file)
   - Password: `your_admin_password` (from your .env file)
2. You'll see the pending user in the "Projects" section
3. Click **"View"** to see full details
4. Click **"Approve & Send Password"**
5. Check the backend logs for email confirmation

### Test 3: Check Email

1. Check the registered user's email inbox
2. Look for the approval email from your configured admin email
3. Use the credentials to login

---

## Troubleshooting

### Email Not Sending?

**Check backend logs:**
```bash
tail -f /home/raviteja/Projects/KumarSpringBoot/backend/backend.log
```

**Common issues:**

1. **"Authentication failed"**
   - Wrong app password
   - App password has spaces (remove them)
   - 2-Step Verification not enabled

2. **"Mail sender not configured"**
   - The email service will log to console instead
   - Check that `spring.mail.username` and `spring.mail.password` are set

3. **"Connection timeout"**
   - Check your internet connection
   - Firewall might be blocking port 587

### If Email Service Fails

The application is designed to **continue working even if email fails**:
- User is still approved
- Password is still generated
- Admin sees the password in the dashboard
- Error is logged, but the operation completes

You can manually send the password to the user via another method.

---

## Security Notes

⚠️ **Important:**
- Never commit `application.properties` with real passwords to Git
- Add to `.gitignore`: `**/application.properties`
- Use environment variables in production
- The app password is **not** your Gmail password
- Revoking the app password won't affect your Gmail account

---

## Production Deployment

For production, use environment variables instead of hardcoding:

```properties
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

Then set them in your deployment environment:
```bash
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

---

## Support

If you encounter issues:
1. Check the backend logs
2. Verify your app password is correct
3. Ensure 2-Step Verification is enabled
4. Try generating a new app password

**Backend is running on:** http://localhost:8080
**Frontend is running on:** http://localhost:5173
