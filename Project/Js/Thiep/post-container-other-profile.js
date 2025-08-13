let isLoading = false;
let isLastPage = false;
let currentPage = 0;
const pageSize = 5;
const loadingSpinner = document.getElementById("loading");

// Hàm fetch trạng thái reaction cho từng post
async function fetchReactionState(postId) {
  try {
    const res = await fetch(
      `http://localhost:8080/api/reaction/cnt-check?postId=${postId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    const emotion = data?.data?.emotionName;
    const btnInModal = document.querySelector(`#like-btn-${postId}`);
    const btnInHome = document.querySelector(`#like-btn-home-${postId}`);

    if (emotion && emotionMap && emotionMap[emotion]) {
      const { icon, label, color } = emotionMap[emotion];

      if (btnInModal) {
        btnInModal.innerHTML = `${icon} ${label}`;
        btnInModal.style.color = color;
      }

      if (btnInHome) {
        btnInHome.innerHTML = `${icon} ${label}`;
        btnInHome.style.color = color;
      }
      currentReaction = emotion;
    } else {
      // Không có cảm xúc -> reset
      const defaultContent = `<i class="bi bi-hand-thumbs-up"></i> Like`;

      if (btnInModal) {
        btnInModal.innerHTML = defaultContent;
        btnInModal.style.color = "";
      }

      if (btnInHome) {
        btnInHome.innerHTML = defaultContent;
        btnInHome.style.color = "";
      }

      currentReaction = null;
    }
  } catch (err) {
    console.error("Lỗi fetch trạng thái reaction:", err);
  }
}

// Lấy userId từ URL (?user-id=...)
function getUserIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('user-id');
}

