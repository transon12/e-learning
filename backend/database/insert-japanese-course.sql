-- Insert Japanese Course for Beginners
-- This script creates a complete Japanese language course with sections and lessons

-- First, ensure we have an instructor (use existing instructor or create one)
-- Note: Replace instructor_id with an actual instructor ID from your users table
-- Or create an instructor first:
-- INSERT INTO users (username, email, password, role, profile_first_name, profile_last_name, is_active)
-- VALUES ('japanese_instructor', 'instructor@example.com', '$2a$12$hashedpassword', 'instructor', 'Japanese', 'Instructor', true)
-- ON CONFLICT (email) DO NOTHING;

-- Get or create instructor (assuming you have an admin user, we'll use the first instructor or admin)
-- For this script, we'll use instructor_id = 1 (you should replace this with actual ID)

-- ===== COURSE: Tiếng Nhật cho Người Mới Bắt Đầu =====
INSERT INTO courses (
    title,
    slug,
    description,
    short_description,
    instructor_id,
    category,
    thumbnail,
    price,
    is_free,
    level,
    language,
    duration_hours,
    total_lessons,
    status,
    is_active
) VALUES (
    'Tiếng Nhật cho Người Mới Bắt Đầu',
    'tieng-nhat-cho-nguoi-moi-bat-dau',
    'Khóa học Tiếng Nhật toàn diện dành cho người mới bắt đầu. Bạn sẽ học từ bảng chữ cái Hiragana, Katakana đến các cấu trúc ngữ pháp cơ bản, từ vựng thông dụng và hội thoại hàng ngày. Khóa học được thiết kế theo phương pháp học tập hiện đại, dễ hiểu và thực hành ngay.',
    'Học Tiếng Nhật từ con số 0 với bảng chữ cái, ngữ pháp và từ vựng cơ bản',
    1, -- Replace with actual instructor_id
    'Ngôn ngữ',
    'img/course-japanese.jpg',
    0.00,
    true,
    'beginner',
    'vietnamese',
    20.00, -- Total duration: 20 hours
    25, -- Total lessons: 25
    'published',
    true
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP
RETURNING id;

-- Get the course ID (you'll need to replace this with actual course ID after insert)
-- For this script, we assume the course ID is returned or you know it
-- Let's use a variable approach - in PostgreSQL, we can use CTE or get the ID

-- ===== SECTIONS =====
-- Section 1: Giới thiệu và Bảng chữ cái
INSERT INTO course_sections (course_id, title, order_index)
SELECT c.id, 'Giới thiệu và Bảng chữ cái', 1
FROM courses c
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT DO NOTHING;

-- Section 2: Từ vựng cơ bản
INSERT INTO course_sections (course_id, title, order_index)
SELECT c.id, 'Từ vựng cơ bản', 2
FROM courses c
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT DO NOTHING;

-- Section 3: Ngữ pháp cơ bản
INSERT INTO course_sections (course_id, title, order_index)
SELECT c.id, 'Ngữ pháp cơ bản', 3
FROM courses c
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT DO NOTHING;

-- Section 4: Hội thoại hàng ngày
INSERT INTO course_sections (course_id, title, order_index)
SELECT c.id, 'Hội thoại hàng ngày', 4
FROM courses c
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT DO NOTHING;

-- Section 5: Luyện tập và Ôn tập
INSERT INTO course_sections (course_id, title, order_index)
SELECT c.id, 'Luyện tập và Ôn tập', 5
FROM courses c
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT DO NOTHING;

-- ===== LESSONS =====
-- Section 1: Giới thiệu và Bảng chữ cái (5 lessons)
INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Giới thiệu khóa học và văn hóa Nhật Bản',
    'gioi-thieu-khoa-hoc-va-van-hoa-nhat-ban',
    'Tìm hiểu về văn hóa Nhật Bản, cách học Tiếng Nhật hiệu quả và giới thiệu về hệ thống chữ viết.',
    c.id,
    cs1.id,
    1,
    30,
    'Nội dung bài học: Giới thiệu về đất nước Nhật Bản, văn hóa và con người. Phương pháp học Tiếng Nhật hiệu quả. Tổng quan về hệ thống chữ viết: Hiragana, Katakana, Kanji.',
    true,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 1 LIMIT 1
) cs1
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Bảng chữ cái Hiragana - Phần 1 (あ-こ)',
    'bang-chu-cai-hiragana-phan-1',
    'Học các chữ cái Hiragana từ あ đến こ, cách viết và phát âm.',
    c.id,
    cs1.id,
    2,
    45,
    'Học 10 chữ cái đầu tiên của Hiragana: あ (a), い (i), う (u), え (e), お (o), か (ka), き (ki), く (ku), け (ke), こ (ko). Cách viết từng chữ và luyện tập.',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 1 LIMIT 1
) cs1
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Bảng chữ cái Hiragana - Phần 2 (さ-と)',
    'bang-chu-cai-hiragana-phan-2',
    'Tiếp tục học Hiragana từ さ đến と.',
    c.id,
    cs1.id,
    3,
    45,
    'Học tiếp các chữ cái: さ (sa), し (shi), す (su), せ (se), そ (so), た (ta), ち (chi), つ (tsu), て (te), と (to).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 1 LIMIT 1
) cs1
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Bảng chữ cái Katakana - Giới thiệu',
    'bang-chu-cai-katakana-gioi-thieu',
    'Học bảng chữ cái Katakana, cách sử dụng và khác biệt với Hiragana.',
    c.id,
    cs1.id,
    4,
    40,
    'Giới thiệu về Katakana, cách viết và phát âm. Katakana được dùng để viết từ mượn từ nước ngoài. Học các chữ cái cơ bản: ア (a), イ (i), ウ (u), エ (e), オ (o).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 1 LIMIT 1
) cs1
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Luyện tập đọc và viết Hiragana, Katakana',
    'luyen-tap-doc-va-viet-hiragana-katakana',
    'Bài tập luyện tập đọc và viết để nắm vững bảng chữ cái.',
    c.id,
    cs1.id,
    5,
    35,
    'Các bài tập đọc từ vựng đơn giản, viết lại các từ bằng Hiragana và Katakana. Trò chơi nhận diện chữ cái.',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 1 LIMIT 1
) cs1
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

