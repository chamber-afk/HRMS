const Department = require('../models/Department')
const User = require('../models/User')

// ─────────────────────────────────────────────────────────────
// CREATE DEPARTMENT
// Route: POST /api/departments
// Access: Admin only
// ─────────────────────────────────────────────────────────────
const createDepartment = async (req, res) => {
  try {
    const { name, description, managerId } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' })
    }

    // Check if department already exists
    const existing = await Department.findOne({ name })
    if (existing) {
      return res.status(400).json({ message: 'Department already exists' })
    }

    // If a managerId is provided, verify that user exists and has manager role
    if (managerId) {
      const manager = await User.findById(managerId)
      if (!manager || manager.role !== 'manager') {
        return res.status(400).json({ message: 'Invalid manager ID' })
      }
    }

    const department = await Department.create({
      name,
      description,
      managerId: managerId || null,
    })

    res.status(201).json({
      message: 'Department created successfully',
      department,
    })

  } catch (error) {
    console.error('Create department error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET ALL DEPARTMENTS
// Route: GET /api/departments
// Access: All roles
// ─────────────────────────────────────────────────────────────
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('managerId', 'name email')
      .sort({ name: 1 })

    res.status(200).json({
      count: departments.length,
      departments,
    })

  } catch (error) {
    console.error('Get departments error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET SINGLE DEPARTMENT
// Route: GET /api/departments/:id
// Access: All roles
// ─────────────────────────────────────────────────────────────
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('managerId', 'name email')

    if (!department) {
      return res.status(404).json({ message: 'Department not found' })
    }

    // Also fetch all employees in this department
    const employees = await User.find({
      department: req.params.id,
      isActive: true,
    }).select('name email role avatar')

    res.status(200).json({
      department,
      employees,
    })

  } catch (error) {
    console.error('Get department by id error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// UPDATE DEPARTMENT
// Route: PUT /api/departments/:id
// Access: Admin only
// ─────────────────────────────────────────────────────────────
const updateDepartment = async (req, res) => {
  try {
    const { name, description, managerId, isActive } = req.body

    const department = await Department.findById(req.params.id)
    if (!department) {
      return res.status(404).json({ message: 'Department not found' })
    }

    if (name) department.name = name
    if (description) department.description = description
    if (managerId !== undefined) department.managerId = managerId
    if (isActive !== undefined) department.isActive = isActive

    await department.save()

    res.status(200).json({
      message: 'Department updated successfully',
      department,
    })

  } catch (error) {
    console.error('Update department error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE DEPARTMENT (soft delete)
// Route: DELETE /api/departments/:id
// Access: Admin only
// ─────────────────────────────────────────────────────────────
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
    if (!department) {
      return res.status(404).json({ message: 'Department not found' })
    }

    // Check if any active employees are still in this department
    const employeeCount = await User.countDocuments({
      department: req.params.id,
      isActive: true,
    })

    if (employeeCount > 0) {
      return res.status(400).json({
        message: `Cannot delete. ${employeeCount} active employee(s) still in this department`,
      })
    }

    department.isActive = false
    await department.save()

    res.status(200).json({ message: 'Department deleted successfully' })

  } catch (error) {
    console.error('Delete department error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
}