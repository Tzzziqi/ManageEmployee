const express = require("express");
const User = require("../models/User");
const Onboarding = require("../models/Onboarding");
const VisaStatus = require("../models/VisaStatus");

const router = express.Router();

// 批量创建测试数据
router.post("/seed", async (req, res) => {
  try {
    const users = [];
    const onboardings = [];

    const employees = [
      { first: "Btys", last: "Xq", email: "btysxq@gmail.com" },
      { first: "Alice", last: "Wang", email: "alice.wang@gmail.com" },
      { first: "Bob", last: "Chen", email: "bob.chen@gmail.com" },
      { first: "Cathy", last: "Li", email: "cathy.li@gmail.com" },
      { first: "David", last: "Zhang", email: "david.zhang@gmail.com" },
      { first: "Eric", last: "Liu", email: "eric.liu@gmail.com" },
      { first: "Frank", last: "Sun", email: "frank.sun@gmail.com" },
      { first: "Grace", last: "Zhao", email: "grace.zhao@gmail.com" },
      { first: "Helen", last: "Xu", email: "helen.xu@gmail.com" },
      { first: "Ian", last: "Guo", email: "ian.guo@gmail.com" },
      { first: "Jack", last: "Huang", email: "jack.huang@gmail.com" },
    ];

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];

      const user = await User.create({
        username: `${emp.first} ${emp.last}`,
        email: emp.email,
        password: "password123",
        role: "employee",
      });

      const statusOptions = ["pending", "approved", "rejected"];
      const status = statusOptions[i % 3];

      const onboarding = await Onboarding.create({
        user: user._id,
        firstName: emp.first,
        lastName: emp.last,
        preferredName: emp.first,
        email: emp.email,
        phone: "123-456-7890",
        workAuthorization: "F1",
        status,
        feedback: status === "rejected" ? "Missing document" : "",
      });

      await VisaStatus.create({
        employee: user._id,
        onboarding: onboarding._id,
        workAuthorization: "F1",
        documents: [
          {
            documentType: "OPT_RECEIPT",
            status: "approved",
          },
          {
            documentType: "OPT_EAD",
            status: i % 2 === 0 ? "pending" : "approved",
          },
          {
            documentType: "I_983",
            status: "not_uploaded",
          },
          {
            documentType: "I_20",
            status: "not_uploaded",
          },
        ],
      });

      users.push(user);
      onboardings.push(onboarding);
    }

    res.json({
      message: "Seed data created",
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to seed data",
      error: error.message,
    });
  }
});

// 清空所有测试数据
router.delete("/clear", async (req, res) => {
  try {
    await User.deleteMany({});
    await Onboarding.deleteMany({});
    await VisaStatus.deleteMany({});

    res.json({
      message: "All test data cleared",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear data",
      error: error.message,
    });
  }
});

module.exports = router;