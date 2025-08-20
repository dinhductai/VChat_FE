function logoutUser() {
  Swal.fire({
    title: "Bạn có chắc chắn muốn đăng xuất?",
    text: "Phiên đăng nhập hiện tại sẽ bị kết thúc.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Đăng xuất",
    cancelButtonText: "Hủy",
    reverseButtons: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
  }).then((result) => {
    if (result.isConfirmed) {
      // Xoá token + dữ liệu khác nếu cần
      localStorage.removeItem("accessToken");
      // localStorage.removeItem("userAvatar");
      // localStorage.removeItem("rememberEmail");

      Swal.fire({
        title: "Đã đăng xuất",
        text: "Bạn sẽ được chuyển về trang đăng nhập.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "login.html";
      });
    }
  });
}
