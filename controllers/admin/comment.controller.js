const Comment = require("../../models/comment.model");
const AccountClient = require("../../models/account-client.model");
const Book = require("../../models/book.model");
const moment = require("moment");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  if (req.query.keyword) {
    const regex = new RegExp(req.query.keyword.trim(), "i");
    find.content = regex;
  }

  const limit = 6;
  let page = 1;
  const totalComment = await Comment.countDocuments(find);
  const totalPage = Math.ceil(totalComment / limit);
  if (req.query.page > 0) {
    page = parseInt(req.query.page, 10);
  }
  if (page > totalPage && totalPage > 0) {
    page = totalPage;
  }
  const skip = (page - 1) * limit;

  const commentList = await Comment.find(find).limit(limit).skip(skip).sort({
    createdAt: "desc",
  });

  for (const item of commentList) {
    const user = await AccountClient.findOne({
      _id: item.id_user,
      deleted: false,
    });
    const book = await Book.findOne({
      _id: item.id_book,
      deleted: false,
    });
    item.userName = user ? user.fullName : "Khách hàng";
    item.bookName = book ? book.name : "Sách đã xóa";
    item.formatTime = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
  }

  const pagination = {
    skip,
    totalComment,
    totalPage,
  };

  res.render("admin/pages/comment-list", {
    pageTitle: "Quản lý bình luận",
    commentList,
    pagination,
  });
};

module.exports.approvePatch = async (req, res) => {
  try {
    const id = req.params.id;
    await Comment.updateOne(
      {
        _id: id,
        deleted: false,
      },
      {
        status: "approved",
        reviewedBy: req.account.id,
        reviewedAt: Date.now(),
      }
    );
    req.flash("success", "Duyệt bình luận thành công!");
    res.json({
      code: "success",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Duyệt bình luận thất bại!",
    });
  }
};

module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;
    await Comment.updateOne(
      {
        _id: id,
        deleted: false,
      },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      }
    );
    req.flash("success", "Xóa bình luận thành công!");
    res.json({
      code: "success",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Xóa bình luận thất bại!",
    });
  }
};
