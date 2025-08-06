document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem("accessToken");
  try {
    // Lấy fullName và profileUrl
    const res = await fetch('http://localhost:8080/api/user-name-profile', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    // Kiểm tra nếu bị lỗi 401 (Unauthorized)
  if (res.status === 401) {
    alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    localStorage.removeItem("accessToken");
    window.location.href = 'login.html';
    return;
  }

    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;

      // Lưu vào localStorage
      localStorage.setItem("userAvatar", d.profileUrl || '');
      localStorage.setItem("userFullName", d.fullName || '');

      // Thay avatar lớn
      const avatarEl = document.getElementById('profile-avatar');
      if (avatarEl) avatarEl.src = d.profileUrl || '';

      // Thay avatar nhỏ trên topbar
      const fbAvatar = document.querySelector('.fb-avatar');
      if (fbAvatar) fbAvatar.src = d.profileUrl || '';

      // Thay tên nếu muốn
      const nameEl = document.getElementById('profile-fullname');
      if (nameEl) nameEl.textContent = d.fullName || '';
    }

  } catch (err) {
    console.error('Lỗi lấy avatar:', err);
  }

  try {
    const res = await fetch('http://localhost:8080/api/user-profile', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      // Cập nhật tên user vào profile
      const nameEl = document.getElementById('profile-fullname');
      if (nameEl) nameEl.textContent = d.fullName || '';
      const profileBioEl = document.getElementById('profile-bio');
      if (profileBioEl) {profileBioEl.innerHTML = `<i class="fas fa-quote-left"></i> ${d.bio || ''}`; }
      // Xử lý dữ liệu trả về
      const userDetail = document.querySelector('.user-details');
      if (userDetail) {
        userDetail.innerHTML = `
          <div class="user-info-basic">
            <p><strong><i class="fas fa-user"></i> Họ tên:</strong> ${d.fullName || ''}</p>
            <p><strong><i class="fas fa-phone"></i> Số điện thoại:</strong> ${d.phoneNumber || ''}</p>
            <p><strong><i class="fas fa-birthday-cake"></i> Ngày sinh:</strong> ${d.birthDate ? new Date(d.birthDate).toLocaleDateString('vi-VN') : ''}</p>
            <p><strong><i class="fas fa-mars"></i> Giới tính:</strong> ${d.gender || ''}</p>
          </div>
          <div class="user-info-more" style="display:none;">
            <p><strong><i class="fas fa-search"></i> Đang tìm kiếm:</strong> ${d.lookingFor || ''}</p>
            <p><strong><i class="fas fa-ruler-vertical"></i> Chiều cao:</strong> ${d.height || ''}</p>
            <p><strong><i class="fas fa-weight"></i> Cân nặng:</strong> ${d.weight || ''}</p>
            <p><strong><i class="fas fa-map-marker-alt"></i> Địa chỉ:</strong> ${d.location || ''}</p>
            <p><strong><i class="fas fa-briefcase"></i> Vị trí:</strong> ${d.jobTitle || ''}</p>
            <p><strong><i class="fas fa-building"></i> Công ty:</strong> ${d.company || ''}</p>
            <p><strong><i class="fas fa-graduation-cap"></i> Học vấn:</strong> ${d.education || ''}</p>
            <p><strong><i class="fas fa-info-circle"></i> Mô tả:</strong> ${d.description || ''}</p>
            <p><strong><i class="fas fa-star"></i> Sở thích:</strong> ${Array.isArray(d.interestName) && d.interestName.length > 0 ? d.interestName.join(', ') : ''}</p>
          </div>
        `;

        // Thêm đoạn xử lý nút xem thêm ở đây
        const btnShowMore = document.getElementById('btn-show-more-details');
        const more = userDetail.querySelector('.user-info-more');
        const textEl = btnShowMore.querySelector('.banner-text');
        const iconEl = btnShowMore.querySelector('i');

        btnShowMore.style.display = 'flex'; // luôn hiển thị dải băng

        let expanded = false;

        btnShowMore.onclick = function(e) {
          e.stopPropagation();
          if (!expanded) {
            if (more) more.style.display = 'block';
            textEl.textContent = 'Ẩn bớt thông tin';
            iconEl.classList.remove('fa-chevron-down');
            iconEl.classList.add('fa-chevron-up');
            expanded = true;
          } else {
            if (more) more.style.display = 'none';
            textEl.textContent = 'Xem thêm thông tin';
            iconEl.classList.remove('fa-chevron-up');
            iconEl.classList.add('fa-chevron-down');
            expanded = false;
          }
        };
      }
    }
  } catch (err) {
    console.error('Lỗi lấy thông tin người dùng:', err);
  }

  // --- PHÂN TRANG ẢNH TAB PHOTO ---
  const PHOTO_PAGE_SIZE = 9;
  async function loadPhotos(page = 0, size = PHOTO_PAGE_SIZE) {
    currentPhotoPage = page;
    try {
      const res = await fetch(`http://localhost:8080/api/photo?page=${page}&size=${size}`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.content)) {
        // Lưu lại danh sách ảnh và thông tin phân trang để dùng lại khi cần
        window.lastPhotoUrls = json.data.content;
        window.lastPhotoPageInfo = json.data.page;
        renderPhotos(json.data.content);
        renderPhotoPagination(json.data.page, size);
      } else {
        window.lastPhotoUrls = [];
        document.getElementById('photo-row').innerHTML = '<p>Không có ảnh.</p>';
        document.getElementById('photo-pagination').innerHTML = '';
      }
    } catch (err) {
      window.lastPhotoUrls = [];
      document.getElementById('photo-row').innerHTML = '<p style="color:red">Không tải được ảnh!</p>';
      document.getElementById('photo-pagination').innerHTML = '';
    }
  }
  window.loadPhotos = loadPhotos;

  function renderPhotos(photoUrls) {
    const row = document.getElementById('photo-row');
    const isDeleteMode = window.isPhotoDeleteMode;
    // Sắp xếp ngược lại: mới nhất lên trước
    const reversed = [...photoUrls].reverse();
    row.innerHTML = reversed.map(url =>
      `<div class="photo-item" style="position:relative;">
        <img src="${url}" alt="Ảnh" data-url="${url}" 
          ${isDeleteMode ? 'style="opacity:0.7;cursor:pointer;border:2px solid #ff4d4f;"' : ''}
          onclick="${isDeleteMode ? 'toggleSelectPhoto(this)' : `openModal('${url}')`}">
      </div>`
    ).join('');
    if (isDeleteMode) {
      // Chỉ làm nổi bật các ảnh đã chọn (không còn tick)
      (window.selectedPhotoUrls || []).forEach(url => {
        const img = row.querySelector(`img[data-url="${url}"]`);
        if (img) {
          img.style.opacity = "1";
          img.style.border = "2px solid #1877F2";
        }
      });
    }
  }

  function renderPhotoPagination(pageInfo, size) {
    const paginationContainer = document.getElementById('photo-pagination');
    paginationContainer.innerHTML = '';
  
    const totalPages = pageInfo.totalPages;
    const currentPage = pageInfo.number; // ✅ sửa đúng tên
  
    if (!totalPages || totalPages <= 1) return;
  
    const createButton = (text, page, isActive = false) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.className = 'page-btn';
      if (isActive) btn.classList.add('active');
      btn.onclick = () => loadPhotos(page, size);
      return btn;
    };
  
    // « first
    if (currentPage > 0) {
      paginationContainer.appendChild(createButton('«', 0));
    }
  
    const visiblePages = 2;
    let start = Math.max(0, currentPage - visiblePages);
    let end = Math.min(totalPages - 1, currentPage + visiblePages);
  
    if (start > 0) {
      paginationContainer.appendChild(createButton('1', 0));
      if (start > 1) {
        paginationContainer.appendChild(document.createTextNode('...'));
      }
    }
  
    for (let i = start; i <= end; i++) {
      paginationContainer.appendChild(createButton((i + 1).toString(), i, i === currentPage));
    }
  
    if (end < totalPages - 1) {
      if (end < totalPages - 2) {
        paginationContainer.appendChild(document.createTextNode('...'));
      }
      paginationContainer.appendChild(createButton(totalPages.toString(), totalPages - 1));
    }
  
    if (currentPage < totalPages - 1) {
      paginationContainer.appendChild(createButton('»', totalPages - 1));
    }
  }
  
  
  // Tải ảnh khi chuyển sang tab "Ảnh"
  document.getElementById('tab-photo').addEventListener('click', function() {
    document.getElementById('section-info').style.display = 'none';
  document.getElementById('section-photo').style.display = 'block';
  document.getElementById('section-video').style.display = 'none';
  document.getElementById('section-story').style.display = 'none';

  // ✅ Tải ảnh trang đầu tiên
  loadPhotos(0);
  });

  // Thêm biến flag để phân biệt upload ảnh profile
  let isProfilePhotoUpload = false;

  // Sử dụng nút "Thêm ảnh profile" để mở modal upload profile photo
  const btnAddProfilePhoto = document.getElementById('btn-add-profile-photo');
  if (btnAddProfilePhoto) {
    btnAddProfilePhoto.onclick = function() {
      isProfilePhotoUpload = true;
      document.getElementById('upload-photo-modal').style.display = 'flex';
    };
  }

  // Sử dụng nút "Thêm ảnh" trong .post-box để mở modal upload ảnh thường
  // (giữ nguyên logic cũ, nhưng set flag false)
  document.querySelector('.post-box button i.fas.fa-image').parentElement.onclick = function() {
    isProfilePhotoUpload = false;
    document.getElementById('upload-photo-modal').style.display = 'flex';
  };

  // Đóng modal khi bấm nút đóng hoặc "Hủy"
  document.getElementById('close-upload-modal').onclick = function() {
    document.getElementById('form-upload-photo-modal').reset();
    document.getElementById('upload-photo-modal').style.display = 'none';
    isProfilePhotoUpload = false;
  };
  document.getElementById('btn-cancel-upload-modal').onclick = function() {
    document.getElementById('form-upload-photo-modal').reset();
    document.getElementById('upload-photo-modal').style.display = 'none';
    isProfilePhotoUpload = false;
  };

  // Xử lý submit form upload trong modal
  // Nếu là upload profile photo thì gọi API /api/profile-photo/upload, ngược lại gọi API upload ảnh thường
  document.getElementById('form-upload-photo-modal').onsubmit = async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('input-photo-file-modal');
    const loading = document.getElementById('upload-loading');
    if (!fileInput.files[0]) return alert('Vui lòng chọn ảnh!');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    loading.style.display = 'flex';
    try {
      const apiUrl = isProfilePhotoUpload
        ? 'http://localhost:8080/api/profile-photo/upload'
        : 'http://localhost:8080/api/photo/upload';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        body: formData
      });
      const json = await res.json();
      loading.style.display = 'none';
      if (json.success) {
        alert('Tải ảnh thành công!');
        document.getElementById('form-upload-photo-modal').reset();
        document.getElementById('upload-photo-modal').style.display = 'none';
        isProfilePhotoUpload = false;
        loadPhotos();
      } else {
        alert('Tải ảnh thất bại!');
      }
    } catch (err) {
      loading.style.display = 'none';
      alert('Lỗi khi tải ảnh!');
    }
  };

  // --- XÓA ẢNH ---
  window.isPhotoDeleteMode = false;
  window.selectedPhotoUrls = [];
  document.getElementById('btn-delete-photo').onclick = function() {
    window.isPhotoDeleteMode = true;
    window.selectedPhotoUrls = [];
    document.getElementById('btn-confirm-delete-photo').style.display = 'inline-block';
    document.getElementById('btn-cancel-delete-photo').style.display = 'inline-block';
    renderPhotos(window.lastPhotoUrls || []);
  };
  document.getElementById('btn-cancel-delete-photo').onclick = function() {
    window.isPhotoDeleteMode = false;
    window.selectedPhotoUrls = [];
    document.getElementById('btn-confirm-delete-photo').style.display = 'none';
    document.getElementById('btn-cancel-delete-photo').style.display = 'none';
    renderPhotos(window.lastPhotoUrls || []);
  };

  document.getElementById('btn-confirm-delete-photo').onclick = async function() {
    if (window.selectedPhotoUrls.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh để xóa!');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa các ảnh đã chọn?')) return;
    
    let successCount = 0;
    for (const url of window.selectedPhotoUrls) {
      try {
        const res = await fetch('http://localhost:8080/api/photo/delete?photoUrl=' + encodeURIComponent(url), {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const json = await res.json();
        if (json.success) successCount++;
      } catch {}
    }
    alert(`Đã xóa ${successCount} ảnh!`);
    window.isPhotoDeleteMode = false;
    window.selectedPhotoUrls = [];
    document.getElementById('btn-confirm-delete-photo').style.display = 'none';
    document.getElementById('btn-cancel-delete-photo').style.display = 'none';
    loadPhotos();
  };

  window.toggleSelectPhoto = function(imgEl) {
    const url = imgEl.getAttribute('data-url');
    const idx = window.selectedPhotoUrls.indexOf(url);
    if (idx === -1) {
      window.selectedPhotoUrls.push(url);
      imgEl.style.opacity = "1";
      imgEl.style.border = "2px solid #1877F2";
      imgEl.nextElementSibling.style.display = "flex";
    } else {
      window.selectedPhotoUrls.splice(idx, 1);
      imgEl.style.opacity = "0.7";
      imgEl.style.border = "2px solid #ff4d4f";
      imgEl.nextElementSibling.style.display = "none";
    }
  };

  // Sử dụng nút "Thêm Video" trong .post-box để mở modal
  document.querySelector('.post-box button i.fas.fa-video').parentElement.onclick = function() {
    document.getElementById('upload-video-modal').style.display = 'flex';
  };

  // Đóng modal khi bấm nút đóng hoặc "Hủy"
  document.getElementById('close-upload-video-modal').onclick = function() {
    document.getElementById('form-upload-video-modal').reset();
    document.getElementById('upload-video-modal').style.display = 'none';
  };
  document.getElementById('btn-cancel-upload-video-modal').onclick = function() {
    document.getElementById('form-upload-video-modal').reset();
    document.getElementById('upload-video-modal').style.display = 'none';
  };

  // Xử lý nút "Tạo story"
  document.getElementById('btn-create-story').onclick = function() {
    window.location.href = 'tao_tin.html';
  };

  


//   // Xử lý nút "Tạo bài viết"
// document.getElementById('btn-create-post').onclick = function() {
//   document.getElementById('form-create-post-modal').reset();
//   document.getElementById('create-post-modal').style.display = 'flex';
//   // Lấy avatar và tên cho modal
//   document.getElementById('profile-avatar-modal').src = document.getElementById('profile-avatar').src;
//   document.getElementById('profile-fullname-modal').textContent = document.getElementById('profile-fullname').textContent;
// };
// document.getElementById('close-create-post-modal').onclick =
// document.getElementById('btn-cancel-create-post-modal').onclick = function() {
//   document.getElementById('form-create-post-modal').reset();
//   document.getElementById('create-post-modal').style.display = 'none';
// };
// document.getElementById('form-create-post-modal').onsubmit = async function (e) {
//   e.preventDefault();

//   const content = document.getElementById('post-content').value.trim();
//   const images = document.getElementById('post-images').files;
//   const videos = document.getElementById('post-videos').files;
//   const isPublic = document.getElementById('post-public').checked;
//   const email = document.getElementById('post-email').value.trim(); // 👈 thêm lại dòng này
//   const loading = document.getElementById('create-post-loading');

//   // Kiểm tra hợp lệ
//   if (!email) {
//     alert('Vui lòng nhập email!');
//     return;
//   }

//   if (!content && images.length === 0 && videos.length === 0) {
//     alert('Bài viết phải có nội dung hoặc ảnh/video!');
//     return;
//   }

//   // Tạo FormData
//   const formData = new FormData();
//   formData.append('content', content);
//   formData.append('isPublic', isPublic.toString()); // "true" hoặc "false"
//   formData.append('userEmail', email); // 👈 thêm để backend không lỗi

//   for (let i = 0; i < images.length; i++) {
//     formData.append('listImage', images[i]);
//   }

//   for (let i = 0; i < videos.length; i++) {
//     formData.append('listVideo', videos[i]);
//   }

//   const token = localStorage.getItem('accessToken');
//   if (!token) {
//     alert('Không tìm thấy token đăng nhập!');
//     return;
//   }

//   loading.style.display = 'flex';

//   try {
//     const res = await fetch('http://localhost:8080/api/post/create', {
//       method: 'POST',
//       headers: {
//         Authorization: 'Bearer ' + token
//         // KHÔNG thêm Content-Type khi dùng FormData
//       },
//       body: formData
//     });

//     const text = await res.text();
//     console.log('Raw response:', text); // debug

//     let json;
//     try {
//       json = JSON.parse(text);
//     } catch (err) {
//       throw new Error('Server không trả về JSON hợp lệ');
//     }

//     loading.style.display = 'none';

//     if (json.success) {
//       alert('Tạo bài viết thành công!');
//       document.getElementById('form-create-post-modal').reset();
//       document.getElementById('create-post-modal').style.display = 'none';
//     } else {
//       alert('Tạo bài viết thất bại: ' + (json.message || 'Không rõ lý do'));
//       console.log(json);
//     }
//   } catch (err) {
//     loading.style.display = 'none';
//     console.error(err);
//     alert('Lỗi kết nối hoặc xử lý phía client!');
//   }
// };


  // Khi ấn nút "Chỉnh sửa thông tin cá nhân"
document.getElementById('btn-edit-profile').onclick = async function () {
  const modal = document.getElementById('edit-profile-modal');
  const form = document.getElementById('form-edit-profile');
  const token = localStorage.getItem('accessToken');

  try {
    const res = await fetch('http://localhost:8080/api/user-profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      form.fullName.value = d.fullName || '';
      form.email.value = d.email || '';
      form.phoneNumber.value = d.phoneNumber || '';
      form.birthDate.value = d.birthDate ? d.birthDate.substring(0, 10) : '';
      form.gender.value = d.gender || 'OTHER';
      form.lookingFor.value = d.lookingFor || 'OTHER';
      form.bio.value = d.bio || '';
      form.height.value = d.height || '';
      form.weight.value = d.weight || '';
      form.location.value = d.location || '';
      form.jobTitle.value = d.jobTitle || '';
      form.company.value = d.company || '';
      form.education.value = d.education || '';
      form.description.value = d.description || '';
      form.interestName.value = (d.interestName || []).join(', ');
      modal.style.display = 'flex';
    } else {
      alert('Không thể tải thông tin người dùng!');
    }
  } catch (err) {
    alert('Lỗi kết nối server!');
  }
};

// Nút đóng modal và Hủy bỏ
document.getElementById('close-edit-profile-modal').onclick =
document.getElementById('btn-cancel-edit-profile').onclick = function () {
  document.getElementById('edit-profile-modal').style.display = 'none';
};

// Submit form cập nhật
document.getElementById('form-edit-profile').onsubmit = async function (e) {
  e.preventDefault();
  const form = e.target;
  const token = localStorage.getItem('accessToken');

  const data = {
    fullName: form.fullName.value,
    email: form.email.value,
    phoneNumber: form.phoneNumber.value,
    birthDate: form.birthDate.value ? new Date(form.birthDate.value).toISOString() : null,
    gender: form.gender.value,
    lookingFor: form.lookingFor.value,
    bio: form.bio.value,
    height: parseInt(form.height.value) || 0,
    weight: parseInt(form.weight.value) || 0,
    location: form.location.value,
    jobTitle: form.jobTitle.value,
    company: form.company.value,
    education: form.education.value,
    description: form.description.value,
    interestName: form.interestName.value.split(',').map(s => s.trim()).filter(s => s)
  };

  try {
    const res = await fetch('http://localhost:8080/api/user-profile/update', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (json.success) {
      alert('Cập nhật thông tin thành công!');
      document.getElementById('edit-profile-modal').style.display = 'none';
      location.reload(); // hoặc gọi lại loadUserProfile() nếu bạn tách hàm
    } else {
      alert('Cập nhật thất bại!');
    }
  } catch (err) {
    alert('Lỗi khi cập nhật!');
  }
};


  // Xử lý submit form upload video trong modal
  document.getElementById('form-upload-video-modal').onsubmit = async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('input-video-file-modal');
    const loading = document.getElementById('upload-video-loading');
    if (!fileInput.files[0]) return alert('Vui lòng chọn video!');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    loading.style.display = 'flex';
    try {
      const res = await fetch('http://localhost:8080/api/video/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        body: formData
      });
      const json = await res.json();
      loading.style.display = 'none';
      if (json.success) {
        alert('Tải video thành công!');
        document.getElementById('form-upload-video-modal').reset();
        document.getElementById('upload-video-modal').style.display = 'none';
        // TODO: loadVideos(); nếu bạn có hàm hiển thị video
      } else {
        alert('Tải video thất bại!');
      }
    } catch (err) {
      loading.style.display = 'none';
      alert('Lỗi khi tải video!');
    }
  };

  // Hàm load video 

  const VIDEO_PAGE_SIZE = 4;
