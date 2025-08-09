let postIdToUpdate = null;

// Hàm mở modal cập nhật, lấy dữ liệu bài viết
window.showUpdatePostModal = async function(postId) {
  postIdToUpdate = postId;
  const token = localStorage.getItem('accessToken');
  try {
    const res = await fetch(`http://localhost:8080/api/post/${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    if (!res.ok) throw new Error('Không thể lấy dữ liệu bài viết');
    const data = await res.json();
    document.getElementById('updatePostContentInput').value = data.data.content || '';
    const modal = new bootstrap.Modal(document.getElementById('updatePostModal'));
    modal.show();
  } catch (err) {
    alert('Không thể lấy dữ liệu bài viết!');
  }
};

// Xử lý khi ấn nút Lưu
document.getElementById('btn-save-update-post').onclick = async function() {
  const content = document.getElementById('updatePostContentInput').value.trim();
  if (!content) {
    alert('Nội dung không được để trống!');
    return;
  }
  const token = localStorage.getItem('accessToken');
  try {
    const res = await fetch('http://localhost:8080/api/post/update', {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postId: postIdToUpdate,
        content: content
      })
    });
    const json = await res.json();
    if (json.success) {
      // Đóng modal
      bootstrap.Modal.getInstance(document.getElementById('updatePostModal')).hide();
      // Cập nhật lại nội dung bài viết trên giao diện nếu muốn
      const postDiv = document.querySelector(`[data-post-id='${postIdToUpdate}'] .post-text`);
      if (postDiv) postDiv.textContent = content;
      alert('Đã cập nhật nội dung!');
    } else {
      alert(json.message || 'Cập nhật thất bại!');
    }
  } catch (err) {
    alert('Lỗi khi cập nhật bài viết!');
  }
  postIdToUpdate = null;
};