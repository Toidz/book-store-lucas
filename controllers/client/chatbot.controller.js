const Fuse = require("fuse.js");
const Book = require("../../models/book.model");
const Category = require("../../models/category.model");

const categories = {
  "Sách trong nước": {
    "Văn học": ["Tiểu thuyết", "Truyện ngắn", "Light novel", "Truyện trinh thám", "Ngôn tình"],
    "Kinh tế": ["Quản trị", "Lãnh đạo", "Marketing", "Bán hàng"],
    "Sách thiếu nhi": ["Manga", "Comic", "Sách tranh kỹ năng sống cho trẻ"],
    "Tâm lý": ["Kỹ năng sống"]
  },
  "Sách nước ngoài": {
    "Children": ["Picture", "Activity Book"],
    "Economics": ["Finance", "Accounting"],
    "Fantasy": [],
    "Romance": []
  }
};
const flattenCategories = (categories) => {
  const list = [];
  for (let parent in categories) {
    for (let child in categories[parent]) {
      list.push({
        parent,
        child,
        sub: null,
        label: child
      });

      categories[parent][child].forEach(sub => {
        list.push({
          parent,
          child,
          sub,
          label: sub
        });
      });
    }
  }

  return list;
};

const categoryList = flattenCategories(categories);
const normalizeText = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};


const stopWords = ["toi", "tim" ,"muon", "mua", "sach", "cho", "minh", "ve", "co"];

const cleanMessage = (msg) => {
  const words = normalizeText(msg).split(" ");
  return words.filter(w => !stopWords.includes(w)).join(" ");
};

const fuse = new Fuse(categoryList, {
  keys: ["label"],
  threshold: 0.4,
  ignoreLocation: true
});

const findBestCategories = (message) => {
  const cleaned = cleanMessage(message);

  const noPrice = cleaned
    .replace(/(\d+)\s*k/g, "")  
    .replace(/\d+/g, "")
    .replace(/duoi|tren|tu|den|k/g, "")
    .trim();

  return fuse.search(noPrice)
    .slice(0, 3)
    .map(r => r.item);
};
const slugify = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
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

  const exactMatch = text.match(/\b(\d{4,})\b/);
  if (exactMatch) {
    const price = parseInt(exactMatch[1]);
    priceFilter.$gte = price - 20000;
    priceFilter.$lte = price + 20000;
    return priceFilter;
  }

  return null;
};
exports.chatBot = async (req, res) => {
  try {
    const message = req.body.message;
    const matches = findBestCategories(message);
    
    const priceFilter = extractPriceFilter(message);
     console.log(priceFilter)
    if (matches.length > 0) {
      const item = matches[0];

      const categoryName = item.sub || item.child;

      const categorySlug = slugify(categoryName);

      const category = await Category.findOne({
        slug: { $regex: categorySlug, $options: "i" }
      })
      const arrayCategory = [category.id]
      const categoryMore = await Category.find({
        parent:category.id
      })
      categoryMore.forEach(item=>{
        arrayCategory.push(item.id)
      })
     
      let query = {
        category: { $in: arrayCategory },
        deleted:false
      };
  
      if(priceFilter) {
        query.priceBook = priceFilter;
      }
      const books = await Book.find(query).limit(5);
      console.log(books)
      return res.json({
        code:"success",
        message: `Mình tìm thấy: ${books.length} sản phẩm liên quan.`,
        books
      });
    }
    return res.json({
      message: `Hãy hỏi chi tiết hơn!`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi server."
    });
  }
};