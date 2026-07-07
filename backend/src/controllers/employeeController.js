const User = require('../models/User')


const getAllEmployees = async (req, res) => {
  try {
    const { role, isActive, search } = req.query
    const filter = {}

    if (role) filter.role = role
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const employees = await User.find(filter)
      .populate('department', 'name')     
      .populate('managerId', 'name email') 
      .sort({ createdAt: -1 })            

    res.status(200).json({
      count: employees.length,
      employees,
    })

  } catch (error) {
    console.error('Get all employees error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getMyTeam = async (req, res) => {
  try {
    const team = await User.find({
      managerId: req.user._id,
      isActive: true,
    })
      .populate('department', 'name')
      .sort({ name: 1 })

    res.status(200).json({
      count: team.length,
      employees: team,
    })

  } catch (error) {
    console.error('Get my team error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .populate('department', 'name')
      .populate('managerId', 'name email')

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    const requestingUser = req.user

    if (requestingUser.role === 'employee') {
      if (employee._id.toString() !== requestingUser._id.toString()) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    if (requestingUser.role === 'manager') {
      const isTheirEmployee =
        employee.managerId?._id.toString() === requestingUser._id.toString()
      const isThemselves =
        employee._id.toString() === requestingUser._id.toString()

      if (!isTheirEmployee && !isThemselves) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    res.status(200).json({ employee })

  } catch (error) {
    console.error('Get employee by id error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    const requestingUser = req.user

    if (requestingUser.role === 'employee') {
      if (employee._id.toString() !== requestingUser._id.toString()) {
        return res.status(403).json({ message: 'Access denied' })
      }

      const { name, avatar } = req.body
      if (name) employee.name = name
      if (avatar) employee.avatar = avatar

      await employee.save()
      return res.status(200).json({ message: 'Profile updated', employee })
    }

    const {
      name,
      email,
      role,
      department,
      managerId,
      salary,
      isActive,
      avatar,
    } = req.body

    if (name) employee.name = name
    if (email) employee.email = email
    if (role) employee.role = role
    if (department !== undefined) employee.department = department
    if (managerId !== undefined) employee.managerId = managerId
    if (salary !== undefined) employee.salary = salary
    if (isActive !== undefined) employee.isActive = isActive
    if (avatar) employee.avatar = avatar

    await employee.save()

    res.status(200).json({
      message: 'Employee updated successfully',
      employee,
    })

  } catch (error) {
    console.error('Update employee error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}


const deactivateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    if (employee.role === 'admin') {
      return res.status(403).json({ message: 'Cannot deactivate admin account' })
    }

    employee.isActive = false
    employee.refreshToken = null  
    await employee.save()

    res.status(200).json({ message: 'Employee deactivated successfully' })

  } catch (error) {
    console.error('Deactivate employee error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('department', 'name')
      .populate('managerId', 'name email')

    res.status(200).json({ employee: user })

  } catch (error) {
    console.error('Get my profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getAllEmployees,
  getMyTeam,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
  getMyProfile,
}