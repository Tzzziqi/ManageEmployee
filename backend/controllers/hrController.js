const Onboarding = require("../models/Onboarding");
const Employee = require("../models/employee");
const Document = require("../models/document");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllApplications = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const total = await Onboarding.countDocuments();

    const applications = await Onboarding.find()
      .populate("user", "username email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      applications,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get onboarding",
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

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await Onboarding.countDocuments({ status });

    const applications = await Onboarding.find({ status })
      .populate("user", "username email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      applications,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get applications by status",
      error: error.message,
    });
  }
};

const getEmployeeProfiles = async (req, res) => {
  try {
    const keyword = (req.query.keyword || "").trim();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const searchKeyword = escapeRegex(keyword);

    const filter = keyword
      ? {
          $or: [
            { firstName: { $regex: searchKeyword, $options: "i" } },
            { lastName: { $regex: searchKeyword, $options: "i" } },
            { preferredName: { $regex: searchKeyword, $options: "i" } },
          ],
        }
      : {};

    const [total, totalEmployees] = await Promise.all([
      Employee.countDocuments(filter),
      Employee.countDocuments(),
    ]);

    const employees = await Employee.find(filter)
      .populate("userId", "username email role")
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      employees,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      totalEmployees,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get employee profiles",
      error: error.message,
    });
  }
};

const getEmployeeProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id).populate(
      "userId",
      "username email role"
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const [uploadedDocuments, onboarding] = await Promise.all([
      Document.find({ employeeId: employee._id }).sort({ uploadedAt: -1 }),
      Onboarding.findOne({ user: employee.userId }).select("documents"),
    ]);

    res.status(200).json({
      employee,
      uploadedDocuments,
      onboardingDocuments: onboarding?.documents || [],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get employee profile",
      error: error.message,
    });
  }
};

const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Onboarding.findById(id);

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

    const application = await Onboarding.findById(id);

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
  getEmployeeProfiles,
  getEmployeeProfileById,
  approveApplication,
  rejectApplication,
};
