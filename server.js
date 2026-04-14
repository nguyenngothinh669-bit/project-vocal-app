const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// Database tạm thời để lưu các ảnh đã tạo
const imageDatabase = {};

app.get('/api/images/:word', async (req, res) => {
    const word = req.params.word.toLowerCase();

    // 1. Kiểm tra cache
    if (imageDatabase[word]) {
        console.log(`[Cache] Đã có ảnh cho từ: ${word}`);
        return res.json({ imageUrl: imageDatabase[word] });
    }

    console.log(`[AI] Đang nhờ AI tạo ẢNH THẬT cho từ vựng: "${word}"...`);
    
    try {
        // ==========================================
        // CÂU LỆNH ĐÃ ĐƯỢC SỬA THÀNH YÊU CẦU "ẢNH THẬT"
        // ==========================================
        // Dịch nghĩa: "Một bức ảnh chụp thật, chất lượng cao, cận cảnh của [TỪ VỰNG], rõ nét và chi tiết, phong cách nhiếp ảnh, nền trung tính, không có chữ viết"
        const aiPrompt = `A realistic, high-quality, close-up photograph of ${word}, clear and detailed, real photography, neutral background, no text`;
        
        // Tạo URL với tham số seed để luôn tạo ảnh mới mẻ
        const randomSeed = Math.floor(Math.random() * 100000);
        const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=400&height=400&nologo=true&seed=${randomSeed}`;
        
        // Mô phỏng thời gian chờ 1 giây
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Lưu vào cache
        imageDatabase[word] = aiImageUrl;
        
        console.log(`[Thành công] Đã tạo link ảnh thật: ${aiImageUrl}`);
        res.json({ imageUrl: aiImageUrl });

    } catch (error) {
        console.error("❌ Lỗi Backend:", error);
        res.status(500).json({ error: "Không thể kết nối với AI" });
    }
});

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 BACKEND AI (CHẾ ĐỘ ẢNH THẬT) TẠI PORT ${PORT}`);
    console.log(`=========================================`);
});