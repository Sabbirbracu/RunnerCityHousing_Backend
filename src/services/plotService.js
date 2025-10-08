const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPlot = async (data) => {
  return await prisma.plot.create({
    data: {
      plot_no: data.plot_no,
      owner_name: data.owner_name,
      is_assigned: data.is_assigned || false,
      assigned_to: data.assigned_to || null,
    },
  });
};

const getAllPlots = async () => {
  return await prisma.plot.findMany({
    include: { assignedUser: { select: { name: true, email: true } } },
  });
};

const updatePlot = async (plot_no, data) => {
  return await prisma.plot.update({
    where: { plot_no },
    data,
  });
};

const deletePlot = async (plot_no) => {
  return await prisma.plot.delete({
    where: { plot_no },
  });
};

module.exports = { createPlot, getAllPlots, updatePlot, deletePlot };
