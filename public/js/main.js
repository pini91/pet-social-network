
// const form = document.getElementById('createPostForm');

function toggleCreatePost() {
  const form = document.getElementById('createPostForm');
  const isVisible = form.classList.contains('show');
  
  if (isVisible) {
    form.classList.remove('show');
  } else {
    form.classList.add('show');
    setTimeout(() => {
      form.scrollIntoView({ //is a web api method used to scroll an element into the visible area of the browser window. It's particularly useful when you need to ensure a specific element is displayed to the user
        behavior: 'smooth', // This option specifies that the scrolling should be animated, creating a smooth transition instead of an instant jump
        block: 'nearest' // This option defines the vertical alignment of the element after scrolling
      });
    }, 100);
  }
}


// const picForm = document.getElementById('createProfilePic');

function toggleCreateProfilePic() {
  const picForm = document.getElementById('createProfilePic');
  const isVisible = picForm.classList.contains('show');

  if (isVisible) {
    picForm.classList.remove('show');
  } else {
    picForm.classList.add('show');
    setTimeout(() => {
      picForm.scrollIntoView({ //is a web api method used to scroll an element into the visible area of the browser window. It's particularly useful when you need to ensure a specific element is displayed to the user
        behavior: 'smooth', // This option specifies that the scrolling should be animated, creating a smooth transition instead of an instant jump
        block: 'nearest' // This option defines the vertical alignment of the element after scrolling
      });
    }, 100);
  }
}