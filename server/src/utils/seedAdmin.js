import "dotenv/config";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const run = async () => {
  await connectDB();

  const { ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error("ADMIN_EMAIL, ADMIN_USERNAME, and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  let admin = await User.findOne({ email: ADMIN_EMAIL });

  if (admin) {
    admin.role = "admin";
    await admin.save();
    console.log(`Existing user ${admin.email} promoted to admin.`);
  } else {
    admin = await User.create({
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Admin user created: ${admin.email}`);
  }

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
