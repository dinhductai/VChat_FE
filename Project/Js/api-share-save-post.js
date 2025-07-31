function shareOrSavePost(actionType, postId) {
  const token = localStorage.getItem("accessToken"); // hoặc cách bạn lưu JWT
  fetch(`http://localhost:8080/api/post/share-save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      postId: postId,
      status: actionType, // SHARE hoặc SAVE
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert(actionType === "SHARE" ? "Post shared!" : "Post saved!");
      } else {
        alert("Action failed.");
      }
    })
    .catch((err) => {
      console.error("Error:", err);
    });
}
