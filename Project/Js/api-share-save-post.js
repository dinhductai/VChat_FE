async function shareOrSavePost(actionType, postId, btnEl) {
  const { isConfirmed } = await Swal.fire({
    title: actionType === "SHARE" ? "Confirm Share?" : "Confirm Save?",
    text:
      actionType === "SHARE"
        ? "Are you sure you want to share this post?"
        : "Are you sure you want to save this post?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: actionType === "SHARE" ? "Share" : "Save",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });

  if (!isConfirmed) return;

  // (tuỳ chọn) khoá nút đang bấm
  const oldHtml = btnEl?.innerHTML;
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Processing...`;
  }

  const token = localStorage.getItem("accessToken");
  try {
    const res = await fetch(`http://localhost:8080/api/post/share-save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, status: actionType }), // SHARE | SAVE
    });

    const data = await res.json();
    if (res.ok && data.success) {
      await Swal.fire({
        icon: "success",
        title: actionType === "SHARE" ? "Post shared!" : "Post saved!",
        timer: 1600,
        showConfirmButton: false,
      });
    } else {
      await Swal.fire({
        icon: "error",
        title: "Action failed",
        text:
          data.message ||
          `Cannot ${actionType === "SHARE" ? "share" : "save"} this post.`,
      });
    }
  } catch (err) {
    console.error(err);
    await Swal.fire({
      icon: "error",
      title: "Network or server error",
      text: "Please try again later.",
    });
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = oldHtml;
    }
  }
}
