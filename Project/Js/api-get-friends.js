const token = localStorage.getItem("accessToken");

fetch("http://localhost:8080/api/user-matches?page=0&size=4", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
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
    const friendList = document.getElementById("friendList");

    // Giả sử dữ liệu trả về là { content: [...], ... }
    const users = data.data; // fallback nếu không có `content`

    users.forEach((friend) => {
      const div = document.createElement("div");
      div.className = "d-flex user-hover px-2 py-2 rounded";
      div.innerHTML = `
        <img
          src="${friend.photoUrl || "../images/default-avatar.jpg"}"
          alt="${friend.fullName || "Không rõ"}"
          style="height: 40px; width: 40px; margin-right: 10px"
          class="rounded-circle"
        />
        <p class="my-auto mx-0">${
          friend.fullName || friend.name || "Tên không xác định"
        }</p>
      `;
      friendList.appendChild(div);
    });

    console.log("Danh sách bạn bè:", users);
  })
  .catch((error) => {
    console.error("Lỗi:", error);
  });
