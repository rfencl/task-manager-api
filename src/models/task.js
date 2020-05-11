const mongoose = require('mongoose');
const validator = require('validator');
const taskSchema = new mongoose.Schema(
  {
  description: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, 
{
  timestamps: true
});

const todo = (desc, isCompleted) => {
  new Task({
    description: desc,
    completed: isCompleted,
  })
    .save()
    .then((task) => {
      console.log(task);
    })
    .catch((error) => {
      console.log('Error!', error);
    });
}


const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