-- Section 2: Từ vựng cơ bản (6 lessons)
INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Số đếm và Thời gian',
    'so-dem-va-thoi-gian',
    'Học cách đếm số và nói về thời gian trong Tiếng Nhật.',
    c.id,
    cs2.id,
    1,
    40,
    'Số đếm từ 1-100. Cách nói giờ, phút, ngày, tháng, năm. Các từ vựng về thời gian: 今 (ima - bây giờ), 今日 (kyou - hôm nay), 明日 (ashita - ngày mai).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 2 LIMIT 1
) cs2
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Màu sắc và Hình dạng',
    'mau-sac-va-hinh-dang',
    'Học từ vựng về màu sắc và hình dạng.',
    c.id,
    cs2.id,
    2,
    30,
    'Các màu cơ bản: 赤 (aka - đỏ), 青 (ao - xanh), 黄色 (kiiro - vàng), 白 (shiro - trắng), 黒 (kuro - đen). Hình dạng: 丸 (maru - tròn), 四角 (shikaku - vuông), 三角 (sankaku - tam giác).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 2 LIMIT 1
) cs2
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Gia đình và Người thân',
    'gia-dinh-va-nguoi-than',
    'Từ vựng về các thành viên trong gia đình.',
    c.id,
    cs2.id,
    3,
    35,
    'お父さん (otousan - bố), お母さん (okaasan - mẹ), 兄 (ani - anh trai), 姉 (ane - chị gái), 弟 (otouto - em trai), 妹 (imouto - em gái), 祖父 (sofu - ông), 祖母 (sobo - bà).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 2 LIMIT 1
) cs2
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Đồ vật hàng ngày',
    'do-vat-hang-ngay',
    'Học từ vựng về các đồ vật thường dùng hàng ngày.',
    c.id,
    cs2.id,
    4,
    40,
    '机 (tsukue - bàn), 椅子 (isu - ghế), 本 (hon - sách), ペン (pen - bút), 電話 (denwa - điện thoại), コンピューター (konpyuutaa - máy tính), 車 (kuruma - xe hơi).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 2 LIMIT 1
) cs2
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Thực phẩm và Đồ uống',
    'thuc-pham-va-do-uong',
    'Từ vựng về thức ăn và đồ uống phổ biến.',
    c.id,
    cs2.id,
    5,
    40,
    'ご飯 (gohan - cơm), パン (pan - bánh mì), 水 (mizu - nước), お茶 (ocha - trà), コーヒー (koohii - cà phê), 肉 (niku - thịt), 魚 (sakana - cá), 野菜 (yasai - rau).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 2 LIMIT 1
) cs2
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Cơ thể và Sức khỏe',
    'co-the-va-suc-khoe',
    'Từ vựng về các bộ phận cơ thể và sức khỏe.',
    c.id,
    cs2.id,
    6,
    35,
    '頭 (atama - đầu), 目 (me - mắt), 耳 (mimi - tai), 鼻 (hana - mũi), 口 (kuchi - miệng), 手 (te - tay), 足 (ashi - chân), 元気 (genki - khỏe mạnh), 病気 (byouki - bệnh).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 2 LIMIT 1
) cs2
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

