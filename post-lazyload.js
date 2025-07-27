// let currentPostPage = 0;
// let totalPostPages = 1;

// async function loadOwnPostsPaginated() {
//   const listPost = document.getElementById('list-post');
//   const btnLoadMore = document.getElementById('btn-load-more-post');
//   const token = localStorage.getItem('token');

//   if (!listPost || !btnLoadMore || currentPostPage >= totalPostPages) return;

//   btnLoadMore.textContent = 'Đang tải...';
//   btnLoadMore.disabled = true;

//   try {
//     const res = await fetch(`http://localhost:8080/api/post/owner?page=${currentPostPage}&size=5`, {
//       headers: { 'Authorization': 'Bearer ' + token }
//     });
//     const json = await res.json();
//     if (json.success && json.data && Array.isArray(json.data.content)) {
//       totalPostPages = json.data.page.totalPages;
//       const posts = json.data.content;
//       listPost.insertAdjacentHTML('beforeend', posts.map(post => renderPostItem(post)).join(''));

//       currentPostPage++;
//       if (currentPostPage >= totalPostPages) {
//         btnLoadMore.style.display = 'none';
//       } else {
//         btnLoadMore.textContent = 'Xem thêm bài viết';
//         btnLoadMore.disabled = false;
//       }
//     } else {
//       listPost.insertAdjacentHTML('beforeend', '<div style="color:red;">Không thể tải thêm bài viết!</div>');
//     }
//   } catch (err) {
//     console.error('Lỗi tải bài viết:', err);
//   }
// }

// document.getElementById('btn-load-more-post')?.addEventListener('click', loadOwnPostsPaginated);

// document.getElementById('tab-info')?.addEventListener('click', () => {
//   document.getElementById('list-post').innerHTML = '';
//   document.getElementById('btn-load-more-post').style.display = 'inline-block';
//   currentPostPage = 0;
//   totalPostPages = 1;
//   loadOwnPostsPaginated();
// });
// lỗi vl, dùng sau