/**
 * Simple Business Landing Page - Interactive Features
 * Vanilla JavaScript with progressive enhancement and accessibility
 */

(function() {
  'use strict';

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  /**
   * Email validation using RFC 5322 simplified regex
   * @param {string} email - Email address to validate
   * @returns {boolean} True if valid email format
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Debounce function to limit execution rate
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ==========================================================================
  // Smooth Scroll Navigation
  // ==========================================================================

  /**
   * Initialize smooth scroll for all anchor links
   */
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');

        // Skip if href is just "#"
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          e.preventDefault();

          // Smooth scroll to target
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Update focus for accessibility
          targetElement.focus({ preventScroll: true });

          // Update URL without triggering scroll
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      });
    });
  }

  // ==========================================================================
  // Header Scroll Effect
  // ==========================================================================

  /**
   * Add shadow to header on scroll
   */
  function initHeaderScrollEffect() {
    const header = document.querySelector('header');

    if (!header) return;

    const handleScroll = debounce(() => {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, 10);

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // ==========================================================================
  // Mobile Menu Toggle
  // ==========================================================================

  /**
   * Initialize mobile menu functionality
   * Note: This is prepared for future mobile menu implementation
   */
  function initMobileMenu() {
    const nav = document.querySelector('nav ul');

    if (!nav) return;

    // Create mobile menu button if screen is small
    if (window.innerWidth < 768) {
      createMobileMenuButton(nav);
    }

    // Re-evaluate on resize
    window.addEventListener('resize', debounce(() => {
      const existingButton = document.querySelector('.mobile-menu-toggle');

      if (window.innerWidth < 768 && !existingButton) {
        createMobileMenuButton(nav);
      } else if (window.innerWidth >= 768 && existingButton) {
        existingButton.remove();
        nav.classList.remove('mobile-menu-open');
        nav.removeAttribute('aria-hidden');
      }
    }, 250));
  }

  /**
   * Create mobile menu toggle button
   * @param {HTMLElement} nav - Navigation element
   */
  function createMobileMenuButton(nav) {
    const navContainer = document.querySelector('.nav-container');
    if (!navContainer) return;

    const button = document.createElement('button');
    button.className = 'mobile-menu-toggle';
    button.setAttribute('aria-label', 'Toggle navigation menu');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'main-navigation');
    button.innerHTML = '<span></span><span></span><span></span>';

    // Style the button
    Object.assign(button.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px'
    });

    // Style the spans (hamburger lines)
    button.querySelectorAll('span').forEach(span => {
      Object.assign(span.style, {
        display: 'block',
        width: '24px',
        height: '2px',
        backgroundColor: 'currentColor',
        transition: 'transform 0.3s ease'
      });
    });

    nav.id = 'main-navigation';
    nav.setAttribute('aria-hidden', 'true');

    // Hide menu initially on mobile
    Object.assign(nav.style, {
      display: 'none'
    });

    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', !isExpanded);
      nav.setAttribute('aria-hidden', isExpanded);
      nav.classList.toggle('mobile-menu-open');

      if (isExpanded) {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '100%';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.backgroundColor = 'var(--color-background)';
        nav.style.padding = 'var(--space-md)';
        nav.style.boxShadow = 'var(--shadow-lg)';
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navContainer.contains(e.target) && nav.classList.contains('mobile-menu-open')) {
        button.click();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('mobile-menu-open')) {
        button.click();
        button.focus();
      }
    });

    navContainer.appendChild(button);
  }

  // ==========================================================================
  // Form Validation
  // ==========================================================================

  /**
   * Validate a single form field
   * @param {HTMLInputElement|HTMLTextAreaElement} field - Form field to validate
   * @returns {boolean} True if field is valid
   */
  function validateField(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(`${field.id}-error`);
    let errorMessage = '';
    let isValid = true;

    // Check required fields
    if (field.hasAttribute('required') && !value) {
      errorMessage = 'This field is required';
      isValid = false;
    }
    // Email validation
    else if (field.type === 'email' && value && !isValidEmail(value)) {
      errorMessage = 'Please enter a valid email address';
      isValid = false;
    }
    // Message minimum length
    else if (field.id === 'message' && value && value.length < 10) {
      errorMessage = 'Message must be at least 10 characters';
      isValid = false;
    }

    // Update UI
    field.setAttribute('aria-invalid', !isValid);

    if (errorElement) {
      errorElement.textContent = errorMessage;
    }

    return isValid;
  }

  /**
   * Initialize contact form validation
   */
  function initFormValidation() {
    const form = document.querySelector('.contact-form');

    if (!form) return;

    const fields = form.querySelectorAll('input, textarea');

    // Real-time validation on blur
    fields.forEach(field => {
      field.addEventListener('blur', () => {
        validateField(field);
      });

      // Clear error on input
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') {
          const errorElement = document.getElementById(`${field.id}-error`);
          if (errorElement) {
            errorElement.textContent = '';
          }
          field.setAttribute('aria-invalid', 'false');
        }
      });
    });

    // Form submission handling
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Validate all fields
      let isFormValid = true;
      fields.forEach(field => {
        if (!validateField(field)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        // Focus first invalid field
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      // Handle form submission
      await handleFormSubmission(form);
    });
  }

  /**
   * Handle form submission with user feedback
   * @param {HTMLFormElement} form - The form element
   */
  async function handleFormSubmission(form) {
    const submitButton = form.querySelector('button[type="submit"]');

    if (!submitButton) return;

    const originalText = submitButton.textContent;

    try {
      // Update button state
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Simulate API call (replace with actual endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success feedback
      showFormMessage(form, 'Thank you! Your message has been sent successfully.', 'success');

      // Reset form
      form.reset();

      // Clear any validation states
      form.querySelectorAll('[aria-invalid]').forEach(field => {
        field.setAttribute('aria-invalid', 'false');
      });

      console.log('Form submitted:', data);

    } catch (error) {
      // Error feedback
      showFormMessage(form, 'Sorry, there was an error sending your message. Please try again.', 'error');
      console.error('Form submission error:', error);
    } finally {
      // Reset button state
      submitButton.setAttribute('aria-busy', 'false');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }

  /**
   * Display form feedback message
   * @param {HTMLFormElement} form - The form element
   * @param {string} message - Message to display
   * @param {string} type - Message type ('success' or 'error')
   */
  function showFormMessage(form, message, type) {
    // Remove existing message if any
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = 'form-message';
    messageElement.setAttribute('role', 'status');
    messageElement.setAttribute('aria-live', 'polite');
    messageElement.textContent = message;

    // Style the message
    Object.assign(messageElement.style, {
      padding: 'var(--space-md)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 'var(--space-lg)',
      backgroundColor: type === 'success' ? '#d1fae5' : '#fee2e2',
      color: type === 'success' ? '#065f46' : '#991b1b',
      border: `1px solid ${type === 'success' ? '#6ee7b7' : '#fca5a5'}`
    });

    form.insertBefore(messageElement, form.firstChild);

    // Remove message after 5 seconds
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }

  // ==========================================================================
  // Scroll-Triggered Animations
  // ==========================================================================

  /**
   * Initialize Intersection Observer for scroll animations
   */
  function initScrollAnimations() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      return; // Graceful degradation - content is still visible
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    }, observerOptions);

    // Observe elements
    const animatedElements = document.querySelectorAll('.service-card, .team-member, .testimonial-card, .about-content');

    animatedElements.forEach(element => {
      element.classList.add('reveal');
      observer.observe(element);
    });

    // Add CSS for reveal animation
    addRevealStyles();
  }

  /**
   * Add CSS styles for reveal animation
   */
  function addRevealStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }

      .reveal-visible {
        opacity: 1;
        transform: translateY(0);
      }

      @media (prefers-reduced-motion: reduce) {
        .reveal {
          opacity: 1;
          transform: none;
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================================
  // Keyboard Navigation Enhancement
  // ==========================================================================

  /**
   * Enhance keyboard navigation
   */
  function initKeyboardNavigation() {
    // Allow keyboard users to navigate cards
    const cards = document.querySelectorAll('.service-card, .testimonial-card, .team-member');

    cards.forEach(card => {
      // Make cards focusable if they contain no interactive elements
      const hasInteractiveElements = card.querySelector('a, button, input, textarea, select');

      if (!hasInteractiveElements) {
        card.setAttribute('tabindex', '0');
      }
    });

    // Add keyboard shortcuts for navigation
    document.addEventListener('keydown', (e) => {
      // Alt + H to go to home
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        const homeSection = document.querySelector('#home');
        if (homeSection) {
          homeSection.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Alt + C to go to contact
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
          // Focus first form field
          setTimeout(() => {
            const firstField = document.querySelector('#name');
            if (firstField) firstField.focus();
          }, 500);
        }
      }
    });
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize all features when DOM is ready
   */
  function init() {
    try {
      initSmoothScroll();
      initHeaderScrollEffect();
      initMobileMenu();
      initFormValidation();
      initScrollAnimations();
      initKeyboardNavigation();

      console.log('Simple Business Landing Page: All features initialized successfully');
    } catch (error) {
      console.error('Error initializing landing page features:', error);
      // Graceful degradation - page remains functional without JavaScript enhancements
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
