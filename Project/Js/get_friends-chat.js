const token = localStorage.getItem("accessToken");
console.log("Token:", token);

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
        const chatBox = document.getElementById("chatBox");
        chatBox.style.display = "block";
        chatBox.dataset.friendId = friend.id;

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
document.getElementById("chatInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const message = e.target.value.trim();
    if (message === "") return;

    const friendId = document.getElementById("chatBox").dataset.friendId;

    const msgDiv = document.createElement("div");
    msgDiv.className = "text-end mb-1";
    msgDiv.innerHTML = `<span class="bg-primary text-white px-2 py-1 rounded">${message}</span>`;
    document.getElementById("chatMessages").appendChild(msgDiv);

    e.target.value = "";

    // TODO: Gửi message qua API POST /api/messages/send với friendId và message
  }
});
