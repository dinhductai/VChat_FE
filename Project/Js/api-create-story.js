token = localStorage.getItem("accessToken");
fetch("http://localhost:8080/api/user-name-profile", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    // Nếu cần token thì thêm:
    Authorization: "Bearer " + token,
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Lỗi khi lấy thông tin người dùng");
    }
    return response.json();
  })
  .then((data) => {
    document.getElementById("userAvatar").src =
      data.data.profileUrl || "../images/user-default.webp";
    console.log(data.data.profileUrl);
    document.getElementsByClassName("userName").textContent =
      data.data.fullName || "Người dùng";
    console.log(data.data.fullName);

    console.log(data);
  })
  .catch((error) => {
    console.error("Lỗi:", error);
  });

function handleFile(files) {
  if (files.length === 0) return;

  const file = files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const img = document.getElementById("storyPreviewImg");
    img.src = e.target.result;

    // Ẩn khung chọn ảnh
    document.getElementById("storySelectBox").classList.add("d-none");

    // Hiện preview
    document.getElementById("storyPreviewBox").classList.remove("d-none");

    // Hiện các nút bên trái
    document.getElementById("storyActionButtons").classList.remove("d-none");
  };

  reader.readAsDataURL(file);
}

function discardStory() {
  document.getElementById("fileInput").value = "";
  document.getElementById("storyPreviewImg").src = "";
  document.getElementById("storyPreviewBox").classList.add("d-none");
  document.getElementById("storySelectBox").classList.remove("d-none");
  document.getElementById("storyActionButtons").classList.add("d-none");
}

function shareStory() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Vui lòng chọn ảnh trước khi đăng story.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file); // key 'photo' đúng theo backend yêu cầu

  fetch("http://localhost:8080/api/story/create", {
    method: "POST",
    body: formData,
    headers: {
      // Nếu cần token thì thêm:
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Lỗi server");
      return res.json();
    })
    .then((data) => {
      alert("Đăng story thành công!");
      // Có thể reset lại form tại đây
      location.reload();
    })
    .catch((err) => {
      console.error(err);
      alert("Đăng story thất bại.");
    });
}