async function loadVideos(page = 0, size = VIDEO_PAGE_SIZE) {
  const token = localStorage.getItem('accessToken');
  try {
    const res = await fetch(`http://localhost:8080/api/video?page=${page}&size=${size}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    const json = await res.json();
    if (json.success && json.data && Array.isArray(json.data.content)) {
      const videos = json.data.content;
      renderVideos(videos);
      renderVideoPagination(json.data.page, size);
    } else {
      document.getElementById('video-row').innerHTML = '<p>Không có video.</p>';
      document.getElementById('video-pagination').innerHTML = '';
    }
  } catch (err) {
    console.error('Lỗi tải video:', err);
    document.getElementById('video-row').innerHTML = '<p style="color:red;">Không thể tải video!</p>';
    document.getElementById('video-pagination').innerHTML = '';
  }
}

function renderVideos(videoList) {
  window.lastVideoList = videoList;
  const row = document.getElementById('video-row');
  if (!row) {
    console.warn('Không tìm thấy phần tử video-row!');
    return;
  }
  const isDeleteMode = window.isVideoDeleteMode;
  // Sắp xếp ngược lại: mới nhất lên trước
  const reversed = [...videoList].reverse();
  row.innerHTML = reversed.map(v => {
    const selected = (window.selectedVideoUrls || []).includes(v.videoUrl);
    return `
      <div class="video-item" style="position:relative;">
        <video src="${v.videoUrl}" controls data-url="${v.videoUrl}"
          ${isDeleteMode ? 'style="opacity:0.7;cursor:pointer;border:2px solid #ff4d4f;"' : ''}
          onclick="${isDeleteMode ? 'toggleSelectVideo(this)' : ''}"></video>
      </div>
    `;
  }).join('');
  if (isDeleteMode) {
    // Chỉ làm nổi bật các video đã chọn
    (window.selectedVideoUrls || []).forEach(url => {
      const vid = row.querySelector(`video[data-url='${url}']`);
      if (vid) {
        vid.style.opacity = "1";
        vid.style.border = "2px solid #1877F2";
      }
    });
  }
}
window.toggleSelectVideo = function(vidEl) {
  const url = vidEl.getAttribute('data-url');
  const idx = window.selectedVideoUrls.indexOf(url);
  if (idx === -1) {
    window.selectedVideoUrls.push(url);
    vidEl.style.opacity = "1";
    vidEl.style.border = "2px solid #1877F2";
  } else {
    window.selectedVideoUrls.splice(idx, 1);
    vidEl.style.opacity = "0.7";
    vidEl.style.border = "2px solid #ff4d4f";
  }
};

function renderVideoPagination(pageInfo, size) {
  const paginationContainer = document.getElementById('video-pagination');
  paginationContainer.innerHTML = '';

  const totalPages = pageInfo.totalPages;
  const currentPage = pageInfo.number;

  if (!totalPages || totalPages <= 1) return;

  const createButton = (text, page, isActive = false) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'page-btn';
    if (isActive) btn.classList.add('active');
    btn.onclick = () => loadVideos(page, size); // ⬅️ gọi lại loadVideos đúng trang
    return btn;
  };

  // « First
  if (currentPage > 0) {
    paginationContainer.appendChild(createButton('«', 0));
  }

  const visiblePages = 2;
  let start = Math.max(0, currentPage - visiblePages);
  let end = Math.min(totalPages - 1, currentPage + visiblePages);

  if (start > 0) {
    paginationContainer.appendChild(createButton('1', 0));
    if (start > 1) {
      paginationContainer.appendChild(document.createTextNode('...'));
    }
  }

  for (let i = start; i <= end; i++) {
    paginationContainer.appendChild(createButton((i + 1).toString(), i, i === currentPage));
  }

  if (end < totalPages - 1) {
    if (end < totalPages - 2) {
      paginationContainer.appendChild(document.createTextNode('...'));
    }
    paginationContainer.appendChild(createButton(totalPages.toString(), totalPages - 1));
  }

  if (currentPage < totalPages - 1) {
    paginationContainer.appendChild(createButton('»', totalPages - 1));
  }
}


document.getElementById('tab-video').addEventListener('click', function () {
  loadVideos(); // tải trang đầu tiên
});

// --- HIỂN THỊ DANH SÁCH BÀI ĐĂNG Ở TAB BÀI VIẾT ---
// async function loadOwnPosts() {
//   const listPost = document.getElementById('list-post');
//   if (!listPost) return;
//   listPost.innerHTML = '<div style="text-align:center;color:#aaa;">Đang tải bài viết...</div>';
//   const token = localStorage.getItem('accessToken');
//   try {
//     let allPosts = [];
//     let page = 0;
//     let totalPages = 1;
//     do {
//       const res = await fetch(`http://localhost:8080/api/post/owner?page=${page}&size=10`, {
//         headers: { 'Authorization': 'Bearer ' + token }
//       });
//       const json = await res.json();
//       if (json.success && json.data && Array.isArray(json.data.content)) {
//         allPosts = allPosts.concat(json.data.content);
//         totalPages = json.data.page.totalPages;
//         page++;
//       } else {
//         break;
//       }
//     } while (page < totalPages);

//     if (allPosts.length === 0) {
//       listPost.innerHTML = '<div style="text-align:center;color:#aaa;">Chưa có bài viết nào.</div>';
//     } else {
//       listPost.innerHTML = allPosts.map(post => renderPostItem(post)).join('');
//     }
//   } catch (err) {
//     listPost.innerHTML = '<div style="color:red;">Lỗi khi tải bài viết!</div>';
//   }
// }

// function renderPostItem(post) {
//   // Lấy avatar và tên từ localStorage
//   const userAvatar = localStorage.getItem("userAvatar") || "";
//   const userFullName = localStorage.getItem("userFullName") || "";

//   // Xử lý ngày đăng
//   const date = new Date(post.uploadDate).toLocaleString('vi-VN');
//   // Ảnh/video
//   let mediaHtml = '';
//   if (post.photosUrl && post.photosUrl.length > 0) {
//     mediaHtml += '<div class="post-media-row">' + post.photosUrl.map(url => `<img src="${url}" alt="Ảnh bài viết" class="post-media-img">`).join('') + '</div>';
//   }
//   if (post.videosUrl && post.videosUrl.length > 0) {
//     mediaHtml += '<div class="post-media-row">' + post.videosUrl.map(url => `<video src="${url}" controls class="post-media-video"></video>`).join('') + '</div>';
//   }
//   return `
//     <div class="post-item">
//       <div class="post-header">
//         <img src="${userAvatar}" class="post-avatar" alt="avatar">
//         <div>
//           <div class="post-author">${userFullName}</div>
//           <div class="post-date">${date}</div>
//         </div>
//       </div>
//       <div class="post-content">${post.content || ''}</div>
//       ${mediaHtml}
//     </div>
//   `;
// }
// Hiển thị thông tin rút gọn ở tab Bài viết




// --- HIỂN THỊ DANH SÁCH BẠN BÈ Ở TAB BẠN BÈ ---
async function loadFriends() {
  const listEl = document.getElementById('friend-list');
  if (!listEl) return;
  listEl.innerHTML = '<div style="text-align:center;color:#aaa;">Đang tải danh sách bạn bè...</div>';
  try {
    const res = await fetch('http://localhost:8080/api/user/friends', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const json = await res.json();
    if (json.success && json.data && Array.isArray(json.data.content)) {
      if (json.data.content.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;color:#aaa;">Bạn chưa có bạn bè nào.</div>';
        return;
      }
      listEl.innerHTML = json.data.content.map(friend => renderFriendItem(friend)).join('');
    } else {
      listEl.innerHTML = '<div style="color:red;">Không tải được danh sách bạn bè!</div>';
    }
  } catch (err) {
    listEl.innerHTML = '<div style="color:red;">Lỗi khi tải danh sách bạn bè!</div>';
  }
}
function renderFriendItem(friend) {
  return `
    <div class="friend-item">
      <img src="${friend.photoProfile || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(friend.fullName)}" alt="avatar" class="post-avatar" style="width:56px;height:56px;">
      <div>
        <div class="post-author">${friend.fullName || ''}</div>
        <div class="post-date">${friend.phoneNumber || ''}</div>
        <div class="post-content" style="font-size:14px;color:#b0b3b8;">${friend.bio || ''}</div>
      </div>
    </div>
  `;
}
const tabFriends = document.getElementById('tab-friends');
if (tabFriends) {
  tabFriends.addEventListener('click', function() {
    loadFriends();
  });
}

// Xử lý nút Xóa tài khoản
const btnDeleteAccount = document.getElementById('btn-delete-account');
if (btnDeleteAccount) {
  btnDeleteAccount.onclick = function() {
    document.getElementById('delete-account-modal').style.display = 'flex';
  };
}
document.getElementById('btn-cancel-delete-account').onclick = function() {
  document.getElementById('delete-account-modal').style.display = 'none';
};
document.getElementById('btn-confirm-delete-account').onclick = async function() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    alert('Bạn chưa đăng nhập!');
    return;
  }
  try {
    const res = await fetch('http://localhost:8080/api/user-profile/delete', {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const json = await res.json();
    if (json.success) {
      alert('Tài khoản đã được xóa!');
      localStorage.removeItem('accessToken');
      window.location.href = 'login.html';
    } else {
      alert('Xóa tài khoản thất bại!');
    }
  } catch (err) {
    alert('Lỗi khi xóa tài khoản!');
  }
  document.getElementById('delete-account-modal').style.display = 'none';
};


});




// --- XÓA VIDEO ---
window.isVideoDeleteMode = false;
window.selectedVideoUrls = [];
document.getElementById('btn-delete-video').onclick = function() {
  window.isVideoDeleteMode = true;
  window.selectedVideoUrls = [];
  document.getElementById('btn-confirm-delete-video').style.display = 'inline-block';
  document.getElementById('btn-cancel-delete-video').style.display = 'inline-block';
  renderVideos(window.lastVideoList || []);
};
document.getElementById('btn-cancel-delete-video').onclick = function() {
  window.isVideoDeleteMode = false;
  window.selectedVideoUrls = [];
  document.getElementById('btn-confirm-delete-video').style.display = 'none';
  document.getElementById('btn-cancel-delete-video').style.display = 'none';
  renderVideos(window.lastVideoList || []);
};
document.getElementById('btn-confirm-delete-video').onclick = async function() {
  if (window.selectedVideoUrls.length === 0) {
    alert('Vui lòng chọn ít nhất 1 video để xóa!');
    return;
  }
  if (!confirm('Bạn có chắc chắn muốn xóa các video đã chọn?')) return;
  let successCount = 0;
  for (const url of window.selectedVideoUrls) {
    try {
      const res = await fetch('http://localhost:8080/api/video/delete?videoUrl=' + encodeURIComponent(url), {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const json = await res.json();
      if (json.success) successCount++;
    } catch {}
  }
  alert(`Đã xóa ${successCount} video!`);
  // window.isVideoDeleteMode = false;
  // window.selectedVideoUrls = [];
  // document.getElementById('btn-confirm-delete-video').style.display = 'none';
  // document.getElementById('btn-cancel-delete-video').style.display = 'none';
  // loadVideos();

  window.location.reload();


};

function renderVideos(videoList) {
  window.lastVideoList = videoList;
  const row = document.getElementById('video-row');
  if (!row) {
    console.warn('Không tìm thấy phần tử video-row!');
    return;
  }
  const isDeleteMode = window.isVideoDeleteMode;
  // Sắp xếp ngược lại: mới nhất lên trước
  const reversed = [...videoList].reverse();
  row.innerHTML = reversed.map(v => {
    const selected = (window.selectedVideoUrls || []).includes(v.videoUrl);
    return `
      <div class="video-item" style="position:relative;">
        <video src="${v.videoUrl}" controls data-url="${v.videoUrl}"
          ${isDeleteMode ? 'style="opacity:0.7;cursor:pointer;border:2px solid #ff4d4f;"' : ''}
          onclick="${isDeleteMode ? 'toggleSelectVideo(this)' : ''}"></video>
      </div>
    `;
  }).join('');
  if (isDeleteMode) {
    // Chỉ làm nổi bật các video đã chọn
    (window.selectedVideoUrls || []).forEach(url => {
      const vid = row.querySelector(`video[data-url='${url}']`);
      if (vid) {
        vid.style.opacity = "1";
        vid.style.border = "2px solid #1877F2";
      }
    });
  }
}
window.toggleSelectVideo = function(vidEl) {
  const url = vidEl.getAttribute('data-url');
  const idx = window.selectedVideoUrls.indexOf(url);
  if (idx === -1) {
    window.selectedVideoUrls.push(url);
    vidEl.style.opacity = "1";
    vidEl.style.border = "2px solid #1877F2";
  } else {
    window.selectedVideoUrls.splice(idx, 1);
    vidEl.style.opacity = "0.7";
    vidEl.style.border = "2px solid #ff4d4f";
  }
};

function openModal(imageUrl) {
  const modal = document.getElementById('image-modal');
  const zoomedImage = document.getElementById('zoomed-image');
  zoomedImage.src = imageUrl;
  modal.style.display = 'flex';
  modal.querySelector('.modal-content').classList.add('animate__animated', 'animate__fadeInDown');
}
function closeModal() {
  const modal = document.getElementById('image-modal');
  modal.style.display = 'none';
  modal.querySelector('.modal-content').classList.remove('animate__animated', 'animate__fadeInDown');
}
