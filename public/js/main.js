// const form = document.getElementById('createPostForm');

// eslint-disable-next-line no-unused-vars
function toggleCreatePost () {
  const form = document.getElementById('createPostForm')
  const isVisible = form.classList.contains('show')

  if (isVisible) {
    form.classList.remove('show')
  } else {
    form.classList.add('show')
    setTimeout(() => {
      form.scrollIntoView({ // is a web api method used to scroll an element into the visible area of the browser window. It's particularly useful when you need to ensure a specific element is displayed to the user
        behavior: 'smooth', // This option specifies that the scrolling should be animated, creating a smooth transition instead of an instant jump
        block: 'nearest' // This option defines the vertical alignment of the element after scrolling
      })
    }, 100)
  }
}

// const picForm = document.getElementById('createProfilePic');

// eslint-disable-next-line no-unused-vars
function toggleCreateProfilePic () {
  const picForm = document.getElementById('createProfilePic')
  const isVisible = picForm.classList.contains('show')

  if (isVisible) {
    picForm.classList.remove('show')
  } else {
    picForm.classList.add('show')
    setTimeout(() => {
      picForm.scrollIntoView({ // is a web api method used to scroll an element into the visible area of the browser window. It's particularly useful when you need to ensure a specific element is displayed to the user
        behavior: 'smooth', // This option specifies that the scrolling should be animated, creating a smooth transition instead of an instant jump
        block: 'nearest' // This option defines the vertical alignment of the element after scrolling
      })
    }, 100)
  }
}

// Add loading states for buttons
const buttons = document.querySelectorAll('button[type="submit"], input[type="submit"]')
buttons.forEach(button => {
  button.addEventListener('click', function () {
    if (this.form && this.form.checkValidity()) {
      const originalText = this.textContent || this.value
      const loadingText = 'Loading...'

      if (this.tagName === 'BUTTON') {
        this.textContent = loadingText
      } else {
        this.value = loadingText
      }

      this.disabled = true

      // Re-enable after 10 seconds as fallback
      setTimeout(() => {
        if (this.tagName === 'BUTTON') {
          this.textContent = originalText
        } else {
          this.value = originalText
        }
        this.disabled = false
      }, 10000)
    }
  })
})
// Enhance image loading with lazy loading fallback
const images = document.querySelectorAll('img[src]')
if ('loading' in HTMLImageElement.prototype) {
  // Native lazy loading is supported
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy')
    }
  })
} else {
  // Fallback for browsers without native lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src || img.src
        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach(img => {
    imageObserver.observe(img)
  })
}

// Add smooth scrolling to anchor links
const anchors = document.querySelectorAll('a[href^="#"]')
anchors.forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href')
    if (href === '#') return

    const target = document.querySelector(href)
    if (target) {
      e.preventDefault()
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
})
