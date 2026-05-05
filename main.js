// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // State
    let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];
    let currentCategory = 'all';
    
    // DOM Elements
    const productsGrid = document.getElementById('productsGrid');
    const filterButtons = document.getElementById('filterButtons');
    const searchInput = document.getElementById('searchInput');
    const cartBtn = document.getElementById('cartBtn');
    const cartBadge = document.getElementById('cartBadge');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const emptyCartMsg = document.getElementById('emptyCartMsg');
    const cartTotalValue = document.getElementById('cartTotalValue');
    const toast = document.getElementById('toast');
    
    // Checkout Elements
    const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');

    // Policy Modals
    const policyLinks = document.querySelectorAll('.policy-link');
    const policyOverlay = document.getElementById('policyOverlay');
    const closePolicyBtns = document.querySelectorAll('.close-policy');

    const WHATSAPP_NUMBER = "917905957827";

    // Initialize
    renderProducts(products);
    updateCartUI();

    // Event Listeners
    if(filterButtons) {
        filterButtons.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentCategory = e.target.getAttribute('data-filter');
                filterAndRender();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRender();
        });
    }

    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    proceedToCheckoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("Your cart is empty!");
            return;
        }
        toggleCart(); // close cart
        openCheckout();
    });

    closeCheckoutBtn.addEventListener('click', closeCheckout);
    checkoutOverlay.addEventListener('click', closeCheckout);

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('cName').value;
        const phone = document.getElementById('cPhone').value;
        const address = document.getElementById('cAddress').value;

        let message = `🛍️ *New Order from Nexus Store* 🛍️\n\n`;
        message += `👤 *Customer Details:*\n`;
        message += `Name: ${name}\n`;
        message += `Phone: ${phone}\n`;
        message += `Address: ${address}\n\n`;
        
        message += `🛒 *Order Details:*\n`;
        let total = 0;
        cart.forEach(item => {
            message += `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}\n`;
            total += item.price * item.quantity;
        });
        
        message += `\n💰 *Total Bill:* $${total.toFixed(2)}\n\n`;
        message += `Please confirm my order!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');

        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        closeCheckout();
        checkoutForm.reset();
        
        showToast("Order sent via WhatsApp!");
    });

    // Policy Modal Listeners
    policyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = link.getAttribute('data-modal');
            document.getElementById(modalId).classList.add('active');
            policyOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    closePolicyBtns.forEach(btn => {
        btn.addEventListener('click', closePolicies);
    });
    if(policyOverlay) policyOverlay.addEventListener('click', closePolicies);

    function closePolicies() {
        document.querySelectorAll('.policy-modal').forEach(m => m.classList.remove('active'));
        policyOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Functions
    function filterAndRender() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        let filteredProducts = products;

        if (currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
        }

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm));
        }

        renderProducts(filteredProducts);
    }

    function renderProducts(productsToRender) {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';
        
        if (productsToRender.length === 0) {
            productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">No products found.</p>`;
            return;
        }

        productsToRender.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class='bx bx-cart-add'></i> Add to Cart
                </button>
            `;
            productsGrid.appendChild(card);
        });
    }

    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        updateCartUI();
        showToast("Product added to cart!");
    };

    window.updateQuantity = function(productId, change) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            saveCart();
            updateCartUI();
        }
    };

    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
    };

    function saveCart() {
        localStorage.setItem('nexus_cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        // Update Badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;

        // Update Items List
        if (cart.length === 0) {
            emptyCartMsg.style.display = 'flex';
            const itemElements = cartItemsContainer.querySelectorAll('.cart-item');
            itemElements.forEach(el => el.remove());
        } else {
            emptyCartMsg.style.display = 'none';
            // Clear existing items
            const itemElements = cartItemsContainer.querySelectorAll('.cart-item');
            itemElements.forEach(el => el.remove());

            cart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-actions">
                            <div class="qty-controls">
                                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                                <i class='bx bx-trash'></i>
                            </button>
                        </div>
                    </div>
                `;
                cartItemsContainer.insertBefore(itemEl, emptyCartMsg);
            });
        }

        // Update Total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalValue.textContent = '$' + total.toFixed(2);
    }

    function toggleCart() {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
        if (cartSidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function openCheckout() {
        checkoutOverlay.classList.add('active');
        checkoutModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCheckout() {
        checkoutOverlay.classList.remove('active');
        checkoutModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showToast(msg = "Product added to cart!") {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.glass-nav');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 17, 21, 0.9)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(15, 17, 21, 0.7)';
            header.style.boxShadow = 'none';
        }
    });
});
