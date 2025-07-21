token = localStorage.getItem("accessToken");
// gửi bài viết
function submitPost() {
  const content = document.getElementById("postContent").value;
  const privacy = document.getElementById("privacyValue").value;
  const userEmail = "olivia@example.com";
  const files = document.getElementById("fileInput").files;

  const postBtn = document.getElementById("postBtn");
  const postBtnText = document.getElementById("postBtnText");
  const postBtnSpinner = document.getElementById("postBtnSpinner");

  // ✅ Bật loading
  postBtn.disabled = true;
  postBtnText.textContent = "Đang đăng...";
  postBtnSpinner.classList.remove("d-none");

  const formData = new FormData();
  formData.append("content", content);
  formData.append("userEmail", userEmail);
  formData.append("isPublic", privacy === "public");

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith("image/")) {
      formData.append("listImage", file);
    } else if (file.type.startsWith("video/")) {
      formData.append("listVideo", file);
    }
  }

  fetch("http://localhost:8080/api/post/create", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Lỗi khi gửi bài viết");
      return response.json();
    })
    .then((data) => {
      console.log("thong tin post: ");
      console.log(data.data);
      const postContainer = document.getElementById("postContainer");

      // ✅ Dòng cần viết ở đây:
      const html = renderPost(data.data, false); // không tự chèn
      postContainer.insertAdjacentHTML("afterbegin", html); // tự chèn vào đầu

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("postModal")
      );
      modal.hide();

      // Hiện modal thông báo thành công
      document.getElementById("customSuccessModal").classList.remove("d-none");
      // ✅ Reset form sau khi đăng
      document.getElementById("postContent").value = "";
      document.getElementById("fileInput").value = "";
      document.getElementById("imagePreviewContainer").innerHTML = "";
    })
    .catch((error) => {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra khi đăng bài viết");
    })
    .finally(() => {
      // ✅ Tắt loading
      postBtn.disabled = false;
      postBtnText.textContent = "Đăng";
      postBtnSpinner.classList.add("d-none");
    });
}

function closeSuccessModal() {
  document.getElementById("customSuccessModal").classList.add("d-none");
}

let currentPage = 0;
const pageSize = 4;
let isLoading = false;
let isLastPage = false;

const postContainer = document.getElementById("postContainer");
const loadingSpinner = document.getElementById("loading");

// Hàm gọi API lấy post
async function loadPosts() {
  if (isLoading || isLastPage) return;

  isLoading = true;
  loadingSpinner.classList.remove("d-none");

  try {
    const response = await fetch(
      `http://localhost:8080/api/post?page=${currentPage}&size=${pageSize}`,
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
        renderPost(post); // 👈 Hàm hiển thị bài viết
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
  function renderImages(photos) {
    if (!Array.isArray(photos) || photos.length === 0) return "";

    if (photos.length === 1) {
      return `
        <div class="post-images-grid single-image mb-2">
          <img src="${photos[0]}" onclick="openImageModal('${photos[0]}','${post.postId}')" />
        </div>
      `;
    }

    if (photos.length === 2) {
      return `
        <div class="post-images-grid mb-2">
          <div class="row-grid">
           <img style="width: 50%;" src="${photos[0]}" onclick="openImageModal('${photos[0]}','${post.postId}')" />
          <img style="width: 50%;" src="${photos[1]}" onclick="openImageModal('${photos[1]}','${post.postId}')" />
          </div>
        </div>
      `;
    }

    if (photos.length === 3) {
      return `
        <div class="post-images-grid mb-2">
          <div class="row-grid">
            <img src="${photos[0]}" onclick="openImageModal('${photos[0]}','${post.postId}')" />
          </div>
          <div class="row-grid">
            <img src="${photos[1]}" onclick="openImageModal('${photos[1]}','${post.postId}')" />
            <img src="${photos[2]}" onclick="openImageModal('${photos[2]}','${post.postId}')" />
          </div>
        </div>
      `;
    }

    // ≥4 ảnh: grid 2x2, giới hạn 4 ảnh đầu
    const limitedPhotos = photos.slice(0, 4);
    return `
      <div class="post-images-grid mb-2">
        <div class="row-grid">
          <img style="width: 50%;" src="${
            limitedPhotos[0]
          }" onclick="openImageModal('${limitedPhotos[0]}','${post.postId}')" />
          <img style="width: 50%;" src="${
            limitedPhotos[1]
          }" onclick="openImageModal('${limitedPhotos[1]}','${post.postId}')" />
        </div>
        <div class="row-grid">
          <img style="width: 50%;" src="${
            limitedPhotos[2]
          }" onclick="openImageModal('${limitedPhotos[2]}','${post.postId}')" />
          <div style="position: relative; flex: 1">
            <img style="width: 100%; height: 100%" src="${
              limitedPhotos[3]
            }" onclick="openImageModal('${
      limitedPhotos[3]
    }','${user_name}')" style="width: 50%; height: 100%; object-fit: cover; border-radius: 6px;" />
            ${
              photos.length > 4
                ? `<div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    border-radius: 6px;
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
    <div class="post shadow-sm rounded bg-white dark-mode-bg col-10" data-post-id='${
      post.postId
    }'>
       <div class="d-flex justify-content-between">
              <div class="d-flex align-items-center mb-2">
                <img src="${
                  post.profilePicture || "../images/user-default.webp"
                }"
                class="rounded-circle me-2" style="width: 40px; height:
                40px;cursor: pointer; border: 1px solid #bdc3c7" alt="Avatar" />
                <div>
                  <strong style="cursor: pointer">${post.fullName}</strong
                  ><br />
                  <small class="text-muted"
                    >${formatTimeAgo(post.uploadDate)}</small
                  >
                </div>
              </div>
            <div class="d-flex icon-hover rounded-circle" 
                  style="width: 35px; height: 35px; align-items: center; justify-content: center;">
              <i class="bi bi-three-dots"></i>
            </div>
            </div>
      <p class="post-text">${post.content}</p>

      ${renderImages(post.photosUrl, post.postId)}
      ${videoHTML}

      <div class="d-flex justify-content-around mt-3 border-top pt-2 position-relative">
        <div class="like-wrapper position-relative w-100 me-1">
          <button class="btn btn-light w-100 btn-action">
            <i class="bi bi-hand-thumbs-up"></i> Thích
          </button>
        </div>
        <button class="btn btn-light w-100 me-1 btn-action toggle-comment">
          <i class="bi bi-chat-left"></i> Bình luận
        </button>
        <button class="btn btn-light w-100 btn-action">
          <i class="bi bi-share"></i> Chia sẻ
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

    // 👉 Logic xử lý kết nối WebSocket

    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        console.log("🔌 Ngắt kết nối cũ để kết nối lại với postId mới");
        connect(postId);
      });
    } else {
      connect(postId);
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
  // Reset ảnh
  document.getElementById("modalImage").src = "";

  // Reset user info
  document.getElementById("profile_image").src = "../images/user-default.webp";
  document.getElementById("post-userName").textContent = "";
  document.getElementById("postTime").textContent = "";

  // Reset nội dung bài viết
  document.getElementById("postContentID").textContent = "";

  // Reset comment list
  document.getElementById("commentList").innerHTML = "";

  // Reset ô nhập comment
  document.getElementById("commentInput").value = "";

  // Reset nút cảm xúc
  const likeBtn = document.querySelector(".like-btn");
  if (likeBtn) {
    likeBtn.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Like`;
    likeBtn.classList.remove("active");
  }

  // Nếu có popup cảm xúc/emoji khác thì cũng reset ở đây
}
