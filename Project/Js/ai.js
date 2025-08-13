    const robot = document.querySelector('.robot');
    let isDancing = false;

    robot.addEventListener('click', () => {
      if (!isDancing) {
        robot.style.animation = 'dance 2s infinite linear';
        isDancing = true;
      } else {
        robot.style.animation = 'none';
        isDancing = false;
      }
    });