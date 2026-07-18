const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connect } = require('../configs/dbconnect');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');

async function seed() {
  try {
    await connect();
    const file = path.join(__dirname, '..', 'data', 'users.json');
    const raw = fs.readFileSync(file, 'utf8');
    const users = JSON.parse(raw);

    for (const u of users) {
      const email = (u.email || '').toLowerCase().trim();
      if (!email) continue;

      const role = (u.role || 'student').toLowerCase();
      let Model = User;
      if (role === 'admin') Model = Admin;
      else if (role === 'instructor') Model = Instructor;

      const existing = await Model.findOne({ email });
      if (existing) {
        console.log(`Skipping existing ${role} user ${email}`);
        continue;
      }

      const doc = {
        name: u.name || 'unknown',
        email,
        role,
        avatar: u.avatar || '',
        bio: u.bio || '',
        createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
      };

      if (u.password && /^\$2[aby]\$/.test(u.password)) {
        doc.password = u.password;
        await Model.collection.insertOne(doc);
        console.log(`Inserted (preserved hash) ${email} into ${Model.collection.name}`);
      } else {
        doc.password = u.password || Math.random().toString(36).slice(-8);
        await Model.create(doc);
        console.log(`Created ${email} in ${Model.collection.name}`);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
