const express = require('express');
const weekListController = require('../controllers/weekListController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', weekListController.getWeekLists);

router.post(
  '/create',
  authController.protect,
  weekListController.createWeekList
);

router.patch(
  '/updateTasks/:id',
  authController.protect,
  weekListController.updateTask
);

router
  .route('/:id')
  .delete(authController.protect, weekListController.deleteWeekList)
  .patch(authController.protect, weekListController.updateWeekList);

module.exports = router;
