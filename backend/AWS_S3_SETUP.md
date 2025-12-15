# Hướng dẫn Cấu hình AWS S3

## 📋 Tổng quan

File uploads trong project này có thể được lưu trữ trên AWS S3. Nếu không cấu hình S3, files sẽ được lưu trữ local trong thư mục `uploads/`.

## 🔑 Các biến môi trường cần thiết

Đã được thêm vào file `.env`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_S3_BUCKET_URL=https://your_bucket_name.s3.us-east-1.amazonaws.com
```

## 🚀 Cách lấy AWS Credentials

### Bước 1: Tạo IAM User

1. Đăng nhập vào [AWS Console](https://console.aws.amazon.com)
2. Vào **IAM** → **Users** → **Create user**
3. Đặt tên user (ví dụ: `e-learning-upload-user`)
4. Chọn **Provide user access to the AWS Management Console** (tùy chọn)
5. Click **Next**

### Bước 2: Gán Permissions

1. Chọn **Attach policies directly**
2. Tìm và chọn policy: **AmazonS3FullAccess** (hoặc tạo custom policy với quyền hạn chế hơn)
3. Click **Next** → **Create user**

### Bước 3: Tạo Access Keys

1. Click vào user vừa tạo
2. Vào tab **Security credentials**
3. Scroll xuống phần **Access keys**
4. Click **Create access key**
5. Chọn **Application running outside AWS**
6. Click **Next** → **Create access key**
7. **Lưu lại ngay**:
   - **Access key ID** → Copy vào `AWS_ACCESS_KEY_ID`
   - **Secret access key** → Copy vào `AWS_SECRET_ACCESS_KEY`
   - ⚠️ **Lưu ý**: Secret key chỉ hiển thị 1 lần, không thể xem lại!

## 🪣 Tạo S3 Bucket

### Bước 1: Tạo Bucket

1. Vào **S3** → **Buckets** → **Create bucket**
2. Đặt tên bucket (ví dụ: `e-learning-uploads`)
3. Chọn **Region** (ví dụ: `us-east-1`)
4. **Block Public Access**: 
   - Nếu muốn files public: Bỏ chọn "Block all public access"
   - Nếu muốn files private: Giữ nguyên (mặc định)
5. Click **Create bucket**

### Bước 2: Cấu hình Bucket Policy (Nếu muốn files public)

1. Vào bucket → **Permissions** → **Bucket policy**
2. Thêm policy sau (thay `your-bucket-name`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

3. Click **Save changes**

### Bước 3: Cấu hình CORS (Nếu cần)

1. Vào bucket → **Permissions** → **Cross-origin resource sharing (CORS)**
2. Thêm CORS configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

3. Click **Save changes**

## 📝 Cập nhật file `.env`

Sau khi có credentials, cập nhật file `.env`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=e-learning-uploads
AWS_S3_BUCKET_URL=https://e-learning-uploads.s3.us-east-1.amazonaws.com
```

**Lưu ý:**
- Thay các giá trị `your_*` bằng giá trị thực tế của bạn
- `AWS_REGION`: Region nơi bạn tạo bucket (ví dụ: `us-east-1`, `ap-southeast-1`)
- `AWS_S3_BUCKET_URL`: Format: `https://{bucket-name}.s3.{region}.amazonaws.com`

## ✅ Kiểm tra cấu hình

Sau khi cập nhật `.env`, restart server:

```bash
npm run dev
```

Kiểm tra logs:
- Nếu thấy `[S3 Upload] Upload successful` → S3 đã được cấu hình đúng
- Nếu không thấy, files sẽ được lưu local trong `uploads/`

## 🔒 Bảo mật

1. **KHÔNG commit file `.env` lên Git**
2. Thêm `.env` vào `.gitignore`
3. Sử dụng IAM user với quyền tối thiểu cần thiết
4. Rotate access keys định kỳ
5. Sử dụng AWS Secrets Manager hoặc Parameter Store cho production

## 🎯 Custom IAM Policy (Khuyến nghị)

Thay vì dùng `AmazonS3FullAccess`, tạo custom policy với quyền hạn chế:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

## 📚 Tài liệu tham khảo

- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- AWS IAM Best Practices: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
- AWS SDK for JavaScript: https://docs.aws.amazon.com/sdk-for-javascript/

---

**Sau khi cấu hình xong, files sẽ tự động upload lên S3 khi có request upload! 🚀**

