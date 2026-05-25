const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUser = async (data) => {
  return prisma.users.create({ data });
};

const getAllUsers = async () => {
  return prisma.users.findMany({
    orderBy: { created_at: "desc" },
  });
};

const getUserById = async (id) => {
  return prisma.users.findUnique({
    where: { user_id: Number(id) },
  });
};

const updateUser = async (id, data) => {
  // Don't allow updating sensitive fields through this generic endpoint
  const { password_hash, status, role, ...safeData } = data;
  return prisma.users.update({
    where: { user_id: Number(id) },
    data: safeData,
  });
};

const deleteUser = async (id) => {
  return prisma.users.delete({
    where: { user_id: Number(id) },
  });
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
