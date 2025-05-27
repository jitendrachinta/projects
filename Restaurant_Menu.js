// Global variables
let cart = [];
let cartTotal = 0;
let cartCount = 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    showSection('veg-starters');
    loadCart();
    updateCartDisplay();
});

// Show/hide menu sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('.menu-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }

    window.scrollTo({
        top: selectedSection.offsetTop - 100,
        behavior: 'smooth'
    });
}

// Add item to cart with animation
function addToBasket(itemName, itemPrice) {
    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: itemName, price: itemPrice, quantity: 1 });
    }

    cartTotal += itemPrice;
    cartCount += 1;

    updateCartDisplay();
    saveCart();
    showNotification(`${itemName} added to cart!`);
    
    // Create flying item animation
    createFlyingItem(itemName);
}

// Create flying item animation
function createFlyingItem(itemName) {
    const flyingItem = document.createElement('div');
    flyingItem.className = 'flying-item';
    flyingItem.textContent = '🍴';
    flyingItem.style.position = 'fixed';
    
    // Random position near the clicked button
    const buttons = document.querySelectorAll('.order-now-btn');
    const lastButton = buttons[buttons.length - 1];
    const rect = lastButton.getBoundingClientRect();
    
    flyingItem.style.left = `${rect.left + rect.width/2}px`;
    flyingItem.style.top = `${rect.top}px`;
    flyingItem.style.fontSize = '20px';
    flyingItem.style.zIndex = '1000';
    flyingItem.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    document.body.appendChild(flyingItem);
    
    // Force reflow
    flyingItem.offsetHeight;
    
    // Animate to cart
    const cartIcon = document.querySelector('.cart-icon');
    const cartRect = cartIcon.getBoundingClientRect();
    
    flyingItem.style.left = `${cartRect.left + cartRect.width/2}px`;
    flyingItem.style.top = `${cartRect.top}px`;
    flyingItem.style.opacity = '0';
    flyingItem.style.transform = 'scale(1.5)';
    
    // Remove after animation
    setTimeout(() => {
        flyingItem.remove();
    }, 800);
}

// Remove item from cart
function removeFromCart(index) {
    const item = cart[index];
    cartTotal -= item.price * item.quantity;
    cartCount -= item.quantity;
    cart.splice(index, 1);

    updateCartDisplay();
    saveCart();
}

// Update item quantity
function updateQuantity(index, change) {
    const item = cart[index];
    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
        removeFromCart(index);
        return;
    }

    cartTotal += item.price * change;
    cartCount += change;
    item.quantity = newQuantity;

    updateCartDisplay();
    saveCart();
}

// Update cart display
function updateCartDisplay() {
    const cartItemsElement = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCountElement = document.querySelector('.cart-count');

    cartItemsElement.innerHTML = '';

    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">₹${item.price * item.quantity}</span>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsElement.appendChild(itemElement);
    });

    cartTotalElement.textContent = cartTotal;
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }

    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p>Your cart is empty</p>';
    }
}

// Toggle cart visibility
function toggleCart() {
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown) {
        cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
    }
}

// Checkout handler
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    let orderSummary = 'Order Summary:\n\n';
    cart.forEach(item => {
        orderSummary += `${item.name} x ${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    orderSummary += `\nTotal: ₹${cartTotal}`;

    const confirmed = confirm(`${orderSummary}\n\nConfirm order?`);

    if (confirmed) {
        alert('Order placed successfully! Thank you for your purchase.');
        cart = [];
        cartTotal = 0;
        cartCount = 0;
        updateCartDisplay();
        saveCart();
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('broRestaurantCart', JSON.stringify({
        items: cart,
        total: cartTotal,
        count: cartCount
    }));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('broRestaurantCart');
    if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        cart = parsedCart.items || [];
        cartTotal = parsedCart.total || 0;
        cartCount = parsedCart.count || 0;
    }
}

// Close cart when clicking outside
document.addEventListener('click', function(event) {
    const cartDropdown = document.getElementById('cartDropdown');
    const cartIcon = document.querySelector('.cart-icon');

    if (cartDropdown && cartIcon) {
        if (!cartDropdown.contains(event.target) &&
            event.target !== cartIcon &&
            !cartIcon.contains(event.target)) {
            cartDropdown.style.display = 'none';
        }
    }
});

// Initialize cart icon event listener
document.addEventListener('DOMContentLoaded', function() {
    const cartIcon = document.querySelector(".cart-icon");
    const cartDropdown = document.querySelector(".cart-dropdown");
    
    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            cartDropdown.classList.toggle("show");
        });
    }
});

// Add styles for flying item
const style = document.createElement('style');
style.textContent = `
    .flying-item {
        position: fixed;
        font-size: 20px;
        z-index: 1000;
        transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
`;
document.head.appendChild(style);