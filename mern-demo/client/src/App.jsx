import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ studentId: '', name: '', email: '' });
  const [editingId, setEditingId] = useState(null); 
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  //: Đổi thành đường dẫn tuyệt đối trỏ thẳng vào Backend ở cổng 5000
  const API_URL = 'http://localhost:5000/api/students';

  // Lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const res = await axios.get(API_URL);
      // [ĐÃ THÊM BẢO VỆ]: Đảm bảo dữ liệu set vào state luôn là một mảng
      if (Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        setStudents([]); 
        console.error("Dữ liệu trả về không phải là mảng:", res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
      setError('❌ Không thể tải danh sách. Backend đã chạy chưa?');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Thêm hoặc Cập nhật sinh viên
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        setMessage('✅ Cập nhật thông tin thành công!');
      } else {
        await axios.post(API_URL, formData);
        setMessage('✅ Thêm sinh viên thành công!');
      }
      fetchStudents(); 
      resetForm();
    } catch (err) {
      setError('❌ Thao tác thất bại. Vui lòng thử lại!');
      console.error(err);
    }
  };

  // Xóa sinh viên
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMessage('✅ Đã xóa sinh viên!');
      fetchStudents();
    } catch (err) {
      setError('❌ Xóa thất bại!');
      console.error(err);
    }
  };

  // Nạp dữ liệu vào form để sửa
  const handleEdit = (student) => {
    setFormData({ studentId: student.studentId, name: student.name, email: student.email });
    setEditingId(student._id);
    setMessage(''); setError('');
  };

  // Hủy chế độ sửa
  const resetForm = () => {
    setFormData({ studentId: '', name: '', email: '' });
    setEditingId(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎓 Quản lý Sinh viên</h1>
        
        {/* Khu vực thông báo */}
        {message && <div style={styles.successMsg}>{message}</div>}
        {error && <div style={styles.errorMsg}>{error}</div>}

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            placeholder="Mã số SV (VD: B123)" 
            value={formData.studentId} 
            onChange={e => setFormData({...formData, studentId: e.target.value})} 
            required style={styles.input}
          />
          <input 
            placeholder="Họ và tên" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required style={styles.input}
          />
          <input 
            type="email"
            placeholder="Địa chỉ Email" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required style={styles.input}
          />
          <div style={styles.buttonGroup}>
            <button type="submit" style={editingId ? styles.btnUpdate : styles.btnAdd}>
              {editingId ? '💾 Lưu cập nhật' : '➕ Thêm sinh viên'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={styles.btnCancel}>
                ❌ Hủy
              </button>
            )}
          </div>
        </form>

        {/* Bảng dữ liệu */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>MSSV</th>
                <th style={styles.th}>Họ Tên</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {/* [ĐÃ SỬA]: Thêm toán tử bảo vệ students?.length */}
              {!students || students?.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Chưa có dữ liệu sinh viên.</td></tr>
              ) : (
                /* [ĐÃ SỬA]: Thêm dấu ? trước map() */
                students?.map((s) => (
                  <tr key={s._id} style={styles.tr}>
                    <td style={styles.td}><strong>{s.studentId}</strong></td>
                    <td style={styles.td}>{s.name}</td>
                    <td style={styles.td}>{s.email}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleEdit(s)} style={styles.btnActionEdit}>✏️ Sửa</button>
                      <button onClick={() => handleDelete(s._id)} style={styles.btnActionDelete}>🗑️ Xóa</button>
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

// Tổng hợp CSS (Inline styles)
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', color: '#333' },
  card: { maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '30px', overflow: 'hidden' },
  title: { textAlign: 'center', color: '#1a73e8', marginBottom: '25px', fontSize: '28px' },
  successMsg: { backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontWeight: '500' },
  errorMsg: { backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontWeight: '500' },
  form: { display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', marginBottom: '30px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' },
  input: { flex: '1 1 200px', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '15px', outline: 'none' },
  buttonGroup: { display: 'flex', gap: '10px', flex: '1 1 100%' },
  btnAdd: { flex: 1, padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  btnUpdate: { flex: 1, padding: '12px', backgroundColor: '#ffc107', color: '#212529', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  btnCancel: { padding: '12px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { backgroundColor: '#1a73e8', color: '#fff', padding: '15px', textAlign: 'left', fontWeight: '600', border: '1px solid #dee2e6' },
  tr: { borderBottom: '1px solid #dee2e6', transition: 'background-color 0.2s' },
  td: { padding: '15px', border: '1px solid #dee2e6', verticalAlign: 'middle' },
  btnActionEdit: { padding: '6px 12px', backgroundColor: '#e2e3e5', border: '1px solid #d6d8db', borderRadius: '4px', cursor: 'pointer', marginRight: '8px', fontSize: '13px' },
  btnActionDelete: { padding: '6px 12px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }
};

export default App;