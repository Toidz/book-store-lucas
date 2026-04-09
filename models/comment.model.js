const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    id_book: String,
    id_user: String,
    id_order: String,
    content: String,
    status: {
      type: String,
      default: "pending",
    },
    reviewedBy: String,
    reviewedAt: Date,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: String,
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", schema, "comments");
module.exports = Comment;
