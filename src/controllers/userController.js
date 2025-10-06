const userService = require("../services/userService");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /users/:id
const getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /users/:id
const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
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

// APPROVE USER
const approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.update({
      where: { user_id: Number(id) },
      data: { status: "approved" },
    });
    res.json({ message: "User approved successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving user" });
  }
};

// REJECT USER
const rejectUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.update({
      where: { user_id: Number(id) },
      data: { status: "rejected" },
    });
    res.json({ message: "User rejected successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting user" });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,
};
