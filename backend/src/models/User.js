const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "hr", "manager", "employee"],
      default: "employee",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // references another User document
      default: null,
    },

    salary: {
      type: Number,
      default: 0,
    },

    avatar: {
      type: String, // will store image URL or file path later
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true, // false = deactivated employee, not deleted
    },

    mustChangePassword: {
      type: Boolean,
      default: true, // forces password change on first login
    },

    refreshToken: {
      type: String, // stores the current valid refresh token
      default: null,
      select: false,
    },
    resetPasswordOTP: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordOTPExpiry: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt fields
  },
);

// ─── MIDDLEWARE: runs automatically before every .save() ─────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── INSTANCE METHOD: comparePassword ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── TRANSFORM: remove sensitive fields from JSON responses ──────────────────
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
