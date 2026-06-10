/**
 * AJR Junk Removal & Flooring - Main JavaScript File
 * Handles: Mobile Nav, Hybrid Static Gallery, Custom Lightbox, Form Validation
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initGallery();
  initFormValidation();
});

/* ==========================================================================
   1. Mobile Navigation Menu
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !mainNav) return;

  const toggleMenu = () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    toggleBtn.classList.toggle('active');
    mainNav.classList.toggle('active');
    
    // Toggle body scroll lock when menu is open
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('active')) {
        toggleMenu();
      }
    });
  });
}

/* ==========================================================================
   2. Static Gallery Loader (Manual Setup)
   ========================================================================== */
let galleryImages = []; // Stores list of { src, alt, caption }

function initGallery() {
  const cards = document.querySelectorAll('.gallery-item');
  if (cards.length === 0) return;

  galleryImages = [];

  cards.forEach((card, idx) => {
    const img = card.querySelector('img');
    const titleElement = card.querySelector('h3');
    const descElement = card.querySelector('p');

    const src = img ? img.getAttribute('src') : '';
    const alt = img ? img.getAttribute('alt') : '';
    const title = titleElement ? titleElement.textContent : 'AJR Work';
    const desc = descElement ? descElement.textContent : '';

    // Save image info for the lightbox navigation
    galleryImages.push({
      src: src,
      alt: alt || title,
      caption: desc ? `${title} - ${desc}` : title
    });

    // Make card accessible and keyboard-navigable
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View larger image of ${title}`);

    // Click & Keyboard event listeners to open the lightbox
    card.addEventListener('click', () => openLightbox(idx));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  initLightbox();
}


/* ==========================================================================
   3. Accessible Lightbox Gallery Modal
   ========================================================================== */
let currentImgIdx = 0;
let lastFocusedElement = null;

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  if (!lightbox) return;

  // Close Event
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Prev / Next Events
  prevBtn.addEventListener('click', showPrevImage);
  nextBtn.addEventListener('click', showNextImage);

  // Keyboard navigation inside lightbox
  document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'none') return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showPrevImage();
    } else if (e.key === 'ArrowRight') {
      showNextImage();
    } else if (e.key === 'Tab') {
      // Accessibility: Keep focus within the lightbox
      const focusableSelectors = 'button, [tabindex="0"]';
      const focusables = lightbox.querySelectorAll(focusableSelectors);
      const firstFocusable = focusables[0];
      const lastFocusable = focusables[focusables.length - 1];

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
}

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  
  if (!lightbox || !img || !caption) return;

  lastFocusedElement = document.activeElement; // Save focus to restore later
  currentImgIdx = index;

  updateLightboxContent();
  
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Lock background scrolling
  
  // Set focus to the close button for screen readers
  document.querySelector('.lightbox-close').focus();
}

function updateLightboxContent() {
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const imageData = galleryImages[currentImgIdx];

  if (img && caption && imageData) {
    img.src = imageData.src;
    img.alt = imageData.alt;
    caption.textContent = imageData.caption;
  }
}

function showPrevImage() {
  currentImgIdx = (currentImgIdx - 1 + galleryImages.length) % galleryImages.length;
  updateLightboxContent();
}

function showNextImage() {
  currentImgIdx = (currentImgIdx + 1) % galleryImages.length;
  updateLightboxContent();
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.style.display = 'none';
  document.body.style.overflow = ''; // Restore scrolling

  if (lastFocusedElement) {
    lastFocusedElement.focus(); // Restore focus to clicked item
  }
}


/* ==========================================================================
   4. Estimate Form Validation & Mailto Generation
   ========================================================================== */
function initFormValidation() {
  const form = document.getElementById('estimate-form');
  const statusBox = document.getElementById('form-status');
  
  if (!form) return;

  const fields = [
    { id: 'form-name', errorId: 'name-error', validate: (val) => val.trim().length > 0 },
    { id: 'form-phone', errorId: 'phone-error', validate: (val) => {
        // Simple 10 digit or international phone validation
        const cleaned = val.replace(/\D/g, '');
        return cleaned.length >= 10;
      }
    },
    { id: 'form-email', errorId: 'email-error', validate: (val) => {
        if (!val) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      }
    },
    { id: 'form-service', errorId: 'service-error', validate: (val) => val !== '' },
    { id: 'form-location', errorId: 'location-error', validate: (val) => val.trim().length > 0 },
    { id: 'form-details', errorId: 'details-error', validate: (val) => val.trim().length > 0 }
  ];

  // Validate single field
  const validateField = (field) => {
    const input = document.getElementById(field.id);
    const value = input.value;
    const isValid = field.validate(value);
    const group = input.closest('.form-group');

    if (isValid) {
      group.classList.remove('invalid');
      input.setAttribute('aria-invalid', 'false');
    } else {
      group.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
    }
    return isValid;
  };

  // Add validation on input/change
  fields.forEach(field => {
    const input = document.getElementById(field.id);
    const eventType = input.tagName === 'SELECT' ? 'change' : 'blur';
    input.addEventListener(eventType, () => validateField(field));
  });

  // Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;
    fields.forEach(field => {
      const isValid = validateField(field);
      if (!isValid) isFormValid = false;
    });

    if (!isFormValid) {
      // Set focus to the first invalid field
      const firstInvalid = form.querySelector('.form-group.invalid input, .form-group.invalid select, .form-group.invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      
      statusBox.className = 'form-status error';
      statusBox.textContent = 'Please fix the highlighted errors before submitting.';
      return;
    }

    // Capture values
    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const email = document.getElementById('form-email').value || 'Not provided';
    const service = document.getElementById('form-service').value;
    const location = document.getElementById('form-location').value;
    const details = document.getElementById('form-details').value;

    // Build mailto components
    const recipient = 'ajrhaul@gmail.com';
    const subject = `AJR Estimate Request: ${service} - ${name}`;
    const body = `AJR Junk Removal & Flooring Estimate Request\n` +
                 `=========================================\n\n` +
                 `Name: ${name}\n` +
                 `Phone: ${phone}\n` +
                 `Email: ${email}\n` +
                 `Service Required: ${service}\n` +
                 `Location: ${location}\n\n` +
                 `Project Details:\n` +
                 `${details}\n\n` +
                 `Sent via AJR Website Contact Form`;

    // Construct Mailto Link
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Show success details & redirect
    statusBox.className = 'form-status success';
    statusBox.innerHTML = `
      <strong>Request Formatted Successfully!</strong><br>
      Your email client will open to send the request.<br><br>
      <em>If your email client didn't open automatically, please send your project details to <strong>${recipient}</strong> directly.</em>
    `;

    // Open mail client
    window.location.href = mailtoUrl;

    // Reset Form
    form.reset();
  });
}
