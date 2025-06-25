import express from 'express'
import { register, login, getUsers, updateUser, deleteUser } from '../controller/user.controller.js'
import { body } from 'express-validator';

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
router.get('/get-users', getUsers)
router.put('/update-user/:id', updateUser)
router.delete('/delete-user/:id', deleteUser)

export default router


