require('dotenv').config({ path: require('path').join(__dirname, '.env') });
console.log('Database connections removed. No DB calls will be made by this script.');
process.exit(0);

