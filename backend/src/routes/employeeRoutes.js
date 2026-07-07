const express = require('express')
const router = express.Router()

const {
  getAllEmployees,
  getMyTeam,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
  getMyProfile,
} = require('../controllers/employeeController')

const { protect } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')

router.get('/me', protect, getMyProfile)
router.get('/my-team', protect, roleGuard('manager'), getMyTeam)

router.get('/', protect, roleGuard('admin', 'hr'), getAllEmployees)
router.get('/:id', protect, getEmployeeById)
router.put('/:id', protect, updateEmployee)
router.delete('/:id', protect, roleGuard('admin', 'hr'), deactivateEmployee)

module.exports = router