const express = require("express");

const {
  getAllApplications,
  getApplicationsByStatus,
  approveApplication,
  rejectApplication,
} = require("../controllers/hrController");

const router = express.Router();

router.get("/applications", getAllApplications);

router.get("/applications/status/:status", getApplicationsByStatus);

router.put("/applications/:id/approve", approveApplication);

router.put("/applications/:id/reject", rejectApplication);

module.exports = router;