token = localStorage.getItem("accessToken");
fetch("http://localhost:8080/api/story?page=0&size=9", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    // Nếu cần token thì thêm:
    Authorization: "Bearer " + token,
  },
})
  .then((res) => res.json())
  .then((result) => {
    console.log(result);
    const storyList = document.getElementById("storyList");
    const stories = result.data.content;
    localStorage.setItem("allStories", JSON.stringify(stories));

    stories.forEach((story, index) => {
      const avatar = story.profileUrl;
      const image = story.listStoryPhoto[0];
      const name = story.fullName;
      console.log(story);
      const html = `
        <div
          class="rounded-3 text-center story-item-wrapper position-relative overflow-hidden pter"
          style="width: 120px; height: 200px; flex: 0 0 auto"
          data-index="${index}"
          onclick="goStory(this)"
        >
          <img
            src="${image}"
            alt=""
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
