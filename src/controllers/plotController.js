const plotService = require("../services/plotService");

const getPlots = async (req, res) => {
  try {
    const plots = await plotService.getAllPlots();
    res.json(plots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPlot = async (req, res) => {
  try {
    const plot = await plotService.createPlot(req.body);
    res.status(201).json(plot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePlot = async (req, res) => {
  try {
    const plot = await plotService.updatePlot(req.params.plot_no, req.body);
    res.json(plot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePlot = async (req, res) => {
  try {
    await plotService.deletePlot(req.params.plot_no);
    res.json({ message: "Plot deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPlots, createPlot, updatePlot, deletePlot };
