const express = require("express");
const userController = require("../controllers/userController");
const { auth, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public (e.g., signup)
router.post("/", userController.createUser);

// Protected (must be logged in)
router.get("/", auth, userController.getUsers);
router.get("/:id", auth, userController.getUser);
router.put("/:id", auth, userController.updateUser);
router.delete("/:id", auth, userController.deleteUser);

// Admin-only routes
router.patch("/:id/approve", auth, adminOnly, userController.approveUser);
router.patch("/:id/reject", auth, adminOnly, userController.rejectUser);

module.exports = router;
