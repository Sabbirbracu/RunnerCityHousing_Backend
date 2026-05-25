const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// Valid role and relationship values
const VALID_ROLES = ["full_owner", "flat_owner", "tenant", "caretaker", "family_resident"];
const VALID_RELATIONSHIPS = ["son", "daughter", "wife", "husband", "brother", "other"];

// Helper to sanitize user before sending response
const sanitizeUser = (user) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

// POST /auth/check-plot — Check if plot exists and has an owner
const checkPlot = async (req, res) => {
  const { plot_no } = req.params;

  try {
    const plot = await prisma.plot.findUnique({ where: { plot_no } });
    if (!plot) {
      return res.status(404).json({ exists: false, message: "Plot not found." });
    }

    // Check for approved owner
    const approvedOwner = await prisma.users.findFirst({
      where: {
        plot_no,
        status: "approved",
        role: { in: ["full_owner", "flat_owner"] },
      },
      select: { name: true, role: true },
    });

    // Check for pending owner request
    const pendingOwner = await prisma.users.findFirst({
      where: {
        plot_no,
        status: "pending",
        role: { in: ["full_owner", "flat_owner"] },
      },
      select: { name: true, role: true },
    });

    res.json({
      exists: true,
      has_owner: !!approvedOwner,
      has_pending_owner: !!pendingOwner,
      owner_name: approvedOwner ? approvedOwner.name : null,
      plot_type: plot.plot_type,
    });
  } catch (err) {
    console.error("Check plot error:", err);
    res.status(500).json({ message: "Error checking plot." });
  }
};

// POST /auth/signup — Multi-step signup
const signup = async (req, res) => {
  const { name, email, phone, plot_no, password, role, relationship_type, flat_count } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !plot_no || !role) {
      return res.status(400).json({ message: "Name, email, password, plot number, and role are required." });
    }

    // Validate name length
    if (name.length < 1 || name.length > 100) {
      return res.status(400).json({ message: "Name must be between 1 and 100 characters." });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` });
    }

    // Validate relationship_type if provided
    if (relationship_type && !VALID_RELATIONSHIPS.includes(relationship_type)) {
      return res.status(400).json({ message: `Invalid relationship type. Must be one of: ${VALID_RELATIONSHIPS.join(", ")}` });
    }

    // Family/resident and caretaker must provide relationship
    if ((role === "family_resident" || role === "caretaker") && !relationship_type) {
      return res.status(400).json({ message: "Relationship type is required for family members and caretakers." });
    }

    // Flat owner must provide flat count
    if (role === "flat_owner" && (!flat_count || flat_count < 1)) {
      return res.status(400).json({ message: "Flat count is required for flat owners (minimum 1)." });
    }

    // Check if email already exists
    const existingEmail = await prisma.users.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Validate plot exists
    const plot = await prisma.plot.findUnique({ where: { plot_no } });
    if (!plot) {
      return res.status(400).json({ message: "Invalid plot number." });
    }

    // If claiming owner role, check if plot already has an owner (approved or pending)
    if (role === "full_owner" || role === "flat_owner") {
      const existingOwner = await prisma.users.findFirst({
        where: {
          plot_no,
          status: { in: ["approved", "pending"] },
          role: { in: ["full_owner", "flat_owner"] },
        },
      });

      if (existingOwner) {
        const statusMsg = existingOwner.status === "approved"
          ? "This plot already has an approved owner."
          : "Someone has already requested owner access for this plot. Please wait for admin review.";
        return res.status(400).json({ message: statusMsg });
      }
    }

    // Validate phone if provided
    if (phone && (phone.length < 7 || phone.length > 15)) {
      return res.status(400).json({ message: "Phone number must be between 7 and 15 digits." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with pending status
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        phone: phone || null,
        plot_no,
        password_hash: hashedPassword,
        role,
        status: "pending",
        relationship_type: relationship_type || null,
        flat_count: role === "flat_owner" ? flat_count : null,
      },
    });

    res.status(201).json({
      message: "Signup successful. Your account is pending admin approval.",
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error signing up." });
  }
};

// POST /auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find user by email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Check if approved
    if (user.status !== "approved") {
      const messages = {
        pending: "Your account is pending admin approval.",
        rejected: "Your account has been rejected. Contact admin for details.",
        suspended: "Your account has been suspended.",
        inactive: "Your account is inactive.",
        deceased: "This account is no longer active.",
      };
      return res.status(403).json({
        message: messages[user.status] || "Account not approved.",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    // Issue JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        status: user.status,
        email: user.email,
        plot_no: user.plot_no,
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

module.exports = {
  checkPlot,
  signup,
  login,
};
