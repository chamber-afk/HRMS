const express = require('express')
const router = express.Router()

const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController')

const { protect } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')

router.get('/', getAllDepartments)
router.get('/:id', protect, getDepartmentById)

router.post('/', protect, roleGuard('admin'), createDepartment)
router.put('/:id', protect, roleGuard('admin'), updateDepartment)
router.delete('/:id', protect, roleGuard('admin'), deleteDepartment)

module.exports = router