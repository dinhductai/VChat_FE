// --- HIỂN THỊ STORY Ở TAB STORY (OWNER) ---
// file rác
function renderOwnStoryItem(story, idx) {
  const photoIdx = (window.storyPhotoIndexes && window.storyPhotoIndexes[idx]) || 0;
  const total = story.listStoryPhoto.length;
  const photoUrl = story.listStoryPhoto[photoIdx] || '';
  const date = story.listDateUpload && story.listDateUpload[photoIdx] ? new Date(story.listDateUpload[photoIdx]).toLocaleString('vi-VN') : '';
  const encodedPhotoUrl = encodeURIComponent(photoUrl);
  return `
    <div class="own-story-item">
      <img src="${story.profileUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(story.fullName)}" class="story-avatar" alt="avatar">
      <div class="story-info">
        <div class="story-author">${story.fullName || ''}</div>
        <div class="story-date">${date}</div>
      </div>
      <div class="story-photo-box">
        <button id="story-arrow-up-${idx}" class="story-arrow-btn" ${photoIdx === 0 ? 'disabled' : ''}>&uarr;</button>
        <div style="position:relative;display:inline-block;">
          <img src="${photoUrl}" class="story-photo" alt="Story">
          <button class="story-trash-btn" onclick="deleteStoryPhoto('${encodedPhotoUrl}')" title="Xóa story"><i class="fas fa-trash"></i></button>
        </div>
        <button id="story-arrow-down-${idx}" class="story-arrow-btn" ${photoIdx === total - 1 ? 'disabled' : ''}>&darr;</button>
      </div>
    </div>
  `;
}

function renderOwnStories(apiData) {
  const storyRow = document.getElementById('own-story-row');
  if (!storyRow || !Array.isArray(apiData) || apiData.length === 0) {
    storyRow.innerHTML = '<div style="color:#ccc;">Chưa có story nào.</div>';
    return;
  }

  const storyData = apiData[0];
  const totalPhotos = storyData.listStoryPhoto.length;
  window.storyPhotoIndexes = [0];
  const html = [renderOwnStoryItem(storyData, 0)].join('');
  storyRow.innerHTML = html;

  const upBtn = document.getElementById('story-arrow-up-0');
  const downBtn = document.getElementById('story-arrow-down-0');
  if (upBtn) upBtn.onclick = function () { changeStoryPhoto(0, -1, [storyData]); };
  if (downBtn) downBtn.onclick = function () { changeStoryPhoto(0, 1, [storyData]); };
}

// function loadOwnStories() {
//   const token = localStorage.getItem('accessToken');
//   fetch('http://localhost:8080/api/story/owner', {
//     headers: { 'Authorization': 'Bearer ' + token }
//   })
//     .then(res => res.json())
//     .then(json => {
//       if (json.success) {
//         renderOwnStories(json.data);
//       }
//     })
//     .catch(err => {
//       console.error('Lỗi khi tải story:', err);
//     });
// }

window.changeStoryPhoto = function (idx, delta, data) {
  if (!window.storyPhotoIndexes) return;
  const story = data[idx];
  let cur = window.storyPhotoIndexes[idx];
  const total = story.listStoryPhoto.length;
  cur = Math.max(0, Math.min(total - 1, cur + delta));
  window.storyPhotoIndexes[idx] = cur;
  const row = document.getElementById('own-story-row');
  if (!row) return;
  row.children[idx].outerHTML = renderOwnStoryItem(story, idx);
  const upBtn = document.getElementById('story-arrow-up-' + idx);
  const downBtn = document.getElementById('story-arrow-down-' + idx);
  if (upBtn) upBtn.onclick = function () { changeStoryPhoto(idx, -1, data); };
  if (downBtn) downBtn.onclick = function () { changeStoryPhoto(idx, 1, data); };
};

// xoa story owner
// window.deleteStoryPhoto = async function(photoUrl) {
//   if (!confirm('Bạn có chắc chắn muốn xóa story này?')) return;
//   const token = localStorage.getItem('token');
//   try {
//     const res = await fetch('http://localhost:8080/api/story/delete?photoUrl=' + photoUrl, {
//       method: 'DELETE', 
//       headers: { 'Authorization': 'Bearer ' + token }
//     });
//     const json = await res.json();
//     if (json.success) {
//       alert('Đã xóa story!');
//       loadOwnStories();
//     } else {
//       alert('Xóa story thất bại!');
//     }
//   } catch (err) {
//     alert('Lỗi khi xóa story!');
//   }
// };

const tabStory = document.getElementById('tab-story');
if (tabStory) {
  tabStory.addEventListener('click', function () {
    showSection("story");
  });
}

function renderAllStoryItem(story) {
  const photoUrl = story.listStoryPhoto[0] || '';
  const date = story.listDateUpload && story.listDateUpload[0] ? new Date(story.listDateUpload[0]).toLocaleString('vi-VN') : '';
  return `
    <div class="own-story-item">
      <img src="${story.profileUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(story.fullName)}" class="story-avatar" alt="avatar">
      <div class="story-info">
        <div class="story-author">${story.fullName || ''}</div>
        <div class="story-date">${date}</div>
      </div>
      <div class="story-photo-box">
        <img src="${photoUrl}" class="story-photo" alt="Story">
      </div>
    </div>
  `;
}
