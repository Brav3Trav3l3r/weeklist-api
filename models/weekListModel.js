const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  isCompleted: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: [true, 'A task need a description']
  },
  completedAt: Date
});

const weekListScheme = new mongoose.Schema(
  {
    createdBy: String,
    description: {
      type: String,
      required: [true, 'A weeklist need a description']
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tasks: [taskSchema],
    number: Number
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

weekListScheme.virtual('state').get(function() {
  const status = [];
  const timeDifference = Date.now() - this.createdAt.getTime();

  // Convert milliseconds to days
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (daysDifference >= 7) {
    status.push('inactive');
  } else {
    status.push('active');
  }

  if (this.isCompleted) status.push('completed');

  return status;
});

weekListScheme.virtual('timeLeft').get(function() {
  const timeDifference = Date.now() - this.createdAt.getTime();

  // Convert milliseconds to days
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (!this.isCompleted && daysDifference >= 7) {
    return null;
  }

  const timeLeft = Math.floor(60 * 60 * 24 * 7 - timeDifference / 1000);

  return timeLeft;
});

weekListScheme.methods.canModify = (weekList, period) => {
  const timeDifference = Date.now() - weekList.createdAt.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (daysDifference >= period) return false;

  return true;
};

const WeekList = mongoose.model('WeekList', weekListScheme);

module.exports = WeekList;
