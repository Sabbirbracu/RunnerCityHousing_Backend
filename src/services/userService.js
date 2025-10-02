const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new user
const createUser = async (data) => {
  return await prisma.users.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,  // e.g. "owner", "admin", "staff", "committee"
      holding_no: data.holding_no,
      plot_no: data.plot_no,
      status: data.status,
      blood_group: data.blood_group,
      password_hash: data.password_hash, // hash before saving!
    },
  });
};

// Fetch all users
const getAllUsers = async () => {
  return await prisma.users.findMany({
    select: {
      user_id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      holding_no: true,
      plot_no: true,
      status: true,
      blood_group: true,
      createdAt: true, // if you later add timestamps
    },
  });
};

// Fetch single user by ID
const getUserById = async (id) => {
  return await prisma.users.findUnique({
    where: { user_id: Number(id) },
  });
};

// Update user
const updateUser = async (id, data) => {
  return await prisma.users.update({
    where: { user_id: Number(id) },
    data,
  });
};

// Delete user
const deleteUser = async (id) => {
  return await prisma.users.delete({
    where: { user_id: Number(id) },
  });
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
