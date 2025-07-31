document.addEventListener('DOMContentLoaded', async () => {
  // Lấy userId của người cần xem profile từ query string (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const userId = 1; //lấy tạm đã
  const token = localStorage.getItem('token');
  if (!userId) {
    alert('Không tìm thấy người dùng!');
    window.location.href = 'home.html';
    return;
  }
  // Lấy avatar, tên, bio
  try {
    const res = await fetch(`http://localhost:8080/api/user-name-profile?id=${userId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.status === 401) {
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      const avatarEl = document.getElementById('profile-avatar');
      if (avatarEl) avatarEl.src = d.profileUrl || '';
      const fbAvatar = document.querySelector('.fb-avatar');
      if (fbAvatar) fbAvatar.src = d.profileUrl || '';
      const nameEl = document.getElementById('profile-fullname');
      if (nameEl) nameEl.textContent = d.fullName || '';
    }
  } catch (err) {
    console.error('Lỗi lấy avatar:', err);
  }
  // Lấy thông tin chi tiết
  try {
    const res = await fetch(`http://localhost:8080/api/user-profile?id=${userId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      const nameEl = document.getElementById('profile-fullname');
      if (nameEl) nameEl.textContent = d.fullName || '';
      const profileBioEl = document.getElementById('profile-bio');
      if (profileBioEl) {profileBioEl.innerHTML = `<i class="fas fa-quote-left"></i> ${d.bio || ''}`; }
      const userDetail = document.querySelector('.user-details');
      if (userDetail) {
        userDetail.innerHTML = `
          <p><strong><i class="fas fa-user"></i> Họ tên:</strong> ${d.fullName || ''}</p>
          <p><strong><i class="fas fa-envelope"></i> Email:</strong> ${d.email || ''}</p>
          <p><strong><i class="fas fa-phone"></i> Số điện thoại:</strong> ${d.phoneNumber || ''}</p>
          <p><strong><i class="fas fa-birthday-cake"></i> Ngày sinh:</strong> ${d.birthDate ? new Date(d.birthDate).toLocaleDateString('vi-VN') : ''}</p>
          <p><strong><i class="fas fa-mars"></i> Giới tính:</strong> ${d.gender || ''}</p>
          <p><strong><i class="fas fa-search"></i> Đang tìm kiếm:</strong> ${d.lookingFor || ''}</p>
          <p><strong><i class="fas fa-pen"></i> Tiểu sử:</strong> ${d.bio || ''}</p>
          <p><strong><i class="fas fa-ruler-vertical"></i> Chiều cao:</strong> ${d.height || ''}</p>
          <p><strong><i class="fas fa-weight"></i> Cân nặng:</strong> ${d.weight || ''}</p>
          <p><strong><i class="fas fa-map-marker-alt"></i> Địa chỉ:</strong> ${d.location || ''}</p>
          <p><strong><i class="fas fa-briefcase"></i> Vị trí:</strong> ${d.jobTitle || ''}</p>
          <p><strong><i class="fas fa-building"></i> Công ty:</strong> ${d.company || ''}</p>
          <p><strong><i class="fas fa-graduation-cap"></i> Học vấn:</strong> ${d.education || ''}</p>
          <p><strong><i class="fas fa-info-circle"></i> Mô tả:</strong> ${d.description || ''}</p>
          <p><strong><i class="fas fa-star"></i> Sở thích:</strong> ${Array.isArray(d.interestName) && d.interestName.length > 0 ? d.interestName.join(', ') : ''}</p>
        `;
      }
    }
  } catch (err) {
    console.error('Lỗi lấy thông tin người dùng:', err);
  }
  // Ảnh
  const PHOTO_PAGE_SIZE = 5;
  async function loadPhotos(page = 0, size = PHOTO_PAGE_SIZE) {
    try {
      const res = await fetch(`http://localhost:8080/api/photo?userId=${userId}&page=${page}&size=${size}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.content)) {
        renderPhotos(json.data.content);
        renderPhotoPagination(json.data.page, size);
      } else {
        document.getElementById('photo-row').innerHTML = '<p>Không có ảnh.</p>';
        document.getElementById('photo-pagination').innerHTML = '';
      }
    } catch (err) {
      document.getElementById('photo-row').innerHTML = '<p style="color:red">Không tải được ảnh!</p>';
      document.getElementById('photo-pagination').innerHTML = '';
    }
  }
  function renderPhotos(photoUrls) {
    const row = document.getElementById('photo-row');
    const reversed = [...photoUrls].reverse();
    row.innerHTML = reversed.map(url =>
      `<div class="photo-item" style="position:relative;">
        <img src="${url}" alt="Ảnh" data-url="${url}" onclick="openModal('${url}')">
      </div>`
    ).join('');
  }
  function renderPhotoPagination(pageInfo, size) {
    const pag = document.getElementById('photo-pagination');
    let html = '';
    for (let i = 0; i < pageInfo.totalPages; i++) {
      html += `<button onclick="loadPhotos(${i},${size})" ${i === pageInfo.number ? 'style="background:#1877F2;color:#fff;"' : ''}>${i + 1}</button> `;
    }
    pag.innerHTML = html;
  }
  document.getElementById('tab-photo').addEventListener('click', function() {
    loadPhotos();
  });
  // Video
  const VIDEO_PAGE_SIZE = 10;
  async function loadVideos(page = 0, size = VIDEO_PAGE_SIZE) {
    try {
      const res = await fetch(`http://localhost:8080/api/video?userId=${userId}&page=${page}&size=${size}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.content)) {
        renderVideos(json.data.content);
        renderVideoPagination(json.data.page, size);
      } else {
        document.getElementById('video-row').innerHTML = '<p>Không có video.</p>';
        document.getElementById('video-pagination').innerHTML = '';
      }
    } catch (err) {
      document.getElementById('video-row').innerHTML = '<p style="color:red;">Không thể tải video!</p>';
      document.getElementById('video-pagination').innerHTML = '';
    }
  }
  function renderVideos(videoList) {
    const row = document.getElementById('video-row');
    row.innerHTML = videoList.reverse().map(v => `
      <div class="video-item">
        <video src="${v.videoUrl}" controls style="max-width:100%;height:auto;"></video>
        <p>Ngày đăng: ${new Date(v.uploadDate).toLocaleDateString('vi-VN')}</p>
      </div>
    `).join('');
  }
  function renderVideoPagination(pageInfo, size) {
    const pag = document.getElementById('video-pagination');
    let html = '';
    for (let i = 0; i < pageInfo.totalPages; i++) {
      html += `<button onclick="loadVideos(${i}, ${size})" ${i === pageInfo.number ? 'style=\"background:#1877F2;color:#fff;\"' : ''}>${i + 1}</button> `;
    }
    pag.innerHTML = html;
  }
  document.getElementById('tab-video').addEventListener('click', function () {
    loadVideos();
  });
  // Tab switching logic
  document.getElementById('tab-info').onclick = function(e) {
    e.preventDefault();
    showSection('info');
  };
  document.getElementById('tab-photo').onclick = function(e) {
    e.preventDefault();
    showSection('photo');
  };
  document.getElementById('tab-video').onclick = function(e) {
    e.preventDefault();
    showSection('video');
  };
  function showSection(section) {
    document.getElementById('section-info').style.display = 'none';
    document.getElementById('section-photo').style.display = 'none';
    document.getElementById('section-video').style.display = 'none';
    document.getElementById('tab-info').classList.remove('active');
    document.getElementById('tab-photo').classList.remove('active');
    document.getElementById('tab-video').classList.remove('active');
    document.getElementById('section-' + section).style.display = 'block';
    document.getElementById('tab-' + section).classList.add('active');
    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.querySelector('.right-panel');
    if (section === 'photo' || section === 'video') {
      if (leftPanel) leftPanel.style.display = 'none';
      if (rightPanel) rightPanel.style.width = '100%';
    } else {
      if (leftPanel) leftPanel.style.display = 'block';
      if (rightPanel) rightPanel.style.width = '';
    }
  }
  // Modal xem ảnh
  window.openModal = function(imageUrl) {
    const modal = document.getElementById('image-modal');
    const zoomedImage = document.getElementById('zoomed-image');
    zoomedImage.src = imageUrl;
    modal.style.display = 'flex';
  }
  window.closeModal = function() {
    document.getElementById('image-modal').style.display = 'none';
  }
  // Xử lý nút Kết bạn
  document.getElementById('btn-add-friend').onclick = async function() {
    try {
      // Gọi API mẫu, bạn thay endpoint phù hợp nếu có
      const res = await fetch(`http://localhost:8080/api/friend-request/send`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ toUserId: userId })
      });
      const json = await res.json();
      if (json.success) {
        alert('Đã gửi lời mời kết bạn!');
        document.getElementById('btn-add-friend').disabled = true;
        document.getElementById('btn-add-friend').textContent = 'Đã gửi lời mời';
      } else {
        alert(json.message || 'Không thể gửi lời mời!');
      }
    } catch (err) {
      alert('Lỗi khi gửi lời mời!');
    }
  };
}); 