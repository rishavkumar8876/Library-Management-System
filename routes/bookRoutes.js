const express = require('express');
const router = express.Router();
const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { bookValidation, bookUpdateValidation } = require('../validators/validationRules');

router.get('/', protect, getAllBooks);
router.get('/:id', protect, getBookById);


router.post('/', protect, authorize('librarian'), bookValidation, addBook);
router.put('/:id', protect, authorize('librarian'), bookUpdateValidation, updateBook);
router.delete('/:id', protect, authorize('librarian'), deleteBook);


router.post('/:id/borrow', protect, authorize('member'), borrowBook);
router.post('/:id/return', protect, authorize('member'), returnBook);

module.exports = router;
