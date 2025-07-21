const emotionMap = {
  LIKE: {
    icon: '<i class="fa-solid fa-thumbs-up"></i>',
    label: "Like",
    color: "#0d6efd",
  },
  LOVE: {
    icon: '<i class="fa-solid fa-heart"></i>',
    label: "Love",
    color: "#dc3545",
  },
  HAHA: {
    icon: '<i class="fa-solid fa-face-laugh-squint"></i>',
    label: "Haha",
    color: "#ffc107",
  },
  WOW: {
    icon: '<i class="fa-solid fa-face-surprise"></i>',
    label: "Wow",
    color: "#ffc107",
  },
  SAD: {
    icon: '<i class="fa-solid fa-face-sad-tear"></i>',
    label: "Sad",
    color: "#6c757d",
  },
  ANGRY: {
    icon: '<i class="fa-solid fa-face-angry"></i>',
    label: "Angry",
    color: "#fd7e14",
  },
};

let currentReaction = null;

document.querySelectorAll(".icon").forEach((icon) => {
  icon.addEventListener("click", async () => {
    const emotion = icon.getAttribute("data-emotion");
    const modal = document.getElementById("imageModal");
    const postId = modal.getAttribute("data-post-id");
    const token = localStorage.getItem("accessToken");
    const likeBtn = modal.querySelector(`#like-btn-${postId}`);

    try {
      if (currentReaction === emotion) {
        // Gỡ cảm xúc
        await fetch(
          `http://localhost:8080/api/reaction/delete?postId=${postId}&contentType=POST`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Reset nút like về mặc định
        likeBtn.innerHTML = `<i class="bi bi-hand-thumbs-up"></i>Like`;
        likeBtn.style.color = ""; // bỏ màu
        likeBtn.classList.remove("active");
        currentReaction = null;
      } else {
        // Gửi cảm xúc mới
        const payload = {
          emotionName: emotion,
          contentId: postId,
          contentReact: "POST",
        };

        await fetch("http://localhost:8080/api/reaction/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        // Cập nhật nút like theo cảm xúc mới
        likeBtn.innerHTML = `<span>${emotionMap[emotion].icon} ${emotionMap[emotion].label}</span>`;
        likeBtn.style.color = emotionMap[emotion].color;
        currentReaction = emotion;
      }
    } catch (err) {
      console.error("Lỗi gửi hoặc xóa cảm xúc:", err);
    }
  });
});
