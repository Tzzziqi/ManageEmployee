const express = require("express");
const User = require("../models/User");
const Onboarding = require("../models/Onboarding");

const router = express.Router();

router.post("/create-test-onboarding", async (req, res) => {
  try {
    const testUser = await User.create({
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@company.com`,
      password: "password123",
      role: "employee",
    });

    const onboarding = await Onboarding.create({
      user: testUser._id,
      firstName: "Yu",
      lastName: "Ma",
      preferredName: "Freya",
      email: testUser.email,
      phone: "(949) 555-0182",
      workAuthorization: "F1",
      status: "pending",
      documents: [
        {
          name: "Driver's license",
          url: "https://example.com/license.pdf",
        },
        {
          name: "OPT Receipt",
          url: "https://example.com/opt-receipt.pdf",
        },
      ],
    });

    res.status(201).json({
      message: "Test onboarding created successfully",
      user: testUser,
      onboarding,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create test onboarding",
      error: error.message,
    });
  }
});

module.exports = router;