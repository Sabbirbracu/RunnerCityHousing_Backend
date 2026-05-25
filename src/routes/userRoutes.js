const express = require("express");
const userController = require("../controllers/userController");
const { auth, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected (must be logged in)
router.get("/", auth, userController.getUsers);
router.get("/pending", auth, adminOnly, userController.getPendingUsers);
router.get("/:id", auth, userController.getUser);
router.put("/:id", auth, userController.updateUser);

// Admin-only routes
router.patch("/:id/approve", auth, adminOnly, userController.approveUser);
router.patch("/:id/reject", auth, adminOnly, userController.rejectUser);
router.patch("/:id/status", auth, adminOnly, userController.updateUserStatus);
router.delete("/:id", auth, adminOnly, userController.deleteUser);

module.exports = router;
