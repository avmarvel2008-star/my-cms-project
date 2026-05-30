const mongoose = require('mongoose');

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
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    default: 'published'
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);