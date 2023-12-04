const WeekList = require('../models/weekListModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const validateWeekList = async (req, next) => {
  const weekList = await WeekList.findById(req.params.id);

  if (!weekList || weekList.createdBy !== req.user.id) {
    return next(
      new AppError(
        'The list belonging to this ID does not exist or you do not have permission to perform this action',
        401
      )
    );
  }

  return weekList;
};

const filterProperties = (obj, ...args) => {
  const filterObj = {};

  Object.keys(obj).forEach(key => {
    if (args.includes(key)) filterObj[key] = obj[key];
  });

  return filterObj;
};

exports.getWeekLists = async (req, res, next) => {
  const weekLists = await WeekList.find({
    $and: [
      { isCompleted: { $eq: false } },
      {
        expiresOn: {
          $gt: new Date()
        }
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    requestedAt: res.requestedAt,
    results: weekLists.length,
    data: {
      weekLists
    }
  });
};

exports.createWeekList = catchAsync(async (req, res, next) => {
  // If two active weeklist present. Throw error.
  const weekLists = await WeekList.find({
    $and: [
      { createdBy: req.user.id },
      { isCompleted: { $eq: false } },
      {
        expiresOn: {
          $gt: new Date()
        }
      }
    ]
  });

  if (weekLists.length === 2) {
    return next(
      new AppError(
        'You have reached your limit( 2 active weeklists ). Please upgrade your plan to create unlimited lists.',
        403
      )
    );
  }

  // Filter out propertes.
  const allowedPropertiesObj = filterProperties(
    req.body,
    'description',
    'tasks'
  );

  // Limit to only update description of task.
  if (allowedPropertiesObj.tasks) {
    const filterdTasks = allowedPropertiesObj.tasks.map(task =>
      filterProperties(task, 'description')
    );
    allowedPropertiesObj.tasks = filterdTasks;
  }

  // Create weeklist
  const weekList = await WeekList.create({
    createdBy: req.user.id,
    ...allowedPropertiesObj
  });

  res.status(200).json({
    status: 'success',
    data: {
      weekList
    }
  });
});

exports.deleteWeekList = catchAsync(async (req, res, next) => {
  // Check if the week list exists and belongs to the user.
  const weekList = await validateWeekList(req, next);

  // if 24hr passed after week list creation. Return
  if (!weekList.canModify(weekList, 1)) {
    return next(new AppError('You cannot delete this list anymore', 403));
  }

  await WeekList.findByIdAndDelete(weekList.id);

  res.status(204).json({
    status: 'success',
    message: 'Deleted list successfully'
  });
});

exports.updateWeekList = catchAsync(async (req, res, next) => {
  let weekList = await validateWeekList(req, next);
  const allowedPropertiesObj = filterProperties(
    req.body,
    'description',
    'tasks'
  );

  // if 1 day passed after week list creation. Return
  if (!weekList.canModify(weekList, 1)) {
    return next(new AppError('You can no longer update this task.', 403));
  }

  // Limit to only update description of task.
  if (allowedPropertiesObj.tasks) {
    const filterdTasks = allowedPropertiesObj.tasks.map(task =>
      filterProperties(task, 'description')
    );
    allowedPropertiesObj.tasks = filterdTasks;
  }

  // Update weeklist
  weekList = await WeekList.findByIdAndUpdate(
    weekList.id,
    allowedPropertiesObj,
    {
      runValidators: false,
      new: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: { weekList }
  });
});

exports.markTask = catchAsync(async (req, res, next) => {
  if (!req.body.taskId || !Object.hasOwn(req.body, 'isCompleted')) {
    return next(
      new AppError(
        'Please provide the "id" and "isCompleted" property of the task which you want to update.',
        403
      )
    );
  }

  const weekList = await validateWeekList(req, next);

  if (weekList.isCompleted) {
    return next(
      new AppError(
        'This weekilst is marked complete. You can no longer update it.',
        403
      )
    );
  }

  // Check if task is in the weeklist
  const currentTask = await weekList.tasks.id(req.body.taskId);

  if (!currentTask) {
    return next(
      new AppError('The task with the given "id" is not in the weeklist', 400)
    );
  }

  // if 7days have passed after week list creation. Return
  if (!weekList.canModify(weekList, 7)) {
    return next(new AppError('You can no longer update this task.', 403));
  }

  // Update the task.
  currentTask.isCompleted = req.body.isCompleted;

  if (req.body.isCompleted) {
    currentTask.completedAt = new Date();
  } else {
    currentTask.completedAt = undefined;
  }

  // Check if all tasks are complete, if then update the isCompleted property to true of weeeklist
  if (!weekList.tasks.some(task => task.isCompleted === false)) {
    weekList.isCompleted = true;
  }

  weekList.save();

  res.status(200).json({
    status: 'success',
    data: { currentTask }
  });
});
