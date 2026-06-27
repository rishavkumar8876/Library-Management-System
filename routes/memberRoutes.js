const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  deleteMember,
  getMyBorrowedBooks,
} = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');



router.get('/me/books', protect, authorize('member'), getMyBorrowedBooks);


router.get('/', protect, authorize('librarian'), getAllMembers);
router.delete('/:id', protect, authorize('librarian'), deleteMember);

module.exports = router;
