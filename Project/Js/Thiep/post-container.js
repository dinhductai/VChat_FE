token = localStorage.getItem("accessToken");
let isLoading = false;
let isLastPage = false;
let currentPage = 0;
const pageSize = 5; // hoặc số bạn muốn
const loadingSpinner = document.getElementById("loading");

// Hàm gọi API lấy post
async function loadPosts() {
  if (isLoading || isLastPage) return;

  isLoading = true;
  loadingSpinner.classList.remove("d-none");

  try {
    const response = await fetch(
      `http://localhost:8080/api/post/owner?page=${currentPage}&size=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );

    // ✅ Kiểm tra HTTP status trước khi xử lý JSON
    if (!response.ok) {
      const errorText = await response.text(); // Lấy nội dung trả về nếu có
      console.error("API trả về lỗi HTTP", response.status, errorText);
      throw new Error("API trả về lỗi");
    }

    const data = await response.json(); // ✅ Không lỗi nữa
    console.log(data);
    if (data?.data?.content && Array.isArray(data.data.content)) {
      data.data.content.forEach((post) => {
        console.log(post);
        renderPost(post); // 👈 Hàm hiển thị bài viết
        fetchReactionState(post.postId);
      });
    } else {
      console.warn("Không có bài viết nào hoặc sai cấu trúc!");
    }

    // ✅ Kiểm tra trang cuối
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

// Hàm hiển thị 1 bài post
function renderPost(post, insert = true) {
  const postContainer = document.getElementById("postContainer");

  // Hàm xử lý hiển thị ảnh theo số lượng
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
          <img src="${limitedPhotos[0]}" onclick="openImageModal('${
      limitedPhotos[0]
    }','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1; overflow: hidden; border-radius: 8px;">
          <img src="${limitedPhotos[1]}" onclick="openImageModal('${
      limitedPhotos[1]
    }','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      </div>
      <div style="display: flex; gap: 4px; height: 240px;">
        <div style="flex: 1; overflow: hidden; border-radius: 8px;">
          <img src="${limitedPhotos[2]}" onclick="openImageModal('${
      limitedPhotos[2]
    }','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1; overflow: hidden; border-radius: 8px; position: relative;">
          <img src="${limitedPhotos[3]}" onclick="openImageModal('${
      limitedPhotos[3]
    }','${postId}')" style="width: 100%; height: 100%; object-fit: cover;" />
          ${
            photos.length > 4
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

  // HTML video
  const videoHTML = Array.isArray(post.videosUrl)
    ? post.videosUrl
        .map(
          (url) => `
        <video
          controls
          class="img-fluid rounded post-video my-2"
          style="max-height: 500px; width: 100%; object-fit: contain"
        >
          <source src="${url}" type="video/mp4" />
          Trình duyệt không hỗ trợ phát video.
        </video>
      `
        )
        .join("")
    : "";

  // Khung bài đăng
  if (post.profilePicture == null) {
    post.profilePicture = "../images/user-default.webp";
  }
  const html = `
    <div class="post shadow-sm rounded text-white col-10"
    style="background-color: #2f3337ff; margin: 10px auto; padding: 20px; position: relative;"    
        data-post-id='${post.postId}'>
       <div class="d-flex justify-content-between">
              <div class="d-flex align-items-center mb-2">
                <img src="${
                  post.profilePicture || "../images/user-default.webp"
                }"
                class="rounded-circle me-2" style="width: 40px; height:
                40px;cursor: pointer; border: 1px solid #bdc3c7" alt="Avatar" />
                <div>
                    <strong style="cursor: pointer; color: #bdc3c7;">${
                      post.fullName
                    }</strong><br />
                     <small style="color: #bdc3c7;">${formatTimeAgo(
                       post.uploadDate
                     )}</small>
                </div>

              </div>
                <!-- Bao toàn bộ nút và menu vào .dropdown -->
<div class="dropdown">
  <!-- Nút ba chấm -->
  <div
    class="rounded-circle contact-icon d-flex justify-content-center align-items-center ms-2"
    role="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <i class="bi bi-three-dots"></i>
  </div>

  <!-- Menu nhỏ hiện ra khi bấm -->
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
<li>
  <button
    class="dropdown-item d-flex align-items-center text-danger"
    onclick="showDeletePostModal(${post.postId})"
    type="button"
    style="background-color: #ffffff; color: #dc3545;"
  >
    <i class="bi bi-trash-fill me-2"></i>
    <span>Xóa Post</span>
  </button>
</li>
<li>
  <button
    class="dropdown-item d-flex align-items-center text-primary"
    onclick="showUpdatePostModal(${post.postId})"
    type="button"
    style="background-color: #ffffff; color: #0d6efd;"
  >
    <i class="bi bi-pencil-square me-2"></i>
    <span>Update Content</span>
  </button>
</li>

  </ul>
</div>


            </div>
      <p class="post-text" style="color: #bdc3c7;">${post.content}</p>


      ${renderImages(post.photosUrl, post.postId)}
      ${renderVideosHTML(post.videosUrl)}

      <div class="d-flex justify-content-around mt-3 border-top pt-2 position-relative">
        <div class="like-wrapper position-relative w-100 me-1">
          <button class="btn btn-light w-100 btn-action"  style="font-weight: bold; color: #65676b; font-size:15px;"
          id="like-btn-home-${post.postId}">
            <i class="bi bi-hand-thumbs-up"></i> Like
          </button>
                              <div
                      class="reaction-popup d-flex gap-2 rounded-5 shadow border"
                    >
                      <span class="icon" data-emotion="LIKE">
                        <img
                          src="../images/Animation/like.gif"
                          alt="Like"
                          class="reaction-img"
                        />
                      </span>
                      <span class="icon" data-emotion="LOVE"
                        ><img
                          src="../images/Animation/Emojis - Love (1).gif"
                          alt=""
                          style="width: 40px; height: 40px"
                      /></span>
                      <span class="icon" data-emotion="HAHA"
                        ><img
                          src="../images/Animation/smiley emoji 2.gif"
                          alt=""
                          style="width: 50px; height: 50px"
                      /></span>
                      <span class="icon" data-emotion="WOW"
                        ><img
                          src="../images/Animation/Emojis - Wow.gif"
                          alt=""
                          style="width: 40px; height: 40px"
                      /></span>
                      <span class="icon" data-emotion="SAD"
                        ><img
                          src="../images/Animation/Sad Emoji.gif"
                          alt=""
                          style="width: 50px; height: 50px"
                      /></span>
                      <span class="icon" data-emotion="ANGRY"
                        ><img
                          src="../images/Animation/Angry emoji.gif"
                          alt=""
                          style="width: 35px; height: 35px"
                      /></span>
                    </div>
        </div>
        <button class="btn btn-light w-100 me-1 btn-action toggle-comment" data-post-id="${
          post.postId
        }"   onclick="openAllImagesModal('${post.postId}')"
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
  }
  return html;
}

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

