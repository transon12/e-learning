// Script to generate bcrypt password hash
// Usage: node scripts/generate-password-hash.js yourpassword

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';
const hash = bcrypt.hashSync(password, 12);

console.log(`Password: ${password}`);
console.log(`Hash: ${hash}`);
console.log(`\nUse this hash in your SQL insert statement:`);
console.log(`('username', 'email@example.com', '${hash}', 'admin');`);

