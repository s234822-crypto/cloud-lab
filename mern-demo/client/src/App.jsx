import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // =====================================================
  // STATE
  // =====================================================
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // =====================================================
  // API CONFIG
  // =====================================================

  // Khi chạy trên Render:
  // VITE_API_URL=https://mern-backend-1-0-mqr3.onrender.com
  //
  // Khi chạy local và chưa khai báo VITE_API_URL:
  // tự động sử dụng http://localhost:5000

  const BASE_URL = (
    import.meta.env.VITE_API_URL || 'http://localhost:5000'
  ).replace(/\/+$/, '');

  const API_URL = `${BASE_URL}/api/students`;

  // =====================================================
  // GET - LẤY DANH SÁCH SINH VIÊN
  // =====================================================
  const fetchStudents = async () => {
    try {
      setError('');

      const res = await axios.get(API_URL);

      if (Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        setStudents([]);
        console.error(
          'Dữ liệu Backend trả về không phải là mảng:',
          res.data
        );

        setError('❌ Dữ liệu Backend trả về không hợp lệ!');
      }
    } catch (err) {
      console.error('Lỗi lấy dữ liệu:', err);

      setStudents([]);

      setError(
        '❌ Không thể tải danh sách sinh viên. Vui lòng kiểm tra Backend!'
      );
    }
  };

  // =====================================================
  // LOAD DATA KHI MỞ TRANG
  // =====================================================
  useEffect(() => {
    fetchStudents();
  }, []);

  // =====================================================
  // POST / PUT
  // THÊM HOẶC CẬP NHẬT SINH VIÊN
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    try {
      if (editingId) {
        // UPDATE
        await axios.put(
          `${API_URL}/${editingId}`,
          formData
        );

        setMessage('✅ Cập nhật thông tin sinh viên thành công!');
      } else {
        // CREATE
        await axios.post(
          API_URL,
          formData
        );

        setMessage('✅ Thêm sinh viên thành công!');
      }

      // Reset form
      resetForm();

      // Load lại danh sách
      await fetchStudents();

    } catch (err) {
      console.error('Lỗi thêm/cập nhật sinh viên:', err);

      setError(
        '❌ Thao tác thất bại. Vui lòng kiểm tra lại!'
      );
    }
  };

  // =====================================================
  // DELETE - XÓA SINH VIÊN
  // =====================================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Bạn có chắc chắn muốn xóa sinh viên này?'
    );

    if (!confirmDelete) return;

    setMessage('');
    setError('');

    try {
      await axios.delete(
        `${API_URL}/${id}`
      );

      setMessage('✅ Đã xóa sinh viên thành công!');

      // Nếu đang sửa chính sinh viên vừa xóa
      if (editingId === id) {
        resetForm();
      }

      // Load lại danh sách
      await fetchStudents();

    } catch (err) {
      console.error('Lỗi xóa sinh viên:', err);

      setError(
        '❌ Xóa sinh viên thất bại!'
      );
    }
  };

  // =====================================================
  // EDIT - ĐƯA DỮ LIỆU SINH VIÊN LÊN FORM
  // =====================================================
  const handleEdit = (student) => {
    setFormData({
      studentId: student.studentId || '',
      name: student.name || '',
      email: student.email || ''
    });

    setEditingId(student._id);

    setMessage('');
    setError('');

    // Cuộn lên form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setFormData({
      studentId: '',
      name: '',
      email: ''
    });

    setEditingId(null);
  };

  // =====================================================
  // GIAO DIỆN
  // =====================================================
  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Tiêu đề */}
        <h1 style={styles.title}>
          🎓 Quản lý Sinh viên
        </h1>

        {/* Thông báo thành công */}
        {message && (
          <div style={styles.successMsg}>
            {message}
          </div>
        )}

        {/* Thông báo lỗi */}
        {error && (
          <div style={styles.errorMsg}>
            {error}
          </div>
        )}

        {/* =================================================
            FORM THÊM / CẬP NHẬT SINH VIÊN
        ================================================= */}
        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          {/* MSSV */}
          <input
            type="text"
            placeholder="Mã số SV (VD: B123)"
            value={formData.studentId}
            onChange={(e) =>
              setFormData({
                ...formData,
                studentId: e.target.value
              })
            }
            required
            style={styles.input}
          />

          {/* Họ tên */}
          <input
            type="text"
            placeholder="Họ và tên"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
            }
            required
            style={styles.input}
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Địa chỉ Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value
              })
            }
            required
            style={styles.input}
          />

          {/* Button */}
          <div style={styles.buttonGroup}>

            <button
              type="submit"
              style={
                editingId
                  ? styles.btnUpdate
                  : styles.btnAdd
              }
            >
              {editingId
                ? '💾 Lưu cập nhật'
                : '➕ Thêm sinh viên'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={styles.btnCancel}
              >
                ❌ Hủy
              </button>
            )}

          </div>
        </form>

        {/* =================================================
            BẢNG DANH SÁCH SINH VIÊN
        ================================================= */}
        <div style={styles.tableWrapper}>

          <table style={styles.table}>

            <thead>
              <tr>
                <th style={styles.th}>
                  MSSV
                </th>

                <th style={styles.th}>
                  Họ Tên
                </th>

                <th style={styles.th}>
                  Email
                </th>

                <th style={styles.th}>
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>

              {students.length === 0 ? (

                <tr>
                  <td
                    colSpan="4"
                    style={styles.emptyData}
                  >
                    Chưa có dữ liệu sinh viên.
                  </td>
                </tr>

              ) : (

                students.map((student) => (

                  <tr
                    key={student._id}
                    style={styles.tr}
                  >

                    {/* MSSV */}
                    <td style={styles.td}>
                      <strong>
                        {student.studentId}
                      </strong>
                    </td>

                    {/* Họ tên */}
                    <td style={styles.td}>
                      {student.name}
                    </td>

                    {/* Email */}
                    <td style={styles.td}>
                      {student.email}
                    </td>

                    {/* Thao tác */}
                    <td style={styles.td}>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(student)
                        }
                        style={styles.btnActionEdit}
                      >
                        ✏️ Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(student._id)
                        }
                        style={styles.btnActionDelete}
                      >
                        🗑️ Xóa
                      </button>

                    </td>
                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
}


// =========================================================
// CSS INLINE
// =========================================================

const styles = {

  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '40px 20px',
    fontFamily:
      '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    color: '#333'
  },

  card: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow:
      '0 4px 12px rgba(0,0,0,0.1)',
    padding: '30px',
    overflow: 'hidden'
  },

  title: {
    textAlign: 'center',
    color: '#1a73e8',
    marginBottom: '25px',
    fontSize: '28px'
  },

  successMsg: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '500'
  },

  errorMsg: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '500'
  },

  form: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    justifyContent: 'space-between',
    marginBottom: '30px',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px'
  },

  input: {
    flex: '1 1 200px',
    padding: '12px 15px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '15px',
    outline: 'none'
  },

  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flex: '1 1 100%'
  },

  btnAdd: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  btnUpdate: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#ffc107',
    color: '#212529',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  btnCancel: {
    padding: '12px 20px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  tableWrapper: {
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  },

  th: {
    backgroundColor: '#1a73e8',
    color: '#fff',
    padding: '15px',
    textAlign: 'left',
    fontWeight: '600',
    border: '1px solid #dee2e6'
  },

  tr: {
    borderBottom:
      '1px solid #dee2e6'
  },

  td: {
    padding: '15px',
    border: '1px solid #dee2e6',
    verticalAlign: 'middle'
  },

  emptyData: {
    textAlign: 'center',
    padding: '20px',
    color: '#666'
  },

  btnActionEdit: {
    padding: '6px 12px',
    backgroundColor: '#e2e3e5',
    border: '1px solid #d6d8db',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px',
    fontSize: '13px'
  },

  btnActionDelete: {
    padding: '6px 12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  }

};

export default App;