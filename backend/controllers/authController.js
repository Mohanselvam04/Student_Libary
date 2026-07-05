const jwt = require('jsonwebtoken');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const TOKEN_EXPIRES = '7d';

function validateEmail(email) {
  if (!email) return false;
  return email.toLowerCase().trim().endsWith('@gmail.com');
}

function validatePassword(password) {
  if (!password || password.length < 5) return 'Password must be at least 5 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain a number';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return 'Password must contain a special character';
  return null;
}

async function findUserByEmail(email) {
  const normalizedEmail = (email || '').toLowerCase().trim();
  if (!normalizedEmail) return null;

  const candidates = [Admin, Instructor, User];
  for (const Model of candidates) {
    const user = await Model.findOne({ email: normalizedEmail });
    if (user) return { model: Model, user };
  }
  return null;
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (!validateEmail(email)) return res.status(400).json({ message: 'Email must be a valid @gmail.com address' });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const selectedRole = ['admin', 'instructor', 'student'].includes(String(role || 'student').trim().toLowerCase())
      ? String(role || 'student').trim().toLowerCase()
      : 'student';
    let Model = User;
    if (selectedRole === 'admin') Model = Admin;
    else if (selectedRole === 'instructor') Model = Instructor;

    const user = await Model.create({ name, email: normalizedEmail, password, role: selectedRole });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

    return res.status(201).json({ user: user.toJSON(), token });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A user with that email already exists' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const found = await findUserByEmail(email);
    if (!found) return res.status(401).json({ message: 'Invalid credentials' });

    const { user } = found;
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
    return res.status(200).json({ user: user.toJSON(), token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function redirect(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const redirectTo = req.user.role === 'admin' ? '/admin' : '/dashboard';
    return res.status(200).json({ redirectTo });
  } catch (err) {
    console.error('Redirect error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function me(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    return res.status(200).json(req.user);
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { register, login, redirect, me };
