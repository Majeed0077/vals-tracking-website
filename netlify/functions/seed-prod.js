const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Admin schema
const AdminSchema = new mongoose.Schema({
  email: String,
  passwordHash: String
});
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

exports.handler = async function () {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      return {
        statusCode: 500,
        body: "MONGODB_URI not found"
      };
    }

    await mongoose.connect(uri);

    const email = "admin@vals.com";
    const plainPassword = "admin123";

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await Admin.updateOne(
      { email },
      { email, passwordHash },
      { upsert: true }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Admin seeded",
        email,
        password: plainPassword
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message
    };
  }
};
