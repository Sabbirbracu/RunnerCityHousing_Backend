const userService = require("../services/userService");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Helper to sanitize user
const sanitizeUser = (user) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

// POST /users
const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /users
const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /users/pending — Get all pending registrations for admin review
const getPendingUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      where: { status: "pending" },
      orderBy: { created_at: "desc" },
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
        plot_no: true,
        role: true,
        relationship_type: true,
        flat_count: true,
        created_at: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error("Get pending users error:", err);
    res.status(500).json({ error: "Error fetching pending users." });
  }
};

// GET /users/:id
const getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /users/:id
const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /users/:id
const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /users/:id/approve — Admin approves a pending user
const approveUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { user_id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.status !== "pending") {
      return res.status(400).json({
        message: `Cannot approve user. Current status is "${user.status}". Only pending users can be approved.`,
      });
    }

    const updatedUser = await prisma.users.update({
      where: { user_id: Number(id) },
      data: { status: "approved" },
    });

    res.json({
      message: "User approved successfully.",
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    console.error("Approve user error:", err);
    res.status(500).json({ message: "Error approving user." });
  }
};

// PATCH /users/:id/reject — Admin rejects a pending user
const rejectUser = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: { user_id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject user. Current status is "${user.status}". Only pending users can be rejected.`,
      });
    }

    const updatedUser = await prisma.users.update({
      where: { user_id: Number(id) },
      data: {
        status: "rejected",
        rejection_reason: reason || null,
      },
    });

    res.json({
      message: "User rejected.",
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    console.error("Reject user error:", err);
    res.status(500).json({ message: "Error rejecting user." });
  }
};

// PATCH /users/:id/status — Admin updates user status (suspend, inactive, deceased)
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["approved", "suspended", "inactive", "deceased"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { user_id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedUser = await prisma.users.update({
      where: { user_id: Number(id) },
      data: { status },
    });

    res.json({
      message: `User status updated to "${status}".`,
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    console.error("Update user status error:", err);
    res.status(500).json({ message: "Error updating user status." });
  }
};

module.exports = {
  createUser,
  getUsers,
  getPendingUsers,
  getUser,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,
  updateUserStatus,
};
