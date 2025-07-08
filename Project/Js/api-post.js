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
      Authorization:
        "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxNiIsInNjb3BlIjoiQURNSU4gbnVsbCIsImlzcyI6IndlYnNpdGUuY29tIiwiZXhwIjoxNzUxOTAyNjE3LCJpYXQiOjE3NTE4OTkwMTcsImp0aSI6ImEzODcxNmI3LTQ4ZjYtNDlkOS04YWU1LTY0OTE0MmY0YjQxOCIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIn0.RM0MbiAseMQ4zVoXbnDjhAfg2wgba8NyzAllUGZHTQEJLm2m7ClROTANaoTTl_r9nydT52d2nNGBc3sTs6HuSA",
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Lỗi khi gửi bài viết");
      return response.json();
    })
    .then((data) => {
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
          Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxNiIsInNjb3BlIjoiQURNSU4gbnVsbCIsImlzcyI6IndlYnNpdGUuY29tIiwiZXhwIjoxNzUxOTAyMDA0LCJpYXQiOjE3NTE4OTg0MDQsImp0aSI6ImE3MTE2YmQ2LWJkYzAtNDIxYy1iY2FlLThkY2U3MzFjODU0ZSIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIn0.t6dvGhVh8ttw7um2zbM6UHOfhwD1TbI8eD4q6kw0SfU3qNTBj5j9Hiur29CS7aXs5HLqKuvs-U_K4tDbNPyMRw`, // JWT của bạn
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
function renderPost(post) {
  const postContainer = document.getElementById("postContainer");

  // Hàm xử lý hiển thị ảnh theo số lượng
  function renderImages(photos) {
    if (!Array.isArray(photos) || photos.length === 0) return "";

    if (photos.length === 1) {
      return `
        <div class="post-images-grid single-image mb-2">
          <img src="${photos[0]}" onclick="openImageModal('${photos[0]}')" />
        </div>
      `;
    }

    if (photos.length === 2) {
      return `
        <div class="post-images-grid mb-2">
          <div class="row-grid">
           <img style="width: 50%;" src="${photos[0]}" onclick="openImageModal('${photos[0]}')" />
          <img style="width: 50%;" src="${photos[1]}" onclick="openImageModal('${photos[1]}')" />
          </div>
        </div>
      `;
    }

    if (photos.length === 3) {
      return `
        <div class="post-images-grid mb-2">
          <div class="row-grid">
            <img src="${photos[0]}" onclick="openImageModal('${photos[0]}')" />
          </div>
          <div class="row-grid">
            <img src="${photos[1]}" onclick="openImageModal('${photos[1]}')" />
            <img src="${photos[2]}" onclick="openImageModal('${photos[2]}')" />
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
          }" onclick="openImageModal('${limitedPhotos[0]}')" />
          <img style="width: 50%;" src="${
            limitedPhotos[1]
          }" onclick="openImageModal('${limitedPhotos[1]}')" />
        </div>
        <div class="row-grid">
          <img style="width: 50%;" src="${
            limitedPhotos[2]
          }" onclick="openImageModal('${limitedPhotos[2]}')" />
          <div style="position: relative; flex: 1">
            <img style="width: 100%; height: 100%" src="${
              limitedPhotos[3]
            }" onclick="openImageModal('${
      limitedPhotos[3]
    }')" style="width: 50%; height: 100%; object-fit: cover; border-radius: 6px;" />
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
  const html = `
    <div class="post shadow-sm p-3 rounded mb-3 bg-white dark-mode-bg col-10">
      <div class="d-flex align-items-center mb-2">
        <img
          src="${post.profilePicture || "../images/OIP.jpg"}"
          class="rounded-circle me-2"
          style="width: 40px; height: 40px"
          alt="Avatar"
        />
        <div>
          <strong>${post.fullName}</strong><br />
          <small class="text-muted">${formatTimeAgo(post.uploadDate)}</small>
        </div>
      </div>

      <p class="post-text">${post.content}</p>

      ${renderImages(post.photosUrl || [])}
      ${videoHTML}

      <div class="d-flex justify-content-around mt-3 border-top pt-2 position-relative">
        <div class="like-wrapper position-relative w-100 me-1">
          <button class="btn btn-light w-100 btn-action like-btn">
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

  postContainer.insertAdjacentHTML("beforeend", html);
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
