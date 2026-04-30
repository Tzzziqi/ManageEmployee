const express = require("express");

const {
  getInProgressVisaEmployees,
  getAllVisaStatuses,
  approveVisaDocument,
  rejectVisaDocument,
} = require("../controllers/visaController");

const router = express.Router();

router.get("/in-progress", getInProgressVisaEmployees);

router.get("/all", getAllVisaStatuses);

router.put("/:id/documents/:documentType/approve", approveVisaDocument);

router.put("/:id/documents/:documentType/reject", rejectVisaDocument);

module.exports = router;