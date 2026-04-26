const OnboardingApplication = require("../models/OnboardingApplication");

const getAllApplications = async (req, res) => {
  try {
    const applications = await OnboardingApplication.find()
      .populate("user", "username email role")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get onboarding applications",
      error: error.message,
    });
  }
};

const getApplicationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    const applications = await OnboardingApplication.find({ status })
      .populate("user", "username email role")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get applications by status",
      error: error.message,
    });
  }
};

const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await OnboardingApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.status = "approved";
    application.feedback = "";
    await application.save();

    res.status(200).json({
      message: "Application approved successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve application",
      error: error.message,
    });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback || feedback.trim() === "") {
      return res.status(400).json({
        message: "Feedback is required when rejecting an application",
      });
    }

    const application = await OnboardingApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.status = "rejected";
    application.feedback = feedback;
    await application.save();

    res.status(200).json({
      message: "Application rejected successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject application",
      error: error.message,
    });
  }
};

module.exports = {
  getAllApplications,
  getApplicationsByStatus,
  approveApplication,
  rejectApplication,
};