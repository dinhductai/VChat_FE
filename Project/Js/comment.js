function submitComment() {
  const input = document.getElementById("mainCommentInput");
  const content = input.value.trim();

  if (!content) {
    alert("Vui lòng nhập nội dung!");
    return;
  }

  const commentData = {
    postId: 123, // post đang bình luận
    content: content,
    isEdited: false,
    isDeleted: false,
    parentCommentId: null,
    level: 1,
  };

  fetch("http://localhost:8080/api/comment/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Không thể gửi comment");
      }
      return response.json(); // Nếu server trả về JSON
    })
    .then((data) => {
      console.log("Đã gửi comment:", data);
      input.value = "";
      alert("Gửi thành công!");
      // TODO: gọi API get lại danh sách comment để render lại
    })
    .catch((error) => {
      console.error("Lỗi khi gửi comment:", error);
      alert("Gửi thất bại!");
    });
}
