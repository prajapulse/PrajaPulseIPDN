// Inisialisasi Smooth Scroll dan UI
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi ulang UI
    updateCartUI();
    
    // Smooth scroll untuk link navigasi
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Logika Keranjang
let cart = JSON.parse(localStorage.getItem('e-ipdn-cart')) || [];

function updateCartUI() {
    const orderSummaryContainer = document.getElementById('order-summary-list');
    
    if (cart.length === 0) {
        if(orderSummaryContainer) orderSummaryContainer.innerHTML = '<p class="text-muted small mb-0">Belum ada produk yang dipilih.</p>';
        return;
    }
    
    // Bangun Ringkasan Pesanan (Daftar di formulir)
    if(orderSummaryContainer) {
        orderSummaryContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemPrice = parseInt(item.price) || (item.lengan === "Lengan Panjang" ? 155000 : 150000);
            const itemSubtotal = itemPrice * item.quantity;
            subtotal += itemSubtotal;

            const formattedPrice = new Intl.NumberFormat('id-ID').format(itemPrice);
            const formattedSubtotal = new Intl.NumberFormat('id-ID').format(itemSubtotal);

            orderSummaryContainer.innerHTML += `
                <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                    <div>
                        <div class="fw-bold small">${item.name}</div>
                        <div class="text-muted" style="font-size: 0.7rem;">${item.kelamin}, ${item.lengan}, Size ${item.size}</div>
                        <div class="fw-bold text-primary" style="font-size: 0.75rem;">Rp ${formattedPrice} x ${item.quantity} = Rp ${formattedSubtotal}</div>
                    </div>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm text-danger p-0" onclick="removeItem(${index})"><i class="fas fa-trash-can" style="font-size: 0.8rem;"></i></button>
                    </div>
                </div>
            `;
        });
        
        // Tambah info Pengiriman jika dipilih
        const wilayahSelect = document.getElementById('wilayahSelect');
        const wilayah = wilayahSelect ? wilayahSelect.value : "";
        let ongkirVal = 0;

        if(wilayah) {
            ongkirVal = wilayah === "Dalam Pulau Jawa" ? 15000 : 25000;
            const formattedOngkir = new Intl.NumberFormat('id-ID').format(ongkirVal);
            orderSummaryContainer.innerHTML += `
                <div class="mt-2 p-2 bg-light border-start border-primary border-4 rounded small">
                    <strong>Wilayah:</strong> ${wilayah}<br>
                    <strong>Ongkir:</strong> Rp ${formattedOngkir}
                </div>
            `;
        }

        const grandTotal = subtotal + ongkirVal;
        const formattedTotal = new Intl.NumberFormat('id-ID').format(grandTotal);

        orderSummaryContainer.innerHTML += `
            <div class="mt-3 p-3 bg-dark text-white rounded d-flex justify-content-between align-items-center">
                <span class="fw-bold">TOTAL BAYAR:</span>
                <span class="fw-bold fs-5">Rp ${formattedTotal}</span>
            </div>
        `;
        
        // Tambah petunjuk "Tambah lagi"
        orderSummaryContainer.innerHTML += `
            <div class="text-center mt-3">
                <a href="#catalog" class="text-primary small text-decoration-none"><i class="fas fa-plus me-1"></i> Tambah Produk Lain</a>
            </div>
        `;
    }
    
    localStorage.setItem('e-ipdn-cart', JSON.stringify(cart));
}

function openOptionsModal(name, price, image) {
    document.getElementById('modalProductName').innerText = name;
    document.getElementById('modalProductImage').value = image;
    
    // Reset Harga ke default (Lengan Pendek)
    const priceDisplay = document.getElementById('modalDisplayPrice');
    const priceBadge = document.getElementById('modalPriceBadge');
    const priceInput = document.getElementById('modalProductPrice');
    
    if(priceDisplay) priceDisplay.value = '150.000';
    if(priceInput) priceInput.value = '150000';
    
    if(priceBadge) {
        priceBadge.innerText = 'Rp 150.000';
        priceBadge.classList.remove('bg-primary');
        priceBadge.classList.add('bg-success');
    }
    
    const modal = new bootstrap.Modal(document.getElementById('optionsModal'));
    modal.show();
}

// Update harga real-time untuk modal
document.addEventListener('change', function(e) {
    if (e.target.name === 'lengan') {
        const priceDisplay = document.getElementById('modalDisplayPrice');
        const priceBadge = document.getElementById('modalPriceBadge');
        const priceInput = document.getElementById('modalProductPrice');
        if (priceDisplay) {
            if (e.target.value === 'Lengan Panjang') {
                priceDisplay.value = '155.000';
                if(priceInput) priceInput.value = '155000';
                if(priceBadge) {
                    priceBadge.innerText = 'Rp 155.000';
                    priceBadge.classList.replace('bg-success', 'bg-primary');
                }
            } else {
                priceDisplay.value = '150.000';
                if(priceInput) priceInput.value = '150000';
                if(priceBadge) {
                    priceBadge.innerText = 'Rp 150.000';
                    priceBadge.classList.replace('bg-primary', 'bg-success');
                }
            }
        }
    }
});