// Gọi API lấy post của userId
async function loadPosts() {
  if (isLoading || isLastPage) return;

  isLoading = true;
  loadingSpinner.classList.remove("d-none");

  try {
    const response = await fetch(
      `http://localhost:8080/api/post/owner?userId=${userId}&page=${currentPage}&size=${pageSize}`,
      {
        method: "GET",
        headers:
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API trả về lỗi HTTP", response.status, errorText);
      throw new Error("API trả về lỗi");
    }

    const data = await response.json();
    if (data?.data?.content && Array.isArray(data.data.content)) {
      data.data.content.forEach((post) => {
        renderPost(post);
        fetchReactionState(post.postId);
      });
    } else {
      console.warn("Không có bài viết nào hoặc sai cấu trúc!");
    }

    const currentPageNumber = data.data.page.number;
    const totalPages = data.data.page.totalPages;

    if (currentPageNumber + 1 >= totalPages) {
      isLastPage = true;
    } else {
      currentPage++;
    }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
  }

  isLoading = false;
  loadingSpinner.classList.add("d-none");
}

// Hàm render media (ảnh + video) cho mọi trường hợp
function renderMedia(photos = [], videos = []) {
  // Nếu có 1 ảnh và 1 video
  if (photos.length === 1 && videos.length === 1) {
    return `
      <div style="max-width: 700px; margin: auto; display: flex; gap: 4px; height: 400px;">
        <div style="flex:1; min-width:0; min-height:0; overflow:hidden; border-radius:8px; display:flex; align-items:stretch;">
          <img src="${photos[0]}" style="width:100%; height:100%; object-fit:cover; display:block;" />
        </div>
        <div style="flex:1; min-width:0; min-height:0; overflow:hidden; border-radius:8px; display:flex; align-items:stretch;">
          <video src="${videos[0]}" controls style="width:100%; height:100%; object-fit:cover; border-radius:8px; display:block;"></video>
        </div>
      </div>
    `;
  }
  // Nếu chỉ có 1 ảnh
  if (photos.length === 1 && videos.length === 0) {
    return `
      <div style="max-width: 700px; margin: auto; height: 400px; display: flex; align-items: stretch;">
        <img src="${photos[0]}" style="width:100%; height:100%; object-fit:cover; border-radius:8px; display:block;" />
      </div>
    `;
  }
  // Nếu chỉ có 1 video
  if (videos.length === 1 && photos.length === 0) {
    return `
      <div style="max-width: 700px; margin: auto; height: 400px; display: flex; align-items: stretch;">
        <video src="${videos[0]}" controls style="width:100%; height:100%; object-fit:cover; border-radius:8px; display:block;"></video>
      </div>
    `;
  }
  // Nếu có 2 ảnh
  if (photos.length === 2 && videos.length === 0) {
    return `
      <div style="max-width: 700px; margin: auto; display: flex; gap: 4px; height: 400px;">
        <div style="flex:1; min-width:0; min-height:0; overflow:hidden; border-radius:8px; display:flex; align-items:stretch;">
          <img src="${photos[0]}" style="width:100%; height:100%; object-fit:cover; display:block;" />
        </div>
        <div style="flex:1; min-width:0; min-height:0; overflow:hidden; border-radius:8px; display:flex; align-items:stretch;">
          <img src="${photos[1]}" style="width:100%; height:100%; object-fit:cover; display:block;" />
        </div>
      </div>
    `;
  }
  // Nếu có 2 video
  if (videos.length === 2 && photos.length === 0) {
    return `
      <div style="max-width: 700px; margin: auto; display: flex; gap: 4px; height: 400px;">
        <div style="flex:1; min-width:0; min-height:0; overflow:hidden; border-radius:8px; display:flex; align-items:stretch;">
          <video src="${videos[0]}" controls style="width:100%; height:100%; object-fit:cover; border-radius:8px; display:block;"></video>
        </div>
        <div style="flex:1; min-width:0; min-height:0; overflow:hidden; border-radius:8px; display:flex; align-items:stretch;">
          <video src="${videos[1]}" controls style="width:100%; height:100%; object-fit:cover; border-radius:8px; display:block;"></video>
        </div>
      </div>
    `;
  }
  // Nếu có >=3 ảnh: grid, ảnh đầu to hơn
  if (photos.length >= 3) {
    return `
      <div style="display: flex; flex-direction: column; gap: 4px; max-width: 700px; margin: auto;">
        <div style="width: 100%; height: 240px; overflow: hidden; border-radius: 8px;">
          <img src="${photos[0]}" style="width:100%; height:100%; object-fit:cover;" />
        </div>
        <div style="display: flex; gap: 4px; height: 160px;">
          <div style="flex:1; overflow:hidden; border-radius:8px;">
            <img src="${photos[1]}" style="width:100%; height:100%; object-fit:cover;" />
          </div>
          <div style="flex:1; overflow:hidden; border-radius:8px;">
            <img src="${photos[2]}" style="width:100%; height:100%; object-fit:cover;" />
          </div>
        </div>
      </div>
    `;
  }
  // Nếu có >=3 video: grid
  if (videos.length >= 3) {
    return `
      <div style="display: flex; flex-direction: column; gap: 4px; max-width: 700px; margin: auto;">
        <div style="width: 100%; height: 240px; overflow: hidden; border-radius: 8px;">
          <video src="${videos[0]}" controls style="width:100%; height:100%; object-fit:cover; border-radius:8px;"></video>
        </div>
        <div style="display: flex; gap: 4px; height: 160px;">
          <div style="flex:1; overflow:hidden; border-radius:8px;">
            <video src="${videos[1]}" controls style="width:100%; height:100%; object-fit:cover; border-radius:8px;"></video>
          </div>
          <div style="flex:1; overflow:hidden; border-radius:8px;">
            <video src="${videos[2]}" controls style="width:100%; height:100%; object-fit:cover; border-radius:8px;"></video>
          </div>
        </div>
      </div>
    `;
  }
  // Nếu có cả ảnh và video >=3, chỉ hiển thị 3 đầu tiên (ưu tiên ảnh)
  const allMedia = [...photos, ...videos].slice(0, 3);
  if (allMedia.length > 0) {
    return `
      <div style="display: flex; gap: 4px; max-width: 700px; margin: auto; height: 400px;">
        ${allMedia
        .map(
          (url) =>
            url.match(/\.(mp4|webm|ogg)$/i)
              ? `<video src="${url}" controls style="flex:1; width:100%; height:100%; object-fit:cover; border-radius:8px; display:block;"></video>`
              : `<img src="${url}" style="flex:1; width:100%; height:100%; object-fit:cover; border-radius:8px; display:block;" />`
        )
        .join("")}
      </div>
    `;
  }
  return "";
}

// Hàm hiển thị 1 bài post
function renderPost(post, insert = true) {
  const postContainer = document.getElementById("postContainer");

  if (post.profilePicture == null) {
    post.profilePicture = "../images/user-default.webp";
  }
  const html = `
    <div class="post shadow-sm rounded text-white col-10"
    style="background-color: #2f3337ff; margin: 10px auto; padding: 20px; position: relative;"    
        data-post-id='${post.postId}'>
       <div class="d-flex justify-content-between">
              <div class="d-flex align-items-center mb-2">
                <img src="${post.profilePicture || "../images/user-default.webp"}"
                class="rounded-circle me-2" style="width: 40px; height: 40px;cursor: pointer; border: 1px solid #bdc3c7" alt="Avatar" />
                <div>
                    <strong style="cursor: pointer; color: #bdc3c7;">${post.fullName}</strong><br />
                     <small style="color: #bdc3c7;">${formatTimeAgo(post.uploadDate)}</small>
                </div>
              </div>
              <div class="dropdown">
                <div
                  class="rounded-circle contact-icon d-flex justify-content-center align-items-center ms-2"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="bi bi-three-dots"></i>
                </div>
                <ul class="dropdown-menu dropdown-menu-end custom-shadow border-0">
                  <li>
                    <button
                      class="dropdown-item d-flex align-items-center"
                      onclick="shareOrSavePost('SHARE', ${post.postId})"
                      type="button"
                      style="background-color: #ffffff; color: black;"
                    >
                      <i class="bi bi-share-fill me-2"></i>
                      <span>Share Post</span>
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item d-flex align-items-center"
                      onclick="shareOrSavePost('SAVE', ${post.postId})"
                      type="button"
                      style="background-color: #ffffff; color: #000000;"
                    >
                      <i class="bi bi-bookmark-fill me-2" style="color: #000000;"></i>
                      <span>Save Post</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
      <p class="post-text" style="color: #bdc3c7;">${post.content}</p>
      ${renderImages(post.photosUrl || [], post.postId)}
      ${renderVideosHTML(post.videosUrl || [])}
      <div class="d-flex justify-content-around mt-3 border-top pt-2 position-relative">
        <div class="like-wrapper position-relative w-100 me-1">
          <button class="btn btn-light w-100 btn-action"  style="font-weight: bold; color: #65676b; font-size:15px;"
          id="like-btn-home-${post.postId}">
            <i class="bi bi-hand-thumbs-up"></i> Like
          </button>
          <div class="reaction-popup d-flex gap-2 rounded-5 shadow border" style="display:none;">
            <span class="icon" data-emotion="LIKE"><img src="../images/Animation/uv2XD2zFzt.gif" alt="Like" class="reaction-img" /></span>
            <span class="icon" data-emotion="LOVE"><img src="../images/Animation/Emojis - Love (1).gif" alt="" style="width: 40px; height: 40px" /></span>
            <span class="icon" data-emotion="HAHA"><img src="../images/Animation/smiley emoji 2.gif" alt="" style="width: 50px; height: 50px" /></span>
            <span class="icon" data-emotion="WOW"><img src="../images/Animation/Emojis - Wow.gif" alt="" style="width: 40px; height: 40px" /></span>
            <span class="icon" data-emotion="SAD"><img src="../images/Animation/Sad Emoji.gif" alt="" style="width: 50px; height: 50px" /></span>
            <span class="icon" data-emotion="ANGRY"><img src="../images/Animation/Angry emoji.gif" alt="" style="width: 35px; height: 35px" /></span>
          </div>
        </div>
        <button class="btn btn-light w-100 me-1 btn-action toggle-comment" data-post-id="${post.postId}"
          onclick="openAllImagesModal('${post.postId}')"
          style="font-weight: bold; color: #bdc3c7; font-size:15px;">
          <i class="bi bi-chat-left"></i> Comment
        </button>
        <button class="btn btn-light w-100 btn-action"  style="font-weight: bold; color: #bdc3c7; font-size:15px;">
          <i class="bi bi-share"></i> Share
        </button>
      </div>
    </div>
  `;
  if (insert) {
    postContainer.insertAdjacentHTML("beforeend", html);
    attachPostEvents(post.postId); // Gán lại sự kiện cho post vừa render
  }
  return html;
}

// Gán lại sự kiện sau khi render post
function attachPostEvents(postId) {
  // Like button hover: hiện popup cảm xúc
  const likeWrapper = document.querySelector(`[data-post-id='${postId}'] .like-wrapper`);
  const popup = likeWrapper?.querySelector('.reaction-popup');
  const likeBtn = document.getElementById(`like-btn-home-${postId}`);

  if (likeWrapper && popup) {
    likeWrapper.onmouseenter = () => { popup.style.display = "flex"; };
    likeWrapper.onmouseleave = () => { popup.style.display = "none"; };
  }

  // Like button click: gọi hàm like (nếu đã có hàm handleLikeButton hoặc tương tự)
  if (likeBtn) {
    likeBtn.onclick = function () {
      if (typeof handleLikeButton === "function") {
        handleLikeButton(postId);
      }
    };
  }

  // Gán sự kiện cho các icon cảm xúc trong popup
  if (popup) {
    popup.querySelectorAll(".icon").forEach((icon) => {
      icon.onclick = function () {
        const emotion = icon.getAttribute("data-emotion");
        if (typeof handleReactionClick === "function") {
          handleReactionClick(postId, emotion);
        }
      };
    });
  }
}

// Hàm mở modal khi click vào ảnh trong post
async function openImageModal(srcImg, postId) {
  try {
    const response = await fetch(`http://localhost:8080/api/post/${postId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) throw new Error("Lỗi khi gọi API");

    const post = await response.json();
    resetModalState();
    renderPostToModal(srcImg, post);
    fetchReactionState(postId);

    if (typeof stompClient !== "undefined" && stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        connectComment(postId);
      });
    } else {
      connectComment(postId);
    }
  } catch (error) {
    console.error("Lỗi load chi tiết bài viết:", error);
    alert("Không thể tải nội dung bài viết");
  }
}

// Hàm render nội dung post vào modal
function renderPostToModal(srcImg, post) {
  const profile_image = document.getElementById("profile_image");
  const modalImg = document.getElementById("modalImage");
  const userName = document.getElementById("post-userName");
  const postTime = document.getElementById("postTime");
  const postContent = document.getElementById("postContentID");

  modalImg.src = srcImg;
  userName.textContent = post.data.fullName || "Ẩn danh";
  postTime.textContent = formatTimeAgo(post.data.uploadDate);
  postContent.textContent = post.data.content;

  const avatar =
    post.data.profilePicture?.trim() && post.data.profilePicture !== "null"
      ? post.data.profilePicture
      : "../images/user-default.webp";
  profile_image.src = avatar;

  const modal = document.getElementById("imageModal");
  modal.setAttribute("data-post-id", post.data.postId);
  modal.setAttribute("data-user-id", post.data.userId);
  modal.querySelector(".like-btn").id = `like-btn-${post.data.postId}`;

  const aiIcon = document.getElementById("ai");
  if (aiIcon) {
    aiIcon.style.display = "none";
  }

  const imageModal = new bootstrap.Modal(modal);
  imageModal.show();
}

// Reset modal state khi đóng
function resetModalState() {
  const modalImg = document.getElementById("modalImage");
  if (modalImg) modalImg.src = "";

  const profile_image = document.getElementById("profile_image");
  if (profile_image) profile_image.src = "../images/user-default.webp";

  const userName = document.getElementById("post-userName");
  if (userName) userName.textContent = "";

  const postTime = document.getElementById("postTime");
  if (postTime) postTime.textContent = "";

  const postContent = document.getElementById("postContentID");
  if (postContent) postContent.textContent = "";

  const commentList = document.getElementById("commentList");
  if (commentList) commentList.innerHTML = "";

  const commentInput = document.getElementById("commentInput");
  if (commentInput) commentInput.value = "";

  const likeBtn = document.querySelector(".like-btn");
  if (likeBtn) {
    likeBtn.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Like`;
    likeBtn.classList.remove("active");
  }
}

// Đảm bảo khi đóng modal thì hiện lại icon AI nếu có
document.getElementById("imageModal")?.addEventListener("hidden.bs.modal", function () {
  const aiIcon = document.getElementById("ai");
  if (aiIcon) {
    aiIcon.style.display = "block";
  }
});

// Gửi comment khi bấm nút gửi trong modal
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("sendCommentBtn")?.addEventListener("click", sendComment);
});