-- Section 3: Ngữ pháp cơ bản (6 lessons)
INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Câu chào hỏi cơ bản',
    'cau-chao-hoi-co-ban',
    'Học cách chào hỏi và giới thiệu bản thân.',
    c.id,
    cs3.id,
    1,
    35,
    'こんにちは (konnichiwa - xin chào), おはようございます (ohayou gozaimasu - chào buổi sáng), こんばんは (konbanwa - chào buổi tối), はじめまして (hajimemashite - lần đầu gặp mặt), よろしくお願いします (yoroshiku onegaishimasu - rất mong được giúp đỡ).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 3 LIMIT 1
) cs3
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Đại từ nhân xưng và Danh từ',
    'dai-tu-nhan-xung-va-danh-tu',
    'Học cách sử dụng đại từ nhân xưng và danh từ.',
    c.id,
    cs3.id,
    2,
    40,
    '私 (watashi - tôi), あなた (anata - bạn), 彼 (kare - anh ấy), 彼女 (kanojo - cô ấy), 私たち (watashitachi - chúng tôi). Cách sử dụng trợ từ は (wa) và が (ga).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 3 LIMIT 1
) cs3
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Động từ です và Tính từ',
    'dong-tu-desu-va-tinh-tu',
    'Học cách sử dụng động từ です và tính từ trong câu.',
    c.id,
    cs3.id,
    3,
    45,
    'Cấu trúc: Danh từ + です (desu). Tính từ đuôi い (i-adjectives): 大きい (ookii - lớn), 小さい (chiisai - nhỏ), 新しい (atarashii - mới). Tính từ đuôi な (na-adjectives): きれい (kirei - đẹp), 静か (shizuka - yên tĩnh).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 3 LIMIT 1
) cs3
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Động từ cơ bản - Thì hiện tại',
    'dong-tu-co-ban-thi-hien-tai',
    'Học các động từ cơ bản và cách chia ở thì hiện tại.',
    c.id,
    cs3.id,
    4,
    50,
    'Động từ nhóm 1 (u-verbs): 行く (iku - đi), 来る (kuru - đến), 食べる (taberu - ăn), 飲む (nomu - uống), 見る (miru - xem), 聞く (kiku - nghe). Cách chia động từ ở thì hiện tại và quá khứ.',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 3 LIMIT 1
) cs3
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Trợ từ を, に, で, へ',
    'tro-tu-wo-ni-de-e',
    'Học cách sử dụng các trợ từ quan trọng trong Tiếng Nhật.',
    c.id,
    cs3.id,
    5,
    45,
    'を (wo) - chỉ đối tượng của động từ: 本を読む (hon wo yomu - đọc sách). に (ni) - chỉ địa điểm, thời gian: 学校に行く (gakkou ni iku - đi đến trường). で (de) - chỉ nơi chốn hành động: 図書館で勉強する (toshokan de benkyou suru - học ở thư viện). へ (e) - chỉ hướng: 東京へ行く (toukyou e iku - đi đến Tokyo).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 3 LIMIT 1
) cs3
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Câu hỏi và Câu phủ định',
    'cau-hoi-va-cau-phu-dinh',
    'Học cách đặt câu hỏi và tạo câu phủ định.',
    c.id,
    cs3.id,
    6,
    40,
    'Câu hỏi với か (ka): これは何ですか？(kore wa nan desu ka? - cái này là gì?). Câu hỏi với だれ (dare - ai), どこ (doko - ở đâu), いつ (itsu - khi nào), どう (dou - như thế nào). Câu phủ định với ではありません (dewa arimasen) và ない (nai).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 3 LIMIT 1
) cs3
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

