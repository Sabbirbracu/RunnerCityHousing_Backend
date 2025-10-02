import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// 🔑 Helper to sanitize user before sending response
const sanitizeUser = (user) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

// 📌 SIGNUP
export const signup = async (req, res) => {
  const { name, email, phone, plot_no, password } = req.body;

  try {
    console.log("Signup request body:", req.body);
    // Check if email already exists
    const existingEmail = await prisma.users.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Validate plot
    const plot = await prisma.plot.findUnique({ where: { plot_no } });
    if (!plot) {
      return res.status(400).json({ message: "Invalid plot number." });
    }

    // Validate owner name
    if (plot.owner_name.toLowerCase() !== name.toLowerCase()) {
      return res
        .status(400)
        .json({ message: "Owner name does not match our records." });
    }

    // Check if already assigned
    if (plot.is_assigned) {
      return res
        .status(400)
        .json({ message: "This plot is already assigned." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (status PENDING)
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        phone,
        plot_no,
        password_hash: hashedPassword,
        role: "owner",
        status: "PENDING",
      },
    });

    // Assign plot to this user
    await prisma.plot.update({
      where: { plot_no },
      data: {
        is_assigned: true,
        assigned_to: newUser.user_id,
      },
    });

    res.status(201).json({
      message: "Signup successful, awaiting admin approval.",
      user: { ...newUser, password_hash: undefined },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error signing up." });
  }
};

// 📌 LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Find user by email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    // 2️⃣ Check if approved
    if (user.status !== "approved") {
      return res.status(403).json({ message: "Account not approved yet." });
    }

    // 3️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    // 4️⃣ Issue JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        status: user.status,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in." });
  }
};
