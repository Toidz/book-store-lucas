const Book = require("../../models/book.model");
const Category = require("../../models/category.model");
const normalizeText = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};
const slugify = (str) => {
  return normalizeText(str)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};
const stopWords = [
  "toi","tim","tim kiem","muon","mua","sach","cho","minh","ve","co","cua"
];
const cleanMessage = (msg) => {
  const words = normalizeText(msg).split(" ");
  return words.filter(w => !stopWords.includes(w)).join(" ");
};
const extractPriceFilter = (message) => {
  let text = normalizeText(message);
  text = text
    .replace(/\./g, "")
    .replace(/đ|vnd/g, "")
    .replace(/(\d+)\s*k/g, (_, num) => parseInt(num) * 1000);
  const priceFilter = {};
  const rangeMatch = text.match(/tu\s*(\d+)\s*den\s*(\d+)/);
  if (rangeMatch) {
    priceFilter.$gte = parseInt(rangeMatch[1]);
    priceFilter.$lte = parseInt(rangeMatch[2]);
    return priceFilter;
  }
  const underMatch = text.match(/duoi\s*(\d+)/);
  if (underMatch) {
    priceFilter.$lte = parseInt(underMatch[1]);
    return priceFilter;
  }
  const overMatch = text.match(/tren\s*(\d+)/);
  if (overMatch) {
    priceFilter.$gte = parseInt(overMatch[1]);
    return priceFilter;
  }
  return null;
};
module.exports.chatBot = async (req, res) => {
  try {
    const message = req.body.message;
    const cleaned = cleanMessage(message);
    const slug = slugify(cleaned);
    const priceFilter = extractPriceFilter(message);
    if (cleaned.includes("ban chay")) {
      const books = await Book.find({
        deleted:false
      })
      .sort({ numberSale:-1 })
      .limit(5);
      return res.json({
        message:"Top sách bán chạy",
        books
      });
    }
    if (cleaned.includes("moi")) {
      const books = await Book.find({
        deleted:false
      })
      .sort({ createdAt:-1 })
      .limit(5);
      return res.json({
        message:"Sách mới nhất",
        books
      });
    }
    const bookBySlug = await Book.find({
      slug: { $regex: slug, $options:"i" },
      deleted:false
    }).limit(5);
    if (bookBySlug.length > 0) {
      return res.json({
        message:"Mình tìm thấy sách bạn cần",
        books:bookBySlug
      });
    }
    const slugAu = slugify(cleaned);
    const authorBooks = await Book.find({
      authorSlug: { $regex: slugAu, $options:"i" },
      deleted:false
    }).limit(5);
    if (authorBooks.length > 0) {
      return res.json({
        message:"Sách của tác giả bạn tìm",
        books:authorBooks
      });
    }
    const categoryList = await Category.find({deleted:false})
    let category =""
    categoryList.forEach(item=>{
      if(slug.includes(item.slug)) {
        category= item.id
      }
    })

    if (category) {
      const childCategory = await Category.find({
        parent:category
      });
      const categoryIds = [category];
      childCategory.forEach(item=>{
        categoryIds.push(item.id)
      });
      let query = {
        category: { $in: categoryIds },
        deleted:false,
        numberBook:{ $gt:0 }
      };
      console.log(priceFilter)
      if (priceFilter) {
        query.priceBook = priceFilter;
      }
      const books = await Book.find(query).limit(5);
      return res.json({
        message:`Mình tìm thấy ${books.length} sách phù hợp`,
        books
      });
    }
    const suggest = await Book.find({
      deleted:false
    })
    .sort({ numberSale:-1 })
    .limit(5);
    return res.json({
      message:"Bạn có thể tham khảo các sách bán chạy",
      books:suggest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:"Vui lòng quay lại sau!"
    });
  }
};