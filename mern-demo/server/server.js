const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Kết nối MongoDB Atlas thành công!'))
    .catch((err) => console.error('Lỗi kết nối MongoDB:', err));

// API Test
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Backend dang hoat dong thanh cong!' });
});

// --- PHẦN 5: API REST QUẢN LÝ SINH VIÊN ---

// Câu 35: Tạo Model Student
const studentSchema = new mongoose.Schema({ 
    studentId: String, 
    name: String, 
    email: String 
});
const Student = mongoose.model('Student', studentSchema);

// Câu 36: Xây dựng API GET /api/students
app.get('/api/students', async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

// Câu 37: Xây dựng API POST /api/students
app.post('/api/students', async (req, res) => {
    const newStudent = await Student.create(req.body);
    res.json(newStudent);
});

// Câu 38: Xây dựng API PUT /api/students/:id
app.put('/api/students/:id', async (req, res) => {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStudent);
});

// Câu 39: Xây dựng API DELETE /api/students/:id
app.delete('/api/students/:id', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa sinh viên' });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});