function confirmAddToCart() {
    const name = document.getElementById('modalProductName').innerText;
    const price = parseInt(document.getElementById('modalProductPrice').value) || 0;
    const image = document.getElementById('modalProductImage').value;
    const kelaminInput = document.querySelector('input[name="kelamin"]:checked');
    const lenganInput = document.querySelector('input[name="lengan"]:checked');
    
    const kelamin = kelaminInput ? kelaminInput.value : 'Pria';
    const lengan = lenganInput ? lenganInput.value : 'Lengan Pendek';
    const size = document.getElementById('sizeSelect').value;
    const qty = parseInt(document.getElementById('modalQty').value) || 1;
    
    addToCart(name, price, image, kelamin, lengan, size, qty);
    
    // Reset Jumlah untuk sesi berikutnya
    document.getElementById('modalQty').value = 1;
    
    // Sembunyikan modal
    const modalEl = document.getElementById('optionsModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
}

function addToCart(name, price, image, kelamin, lengan, size, qty = 1) {
    const existing = cart.find(item => 
        item.name === name && 
        item.kelamin === kelamin && 
        item.lengan === lengan && 
        item.size === size
    );
    
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ name, price, image, kelamin, lengan, size, quantity: qty });
    }
    updateCartUI();
    
    // Scroll otomatis ke formulir Pesanan
    const orderSection = document.getElementById('order');
    if (orderSection) {
        orderSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function clearCart() {
    if (confirm('Kosongkan pilihan Anda?')) {
        cart = [];
        updateCartUI();
    }
}

// Handler formulir global
document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.id === 'checkoutForm') {
        e.preventDefault();
        
        if (cart.length === 0) {
            alert('Silakan tambahkan produk terlebih dahulu.');
            return;
        }
        
        const nama = form.querySelector('[name="nama"]').value;
        const wa = form.querySelector('[name="whatsapp"]').value;
        const wilayah = form.querySelector('[name="wilayah"]').value;
        const alamat = form.querySelector('[name="alamat"]').value;
        const rt = form.querySelector('[name="rt"]').value;
        const rw = form.querySelector('[name="rw"]').value;
        const kodepos = form.querySelector('[name="kodepos"]').value;
        const catatan = form.querySelector('[name="catatan"]').value;
        
        if(!wilayah) {
            alert('Silakan pilih wilayah pengiriman.');
            return;
        }
        
        let message = `Halo Admin PRAJA PULSE!\n\n`;
        message += `*RINCIAN PESANAN:*\n`;
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemPrice = item.lengan === "Lengan Panjang" ? 155000 : 150000;
            const itemSubtotal = itemPrice * item.quantity;
            subtotal += itemSubtotal;
            const formattedPrice = new Intl.NumberFormat('id-ID').format(itemPrice);
            
            message += `-------------------------\n`;
            message += `Produk: ${item.name}\n`;
            message += `Varian: ${item.kelamin || 'Pria'}, ${item.lengan || 'Pendek'}, Size ${item.size || 'M'}\n`;
            message += `Harga: Rp ${formattedPrice} x ${item.quantity}\n`;
        });
        
        const ongkirVal = wilayah === "Dalam Pulau Jawa" ? 15000 : 25000;
        const totalBayar = subtotal + ongkirVal;
        const formattedTotal = new Intl.NumberFormat('id-ID').format(totalBayar);
        
        message += `-------------------------\n`;
        message += `*PENGIRIMAN:*\n`;
        message += `Wilayah: ${wilayah}\n`;
        message += `Ongkir: Rp ${new Intl.NumberFormat('id-ID').format(ongkirVal)}\n\n`;
        
        message += `*TOTAL BAYAR: Rp ${formattedTotal}*\n\n`;
        
        message += `*DATA PEMESAN:*\n`;
        message += `Nama: ${nama}\n`;
        message += `WhatsApp: ${wa}\n`;
        message += `Alamat: ${alamat}\n`;
        message += `RT/RW: ${rt}/${rw}\n`;
        message += `Kode Pos: ${kodepos}\n`;
        if(catatan) message += `Catatan: ${catatan}\n\n`; else message += `\n`;
        message += `Mohon konfirmasi pesanan saya. Terima kasih!`;
        
        const wa_base_url = "https://wa.me/6289531159072";
        const wa_url = `${wa_base_url}?text=${encodeURIComponent(message)}`;
        window.location.href = wa_url;
    }
});

// Efek Navbar
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.navbar');
    if (nav && window.scrollY > 50) {
        nav.classList.add('shadow-sm');
    } else if(nav) {
        nav.classList.remove('shadow-sm');
    }
});
