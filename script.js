const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

function getProductDetails(productId) {
    let products = {
        'product1': {
            id: 'product1',
            name: 'Eco-Friendly Diya',
            price: 50,
            images: {
                'Red': 'img/pro.png',
                'White': 'img/pro3.png',
                'Green': 'img/pro4.png',
                'Blue': 'img/pro5.png'
            },
            colors: ['Red', 'White', 'Green', 'Blue']
        },
        'product2': {
            id: 'product2',
            name: 'Candle',
            price: 20,
            images: {
                'Default': 'img/pro2.png'
            },
            colors: ['Default']
        },
    };
    return products[productId];
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let product = getProductDetails(productId);

    // Get selected color
    let selectedColor = document.getElementById('color-' + productId).value;
    product.color = selectedColor;

    // Get the image for the selected color
    product.image = product.images[selectedColor];

    let quantityInput = document.getElementById('quantity-' + productId).value;
    let quantity = Math.max(1, parseInt(quantityInput));
    product.quantity = quantity;

    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart with color: ' + selectedColor);
}

function displayCartItems() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let tbody = document.querySelector("tbody");
    tbody.innerHTML = '';  // Clear existing content

    cart.forEach((item, index) => {
        let row = `
            <tr>
                <td><a href="#" onclick="removeFromCart(${index})"><i class="far fa-times-circle"></i></a></td>
                <td><img src="${item.image}" alt="" width="50px"></td> <!-- Use the selected color's image -->
                <td>${item.name}</td>
                <td>${item.color}</td> <!-- Display the selected color -->
                <td>₹${item.price}</td>
                <td><input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)"></td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>`;
        tbody.innerHTML += row;
    });

    updateTotal();
}

function updateTotal() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('total-price').textContent = 'Total: ₹' + total.toFixed(2);
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

function updateQuantity(index, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

window.onload = displayCartItems;

function checkout() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        alert("Your cart is empty. Please add items to the cart before proceeding to checkout.");
        return;  // Prevent checkout
    }

    alert("Thank you for your purchase you are being redirected to checkout page");
    window.location.href = 'checkout.html';  // Redirect to homepage after purchase
}

function applyCoupon() {
    let coupon = document.getElementById('coupon').value;
    let total = JSON.parse(localStorage.getItem('cart')).reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discount = 0;
    if (coupon === 'SAVE10') {
        discount = total * 0.10;  // 10% discount
    } else {
        alert("Invalid coupon code!");
        return;
    }

    let newTotal = total - discount;
    localStorage.setItem('totalPrice', newTotal);  // Update total after discount
    document.getElementById('total-price').textContent = 'Total: ₹' + newTotal.toFixed(2);
}

function confirmOrder(event) {
    event.preventDefault();  // Prevent the form from submitting traditionally

    let buyerName = document.getElementById('buyer-name').value;
    let buyerPhone = document.getElementById('buyer-phone').value.trim();
    let paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if phone number is exactly 10 digits
    if (!/^\d{10}$/.test(buyerPhone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    if (!buyerName || !buyerPhone) {
        alert("Please enter your name and phone number.");
        return;
    }

    if (paymentMethod === 'UPI') {
        let upiId = document.getElementById('upi-id').value;
        if (!upiId) {
            alert("Please enter your UPI ID.");
            return;
        }
    }

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    let totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let orderDetails = {
        buyerName: buyerName,
        buyerPhone: buyerPhone,
        cartItems: JSON.stringify(cart),  // Convert cart array to string for storage
        totalPrice: totalPrice,
        paymentMethod: paymentMethod
    };

    console.log("Order details: ", orderDetails);  // Debugging log

    // Send data to Google Spreadsheet Web App
    fetch('https://script.google.com/macros/s/AKfycbzh0MpCdm13bHEC-GColnRfoKrbXUuIUxm6ebSAPtKhgz-wM8SiiWvBvf3_Is9sHtC3/exec', {
        method: 'POST',
        body: new URLSearchParams(orderDetails)
    })
    .then(response => response.text())
    .then(data => {
        console.log("Response: ", data);  // Debugging log
        alert("Order confirmed! " + data);
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    })
    .catch(error => {
        console.error('Error:', error);  // Detailed error logging
        alert("Failed to place order. Please try again later.");
    });
}


