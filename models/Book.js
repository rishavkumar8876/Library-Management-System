const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 1,
    },
    availableQuantity: {
      type: Number,
      min: [0, 'Available quantity cannot be negative'],
    },
  },
  { timestamps: true }
);

// Set availableQuantity = quantity on first save
bookSchema.pre('save', function (next) {
  if (this.isNew) {
    this.availableQuantity = this.quantity;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
