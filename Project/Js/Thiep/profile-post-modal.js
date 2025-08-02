document.addEventListener("DOMContentLoaded", function () {
  // --- Mở modal và reset form ---
  const btnCreatePost = document.getElementById("btn-create-post");
  const postModal = document.getElementById("postModal");
  const postContent = document.getElementById("postContent");
  const fileInput = document.getElementById("fileInput");
  const imagePreviewContainer = document.getElementById("imagePreviewContainer");
  const privacyDropdown = document.getElementById("privacyDropdown");
  const privacyLabel = document.getElementById("privacyLabel");
  const privacyValue = document.getElementById("privacyValue");
  const postBtn = document.getElementById("postBtn");
  const postBtnText = document.getElementById("postBtnText");
  const postBtnSpinner = document.getElementById("postBtnSpinner");

  // Sử dụng lại hàm preview từ model.js
  function handleMultipleImages(input) {
    const container = imagePreviewContainer;
    container.innerHTML = "";

    const files = input.files;
    const count = files.length;

    if (count === 0) {
      container.classList.add("d-none");
      return;
    }

    container.classList.remove("d-none");
    container.className = "media-grid mt-3";

    // Thêm class lưới giống Facebook
    if (count === 1) container.classList.add("grid-1");
    else if (count === 2) container.classList.add("grid-2");
    else if (count === 3) container.classList.add("grid-3");
    else if (count === 4) container.classList.add("grid-4");
    else container.classList.add("grid-5");

    const maxDisplay = 5;

    for (let i = 0; i < Math.min(count, maxDisplay); i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);

      let mediaElement;
      if (file.type.startsWith("image/")) {
        mediaElement = document.createElement("img");
      } else if (file.type.startsWith("video/")) {
        mediaElement = document.createElement("video");
        mediaElement.controls = true;
      }

      mediaElement.src = url;
      mediaElement.style.width = "100%";
      mediaElement.style.height = "100%";
      mediaElement.style.objectFit = "cover";
      mediaElement.style.borderRadius = "8px";
      container.appendChild(mediaElement);
    }

    // Nếu có nhiều hơn 5, thêm overlay ở ảnh cuối
    if (count > maxDisplay) {
      const overlay = document.createElement("div");
      overlay.textContent = `+${count - maxDisplay}`;
      Object.assign(overlay.style, {
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        backgroundColor: "rgba(0,0,0,0.5)",
        color: "white",
        fontSize: "36px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        zIndex: 10,
      });

      const lastChild = container.lastChild;
      lastChild.style.position = "relative";
      lastChild.style.zIndex = "1";
      lastChild.parentElement.style.position = "relative";
      lastChild.parentElement.appendChild(overlay);
    }
  }

  // --- Sự kiện mở modal ---
  if (btnCreatePost) {
    btnCreatePost.onclick = function () {
      // Lấy avatar và tên từ localStorage
      const avatarEl = postModal.querySelector('img.rounded-circle');
      const nameEl = postModal.querySelector('strong');
      if (avatarEl) avatarEl.src = localStorage.getItem("userAvatar") || "../images/OIP.jpg";
      if (nameEl) nameEl.textContent = localStorage.getItem("userFullName") || "Người dùng";

      if (postContent) postContent.value = "";
      if (fileInput) fileInput.value = "";
      if (imagePreviewContainer) imagePreviewContainer.innerHTML = "";
      if (imagePreviewContainer) imagePreviewContainer.classList.add("d-none");
      if (privacyValue) privacyValue.value = "public";
      if (privacyLabel) privacyLabel.innerText = "Public";
      const icon = privacyDropdown ? privacyDropdown.querySelector("i") : null;
      if (icon) icon.className = "bi bi-globe me-1";
      const modal = new bootstrap.Modal(postModal);
      modal.show();
    };
  }

  // --- Sự kiện chọn file để preview ---
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      handleMultipleImages(fileInput);
    });
  }

  // --- Auto resize textarea ---
  if (postContent) {
    postContent.addEventListener("input", function () {
      postContent.style.height = "auto";
      postContent.style.height = postContent.scrollHeight + "px";
    });
  }

  // --- Chọn chế độ hiển thị ---
  window.setPrivacy = function (value) {
    if (!privacyLabel || !privacyDropdown || !privacyValue) return;
    privacyValue.value = value;
    if (value === "public") {
      privacyLabel.innerText = "Public";
      privacyDropdown.querySelector("i").className = "bi bi-globe me-1";
    } else {
      privacyLabel.innerText = "Private";
      privacyDropdown.querySelector("i").className = "bi bi-lock-fill me-1";
    }
  };

  // --- Gửi bài viết ---
  window.submitPost = function () {
    const content = postContent ? postContent.value.trim() : "";
    const files = fileInput ? fileInput.files : [];
    const privacy = privacyValue ? privacyValue.value : "public";

    if (!content && files.length === 0) {
      alert("Bài viết phải có nội dung hoặc ảnh/video!");
      return;
    }

    // Tạo FormData
    const formData = new FormData();
    formData.append("content", content);
    formData.append("privacy", privacy);

    // Gửi đúng key cho backend
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        formData.append("listImage", file);
      } else if (file.type.startsWith("video/")) {
        formData.append("listVideo", file);
      }
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    // Hiển thị loading
    if (postBtnSpinner) postBtnSpinner.classList.remove("d-none");
    if (postBtnText) postBtnText.textContent = "Đang đăng...";
    if (postBtn) postBtn.disabled = true;

    fetch("http://localhost:8080/api/post/create", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((json) => {
        if (postBtnSpinner) postBtnSpinner.classList.add("d-none");
        if (postBtnText) postBtnText.textContent = "Post";
        if (postBtn) postBtn.disabled = false;
        if (json.success) {
          alert("Đăng bài thành công!");
          // Đóng modal
          const modal = bootstrap.Modal.getInstance(postModal);
          if (modal) modal.hide();
          // Reset form
          if (postContent) postContent.value = "";
          if (fileInput) fileInput.value = "";
          if (imagePreviewContainer) imagePreviewContainer.innerHTML = "";
          if (imagePreviewContainer) imagePreviewContainer.classList.add("d-none");
        } else {
          alert("Đăng bài thất bại!");
        }
      })
      .catch((err) => {
        if (postBtnSpinner) postBtnSpinner.classList.add("d-none");
        if (postBtnText) postBtnText.textContent = "Post";
        if (postBtn) postBtn.disabled = false;
        alert("Lỗi khi đăng bài!");
        console.error(err);
      });
  };
});