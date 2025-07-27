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

document.addEventListener("click", async (e) => {
  const icon = e.target.closest(".icon");
  if (!icon) return;

  const emotion = icon.getAttribute("data-emotion");

  // Tìm postId từ thẻ cha gần nhất là .post
  let postContainer = icon.closest(".post");
  let postId = postContainer?.getAttribute("data-post-id");
  // Nếu không có .post, thử lấy từ modal
  if (!postId) {
    const modal = document.getElementById("imageModal");
    postId = modal?.getAttribute("data-post-id");
  }

  if (!postId) {
    console.error("Không tìm thấy postId!");
    return;
  }
  const token = localStorage.getItem("accessToken");

  try {
    if (currentReaction === emotion) {
      await fetch(
        `http://localhost:8080/api/reaction/delete?postId=${postId}&contentType=POST`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      currentReaction = null;
    } else {
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
      currentReaction = emotion;
    }

    // Gọi lại hàm để render trạng thái mới
    fetchReactionState(postId);
  } catch (err) {
    console.error("Lỗi gửi hoặc xóa cảm xúc:", err);
  }
});
