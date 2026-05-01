const express = require("express");

const {
  getInProgressVisaEmployees,
  getAllVisaStatuses,
  approveVisaDocument,
  rejectVisaDocument,
  sendReminderEmail, 
} = require("../controllers/visaController");

const router = express.Router();

router.get("/in-progress", getInProgressVisaEmployees);

router.get("/all", getAllVisaStatuses);

router.put("/:id/documents/:documentType/approve", approveVisaDocument);

router.put("/:id/documents/:documentType/reject", rejectVisaDocument);

router.post("/:id/documents/:documentType/remind", sendReminderEmail);

module.exports = router;