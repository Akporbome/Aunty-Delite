document.addEventListener('DOMContentLoaded', () => {
    // Nav bar shrink & background on scroll
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // toggle icon
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('ph-list');
                icon.classList.add('ph-x');
            } else {
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
        });

        // Close mobile menu when a link is clicked
        document.querySelectorAll('.nav-links li a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            });
        });
    }

    // --- CART SYSTEM LOGIC ---
    let cart = JSON.parse(localStorage.getItem('auntyDeliteCart')) || [];

    function saveCart() {
        localStorage.setItem('auntyDeliteCart', JSON.stringify(cart));
        updateCartBadges();
    }

    function updateCartBadges() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    function showToast(message) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="ph ph-check-circle" style="color: var(--color-primary); font-size: 1.5rem;"></i> <span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    }

    // Add to cart buttons listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            
            const existing = cart.find(i => i.name === name);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }
            saveCart();
            showToast(`Added <strong>${name}</strong> to your order!`);
        });
    });

    // Initialize badges on load
    updateCartBadges();

    // --- FLOATING CART DRAG LOGIC ---
    const floatingCart = document.querySelector('.floating-cart');
    if (floatingCart) {
        let isDragging = false;
        let isMoved = false; // to distinguish click vs drag
        let initialX, initialY;
        let posX = 0, posY = 0;
        
        floatingCart.addEventListener('touchstart', dragStart, {passive: false});
        floatingCart.addEventListener('touchend', dragEnd);
        floatingCart.addEventListener('touchmove', drag, {passive: false});
        
        floatingCart.addEventListener('mousedown', dragStart);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('mousemove', drag);

        function dragStart(e) {
            if (e.target.closest('a')) return; // ignore standard link click initiation (handled below)
            isMoved = false;
            isDragging = true;
            
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - floatingCart.offsetLeft;
                initialY = e.touches[0].clientY - floatingCart.offsetTop;
            } else {
                initialX = e.clientX - floatingCart.offsetLeft;
                initialY = e.clientY - floatingCart.offsetTop;
            }
            floatingCart.style.transition = 'none'; // remove transition for smooth dragging
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            isMoved = true;
            
            let currentX, currentY;
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX;
                currentY = e.touches[0].clientY;
            } else {
                currentX = e.clientX;
                currentY = e.clientY;
            }

            posX = currentX - initialX;
            posY = currentY - initialY;
            
            // Bounds check
            posX = Math.max(0, Math.min(posX, window.innerWidth - floatingCart.offsetWidth));
            posY = Math.max(0, Math.min(posY, window.innerHeight - floatingCart.offsetHeight));

            floatingCart.style.left = posX + "px";
            floatingCart.style.top = posY + "px";
            floatingCart.style.right = 'auto';
            floatingCart.style.bottom = 'auto';
        }

        function dragEnd(e) {
            isDragging = false;
            floatingCart.style.transition = 'transform 0.2s'; // restore active state transitions
        }

        floatingCart.addEventListener('click', (e) => {
            if (isMoved) {
                e.preventDefault(); // Prevent navigating if the user casually dragged it
            } else {
                window.location.href = 'cart.html';
            }
        });
    }
});
