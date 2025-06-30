import User from '../model/user.model.js'
import Task from '../model/task.model.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const generateToken = (user) => {
    return jwt.sign({
        userId: user._id,
        userRole: user.role
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

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
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        //delete password field in the response
        const userObj = user.toObject(); //converting mongodb object/record into js object
        delete userObj.password

        res.status(201).json({ message: 'User registered successfully', userObj });
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
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }
        //jwt part here
        const token = generateToken(user);
        res.status(200).json({ message: 'Login successful', token });
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
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const updatedUser = {
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        }
        await User.findByIdAndUpdate(
            req.params.id,
            { $set: updatedUser },
            { new: true }
        )
        delete updatedUser.password
        res.status(200).json({ "User updated successfully": updatedUser })

    } catch (error) {
        res.status(400).json({ "Error updating user": error })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(401).json({ error: 'User does not exist' })
        }
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        res.status(200).json({ "user deleted successfully": deletedUser })
    } catch (error) {
        res.status(500).json({ "error deleting user": error })
    }
}

//admin assigns task to user(s)
export const assignTask = async (req, res) => {
    const { title, description, assignedTo } = req.body;
    try {
        const newTask = new Task({
            title,
            description,
            assignedTo,
            createdBy: req.user.userId //user Id of admin from jwt middleware
        });
        await newTask.save()
        res.status(201).json({ message: 'Task assigned', newTask });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//get user tasks

export const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId })
      .select('title description createdBy') // select only these fields
      .populate('createdBy', 'name email');  // populate createdBy info

    if (!tasks || tasks.length === 0) {
      return res.status(200).json({ message: 'No Tasks Assigned' });
    }

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//mark task as completed

export const markTaskCompleted = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        if (!task) return res.status(404).json({ error: "Task not found" });
        if (!task.assignedTo.includes(req.user.userId)) {
            return res.status(403).json({ error: "You are not assigned to this task" });
        }
        //to prevent duplicate entries
        if (!task.completedBy.map(id => id.toString()).includes(req.user.userId)) {
            task.completedBy.push(req.user.userId);
            await task.save();
        }
        res.status(200).json({ message: "Task marked as completed", task });
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
}

