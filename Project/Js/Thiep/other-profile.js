function getUserIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('user-id');
}
const userId = getUserIdFromUrl();
var token = localStorage.getItem('accessToken');// Nếu không có userId, vẫn cho phép xem profile của chính mình (hoặc chuyển hướng nếu muốn)
if (!token) {
  alert('Vui lòng đăng nhập để tiếp tục!');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  // Lấy ảnh đại diện
  try {
    const res = await fetch(`http://localhost:8080/api/profile-photo${userId ? '?userId=' + userId : ''}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const json = await res.json();

    const defaultAvatar = "../images/user-default.webp"; // ảnh avatar mặc định

    const avatarEl = document.getElementById('profile-avatar');
    const fbAvatar = document.querySelector('.fb-avatar');

    if (json.success && json.data) {
      if (avatarEl) avatarEl.src = json.data || defaultAvatar;
      if (fbAvatar) fbAvatar.src = json.data || defaultAvatar;
    } else {
      if (avatarEl) avatarEl.src = defaultAvatar;
      if (fbAvatar) fbAvatar.src = defaultAvatar;
    }
  } catch (err) {
    console.error('Lỗi lấy avatar:', err);

    const defaultAvatar = "../images/user-default.webp";
    const avatarEl = document.getElementById('profile-avatar');
    const fbAvatar = document.querySelector('.fb-avatar');

    if (avatarEl) avatarEl.src = defaultAvatar;
    if (fbAvatar) fbAvatar.src = defaultAvatar;
  }



  // Lấy thông tin cá nhân
  try {
    const res = await fetch(`http://localhost:8080/api/user-profile${userId ? '?userId=' + userId : ''}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      const nameEl = document.getElementById('profile-fullname');
      if (nameEl) nameEl.textContent = d.fullName || '';
      const profileBioEl = document.getElementById('profile-bio');
      if (profileBioEl) { profileBioEl.innerHTML = `<i class="fas fa-quote-left"></i> ${d.bio || ''}`; }
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

        // Xem thêm thông tin cá nhân
        const btnShowMore = document.getElementById('btn-show-more-details');
        const more = userDetail.querySelector('.user-info-more');
        const textEl = btnShowMore.querySelector('.banner-text');
        const iconEl = btnShowMore.querySelector('i');
        btnShowMore.style.display = 'flex';
        let expanded = false;
        btnShowMore.onclick = function (e) {
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

  // PHÂN TRANG ẢNH
  const PHOTO_PAGE_SIZE = 9;
  async function loadPhotos(page = 0, size = PHOTO_PAGE_SIZE) {
    try {
      const res = await fetch(`http://localhost:8080/api/photo${userId ? '?userId=' + userId : ''}&page=${page}&size=${size}`, {
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
  window.loadPhotos = loadPhotos;

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
    const paginationContainer = document.getElementById('photo-pagination');
    paginationContainer.innerHTML = '';
    const totalPages = pageInfo.totalPages;
    const currentPage = pageInfo.number;
    if (!totalPages || totalPages <= 1) return;
    const createButton = (text, page, isActive = false) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.className = 'page-btn';
      if (isActive) btn.classList.add('active');
      btn.onclick = () => loadPhotos(page, size);
      return btn;
    };
    if (currentPage > 0) paginationContainer.appendChild(createButton('«', 0));
    const visiblePages = 2;
    let start = Math.max(0, currentPage - visiblePages);
    let end = Math.min(totalPages - 1, currentPage + visiblePages);
    if (start > 0) {
      paginationContainer.appendChild(createButton('1', 0));
      if (start > 1) paginationContainer.appendChild(document.createTextNode('...'));
    }
    for (let i = start; i <= end; i++) {
      paginationContainer.appendChild(createButton((i + 1).toString(), i, i === currentPage));
    }
    if (end < totalPages - 1) {
      if (end < totalPages - 2) paginationContainer.appendChild(document.createTextNode('...'));
      paginationContainer.appendChild(createButton(totalPages.toString(), totalPages - 1));
    }
    if (currentPage < totalPages - 1) paginationContainer.appendChild(createButton('»', totalPages - 1));
  }

  document.getElementById('tab-photo').addEventListener('click', function () {
    document.getElementById('section-info').style.display = 'none';
    document.getElementById('section-photo').style.display = 'block';
    document.getElementById('section-video').style.display = 'none';
    document.getElementById('section-story').style.display = 'none';
    loadPhotos(0);
  });

  // VIDEO
  const VIDEO_PAGE_SIZE = 4;
  async function loadVideos(page = 0, size = VIDEO_PAGE_SIZE) {
    try {
      const res = await fetch(`http://localhost:8080/api/video${userId ? '?userId=' + userId : ''}&page=${page}&size=${size}`, {
        headers: { 'Authorization': 'Bearer ' + token }
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
      document.getElementById('video-row').innerHTML = '<p style="color:red;">Không thể tải video!</p>';
      document.getElementById('video-pagination').innerHTML = '';
    }
  }

  function renderVideos(videoList) {
    const row = document.getElementById('video-row');
    if (!row) return;
    const reversed = [...videoList].reverse();
    row.innerHTML = reversed.map(v => `
      <div class="video-item" style="position:relative;">
        <video src="${v.videoUrl}" controls data-url="${v.videoUrl}"></video>
      </div>
    `).join('');
  }

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
      btn.onclick = () => loadVideos(page, size);
      return btn;
    };
    if (currentPage > 0) paginationContainer.appendChild(createButton('«', 0));
    const visiblePages = 2;
    let start = Math.max(0, currentPage - visiblePages);
    let end = Math.min(totalPages - 1, currentPage + visiblePages);
    if (start > 0) {
      paginationContainer.appendChild(createButton('1', 0));
      if (start > 1) paginationContainer.appendChild(document.createTextNode('...'));
    }
    for (let i = start; i <= end; i++) {
      paginationContainer.appendChild(createButton((i + 1).toString(), i, i === currentPage));
    }
    if (end < totalPages - 1) {
      if (end < totalPages - 2) paginationContainer.appendChild(document.createTextNode('...'));
      paginationContainer.appendChild(createButton(totalPages.toString(), totalPages - 1));
    }
    if (currentPage < totalPages - 1) paginationContainer.appendChild(createButton('»', totalPages - 1));
  }

  document.getElementById('tab-video').addEventListener('click', function () {
    loadVideos();
  });

  // BẠN BÈ
  async function loadFriends() {
    const listEl = document.getElementById('friend-list');
    if (!listEl) return;
    listEl.innerHTML = '<div style="text-align:center;color:#aaa;">Đang tải danh sách bạn bè...</div>';
    try {
      const res = await fetch(`http://localhost:8080/api/user/friends${userId ? '?userId=' + userId : ''}`, {
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
    tabFriends.addEventListener('click', function () {
      loadFriends();
    });
  }

  // XEM ẢNH LỚN
  window.openModal = function (imageUrl) {
    const modal = document.getElementById('image-modal');
    const zoomedImage = document.getElementById('zoomed-image');
    zoomedImage.src = imageUrl;
    modal.style.display = 'flex';
    modal.querySelector('.modal-content').classList.add('animate__animated', 'animate__fadeInDown');
  };
  window.closeModal = function () {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none';
    modal.querySelector('.modal-content').classList.remove('animate__animated', 'animate__fadeInDown');
  };
});




// --- XÓA VIDEO ---
window.isVideoDeleteMode = false;
window.selectedVideoUrls = [];
document.getElementById('btn-delete-video').onclick = function () {
  window.isVideoDeleteMode = true;
  window.selectedVideoUrls = [];
  document.getElementById('btn-confirm-delete-video').style.display = 'inline-block';
  document.getElementById('btn-cancel-delete-video').style.display = 'inline-block';
  renderVideos(window.lastVideoList || []);
};
document.getElementById('btn-cancel-delete-video').onclick = function () {
  window.isVideoDeleteMode = false;
  window.selectedVideoUrls = [];
  document.getElementById('btn-confirm-delete-video').style.display = 'none';
  document.getElementById('btn-cancel-delete-video').style.display = 'none';
  renderVideos(window.lastVideoList || []);
};
document.getElementById('btn-confirm-delete-video').onclick = async function () {
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
    } catch { }
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
window.toggleSelectVideo = function (vidEl) {
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
