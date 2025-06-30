import express from 'express'
import { register, login, assignTask, getUserTasks, markTaskCompleted, getUsers, updateUser, deleteUser } from '../controller/user.controller.js'
import { body } from 'express-validator';
import { verifyJwt } from '../middleware/verifyJwt.js';
import { authorizeRoles } from '../middleware/authorizeRole.js';

const router = express.Router()

const validateUserRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
]

const validateUserLogin = [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
]

router.post('/register', validateUserRegistration, register)
router.post('/login',validateUserLogin, login)

router.post('/assign-task', verifyJwt, authorizeRoles('admin'), assignTask) 

router.get('/my-tasks', verifyJwt, authorizeRoles('user'), getUserTasks)

router.put('/mark-complete/:id', verifyJwt, authorizeRoles('user'), markTaskCompleted)

router.get('/get-users', getUsers)
router.put('/update-user/:id',verifyJwt, updateUser)
router.delete('/delete-user/:id', verifyJwt, deleteUser)

export default router


