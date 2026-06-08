const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: String,
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: 'Admin'
  },
  category: {
    type: String,
    default: 'General'
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  comments: [CommentSchema],
  status: {
    type: String,
    default: 'published'
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);