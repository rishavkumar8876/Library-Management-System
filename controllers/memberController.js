const User = require('../models/User');
const Borrow = require('../models/Borrow');


const getAllMembers = async (req, res, next) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Members retrieved successfully.',
      data: members,
    });
  } catch (error) {
    next(error);
  }
};


const deleteMember = async (req, res, next) => {
  try {
    const member = await User.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found.',
      });
    }

    if (member.role !== 'member') {
      return res.status(400).json({
        success: false,
        message: 'Only members can be deleted through this endpoint.',
      });
    }

   
    const activeBorrows = await Borrow.countDocuments({
      memberId: req.params.id,
      status: 'borrowed',
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete member. They have ${activeBorrows} book(s) currently borrowed.`,
      });
    }

    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Member deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};


const getMyBorrowedBooks = async (req, res, next) => {
  try {
    const borrows = await Borrow.find({
      memberId: req.user._id,
      status: 'borrowed',
    })
      .populate('bookId', 'title author isbn category')
      .sort({ borrowDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Borrowed books retrieved successfully.',
      data: borrows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllMembers, deleteMember, getMyBorrowedBooks };
