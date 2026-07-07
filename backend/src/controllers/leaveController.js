const Leave = require("../models/Leave");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

const applyLeave = (io) => async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res
        .status(400)
        .json({ message: "End date cannot be before start date" });
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      employeeId: req.user._id,
      type,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
    });

    const populatedLeave = await Leave.findById(leave._id).populate(
      "employeeId",
      "name email avatar role",
    );
    if (req.user.managerId) {
      io.to(req.user.managerId.toString()).emit("leave:new", {
        message: `${req.user.name} applied for ${type} leave`,
        leave: populatedLeave,
      });
    }

    io.to("admin-hr").emit("leave:new", {
      message: `${req.user.name} applied for ${type} leave`,
      leave: populatedLeave,
    });

    if (req.user.managerId) {
      await createNotification(io, {
        userId: req.user.managerId,
        message: `${req.user.name} applied for ${type} leave`,
        type: "leave_applied",
        refId: leave._id,
        refModel: "Leave",
      });
    }

    res.status(201).json({
      message: "Leave application submitted",
      leave: populatedLeave,
    });
  } catch (error) {
    console.error("Apply leave error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const reviewLeave = (io) => async (req, res) => {
  try {
    const { status, reviewNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be approved or rejected" });
    }

    const leave = await Leave.findById(req.params.id).populate(
      "employeeId",
      "name email managerId",
    );

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ message: "Leave already reviewed" });
    }

    if (req.user.role === "manager") {
      const employee = await User.findById(leave.employeeId._id);
      if (employee.managerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    leave.status = status;
    leave.reviewNote = reviewNote || "";
    leave.reviewedBy = req.user._id;
    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate("employeeId", "name email avatar")
      .populate("reviewedBy", "name role");

    io.to(leave.employeeId._id.toString()).emit("leave:decision", {
      message: `Your leave request has been ${status}`,
      leave: updatedLeave,
    });

    await createNotification(io, {
      userId: leave.employeeId._id,
      message: `Your ${leave.type} leave has been ${status}`,
      type: status === "approved" ? "leave_approved" : "leave_rejected",
      refId: leave._id,
      refModel: "Leave",
    });

    res.status(200).json({
      message: `Leave ${status} successfully`,
      leave: updatedLeave,
    });
  } catch (error) {
    console.error("Review leave error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const { status, type } = req.query;
    let filter = {};

    if (req.user.role === "employee") {
      filter.employeeId = req.user._id;
    } else if (req.user.role === "manager") {
      const teamMembers = await User.find({
        managerId: req.user._id,
      }).select("_id");

      const teamIds = teamMembers.map((m) => m._id);
      filter.employeeId = { $in: teamIds };
    }

    if (status) filter.status = status;
    if (type) filter.type = type;

    const leaves = await Leave.find(filter)
      .populate("employeeId", "name email avatar department")
      .populate("reviewedBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("Get leaves error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate("employeeId", "name email avatar managerId")
      .populate("reviewedBy", "name role");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    const user = req.user;
    const isOwner = leave.employeeId._id.toString() === user._id.toString();
    const isManagerOfOwner =
      leave.employeeId.managerId?.toString() === user._id.toString();
    const isAdminOrHr = ["admin", "hr"].includes(user.role);

    if (!isOwner && !isManagerOfOwner && !isAdminOrHr) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ leave });
  } catch (error) {
    console.error("Get leave by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.employeeId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only cancel your own leave" });
    }

    if (leave.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending leaves can be cancelled" });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Leave cancelled successfully" });
  } catch (error) {
    console.error("Cancel leave error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  applyLeave,
  reviewLeave,
  getAllLeaves,
  getLeaveById,
  cancelLeave,
};
