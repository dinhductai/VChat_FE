fetch("http://localhost:8080/api/user/friends?page=0&size=10", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then(async (response) => {
    if (!response.ok) {
      const errorText = await response.text();
      console.error("HTTP Status:", response.status);
      console.error("Chi tiết lỗi:", errorText);
      throw new Error("Lỗi khi lấy thông tin bạn bè");
    }
    return response.json();
  })
  .then((data) => {
    const friendList = document.getElementById("friendList");
    const users = data?.data?.content || [];

    users.forEach((friend) => {
      const avatar = friend.photoProfile?.trim()
        ? friend.photoProfile
        : "../images/user-default.webp";

      const div = document.createElement("div");
      div.innerHTML = `
        <div class="friend-hover-item align-items-center d-flex py-2 rounded-2" style="cursor: pointer;">
          <img src="${avatar}" class="rounded-circle d-block mx-2"
               style="width: 40px; height: 40px; object-fit: cover; border: 1px solid #bdc3c7;" />
          <h6 class="mx-2 mb-0">
            ${friend.fullName || "Không rõ"}
          </h6>
        </div>
      `;

      // Gán sự kiện click vào phần tử .friend-hover-item
      div.querySelector(".friend-hover-item").addEventListener("click", () => {
        // Hiển thị tên
        // Hiển thị khung chat
        document.getElementById("friendName").textContent = friend.fullName;
        document.getElementById("friendAvatar").src =
          friend.photoProfile || "../images/user-default.webp";
        document.getElementById("friendAvatar").dataset.userId = friend.userId;
        document.getElementById("friendName").dataset.userId = friend.userId;
        const chatBox = document.getElementById("chatBox");
        chatBox.style.display = "block";
        chatBox.dataset.friendId = friend.userId;
        connectWebSocket(() => {
          startChat(); // Gọi sau khi kết nối thành công
        });
        // Reset tin nhắn cũ (hoặc có thể load từ API)
      });

      friendList.appendChild(div);
    });
  })
  .catch((error) => {
    console.error("Lỗi:", error);
  });

// Xử lý nút đóng chat
document.getElementById("closeChatBtn").addEventListener("click", () => {
  document.getElementById("chatBox").style.display = "none";
});

// Gửi tin nhắn khi nhấn Enter
document.getElementById("chatInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Bấm avatar trong chat → sang trang cá nhân
document.getElementById("friendAvatar").addEventListener("click", function () {
  const id = this.dataset.userId;
  if (id) {
    window.location.href = `other-profile.html?user-id=${id}`;
  }
});

// Bấm tên trong chat → sang trang cá nhân
document.getElementById("friendName").addEventListener("click", function () {
  const id = this.dataset.userId;
  if (id) {
    window.location.href = `other-profile.html?user-id=${id}`;
  }
});