// openImageModal
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
    resetModalState(); // Reset UI
    renderPostToModal(srcImg, post); // Hiển thị
    fetchReactionState(postId);
    // 👉 Logic xử lý kết nối WebSocket

    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        console.log("🔌 Ngắt kết nối cũ để kết nối lại với postId mới");
        // connect(postId);
        connectComment(postId);
      });
    } else {
      // connect(postId);
      connectComment(postId);
    }
  } catch (error) {
    console.error("Lỗi load chi tiết bài viết:", error);
    alert("Không thể tải nội dung bài viết");
  }
}

function renderPostToModal(srcImg, post) {
  console.log(post);
  const profile_image = document.getElementById("profile_image");
  const modalImg = document.getElementById("modalImage");
  const userName = document.getElementById("post-userName");
  const postTime = document.getElementById("postTime");
  const postContent = document.getElementById("postContentID");

  // Cập nhật nội dung modal
  modalImg.src = srcImg;
  userName.textContent = post.data.fullName || "Ẩn danh";
  postTime.textContent = formatTimeAgo(post.data.uploadDate);
  postContent.textContent = post.data.content;

  // Avatar người đăng
  const avatar =
    post.data.profilePicture?.trim() && post.data.profilePicture !== "null"
      ? post.data.profilePicture
      : "../images/user-default.webp";
  profile_image.src = avatar;

  // Lưu postId và userId nếu cần cho like/comment
  const modal = document.getElementById("imageModal");
  modal.setAttribute("data-post-id", post.data.postId);
  modal.setAttribute("data-user-id", post.data.userId);
  modal.querySelector(".like-btn").id = `like-btn-${post.data.postId}`;

  // Ẩn icon AI nếu có
  const aiIcon = document.getElementById("ai");
  if (aiIcon) {
    aiIcon.style.display = "none";
  }

  // Hiển thị modal
  const imageModal = new bootstrap.Modal(modal);
  imageModal.show();
}
document
  .getElementById("imageModal")
  .addEventListener("hidden.bs.modal", function () {
    const aiIcon = document.getElementById("ai");
    if (aiIcon) {
      aiIcon.style.display = "block";
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("sendCommentBtn")
    .addEventListener("click", sendComment);
});

function resetModalState() {
  // Reset modal ảnh từng post (imageModal)
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

  // Reset comment list
  const commentList = document.getElementById("commentList");
  if (commentList) commentList.innerHTML = "";

  // Reset ô nhập comment
  const commentInput = document.getElementById("commentInput");
  if (commentInput) commentInput.value = "";

  // Reset nút cảm xúc
  const likeBtn = document.querySelector(".like-btn");
  if (likeBtn) {
    likeBtn.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Like`;
    likeBtn.classList.remove("active");
  }
}

// function updateLikeButton(postId, emotionName) {
//   const btnHome = document.getElementById(`like-btn-home-${postId}`);
//   const btnModal = document.getElementById(`like-btn-${postId}`);

//   if (emotionName) {
//     const html = `<span>${emotionMap[emotionName].icon} ${emotionMap[emotionName].label}</span>`;
//     const color = emotionMap[emotionName].color;

//     if (btnHome) {
//       btnHome.innerHTML = html;
//       btnHome.style.color = color;
//     }
//     if (btnModal) {
//       btnModal.innerHTML = html;
//       btnModal.style.color = color;
//     }
//   } else {
//     const defaultHTML = `<i class="bi bi-hand-thumbs-up"></i> Like`;

//     if (btnHome) {
//       btnHome.innerHTML = defaultHTML;
//       btnHome.style.color = "";
//     }
//     if (btnModal) {
//       btnModal.innerHTML = defaultHTML;
//       btnModal.style.color = "";
//     }
//   }
// }

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

document.addEventListener("click", function (e) {
  if (e.target.closest(".toggle-comment")) {
    const button = e.target.closest(".toggle-comment");
    const postId = button.getAttribute("data-post-id");
    console.log(postId);
    openAllImagesModal(postId);
  }
});

async function openAllImagesModal(postId) {
  try {
    const res = await fetch(`http://localhost:8080/api/post/${postId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Không thể lấy chi tiết bài viết");

    const data = await res.json();
    console.log("📥 JSON nhận được:", data); // 👉 log ở đây

    // Gán thông tin user
    const avatarEl = document.getElementById("allImagesAvatar");
    const nameEl = document.getElementById("allImagesName");
    const timeEl = document.getElementById("allImagesTime");
    const contentEl = document.getElementById("allImagesContent");

    avatarEl.src =
      data.data.profilePicture?.trim() && data.data.profilePicture !== "null"
        ? data.data.profilePicture
        : "../images/user-default.webp";
    nameEl.textContent = data.data.fullName;
    timeEl.textContent = formatTimeAgo(data.data.uploadDate);
    contentEl.textContent = data.data.content || "";

    // Gán ảnh
    const grid = document.getElementById("allImagesGrid");
    grid.innerHTML = ""; // reset

    if (data.data.photosUrl && data.data.photosUrl.length > 0) {
      grid.innerHTML = renderPhotosHTML(data.data.photosUrl);
    }

    // Gán phần video (nếu có)
    const videoGrid = document.getElementById("allVideosGrid");
    videoGrid.innerHTML = ""; // reset

    if (data.data.videosUrl && data.data.videosUrl.length > 0) {
      videoGrid.innerHTML = renderVideosHTML(data.data.videosUrl);
    }

    // Ẩn/hiện khung nếu không có ảnh & không có video
    const hasMedia =
      (data.data.photosUrl && data.data.photosUrl.length > 0) ||
      (data.data.videosUrl && data.data.videosUrl.length > 0);

    const mediaWrapper = document.getElementById("mediaWrapper");
    if (!hasMedia) {
      mediaWrapper.style.display = "none";
    } else {
      mediaWrapper.style.display = "block";
    }

    // Reset phần bình luận
    resetModalState(); // hàm này bạn đã có để reset comment hoặc reply state

    // Mở modal ảnh
    const modal = new bootstrap.Modal(
      document.getElementById("allImagesModal")
    );
    modal.show();

    // Gọi socket và reaction
    connectComment(postId); // kết nối socket bình luận riêng post này
    fetchReactionState(postId); // gọi lại trạng thái cảm xúc nếu có
  } catch (err) {
    console.error("❌ Lỗi khi mở modal tất cả ảnh:", err);
    alert("Không thể mở chi tiết bài viết");
  }
}

function renderPhotosHTML(photos) {
  if (photos.length === 1) {
    return `
      <div class="post-images-grid single-image mb-2">
      <img src="${photos[0]}" style="width: 666px; height: 100%; object-fit: cover;" />
      </div>
    `;
  }

  if (photos.length === 2) {
    return `
    <div class="post-images-grid mb-2" style="max-width: 700px; margin: auto; display: flex; flex-direction: row; gap: 4px; height: 500px;">
      <div style="flex: 1; overflow: hidden; border-radius: 8px;">
        <img src="${photos[0]}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="flex: 1; overflow: hidden; border-radius: 8px;">
        <img src="${photos[1]}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    </div>
  `;
  }

  if (photos.length === 3) {
    return `
    <div class="post-images-grid mb-2" style="display: flex; flex-direction: column; gap: 4px; max-width: 700px; margin: auto;">
      
      <!-- Ảnh đầu tiên -->
      <div style="width: 100%; height: 400px; overflow: hidden; border-radius: 8px;">
        <img src="${photos[0]}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      
      <!-- 2 ảnh dưới -->
      <div style="display: flex; gap: 4px; height: 300px;">
        <div style="flex: 1; overflow: hidden; border-radius: 8px;">
          <img src="${photos[1]}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1; overflow: hidden; border-radius: 8px;">
          <img src="${photos[2]}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      </div>

    </div>
  `;
  }

  const limitedPhotos = photos.slice(0, 4);
  return `
  <div class="post-images-grid mb-2" style="max-width: 700px; margin: auto; display: flex; flex-direction: column; gap: 4px;">
    <div style="display: flex; gap: 4px; height: 240px;">
      <div style="flex: 1; overflow: hidden; border-radius: 8px;">
        <img src="${
          limitedPhotos[0]
        }" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="flex: 1; overflow: hidden; border-radius: 8px;">
        <img src="${
          limitedPhotos[1]
        }" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    </div>
    <div style="display: flex; gap: 4px; height: 240px;">
      <div style="flex: 1; overflow: hidden; border-radius: 8px;">
        <img src="${
          limitedPhotos[2]
        }" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="flex: 1; overflow: hidden; border-radius: 8px; position: relative;">
        <img src="${
          limitedPhotos[3]
        }" style="width: 100%; height: 100%; object-fit: cover;" />
        ${
          photos.length > 4
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
  return videos
    .map(
      (url) => `
    <div class="fb-video-row">
      <video controls class="fb-video" style="width: 100%; max-height: 450px; border-radius: 8px;">
        <source src="${url}" type="video/mp4" />
        Trình duyệt không hỗ trợ video.
      </video>
    </div>
  `
    )
    .join("");
}

let postIdToDelete = null;

function showDeletePostModal(postId) {
  postIdToDelete = postId;
  const modal = new bootstrap.Modal(document.getElementById("deletePostModal"));
  modal.show();
}

document.getElementById("btn-confirm-delete-post").onclick = async function () {
  if (!postIdToDelete) return;
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      `http://localhost:8080/api/post/delete?postId=${postIdToDelete}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    if (res.status === 204) {
      // Thành công, không có nội dung trả về
      bootstrap.Modal.getInstance(
        document.getElementById("deletePostModal")
      ).hide();
      setTimeout(() => {
        const btnCreatePost = document.getElementById("btn-create-post");
        if (btnCreatePost) {
          btnCreatePost.focus();
        } else {
          document.body.focus();
        }
      }, 300);
      // Xóa post khỏi giao diện
      const postDiv = document.querySelector(
        `[data-post-id='${postIdToDelete}']`
      );
      if (postDiv) postDiv.remove();
      alert("Đã xóa bài viết!");
    } else {
      // Nếu không phải 204, thử parse JSON như cũ
      const text = await res.text();
      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch (e) {
        json = {};
      }
      if (json.success) {
        bootstrap.Modal.getInstance(
          document.getElementById("deletePostModal")
        ).hide();
        setTimeout(() => {
          const btnCreatePost = document.getElementById("btn-create-post");
          if (btnCreatePost) {
            btnCreatePost.focus();
          } else {
            document.body.focus();
          }
        }, 300);
        const postDiv = document.querySelector(
          `[data-post-id='${postIdToDelete}']`
        );
        if (postDiv) postDiv.remove();
        alert("Đã xóa bài viết!");
      } else {
        alert(json.message || "Xóa bài viết thất bại!");
      }
    }
  } catch (err) {
    alert("Lỗi khi xóa bài viết!");
    console.error(err);
  }
  postIdToDelete = null;
};
