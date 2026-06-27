const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');


const addBook = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const { title, author, isbn, category, quantity } = req.body;

    const book = await Book.create({ title, author, isbn, category, quantity });

    res.status(201).json({
      success: true,
      message: 'Book added successfully.',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Books retrieved successfully.',
      data: books,
    });
  } catch (error) {
    next(error);
  }
};


const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Book retrieved successfully.',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};


const updateBook = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    const { title, author, isbn, category, quantity } = req.body;

   
    if (quantity !== undefined) {
      const borrowedCount = book.quantity - book.availableQuantity;
      const newAvailable = quantity - borrowedCount;
      if (newAvailable < 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce quantity below borrowed count (${borrowedCount} currently borrowed).`,
        });
      }
      book.availableQuantity = newAvailable;
      book.quantity = quantity;
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    if (category) book.category = category;

    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book updated successfully.',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};


const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

  
    const activeBorrows = await Borrow.countDocuments({
      bookId: req.params.id,
      status: 'borrowed',
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book. ${activeBorrows} copy/copies are currently borrowed.`,
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};


const borrowBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

   
    if (book.availableQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'No copies of this book are currently available.',
      });
    }

  
    const existingBorrow = await Borrow.findOne({
      memberId: req.user._id,
      bookId: req.params.id,
      status: 'borrowed',
    });

    if (existingBorrow) {
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book.',
      });
    }

    
    const borrow = await Borrow.create({
      memberId: req.user._id,
      bookId: req.params.id,
    });

    book.availableQuantity -= 1;
    await book.save();

    await borrow.populate('bookId', 'title author isbn');

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully.',
      data: borrow,
    });
  } catch (error) {
    next(error);
  }
};


const returnBook = async (req, res, next) => {
  try {
    const borrow = await Borrow.findOne({
      memberId: req.user._id,
      bookId: req.params.id,
      status: 'borrowed',
    });

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: 'No active borrow record found for this book.',
      });
    }

    
    borrow.status = 'returned';
    borrow.returnDate = Date.now();
    await borrow.save();

    
    const book = await Book.findById(req.params.id);
    if (book) {
      book.availableQuantity += 1;
      await book.save();
    }

    res.status(200).json({
      success: true,
      message: 'Book returned successfully.',
      data: borrow,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
};