// Gọi lần đầu
loadPosts();

// Lắng nghe cuộn trang
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadPosts();
  }
});

function formatTimeAgo(dateString) {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else {
    return postDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

function renderImages(photos, postId) {
  if (!Array.isArray(photos) || photos.length === 0) return "";

  if (photos.length === 1) {
    return `
      <div class="post-images-grid single-image mb-2">
        <img src="${photos[0]}" onclick="openImageModal('${photos[0]}','${postId}')" style="width: 666px; height: 100%; object-fit: cover;" />
      </div>
    `;
  }

  if (photos.length === 2) {
    return `
      <div class="post-images-grid mb-2" style="max-width: 700px; margin: auto; display: flex; flex-direction: row; gap: 4px; height: 500px;">
        <div style="flex: 1; overflow: hidden; border-radius: 8px;">
          <img src="${photos[0]}" onclick="openImageModal('${photos[0]}','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1; overflow: hidden; border-radius: 8px;">
          <img src="${photos[1]}" onclick="openImageModal('${photos[1]}','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      </div>
    `;
  }

  if (photos.length === 3) {
    return `
      <div class="post-images-grid mb-2" style="display: flex; flex-direction: column; gap: 4px; max-width: 700px; margin: auto;">
        <div style="width: 100%; height: 400px; overflow: hidden; border-radius: 8px;">
          <img src="${photos[0]}" onclick="openImageModal('${photos[0]}','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="display: flex; gap: 4px; height: 300px;">
          <div style="flex: 1; overflow: hidden; border-radius: 8px;">
            <img src="${photos[1]}" onclick="openImageModal('${photos[1]}','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="flex: 1; overflow: hidden; border-radius: 8px;">
            <img src="${photos[2]}" onclick="openImageModal('${photos[2]}','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        </div>
      </div>
    `;
  }

  // ≥4 ảnh: grid 2x2, giới hạn 4 ảnh đầu
  const limitedPhotos = photos.slice(0, 4);
  return `
    <div class="post-images-grid mb-2" style="max-width: 700px; margin: auto; display: flex; flex-direction: column; gap: 4px;">
      <div style="display: flex; gap: 4px; height: 240px;">
        <div style="flex: 1; overflow: hidden; border-radius: 8px;">
          <img src="${limitedPhotos[0]}" onclick="openImageModal('${limitedPhotos[0]}','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1; overflow: hidden; border-radius: 8px;">
          <img src="${limitedPhotos[1]}" onclick="openImageModal('${limitedPhotos[1]}','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      </div>
      <div style="display: flex; gap: 4px; height: 240px;">
        <div style="flex: 1; overflow: hidden; border-radius: 8px;">
          <img src="${limitedPhotos[2]}" onclick="openImageModal('${limitedPhotos[2]}','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1; overflow: hidden; border-radius: 8px; position: relative;">
          <img src="${limitedPhotos[3]}" onclick="openImageModal('${limitedPhotos[3]}','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
          ${photos.length > 4
      ? `<div style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-color: rgba(0, 0, 0, 0.4);
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 32px;
                  font-weight: bold;
                  border-radius: 8px;
                ">+${photos.length - 4}</div>`
      : ""
    }
        </div>
      </div>
    </div>
  `;
}

function renderVideosHTML(videos) {
  if (!Array.isArray(videos) || videos.length === 0) return "";
  return videos.map(url => `
    <div class="fb-video-row">
      <video controls class="fb-video" style="width: 100%; max-height: 450px; border-radius: 8px;">
        <source src="${url}" type="video/mp4" />
        Trình duyệt không hỗ trợ video.
      </video>
    </div>
  `).join('');
}


