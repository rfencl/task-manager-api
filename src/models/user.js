const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true, // sets an index

      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        // if (value.length < 7) {
        //   // validator.isLength(value, {min:7})
        //   throw rsnew Error('Password must be greater than six characters.');
        // }
        if (value.toLowerCase().includes('password')) {
          throw new Error(
            'Password must not contain the literal string "password"'
          );
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (!value) {
          this.age = 0;
        } else if (value < 0) {
          throw new Error('Age must be a positive number');
        }
      },
    },
    tokens: [
      {
        token: { type: String, required: true },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);
// methods added to methods are instance methods
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7 days',
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// Like a foreign key in plsql. We tell mongoose to tie Users and tasks together by the owner id.
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.tokens;
  delete userObj.avatar;

  return userObj;
};

// methods added to statics are accessible on the Model (User)
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to login');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to login');
  }
  return user;
};
/**
 * Hash plain text password before saving
 */
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    // only hash it if it is plain text
    user.password = await bcrypt.hash(user.password, 8);
  }
  next(); // call this to signal mongoose that our hook is done
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
