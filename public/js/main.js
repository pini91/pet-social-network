// const form = document.getElementById('createPostForm');

// eslint-disable-next-line no-unused-vars
function toggleCreatePost () {
  const form = document.getElementById('createPostForm')
  const isVisible = form.classList.contains('show')

  if (isVisible) {
    form.classList.remove('show')
    // Remove mobile backdrop if exists
    removeMobileBackdrop()
  } else {
    form.classList.add('show')
    // Add mobile backdrop for better UX on small screens
    if (window.innerWidth <= 767) {
      addMobileBackdrop(form)
    }
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
    removeMobileBackdrop()
  } else {
    picForm.classList.add('show')
    if (window.innerWidth <= 767) {
      addMobileBackdrop(picForm)
    }
    setTimeout(() => {
      picForm.scrollIntoView({ // is a web api method used to scroll an element into the visible area of the browser window. It's particularly useful when you need to ensure a specific element is displayed to the user
        behavior: 'smooth', // This option specifies that the scrolling should be animated, creating a smooth transition instead of an instant jump
        block: 'nearest' // This option defines the vertical alignment of the element after scrolling
      })
    }, 100)
  }
}

/**
 * Add mobile backdrop for better form visibility on small screens
 */
function addMobileBackdrop (formElement) {
  if (document.querySelector('.mobile-backdrop')) return // Don't create multiple backdrops

  const backdrop = document.createElement('div')
  backdrop.className = 'mobile-backdrop'
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1040;
    opacity: 0;
    transition: opacity 0.3s ease;
  `

  document.body.appendChild(backdrop)

  // Trigger opacity animation
  requestAnimationFrame(() => {
    backdrop.style.opacity = '1'
  })

  // Close form when backdrop is clicked
  backdrop.addEventListener('click', () => {
    if (formElement.classList.contains('show')) {
      if (formElement.id === 'createPostForm') {
        toggleCreatePost()
      } else if (formElement.id === 'createProfilePic') {
        toggleCreateProfilePic()
      }
    }
  })
}

/**
 * Remove mobile backdrop
 */
function removeMobileBackdrop () {
  const backdrop = document.querySelector('.mobile-backdrop')
  if (backdrop) {
    backdrop.style.opacity = '0'
    setTimeout(() => {
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop)
      }
    }, 300)
  }
}

/**
 * Initialize responsive behaviors when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function () {
  // Improve touch experience for iOS Safari
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.body.classList.add('ios-device')
  }

  // Handle orientation change
  window.addEventListener('orientationchange', function () {
    setTimeout(() => {
      // Close any open forms on orientation change for better UX
      const openForms = document.querySelectorAll('.modern-form.show')
      openForms.forEach(form => {
        form.classList.remove('show')
      })
      removeMobileBackdrop()

      // Scroll to top after orientation change
      window.scrollTo(0, 0)
    }, 500)
  })

  // Handle window resize
  window.addEventListener('resize', function () {
    // Remove backdrop if screen becomes larger
    if (window.innerWidth > 767) {
      removeMobileBackdrop()
    }
  })

  // Improve form accessibility
  const forms = document.querySelectorAll('form')
  forms.forEach(form => {
    const firstInput = form.querySelector('input, textarea, select')
    if (firstInput) {
      form.addEventListener('focus', () => {
        // Ensure form is visible when focused
        setTimeout(() => {
          form.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }, 100)
      }, true)
    }
  })

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

  // Add keyboard navigation for custom elements
  const customClickables = document.querySelectorAll('.profilePic, .settings')
  customClickables.forEach(element => {
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0')
    }

    element.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        this.click()
      }
    })
  })
})

/**
 * Service Worker registration for offline functionality (Progressive Web App)
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(() => {
        // Service worker registration failed, but app still works
        console.log('Service Worker registration failed')
      })
  })
}
