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

const filterFields = (obj, ...args) => {
  const filterObj = {};

  Object.keys(obj).forEach(key => {
    if (args.includes(key)) filterObj[key] = obj[key];
  });

  return filterObj;
};

exports.getWeekLists = async (req, res, next) => {
  const weekLists = await WeekList.find();

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
  const weekLists = await WeekList.aggregate([
    {
      $match: {
        $and: [
          { createdBy: req.user.id },
          { isCompleted: false },
          {
            $expr: {
              $lte: [
                { $subtract: [new Date(), '$createdAt'] },
                7 * 24 * 60 * 60 * 1000
              ]
            }
          }
        ]
      }
    }
  ]);

  if (weekLists.length >= 2) {
    return next(
      new AppError(
        'You have reached your limit( 2 active weeklists ). Please upgrade your plan to create unlimited lists.',
        403
      )
    );
  }

  // Create weeklist
  const weekList = await WeekList.create({
    description: req.body.description,
    tasks: req.body.tasks,
    createdBy: req.user.id
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
  const allowedFieldObj = filterFields(
    req.body,
    'isCompleted',
    'description',
    'tasks'
  );

  // if 7days passed after week list creation. Return
  if (!weekList.canModify(weekList, 7)) {
    return next(new AppError('You cannot update this week list anymore', 403));
  }

  // If 1 day pass and fileds containes description or task. Return
  if (
    !weekList.canModify(weekList, 1) &&
    Object.keys(allowedFieldObj).some(el =>
      ['description', 'tasks'].includes(el)
    )
  ) {
    return next(
      new AppError(
        'You can now only update "isCompleted" field after 24hr of creation.',
        403
      )
    );
  }

  weekList = await WeekList.findByIdAndUpdate(weekList.id, allowedFieldObj, {
    runValidators: false,
    new: true
  });

  res.status(200).json({
    status: 'success',
    data: { weekList }
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  if (!req.body.id) {
    return next(
      new AppError(
        'Please provide then "id" of the task which you want to update.',
        403
      )
    );
  }

  let weekList = await validateWeekList(req, next);

  // if 7days passed after week list creation. Return
  if (!weekList.canModify(weekList, 7)) {
    return next(new AppError('You cannot update this task anymore', 403));
  }

  const allowedFieldObj = filterFields(req.body, 'isCompleted', 'description');

  // If 1 day pass and fileds contains description. Return
  if (
    !weekList.canModify(weekList, 1) &&
    Object.keys(allowedFieldObj).some(el => ['description'].includes(el))
  ) {
    return next(
      new AppError(
        'You can now only update "isCompleted" field after 24hr of creation.',
        403
      )
    );
  }

  // Update the task.
  // #TODO make this code short.
  if (req.body.isCompleted) {
    weekList = await WeekList.findOneAndUpdate(
      { _id: weekList.id, 'tasks._id': req.body.id },
      {
        $set: {
          'tasks.$.isCompleted': req.body.isCompleted,
          'tasks.$.completedAt': new Date(),
          'tasks.$.description': req.body.description
        }
      },

      { new: true }
    );
  } else if (req.body.isCompleted === false) {
    weekList = await WeekList.findOneAndUpdate(
      { _id: weekList.id, 'tasks._id': req.body.id },
      {
        $set: {
          'tasks.$.isCompleted': req.body.isCompleted,
          'tasks.$.description': req.body.description
        },
        $unset: {
          'tasks.$.completedAt': ''
        }
      },

      { new: true }
    );
  } else {
    weekList = await WeekList.findOneAndUpdate(
      { _id: weekList.id, 'tasks._id': req.body.id },
      {
        $set: {
          'tasks.$.isCompleted': req.body.isCompleted,
          'tasks.$.description': req.body.description
        }
      },

      { new: true }
    );
  }

  res.status(200).json({
    status: 'success',
    data: { weekList }
  });
});
