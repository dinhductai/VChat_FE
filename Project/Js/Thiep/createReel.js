document.addEventListener('DOMContentLoaded', () => {
  const btnCreateReel = document.getElementById('btn-create-reel');
  const modal = document.getElementById('create-reel-modal');
  const form = document.getElementById('form-create-reel-modal');
  const closeBtn = document.getElementById('close-create-reel-modal');
  const cancelBtn = document.getElementById('btn-cancel-create-reel-modal');
  const loading = document.getElementById('create-reel-loading');

  if (!btnCreateReel || !modal || !form || !closeBtn || !cancelBtn) {
    console.warn('Thiếu phần tử cho reel!');
    return;
  }

  btnCreateReel.onclick = function () {
    form.reset();
    document.getElementById('reel-public').checked = true;
    modal.style.display = 'flex';
  };

  closeBtn.onclick = cancelBtn.onclick = function () {
    form.reset();
    modal.style.display = 'none';
  };

  form.onsubmit = async function (e) {
    e.preventDefault();

    const token = localStorage.getItem('accessToken');
    const videoInput = document.getElementById('input-reel-file-modal');
    const contentInput = document.getElementById('reel-content');
    const isPublicChecked = document.getElementById('reel-public').checked;

    if (!videoInput.files[0]) {
      alert('Vui lòng chọn video!');
      return;
    }

    if (!contentInput.value.trim()) {
      alert('Nội dung không được để trống!');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoInput.files[0]);
    formData.append('content', contentInput.value.trim());
    formData.append('isPublic', isPublicChecked.toString()); // "true" or "false"

    // DEBUG: log lại FormData để chắc chắn không thiếu
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    loading.style.display = 'flex';

    try {
      const res = await fetch('http://localhost:8080/api/reel/create', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token
        },
        body: formData
      });

      const json = await res.json();
      loading.style.display = 'none';

      console.log('Status:', res.status);
      console.log('Response:', json);

      if (json.success) {
        alert('Tạo reel thành công!');
        form.reset();
        modal.style.display = 'none';
      } else {
        alert('Tạo reel thất bại: ' + (json.message || 'Không rõ lý do'));
      }
    } catch (err) {
      loading.style.display = 'none';
      console.error(err);
      alert('Lỗi khi gửi yêu cầu tạo reel!');
    }
  };

});
