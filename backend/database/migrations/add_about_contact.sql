-- Migration: Add About and Contact tables
-- Created: 2024

-- ===== about (Static content page) =====
CREATE TABLE IF NOT EXISTS about (
  id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title              VARCHAR(255) NOT NULL DEFAULT 'About Us',
  subtitle           VARCHAR(500),
  description        TEXT,
  mission            TEXT,
  vision             TEXT,
  values             TEXT, -- JSON array or comma-separated
  team_description   TEXT,
  image_url          VARCHAR(500),
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_about_updated_at
  BEFORE UPDATE ON about
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== contact_messages (Contact form submissions) =====
CREATE TABLE IF NOT EXISTS contact_messages (
  id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name               VARCHAR(100) NOT NULL,
  email              VARCHAR(100) NOT NULL,
  phone              VARCHAR(20),
  subject            VARCHAR(255) NOT NULL,
  message            TEXT NOT NULL,
  status             VARCHAR(20) NOT NULL DEFAULT 'new', -- new, read, replied, archived
  user_id            INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Optional: if user is logged in
  replied_at         TIMESTAMP WITH TIME ZONE,
  replied_by         INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Admin who replied
  reply_message      TEXT,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== contact_info (Contact information - address, phone, email, social links) =====
CREATE TABLE IF NOT EXISTS contact_info (
  id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type               VARCHAR(50) NOT NULL, -- address, phone, email, social
  label              VARCHAR(100) NOT NULL, -- Home Address, Office Phone, etc.
  value              VARCHAR(500) NOT NULL,
  icon               VARCHAR(50), -- fa-map-marker-alt, fa-phone, etc.
  display_order      INTEGER DEFAULT 0,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_contact_info_type ON contact_info(type);
CREATE INDEX idx_contact_info_display_order ON contact_info(display_order);

-- Trigger for updated_at
CREATE TRIGGER update_contact_info_updated_at
  BEFORE UPDATE ON contact_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default About content
INSERT INTO about (title, subtitle, description, mission, vision, values, team_description, is_active)
VALUES (
  'Chào mừng đến với Secret Coder',
  'Nền tảng học tập trực tuyến hàng đầu',
  'Secret Coder là nền tảng học tập trực tuyến được thiết kế để giúp bạn phát triển kỹ năng lập trình và công nghệ thông tin. Chúng tôi cung cấp các khóa học chất lượng cao với nội dung được cập nhật thường xuyên.',
  'Sứ mệnh của chúng tôi là làm cho giáo dục công nghệ trở nên dễ tiếp cận và hiệu quả cho mọi người, bất kể trình độ của họ.',
  'Trở thành nền tảng học tập trực tuyến hàng đầu tại Việt Nam, nơi mọi người có thể học và phát triển kỹ năng công nghệ một cách dễ dàng và thú vị.',
  'Chất lượng, Đổi mới, Cộng đồng, Minh bạch',
  'Đội ngũ của chúng tôi bao gồm các giảng viên giàu kinh nghiệm và các chuyên gia công nghệ hàng đầu, cam kết mang đến trải nghiệm học tập tốt nhất cho học viên.',
  TRUE
)
ON CONFLICT DO NOTHING;

-- Insert default Contact Info
INSERT INTO contact_info (type, label, value, icon, display_order, is_active) VALUES
('address', 'Địa chỉ', '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh', 'fa-map-marker-alt', 1, TRUE),
('phone', 'Điện thoại', '+84 123 456 789', 'fa-phone-alt', 2, TRUE),
('email', 'Email', 'info@secretcoder.com', 'fa-envelope', 3, TRUE),
('social', 'Facebook', 'https://facebook.com/secretcoder', 'fab fa-facebook-f', 4, TRUE),
('social', 'Twitter', 'https://twitter.com/secretcoder', 'fab fa-twitter', 5, TRUE),
('social', 'LinkedIn', 'https://linkedin.com/company/secretcoder', 'fab fa-linkedin-in', 6, TRUE),
('social', 'YouTube', 'https://youtube.com/secretcoder', 'fab fa-youtube', 7, TRUE)
ON CONFLICT DO NOTHING;

