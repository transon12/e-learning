# Environment Configuration

Create two environment files manually (not committed to git):

## Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=e_learning
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# CORS / Frontend
FRONTEND_URL=http://localhost:3000

# Uploads
UPLOAD_DIR=uploads
```

## Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=SecretCoder
```

> Lưu ý: tạo file thủ công trên máy, không commit các file `.env` vào repo.


