const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connect } = require('../configs/dbconnect');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');
const Course = require('../models/Course');
const Material = require('../models/Material');

async function test() {
  try {
    await connect();
    const users = await User.find({}).lean();
    const admins = await Admin.find({}).lean();
    const instructors = await Instructor.find({}).lean();
    const courses = await Course.find({}).lean();
    const materials = await Material.find({}).lean();

    console.log("--- COLLECTION BREAKDOWNS ---");
    
    const countRoles = (docs) => {
      const counts = {};
      for (const d of docs) {
        const r = d.role || 'undefined';
        counts[r] = (counts[r] || 0) + 1;
      }
      return counts;
    };

    console.log("USERS collection count:", users.length);
    console.log("USERS collection role breakdown:", countRoles(users));

    console.log("\nADMINS collection count:", admins.length);
    console.log("ADMINS collection role breakdown:", countRoles(admins));

    console.log("\nINSTRUCTORS collection count:", instructors.length);
    console.log("INSTRUCTORS collection role breakdown:", countRoles(instructors));

    console.log("\n--- OTHER COUNTS ---");
    console.log("COURSES count:", courses.length);
    console.log("MATERIALS count:", materials.length);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
