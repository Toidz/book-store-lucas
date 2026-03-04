const Book = require("../../models/book.model");

exports.aiBookAdvisor = async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();
    let mongoFilter = {};
    let replyParts = [];
    const categories = [
      "văn học",
      "kinh doanh",
      "thiếu nhi",
      "trinh thám",
      "kỹ năng sống",
      "tâm lý",
      "giáo dục"
    ];

    categories.forEach(cat => {
      if (lowerMsg.includes(cat)) {
        mongoFilter.category = { $regex: cat, $options: "i" };
        replyParts.push(`thể loại ${cat}`);
      }
    });

    // =============================
    // 2️⃣ Nhận diện giá
    // =============================

    const priceMatch = lowerMsg.match(/(\d+)\s?(k|nghìn|000)?/);

    if (priceMatch) {
      let price = parseInt(priceMatch[1]);

      if (priceMatch[2]) {
        price = price * 1000;
      }

      mongoFilter.priceBook = { $lte: price };
      replyParts.push(`giá dưới ${price.toLocaleString()}đ`);
    }

    // =============================
    // 3️⃣ Nhận diện tác giả
    // =============================

    const authorMatch = lowerMsg.match(/của (.+)/);

    if (authorMatch) {
      mongoFilter.author = {
        $regex: authorMatch[1],
        $options: "i"
      };
      replyParts.push(`tác giả ${authorMatch[1]}`);
    }

    // =============================
    // 4️⃣ Query database
    // =============================

    const books = await Book.find(mongoFilter).limit(5);

    // =============================
    // 5️⃣ Tạo câu trả lời tự nhiên
    // =============================

    let messageReply = "";

    if (books.length > 0) {
      messageReply = `Mình tìm thấy ${books.length} sách phù hợp`;

      if (replyParts.length > 0) {
        messageReply += ` theo ${replyParts.join(", ")}`;
      }

      messageReply += ":\n\n";

      books.forEach((book, index) => {
        messageReply += `${index + 1}. ${book.name}\n`;
        messageReply += `   - Tác giả: ${book.author}\n`;
        messageReply += `   - Giá: ${book.priceBook.toLocaleString()}đ\n\n`;
      });

      messageReply += "Bạn muốn mình gợi ý thêm theo tiêu chí nào không?";
    } else {
      messageReply = "Hiện chưa tìm thấy sách phù hợp. Bạn có thể cho mình thêm thông tin như thể loại hoặc mức giá không?";
    }

    res.json({
      message: messageReply,
      books
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "AI đang gặp lỗi." });
  }
};