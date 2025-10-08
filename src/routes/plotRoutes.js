const express = require("express");
const router = express.Router();
const plotController = require("../controllers/plotController");

router.get("/", plotController.getPlots);
router.post("/", plotController.createPlot);
router.put("/:plot_no", plotController.updatePlot);
router.delete("/:plot_no", plotController.deletePlot);

module.exports = router;
