const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Course = require('./models/Course');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Course.deleteMany({});
  console.log('Cleared existing data');

  // Create users
  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass = await bcrypt.hash('student123', 12);
  const instrPass = await bcrypt.hash('instructor123', 12);

  const admin = await User.create({ name: 'Admin User', email: 'admin@lms.com', password: adminPass, role: 'admin' });
  const instructor = await User.create({ name: 'Dr. Sarah Johnson', email: 'instructor@lms.com', password: instrPass, role: 'instructor', bio: 'Computer Science professor with 10 years experience.' });
  const student = await User.create({ name: 'John Student', email: 'student@lms.com', password: userPass, role: 'student' });

  console.log('✅ Users created');

  // Create sample courses
  const courses = await Course.create([
    { title: 'Introduction to Web Development', description: 'Learn HTML, CSS, and JavaScript from scratch. Build your first website in this beginner-friendly course.', instructor: instructor._id, category: 'Programming', level: 'Beginner', duration: '8 weeks', isPublished: true, rating: 4.8, reviewCount: 120 },
    { title: 'React.js Complete Guide', description: 'Master React.js with hooks, context, and best practices. Build real-world applications.', instructor: instructor._id, category: 'Programming', level: 'Intermediate', duration: '10 weeks', isPublished: true, rating: 4.9, reviewCount: 85 },
    { title: 'Node.js & Express API Development', description: 'Build scalable REST APIs with Node.js and Express. Includes authentication, MongoDB, and deployment.', instructor: instructor._id, category: 'Programming', level: 'Intermediate', duration: '6 weeks', isPublished: true, rating: 4.7, reviewCount: 64 },
    { title: 'UI/UX Design Fundamentals', description: 'Learn the principles of user interface and experience design using Figma.', instructor: instructor._id, category: 'Design', level: 'Beginner', duration: '4 weeks', isPublished: true, rating: 4.6, reviewCount: 48 },
    { title: 'Data Science with Python', description: 'Explore data analysis, visualization, and machine learning with Python, Pandas, and Scikit-learn.', instructor: instructor._id, category: 'Data Science', level: 'Advanced', duration: '12 weeks', isPublished: true, rating: 4.8, reviewCount: 93 },
  ]);

  // Enroll student in first two courses
  await User.findByIdAndUpdate(student._id, { enrolledCourses: [courses[0]._id, courses[1]._id] });
  await Course.findByIdAndUpdate(courses[0]._id, { $push: { enrolledStudents: student._id } });
  await Course.findByIdAndUpdate(courses[1]._id, { $push: { enrolledStudents: student._id } });
  await User.findByIdAndUpdate(instructor._id, { createdCourses: courses.map(c => c._id) });

  console.log('✅ Courses created and student enrolled');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Demo Accounts:');
  console.log('  Admin:      admin@lms.com      / admin123');
  console.log('  Instructor: instructor@lms.com / instructor123');
  console.log('  Student:    student@lms.com    / student123\n');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
