const express = require("express");

const {
  getAllApplications,
  getApplicationsByStatus,
  getEmployeeProfiles,
  getEmployeeProfileById,
  approveApplication,
  rejectApplication,
} = require("../controllers/hrController");

const router = express.Router();

router.get("/applications", getAllApplications);

router.get("/applications/status/:status", getApplicationsByStatus);

router.get("/employees", getEmployeeProfiles); 

router.get("/employees/:id", getEmployeeProfileById);

router.put("/applications/:id/approve", approveApplication);

router.put("/applications/:id/reject", rejectApplication);

module.exports = router;