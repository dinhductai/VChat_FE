token = localStorage.getItem("accessToken");
console.log(token);
fetch("http://localhost:8080/api/user/friends?page=0&size=10", {
  method: "GET",
  headers: {
    Authorization: "Bearer " + token,
  },
})
  .then(async (response) => {
    if (!response.ok) {
      const errorText = await response.text(); // Lấy chi tiết lỗi trả về
      console.error("HTTP Status:", response.status);
      console.error("Chi tiết lỗi:", errorText);
      throw new Error("Lỗi khi lấy thông tin người dùng");
    }
    return response.json();
  })
  .then((data) => {
    const friendList = document.getElementById("friendContainer");
    const users = data.data.content;
    
    users.forEach((friend) => {
      const avatar =
        friend.photoProfile && friend.photoProfile.trim() !== ""
          ? friend.photoProfile
          : "../images/user-default.webp"; // Đường dẫn ảnh mặc định

      const mutual =
        friend.mutualFriends > 0
          ? `<p class="text-muted small">${user.mutualFriends} bạn chung</p>`
          : "";
      const div = document.createElement("div");
      div.className = "col"; // Bootstrap yêu cầu col để card xếp hàng

      div.innerHTML = `
  <div class="card h-100 shadow-sm friend-card text-center border-0">
    <img src="${avatar || "../images/default-avatar.jpg"}"
         class="card-img-top"
         style="height: 180px; object-fit: cover; border-top-left-radius: 8px; border-top-right-radius: 8px;" />
    <div class="card-body p-2">
      <h6 class="card-title mb-1 text-truncate text-start">${
        friend.fullName || "Không rõ"
      }</h6>
      <p class="text-muted small mb-2 text-start">${
        friend.mutualFriends || 0
      } mutual friends</p>
      <button class="btn btn-sm btn-primary w-100 mb-1">Add friend</button>
      <button class="btn btn-sm btn-light w-100 border">Remove</button>
    </div>
  </div>
`;

      friendList.appendChild(div);
    });
  })
  .catch((error) => {
    console.error("Lỗi:", error);
  });
