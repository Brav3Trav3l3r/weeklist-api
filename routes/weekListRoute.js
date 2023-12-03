const express = require('express');
const weekListController = require('../controllers/weekListController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.protect, weekListController.getWeekLists);

router.post(
  '/create',
  authController.protect,
  weekListController.createWeekList
);

router.patch(
  '/markTask/:id',
  authController.protect,
  weekListController.markTask
);

router
  .route('/:id')
  .delete(authController.protect, weekListController.deleteWeekList)
  .patch(authController.protect, weekListController.updateWeekList);

module.exports = router;
