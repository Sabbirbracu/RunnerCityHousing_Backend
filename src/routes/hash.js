const bcrypt = require("bcryptjs");
const hashed = bcrypt.hashSync("Admin@123", 10);
console.log(hashed);
