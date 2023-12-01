const WeekList = require('../models/weekListModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getWeekLists = async (req, res, next) => {
  const weekLists = await WeekList.find({ createdBy: req.user.id });

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
        'You have reached your limit( 2 weeklists ). Please upgrade youn plan to create unlimited lists.',
        403
      )
    );
  }

  // Create weeklist
  const weekList = await WeekList.create({
    description: req.body.description,
    tasks: req.body.tasks,
    createdBy: req.user._id
  });

  res.status(200).json({
    status: 'success',
    requestedAt: res.requestedAt,
    data: {
      weekList
    }
  });
});

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

  // if 24hr passed after week list creation. Return
  if (!weekList.canModify(weekList)) {
    return next(
      new AppError('You cannot delete or update this list anymore', 401)
    );
  }

  return weekList;
};

exports.deleteWeekList = catchAsync(async (req, res, next) => {
  // Check if the week list present and belongs to user
  const weekList = await validateWeekList(req, next);

  await WeekList.findByIdAndDelete(weekList._id);

  res.status(204).json({
    status: 'success',
    message: 'Deleted list successfully'
  });
});

const filterFields = (obj, ...args) => {
  const filterObj = {};

  Object.keys(obj).forEach(key => {
    if (args.includes(key)) filterObj[key] = obj[key];
  });

  return filterObj;
};

exports.updateWeekList = catchAsync(async (req, res, next) => {
  const weekList = await validateWeekList(req, next);
  const allowedFieldObj = filterFields(
    req.body,
    'description',
    'tasks',
    'isCompleted'
  );

  weekList.description = allowedFieldObj.description;
  weekList.tasks = allowedFieldObj.tasks;
  weekList.isCompleted = allowedFieldObj.isCompleted;

  await weekList.save();

  res.status(200).json({
    status: 'success',
    data: { weekList }
  });
});
