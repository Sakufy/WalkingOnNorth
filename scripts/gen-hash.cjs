const { hash } = require("bcryptjs");
hash("beixing123", 12).then(h => process.stdout.write(h));
