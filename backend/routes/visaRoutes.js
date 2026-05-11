const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");

const {
  getInProgressVisaEmployees,
  getAllVisaStatuses,
  getVisaStatusById,
  approveVisaDocument,
  rejectVisaDocument,
  sendReminderEmail,
  sendNextStepNotificationEmail,
} = require("../controllers/visaController");

const router = express.Router();

router.use(authMiddleware, requireRole("hr"));

router.get("/in-progress", getInProgressVisaEmployees);

router.get("/all", getAllVisaStatuses);

router.get("/:id", getVisaStatusById);

router.put("/:id/documents/:documentType/approve", approveVisaDocument);

router.put("/:id/documents/:documentType/reject", rejectVisaDocument);

router.post("/:id/documents/:documentType/notify-next", sendNextStepNotificationEmail);

router.post("/:id/documents/:documentType/remind", sendReminderEmail);

module.exports = router;
