require('dotenv').config();
const bcrypt = require('bcryptjs');
const connect = require('./db');
const { User } = require('./models');

(async () => {
  await connect();
  const email = 'admin@medibridge.ng';
  if (await User.findOne({ email })) { console.log('Admin exists'); process.exit(0); }
  await User.create({
    email, password: await bcrypt.hash('admin123', 10),
    role: 'PLATFORM_ADMIN', fullName: 'Platform Admin'
  });
  console.log('Admin created:', email, '/ admin123');
  process.exit(0);
})();
