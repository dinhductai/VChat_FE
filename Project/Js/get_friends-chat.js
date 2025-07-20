token = localStorage.getItem("accessToken");
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
        <div class="friend-hover-item align-items-center d-flex py-2 rounded-2">
          <img src="${avatar}" class="rounded-circle d-block mx-2"
               style="width: 40px; height: 40px; object-fit: cover;border: 1px solid #bdc3c7;
" />
            <h6 class="mx-2">
              ${friend.fullName || "Không rõ"}
            </h6>
        </div>
      `;

      friendList.appendChild(div);
    });
  })
  .catch((error) => {
    console.error("Lỗi:", error);
  });
