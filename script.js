/**
 * DECODELABS PROJECT - FRONTEND & REST API INTEGRATION
 * Script: script.js
 * Features: Mobile Menu, API Status Ping, RESTful Contact Form, Dynamic Projects & Modal, Theme Swatch
 */

document.addEventListener('DOMContentLoaded', () => {

    const API_BASE = '/api';

    // ==================== 1. BACKEND API HEALTH CHECK ====================
    const apiStatusBadge = document.getElementById('api-status-badge');
    const apiStatusText = document.getElementById('api-status-text');

    async function checkApiHealth() {
        try {
            const response = await fetch(`${API_BASE}/health`);
            const data = await response.json();

            if (response.ok && data.success) {
                if (apiStatusBadge) {
                    apiStatusBadge.classList.remove('offline');
                    apiStatusBadge.classList.add('online');
                }
                if (apiStatusText) {
                    apiStatusText.textContent = 'API Live (200 OK)';
                }
            } else {
                throw new Error('API returned unhealthy status');
            }
        } catch (err) {
            console.warn('Backend API connection check failed:', err);
            if (apiStatusBadge) {
                apiStatusBadge.classList.remove('online');
                apiStatusBadge.classList.add('offline');
            }
            if (apiStatusText) {
                apiStatusText.textContent = 'API Offline';
            }
        }
    }

    checkApiHealth();

    // ==================== 2. MOBILE HAMBURGER MENU TOGGLE ====================
    const hamburgerBtn = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu(open) {
        const isOpen = open !== undefined ? open : !mainNav.classList.contains('open');
        
        mainNav.classList.toggle('open', isOpen);
        hamburgerBtn.classList.toggle('open', isOpen);
        navOverlay.classList.toggle('open', isOpen);
        document.body.classList.toggle('no-scroll', isOpen);

        hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => toggleMenu());
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', () => toggleMenu(false));
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('open')) {
                toggleMenu(false);
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024 && mainNav.classList.contains('open')) {
            toggleMenu(false);
        }
    });

    // ==================== 3. HEADER SCROLL & BACK-TO-TOP ====================
    const header = document.getElementById('header');
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        if (header) {
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        if (backToTopBtn) {
            if (scrollY > 400) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.pointerEvents = 'all';
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.pointerEvents = 'none';
            }
        }

        updateActiveNavLink();
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    // ==================== 4. DYNAMIC PROJECTS SHOWCASE FROM API ====================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectsGrid = document.getElementById('projects-grid');

    async function loadProjects(category = 'all') {
        try {
            const url = category && category !== 'all' 
                ? `${API_BASE}/projects?category=${encodeURIComponent(category)}`
                : `${API_BASE}/projects`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}`);
            }

            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                renderProjects(result.data);
            }
        } catch (err) {
            console.error('Failed to load projects from REST API:', err);
            // Fallback: don't break UI if offline
        }
    }

    function renderProjects(projects) {
        if (!projectsGrid) return;
        
        projectsGrid.innerHTML = projects.map(proj => `
            <article class="project-card" data-category="${proj.category}">
                <div class="project-image-wrapper">
                    <div class="project-placeholder-img ${proj.gradientClass || 'img-gradient-1'}">
                        <i class="fa-solid ${proj.iconClass || 'fa-code'} project-icon-bg"></i>
                        <span class="category-badge">${proj.category.toUpperCase()}</span>
                    </div>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${proj.title}</h3>
                    <p class="project-summary">${proj.summary}</p>
                    <div class="project-tags">
                        ${(proj.tech || []).map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                    <div class="project-card-footer">
                        <button class="btn-link view-details-btn" data-project="${proj.id}">
                            <span>View Details</span>
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </button>
                        <a href="${proj.githubUrl || 'https://github.com'}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="View Source Code on GitHub">
                            <i class="fa-brands fa-github"></i>
                        </a>
                    </div>
                </div>
            </article>
        `).join('');

        // Re-attach modal trigger listeners
        attachModalListeners();
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const filterValue = btn.getAttribute('data-filter');
            loadProjects(filterValue);
        });
    });

    // Initial projects fetch from API
    loadProjects('all');

    // ==================== 5. INTERACTIVE PROJECT DETAILS MODAL ====================
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCloseAction = document.getElementById('modal-close-action');
    const modalBackdrop = document.getElementById('modal-backdrop');

    async function openModal(projectId) {
        if (!modal) return;

        // Show loading state first
        modalTitle.textContent = 'Loading Project...';
        modalCategory.textContent = 'API Request';
        modalBody.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Fetching details from REST API endpoint <code>GET /api/projects/' + projectId + '</code>...</p>';
        
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');

        try {
            const response = await fetch(`${API_BASE}/projects/${projectId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Project not found (404 Not Found)');
                }
                throw new Error(`Server returned HTTP ${response.status}`);
            }

            const result = await response.json();
            const data = result.data;

            modalTitle.textContent = data.title;
            modalCategory.textContent = data.category.toUpperCase();

            modalBody.innerHTML = `
                <p style="line-height: 1.6; margin-bottom: 1rem;">${data.description}</p>
                <div style="background: rgba(0,0,0,0.25); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--color-card-border);">
                    <strong style="color: var(--color-moonlit); display: block; margin-bottom: 0.5rem;">Technologies & Architecture:</strong>
                    <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                        ${(data.tech || []).map(t => `<span class="tag" style="background: rgba(160, 212, 224, 0.15); color: var(--color-ethereal);">${t}</span>`).join('')}
                    </div>
                </div>
            `;
        } catch (err) {
            modalTitle.textContent = 'Project Load Error';
            modalBody.innerHTML = `<p style="color: #FF5F56;"><i class="fa-solid fa-triangle-exclamation"></i> ${err.message}</p>`;
        }
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }

    function attachModalListeners() {
        const viewDetailBtns = document.querySelectorAll('.view-details-btn');
        viewDetailBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-project');
                openModal(id);
            });
        });
    }

    attachModalListeners();

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalCloseAction) modalCloseAction.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeModal();
        }
    });

    // ==================== 6. 2025 WARM PALETTE EXPLORER ====================
    const swatchBtns = document.querySelectorAll('.swatch-btn');
    const paletteFeedback = document.getElementById('palette-feedback');

    swatchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const hex = btn.getAttribute('data-color');
            
            document.body.classList.remove('accent-mocha', 'accent-moonlit');

            if (hex === '#88856F') {
                document.body.classList.add('accent-mocha');
                if (paletteFeedback) paletteFeedback.innerHTML = `Active Accent: <strong>Mocha Mousse (#88856F)</strong>`;
            } else if (hex === '#F2F0EA') {
                document.body.classList.add('accent-moonlit');
                if (paletteFeedback) paletteFeedback.innerHTML = `Active Accent: <strong>Moonlit Grey (#F2F0EA)</strong>`;
            } else {
                if (paletteFeedback) paletteFeedback.innerHTML = `Active Accent: <strong>Ethereal Blue (#A0D4E0)</strong>`;
            }

            showToast(`Applied color accent: ${hex}`);
        });
    });

    // ==================== 7. CONTACT FORM (RESTful POST & GATEKEEPER VALIDATION) ====================
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const subjectInput = document.getElementById('user-subject');
    const messageInput = document.getElementById('user-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous errors
            clearAllErrors();

            const payload = {
                name: nameInput ? nameInput.value : '',
                email: emailInput ? emailInput.value : '',
                subject: subjectInput ? subjectInput.value : '',
                message: messageInput ? messageInput.value : ''
            };

            const submitBtn = contactForm.querySelector('.form-submit-btn');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
            }

            try {
                // Send JSON payload to POST /api/contacts
                const response = await fetch(`${API_BASE}/contacts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                // Semantic HTTP Status Handling
                if (response.status === 201 && data.success) {
                    // 201 Created Success
                    showToast(data.message || 'Thank you! Your message has been sent successfully.');
                    contactForm.reset();
                } else if (response.status === 400 && data.error && Array.isArray(data.error.details)) {
                    // 400 Bad Request: Gatekeeper Validation Failures
                    showToast('Validation failed. Please correct the highlighted errors.', 'warning');
                    data.error.details.forEach(errItem => {
                        const targetInput = document.querySelector(`[name="${errItem.field}"]`) || document.getElementById(`user-${errItem.field}`);
                        if (targetInput) {
                            showError(targetInput, `${errItem.field}-error`, errItem.issue);
                        }
                    });
                } else if (response.status === 429) {
                    // 429 Too Many Requests
                    showToast(data.error?.message || 'Rate limit exceeded: Too many submissions. Please wait a few minutes.', 'warning');
                } else {
                    // 500 or unknown error
                    showToast(data.error?.message || 'Server error occurred while submitting message.', 'error');
                }
            } catch (err) {
                console.error('Contact form submission network error:', err);
                showToast('Unable to connect to backend server. Is the API server running?', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    function showError(input, errorId, message) {
        input.classList.add('error');
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('visible');
        }
    }

    function clearError(input, errorId) {
        input.classList.remove('error');
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.classList.remove('visible');
        }
    }

    function clearAllErrors() {
        [nameInput, emailInput, messageInput].forEach(input => {
            if (input) {
                input.classList.remove('error');
                const fieldName = input.name || input.id.replace('user-', '');
                const errorEl = document.getElementById(`${fieldName}-error`);
                if (errorEl) errorEl.classList.remove('visible');
            }
        });
    }

    [nameInput, emailInput, messageInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const fieldName = input.name || input.id.replace('user-', '');
                const errorEl = document.getElementById(`${fieldName}-error`);
                if (errorEl) errorEl.classList.remove('visible');
            });
        }
    });

    // ==================== 8. TOAST NOTIFICATIONS ====================
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        
        let iconClass = 'fa-circle-check text-ethereal';
        if (type === 'warning') iconClass = 'fa-triangle-exclamation text-mocha';
        if (type === 'error') iconClass = 'fa-circle-xmark text-required';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

});
