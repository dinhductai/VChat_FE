document.querySelectorAll(".story-item:not(.add-story)").forEach((item) => {
  item.addEventListener("click", () => {
    alert("Đang mở story của " + item.querySelector("p").innerText);
    // Bạn có thể mở modal hoặc chuyển trang ở đây
  });
});

const storyContainer = document.getElementById("storyContainer");
const scrollLeftBtn = document.getElementById("scrollLeftBtn");
const scrollRightBtn = document.getElementById("scrollRightBtn");

const updateScrollButtons = () => {
  // Nếu đang ở đầu thì ẩn nút trái
  if (storyContainer.scrollLeft === 0) {
    scrollLeftBtn.style.display = "none";
  } else {
    scrollLeftBtn.style.display = "block";
  }
};

// ✅ Bấm nút trái thì về đầu luôn
scrollLeftBtn.addEventListener("click", () => {
  storyContainer.scrollTo({ left: 0, behavior: "smooth" });
  setTimeout(updateScrollButtons, 300);
});

// Cập nhật nút khi scroll thủ công
storyContainer.addEventListener("scroll", updateScrollButtons);

// Ban đầu ẩn nút trái
updateScrollButtons();

const storyItem = document.querySelector(".story-item-wrapper"); // class bao quanh 1 story
const scrollAmount = storyItem.offsetWidth * 4;

scrollRightBtn.addEventListener("click", () => {
  storyContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
  setTimeout(updateScrollButtons, 300);
});

function goStory(el) {
  const postId = el.getAttribute("data-post-id");
  const avatar = el.querySelector(".story-avatar");
  const index = el.getAttribute("data-index");
  localStorage.setItem("currentStoryIndex", index);
  // Đổi border
  if (avatar) {
    avatar.classList.remove("border-primary");
    avatar.classList.add("border-secondary");
  }

  // Lưu trạng thái đã xem vào localStorage
  if (postId) {
    const viewedStories = JSON.parse(
      localStorage.getItem("viewedStories") || "[]"
    );
    if (!viewedStories.includes(postId)) {
      viewedStories.push(postId);
      localStorage.setItem("viewedStories", JSON.stringify(viewedStories));
    }
  }

  // Chuyển trang sau 100ms
  setTimeout(() => {
    window.location.href = "story.html";
  }, 100);
}

function makeStory() {
  window.location.href = "tao_tin.html"; // hoặc '/index.html' nếu cần
}

window.addEventListener("DOMContentLoaded", () => {
  const viewedStories = JSON.parse(
    localStorage.getItem("viewedStories") || "[]"
  );

  document.querySelectorAll(".story").forEach((el) => {
    const postId = el.getAttribute("data-post-id");
    const avatar = el.querySelector(".story-avatar");

    if (viewedStories.includes(postId) && avatar) {
      avatar.classList.remove("border-primary");
      avatar.classList.add("border-secondary");
    }
  });
});
