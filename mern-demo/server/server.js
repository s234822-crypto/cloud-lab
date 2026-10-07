const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const BUILD_VERSION = 'backend-1.3-client-url-fix';

// ======================================================
// CẤU HÌNH CORS
// ======================================================

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Cho phép request không có origin:
        // ví dụ Postman, curl hoặc server-to-server
        if (!origin) {
            return callback(null, true);
        }

        // Development: cho phép linh hoạt
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // Production: chỉ cho phép origin nằm trong danh sách
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn(`CORS blocked origin: ${origin}`);

        return callback(
            new Error('Not allowed by CORS')
        );
    },

    credentials: true
}));

app.use(express.json());

// ======================================================
// ROUTE GỐC
// ======================================================

app.get('/', (req, res) => {
    res.json({
        message: 'MERN Backend đang hoạt động!',
        status: 'success'
    });
});

// ======================================================
// API TEST
// ======================================================

app.get('/api/hello', (req, res) => {
    res.json({
        message: 'Backend dang hoat dong thanh cong!'
    });
});
app.get('/api/debug/config', (req, res) => {
    res.json({
        build: BUILD_VERSION,
        nodeEnv: process.env.NODE_ENV || null,
        clientUrl: process.env.CLIENT_URL || null,
        port: process.env.PORT || null,
        mongodbConfigured: Boolean(process.env.MONGODB_URI)
    });
});

// ======================================================
// KẾT NỐI MONGODB ATLAS
// ======================================================

if (!process.env.MONGODB_URI) {
    console.warn(
        'CẢNH BÁO: Chưa cấu hình biến môi trường MONGODB_URI'
    );
} else {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log(
                'Kết nối MongoDB Atlas thành công!'
            );
        })
        .catch((err) => {
            console.error(
                'Lỗi kết nối MongoDB:',
                err.message
            );
        });
}

// ======================================================
// SCHEMA STUDENT
// ======================================================

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Student = mongoose.model(
    'Student',
    studentSchema
);

// ======================================================
// GET - DANH SÁCH SINH VIÊN
// ======================================================

app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();

        res.status(200).json(students);

    } catch (error) {
        console.error(
            'Lỗi GET students:',
            error
        );

        res.status(500).json({
            message:
                'Không thể lấy danh sách sinh viên',
            error: error.message
        });
    }
});

// ======================================================
// POST - THÊM SINH VIÊN
// ======================================================

app.post('/api/students', async (req, res) => {
    try {
        const newStudent =
            await Student.create(req.body);

        res.status(201).json(newStudent);

    } catch (error) {
        console.error(
            'Lỗi POST student:',
            error
        );

        res.status(500).json({
            message:
                'Không thể thêm sinh viên',
            error: error.message
        });
    }
});

// ======================================================
// PUT - CẬP NHẬT SINH VIÊN
// ======================================================

app.put('/api/students/:id', async (req, res) => {
    try {
        const updatedStudent =
            await Student.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!updatedStudent) {
            return res.status(404).json({
                message:
                    'Không tìm thấy sinh viên'
            });
        }

        res.status(200).json(
            updatedStudent
        );

    } catch (error) {
        console.error(
            'Lỗi PUT student:',
            error
        );

        res.status(500).json({
            message:
                'Không thể cập nhật sinh viên',
            error: error.message
        });
    }
});

// ======================================================
// DELETE - XÓA SINH VIÊN
// ======================================================

app.delete('/api/students/:id', async (req, res) => {
    try {
        const deletedStudent =
            await Student.findByIdAndDelete(
                req.params.id
            );

        if (!deletedStudent) {
            return res.status(404).json({
                message:
                    'Không tìm thấy sinh viên'
            });
        }

        res.status(200).json({
            message:
                'Đã xóa sinh viên'
        });

    } catch (error) {
        console.error(
            'Lỗi DELETE student:',
            error
        );

        res.status(500).json({
            message:
                'Không thể xóa sinh viên',
            error: error.message
        });
    }
});

// ======================================================
// ROUTE KHÔNG TỒN TẠI
// ======================================================
app.use(express.json());
app.use((req, res) => {
    res.status(404).json({
        message:
            'API không tồn tại',
        path: req.originalUrl
    });
});


// ======================================================
// KHỞI ĐỘNG SERVER
// ======================================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================');
    console.log(`BUILD_VERSION: ${BUILD_VERSION}`);
    console.log(`Server đang chạy trên port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CLIENT_URL: ${process.env.CLIENT_URL || 'chưa cấu hình'}`);
    console.log(`MONGODB_URI configured: ${Boolean(process.env.MONGODB_URI)}`);
    console.log('API test: /api/hello');
    console.log('Debug config: /api/debug/config');
    console.log('Student API: /api/students');
    console.log('====================================');
});