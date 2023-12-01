const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  isCompleted: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: [true, 'A task need a description']
  }
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
  const timeDifference = Date.now() - this.createdAt.getTime();

  // Convert milliseconds to days
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (!this.isCompleted && daysDifference >= 7) {
    return 'expired';
  }

  if (this.isCompleted) return 'completed';

  return 'active';
});

weekListScheme.virtual('timeLeft').get(function() {
  // if under 7 daays
  const timeDifference = Date.now() - this.createdAt.getTime();

  // Convert milliseconds to days
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (!this.isCompleted && daysDifference >= 7) {
    return null;
  }

  const timeLeft = Math.floor(60 * 60 * 24 * 7 - timeDifference / 1000);

  return timeLeft;
});

weekListScheme.pre(/^find/, function(next) {
  this.totalActive = 2;
  next();
});

weekListScheme.methods.canModify = weekList => {
  const timeDifference = Date.now() - weekList.createdAt.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (daysDifference >= 1) return false;

  return true;
};

const WeekList = mongoose.model('WeekList', weekListScheme);

module.exports = WeekList;