-- Section 4: Hội thoại hàng ngày (5 lessons)
INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Mua sắm',
    'mua-sam',
    'Học cách mua sắm và hỏi giá trong Tiếng Nhật.',
    c.id,
    cs4.id,
    1,
    40,
    'いくらですか？(ikura desu ka? - giá bao nhiêu?). これをください (kore wo kudasai - cho tôi cái này). ありがとうございます (arigatou gozaimasu - cảm ơn). すみません (sumimasen - xin lỗi/xin chào).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 4 LIMIT 1
) cs4
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Đặt món ăn',
    'dat-mon-an',
    'Học cách đặt món ăn tại nhà hàng.',
    c.id,
    cs4.id,
    2,
    35,
    'メニューを見せてください (menyuu wo misete kudasai - cho tôi xem menu). これをください (kore wo kudasai - cho tôi món này). おいしい (oishii - ngon). お会計お願いします (okaikei onegaishimasu - tính tiền).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 4 LIMIT 1
) cs4
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Hỏi đường',
    'hoi-duong',
    'Học cách hỏi đường và chỉ đường.',
    c.id,
    cs4.id,
    3,
    35,
    'すみません、駅はどこですか？(sumimasen, eki wa doko desu ka? - xin lỗi, nhà ga ở đâu?). まっすぐ行ってください (massugu itte kudasai - đi thẳng). 右に曲がってください (migi ni magatte kudasai - rẽ phải). 左に曲がってください (hidari ni magatte kudasai - rẽ trái).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 4 LIMIT 1
) cs4
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Gọi điện thoại',
    'goi-dien-thoai',
    'Học cách gọi điện thoại và trả lời điện thoại.',
    c.id,
    cs4.id,
    4,
    30,
    'もしもし (moshimoshi - alo). もしもし、[名前]です (moshimoshi, [namae] desu - alo, tôi là [tên]). [名前]さんはいらっしゃいますか？([namae] san wa irasshaimasu ka? - [tên] có ở đó không?). 少々お待ちください (shoushou omachi kudasai - vui lòng đợi một chút).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 4 LIMIT 1
) cs4
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Gặp gỡ và Giới thiệu',
    'gap-go-va-gioi-thieu',
    'Học cách giới thiệu bản thân và người khác.',
    c.id,
    cs4.id,
    5,
    40,
    'はじめまして、[名前]です (hajimemashite, [namae] desu - lần đầu gặp mặt, tôi là [tên]). どうぞよろしくお願いします (douzo yoroshiku onegaishimasu - rất mong được giúp đỡ). こちらは[名前]です (kochira wa [namae] desu - đây là [tên]). お仕事は何ですか？(oshigoto wa nan desu ka? - công việc của bạn là gì?).',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 4 LIMIT 1
) cs4
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

-- Section 5: Luyện tập và Ôn tập (3 lessons)
INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Luyện tập Tổng hợp - Phần 1',
    'luyen-tap-tong-hop-phan-1',
    'Bài tập tổng hợp về từ vựng và ngữ pháp đã học.',
    c.id,
    cs5.id,
    1,
    45,
    'Bài tập đọc hiểu, điền từ vào chỗ trống, dịch câu đơn giản. Luyện tập với các từ vựng về gia đình, màu sắc, số đếm. Làm bài tập về trợ từ và động từ.',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 5 LIMIT 1
) cs5
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Luyện tập Tổng hợp - Phần 2',
    'luyen-tap-tong-hop-phan-2',
    'Tiếp tục luyện tập với các tình huống thực tế.',
    c.id,
    cs5.id,
    2,
    45,
    'Bài tập hội thoại, đặt câu với từ vựng đã học. Luyện tập các tình huống: mua sắm, đặt món ăn, hỏi đường. Viết đoạn văn ngắn giới thiệu bản thân.',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 5 LIMIT 1
) cs5
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, duration_minutes, content, is_preview, status)
SELECT 
    'Kiểm tra và Ôn tập cuối khóa',
    'kiem-tra-va-on-tap-cuoi-khoa',
    'Bài kiểm tra tổng hợp và ôn tập lại toàn bộ kiến thức.',
    c.id,
    cs5.id,
    3,
    50,
    'Bài kiểm tra tổng hợp: đọc hiểu, ngữ pháp, từ vựng, viết câu. Ôn tập lại các điểm ngữ pháp quan trọng. Tổng kết và hướng dẫn học tiếp lên trình độ trung cấp.',
    false,
    'published'
FROM courses c
CROSS JOIN LATERAL (
    SELECT id FROM course_sections 
    WHERE course_id = c.id AND order_index = 5 LIMIT 1
) cs5
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (slug) DO NOTHING;

-- Update course total_lessons count
UPDATE courses 
SET total_lessons = (
    SELECT COUNT(*) 
    FROM lessons 
    WHERE course_id = courses.id
)
WHERE slug = 'tieng-nhat-cho-nguoi-moi-bat-dau';

-- Link lessons to sections in section_lessons junction table
INSERT INTO section_lessons (section_id, lesson_id, order_index)
SELECT cs.id, l.id, l.order_index
FROM courses c
JOIN course_sections cs ON cs.course_id = c.id
JOIN lessons l ON l.course_id = c.id AND l.section_id = cs.id
WHERE c.slug = 'tieng-nhat-cho-nguoi-moi-bat-dau'
ON CONFLICT (section_id, lesson_id) DO UPDATE SET order_index = EXCLUDED.order_index;

-- Update course total_lessons count
UPDATE courses 
SET total_lessons = (
    SELECT COUNT(*) 
    FROM lessons 
    WHERE course_id = courses.id
)
WHERE slug = 'tieng-nhat-cho-nguoi-moi-bat-dau';

-- Update course duration_hours (sum of all lesson durations in hours)
UPDATE courses 
SET duration_hours = (
    SELECT ROUND(SUM(duration_minutes)::numeric / 60.0, 2)
    FROM lessons 
    WHERE course_id = courses.id
)
WHERE slug = 'tieng-nhat-cho-nguoi-moi-bat-dau';

