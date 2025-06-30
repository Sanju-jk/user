import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    assignedTo: [{type:mongoose.Schema.Types.ObjectId, ref: 'User'}],
    completedBy: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdAt: {type: Date, default: Date.now}
})

const Task = mongoose.model('Task', taskSchema)

export default Task