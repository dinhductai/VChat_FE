token = localStorage.getItem("accessToken");
function openCommentModal(author, time, content, imageSrc) {
  document.getElementById("modal-author").textContent = author;
  document.getElementById("modal-time").textContent = time;
  document.getElementById("modal-content").textContent = content;
  document.getElementById("modal-image").src = imageSrc;
  const modal = new bootstrap.Modal(document.getElementById("commentModal"));
  modal.show();
}

// Mở modal đăng bài không có ảnh
function openPostModal() {
  document.getElementById("postContent").value = "";
  document.getElementById("fileInput").value = "";
  document.getElementById("imagePreviewContainer").innerHTML = "";

  const modal = new bootstrap.Modal(document.getElementById("postModal"));
  modal.show();
  const container = document.getElementById("imagePreviewContainer");
  container.classList.add("d-none");
}

function triggerFileInputAndOpenModal() {
  const input = document.getElementById("fileInput");

  // Xóa dữ liệu cũ
  document.getElementById("postContent").value = "";
  document.getElementById("imagePreviewContainer").innerHTML = "";

  // Gọi click để chọn ảnh
  input.click();

  // Gắn sự kiện chỉ 1 lần nếu chưa có
  if (!input.dataset.listenerAttached) {
    input.addEventListener("change", function () {
      handleMultipleImages(this); // Hiển thị ảnh preview
      const modal = new bootstrap.Modal(document.getElementById("postModal"));
      modal.show();
    });
    input.dataset.listenerAttached = "true";
  }
}
function handleMultipleImages(input) {
  const container = document.getElementById("imagePreviewContainer");
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
function setPrivacy(value) {
  const label = document.getElementById("privacyLabel");
  const icon = document.querySelector("#privacyDropdown i");
  const input = document.getElementById("privacyValue");

  // Gán giá trị
  input.value = value;

  // Đổi label và icon
  if (value === "public") {
    label.innerText = "Public";
    icon.className = "bi bi-globe me-1";
  } else {
    label.innerText = "Private";
    icon.className = "bi bi-lock-fill me-1";
  }
}

fetch("http://localhost:8080/api/user-name-profile", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token, // Chỉ thêm nếu token tồn tại
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Lỗi khi lấy thông tin người dùng");
    }
    return response.json();
  })
  .then((data) => {
    const profileUrl = data.data.profileUrl || "../images/user-default.webp";
    const fullName = data.data.fullName || "Người dùng";

    // Gán avatar
    document.querySelectorAll(".userAvatar").forEach((el) => {
      el.src = profileUrl;
    });

    // Gán tên
    document.querySelectorAll(".userName").forEach((el) => {
      el.textContent = fullName;
    });

    console.log(fullName);
    console.log(data);
  })
  .catch((error) => {
    console.error("Lỗi:", error);
  });
