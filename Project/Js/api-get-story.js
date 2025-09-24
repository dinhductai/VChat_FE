function loadStories() {
  const token = localStorage.getItem("accessToken");

  fetch("http://localhost:8080/api/story?page=0&size=9", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token, // nếu API yêu cầu
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Lỗi HTTP: " + res.status);
      }
      return res.json();
    })
    .then((result) => {
      console.log("Stories:", result);

      const storyList = document.getElementById("storyList");
      if (!storyList) {
        console.error("Không tìm thấy #storyList trong DOM");
        return;
      }

      const stories = result.data.content;
      localStorage.setItem("allStories", JSON.stringify(stories));

      // Xóa dữ liệu cũ trước khi render
      storyList.innerHTML = "";

      stories.forEach((story, index) => {
        let avatar = story.profileUrl;
        const image = story.listStoryPhoto[0];
        const name = story.fullName;
        if (!avatar) {
          avatar = "../images/user-default.webp";
        }
        const html = `
          <div
            class="rounded-3 text-center story-item-wrapper position-relative overflow-hidden pter"
            style="width: 120px; height: 200px; flex: 0 0 auto"
            data-index="${index}"
            onclick="goStory(this)"
          >
            <img
              src="${image}"
              alt="Story"
              style="width: 100%; height: 100%; object-fit: cover"
              class="story-image"
            />
            <img
              src="${avatar}"
              alt="Avatar"
              class="position-absolute top-0 start-0 m-1 rounded-circle border border-4 border-primary story-avatar"
              style="width: 45px; height: 45px; object-fit: cover"
            />
            <div
              class="story-overlay position-absolute bottom-0 start-0 w-100 px-1 py-1"
              style="text-align: left"
            >
              <p class="mb-0 text-white fw-semibold" style="font-size: 13px">${name}</p>
            </div>
          </div>
        `;

        storyList.insertAdjacentHTML("beforeend", html);
      });
    })
    .catch((err) => {
      console.error("Lỗi khi load story:", err);
    });
}

// Tự động chạy khi vào trang
window.addEventListener("DOMContentLoaded", loadStories);
