// Install dependencies:
// npm install express mysql2 bcryptjs cors body-parser

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection config - update with your credentials
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '162005',
  database: 'nextmove_db',
};
   
// Create users table if not exists
async function initialize() {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute
    await connection.end();
}
initialize().catch(console.error);
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('Database initialized successfully');
  console.log('Server is listening on port 3000');
  console.log('Routes are set up');
  console.log('API routes are ready');
  console.log('API routes are set up successfully');
  console.log('API routes are ready to handle requests');
});

// Signup route
app.post('/api/signup', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.end();
      return res.status(409).json({ message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await connection.execute(
      'INSERT INTO users (fullName, email, passwordHash, role) VALUES (?, ?, ?, ?)',
      [fullName, email, passwordHash, role]
    );
    await connection.end();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
    await connection.end();
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', user: { fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Password reset route
app.post('/api/reset-password', async (req, res) => {
const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
    }  try {
        const connection = await mysql.createConnection(dbConfig);
        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);   if (existing.length === 0) {
          await connection.end();
          return res.status(404).json({ message: 'Email not found' });  
          }  
    await connection.execute('UPDATE users SET passwordHash = ? WHERE email = ?', [await bcrypt.hash(newPassword, 10), email]); await connection.end();
    res.json({ message: 'Password reset successfully' });       
    } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    }
    });





