import User from '../model/user.model.js'
import { validationResult } from 'express-validator';


export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const user = new User({ name, email, password });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const allUsers = await User.find()
        res.status(200).json({ "users": allUsers })
    } catch (error) {
        res.status(400).json({ "Error fetching users": error })
    }
}

export const updateUser = async (req, res) => {
    try {
        const updatedUser = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }
        const savedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updatedUser },
            { new: true }
        )
        res.status(200).json({ "User updated successfully": savedUser })

    } catch (error) {
        res.status(400).json({ "Error updating user": error })
    }
}

export const deleteUser = async (req, res) => {
    try { 
        const user = await User.findById( req.params.id )
        if (!user) {
            return res.status(401).json({ error: 'User does not exist' })
        }
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        res.status(200).json({ "user deleted successfully": deletedUser })
    } catch (error) {
        res.status(500).json({"error deleting user": error})
    }
}
