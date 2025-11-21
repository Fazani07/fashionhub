// --- Fungsi Helper (Alat Bantu) ---
const loadCart = () => {
    const cartJson = localStorage.getItem('fashionHubCart');
    return cartJson ? JSON.parse(cartJson) : [];
};

const saveCart = (cart) => {
    localStorage.setItem('fashionHubCart', JSON.stringify(cart));
};

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// --- Fungsi Inti (Core Functions) ---

// Update Badge Keranjang
const updateCartBadge = () => {
    const cart = loadCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
};

// View Detail Produk (Simpan data sebelum pindah halaman)
const viewProductDetail = (button) => {
    const product = {
        id: button.dataset.productId,
        name: button.dataset.name,
        price: parseInt(button.dataset.price),
        image: button.dataset.image,
        desc: button.dataset.desc // Ambil deskripsi singkat
    };
    localStorage.setItem('currentProductDetail', JSON.stringify(product));
    window.location.href = 'detail-produk.html';
};

// Render Halaman Detail Produk
const renderDetailPage = () => {
    const productJson = localStorage.getItem('currentProductDetail');
    if (!productJson) {
        window.location.href = 'index.html'; // Redirect jika tidak ada detail produk
        return;
    }
    const product = JSON.parse(productJson);
    const productImageUrl = product.image ? product.image.replace('300x400', '600x800') : 'https://via.placeholder.com/600x800?text=Produk';

    // Update elemen-elemen di halaman detail-produk.html
    document.getElementById('page-title').textContent = `${product.name} - FashionHub`; // Judul tab browser
    document.getElementById('product-image').src = productImageUrl;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('breadcrumb-name').textContent = product.name;
    document.getElementById('product-price').textContent = formatRupiah(product.price);
    document.getElementById('product-description').textContent = product.desc; // Deskripsi singkat
    
    // Set data untuk tombol 'Tambah ke Keranjang'
    const btnAddToCart = document.getElementById('btn-add-to-cart-detail');
    if (btnAddToCart) { // Pastikan elemen ada
        btnAddToCart.dataset.productId = product.id;
        btnAddToCart.dataset.name = product.name;
        btnAddToCart.dataset.price = product.price;
        // Gunakan ukuran gambar yang lebih kecil untuk thumbnail keranjang
        btnAddToCart.dataset.image = product.image ? product.image.replace('600x800', '80x100') : 'https://via.placeholder.com/80x100?text=Produk';
    }
};

// Tambah ke Keranjang
const addToCart = (button) => {
    let cart = loadCart();
    const productId = button.dataset.productId;
    const name = button.dataset.name;
    const price = parseInt(button.dataset.price);
    const image = button.dataset.image;
    
    // Dapatkan kuantitas dari input number
    const quantityInput = document.getElementById('quantity-input');
    const quantity = parseInt(quantityInput.value);
    
    const size = document.getElementById('size-select').value;
    
    const uniqueId = `${productId}-${size}`; // ID unik untuk kombinasi produk dan ukuran
    const existingItem = cart.find(item => item.id === uniqueId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: uniqueId, productId, name, price, image, quantity, size });
    }
    saveCart(cart);
    updateCartBadge();
    alert(`${name} (Ukuran: ${size}) telah ditambahkan ke keranjang!`);
};

// Render Halaman Keranjang
const renderCartPage = () => {
    const cartTableBody = document.getElementById('cart-table-body');
    if (!cartTableBody) return; 

    const cart = loadCart();
    cartTableBody.innerHTML = ''; 
    
    if (cart.length === 0) {
        cartTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Keranjang Anda masih kosong.</td></tr>';
        updateCartTotals(0, 0);
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="align-middle"><img src="${item.image}" alt="${item.name}" class="img-fluid rounded" style="width: 80px;"></td>
            <td class="align-middle"><h5 class="mb-1">${item.name}</h5><p class="mb-1 text-muted small">Ukuran: ${item.name.includes('Hoodie') ? item.size : 'Ukuran: ' + item.size}</p></td>
            <td class="align-middle">${formatRupiah(item.price)}</td>
            <td class="align-middle">
                <div class="input-group" style="width: 100px;">
                    <button class="btn btn-outline-secondary btn-sm btn-quantity-change" data-id="${item.id}" data-change="-1" type="button">-</button>
                    <input type="text" class="form-control form-control-sm text-center" value="${item.quantity}" readonly>
                    <button class="btn btn-outline-secondary btn-sm btn-quantity-change" data-id="${item.id}" data-change="1" type="button">+</button>
                </div>
            </td>
            <td class="align-middle fw-bold">${formatRupiah(itemTotal)}</td>
            <td class="align-middle text-end">
                <button class="btn btn-sm btn-outline-danger btn-remove-item" data-id="${item.id}" title="Hapus"><i class="bi bi-trash"></i></button>
            </td>
        `;
        cartTableBody.appendChild(row);
    });

    const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon'));
    if (appliedCoupon) {
        applyCoupon(appliedCoupon.code, subtotal);
    } else {
        updateCartTotals(subtotal, 20000); // Default shipping cost
    }
};

// Update Total Harga Keranjang
const updateCartTotals = (subtotal, shipping, discount = 0, couponCode = null) => {
    const total = subtotal + shipping - discount;
    
    // Update di Keranjang.html
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    if (cartSubtotalEl) {
        cartSubtotalEl.textContent = formatRupiah(subtotal);
        document.getElementById('cart-shipping').textContent = formatRupiah(shipping);
        document.getElementById('cart-discount').textContent = `−${formatRupiah(discount)}`;
        document.getElementById('cart-total').textContent = formatRupiah(total);
        
        const couponNotice = document.getElementById('coupon-notice');
        if (couponCode) {
            couponNotice.innerHTML = `<div class="alert alert-success py-2 px-3 small d-flex justify-content-between align-items-center"><span>Kupon <strong>${couponCode}</strong> diterapkan!</span><button class="btn-close btn-sm p-0 btn-remove-coupon" type="button"></button></div>`;
            localStorage.setItem('appliedCoupon', JSON.stringify({ code: couponCode, discount, shipping }));
        } else {
            couponNotice.innerHTML = '';
            localStorage.removeItem('appliedCoupon');
        }
    }

    // Update di Pembayaran.html
    const checkoutSubtotalEl = document.getElementById('checkout-subtotal');
    if (checkoutSubtotalEl) {
        checkoutSubtotalEl.textContent = formatRupiah(subtotal);
        document.getElementById('checkout-shipping').textContent = formatRupiah(shipping);
        document.getElementById('checkout-discount').textContent = `−${formatRupiah(discount)}`;
        document.getElementById('checkout-total').textContent = formatRupiah(total);
        document.getElementById('checkout-total-badge').textContent = loadCart().length;
    }
};

// Logika Kupon
const applyCoupon = (code = null, subtotal = null) => {
    const couponInput = document.getElementById('coupon-code');
    if (!code && couponInput) code = couponInput.value.toUpperCase(); // Ambil dari input jika tidak disediakan

    if (!subtotal) { // Hitung subtotal dari keranjang jika tidak disediakan
        const cart = loadCart();
        subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    let shipping = 20000;
    let discount = 0;
    let validCoupon = null;

    if (code === 'HEMAT10') {
        discount = subtotal * 0.10;
        validCoupon = 'HEMAT10';
        if (couponInput) alert('Kupon HEMAT10 (10%) berhasil digunakan!');
    } else if (code === 'GRATISONGKIR') {
        shipping = 0;
        validCoupon = 'GRATISONGKIR';
        if (couponInput) alert('Kupon GRATISONGKIR berhasil digunakan!');
    } else {
        if (couponInput) alert('Kode kupon tidak valid.');
    }
    updateCartTotals(subtotal, shipping, discount, validCoupon);
};

const removeCoupon = () => {
    localStorage.removeItem('appliedCoupon');
    renderCartPage(); // Render ulang keranjang setelah kupon dihapus
};

// Ubah Kuantitas & Hapus Item
const changeCartQuantity = (itemId, change) => {
    let cart = loadCart();
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            if (confirm('Hapus item ini?')) cart = cart.filter(i => i.id !== itemId);
            else item.quantity = 1; // Jika tidak jadi hapus, set quantity jadi 1
        }
        saveCart(cart);
        renderCartPage();
        updateCartBadge();
    }
};
const removeCartItem = (itemId) => {
    if (confirm('Hapus item ini?')) {
        let cart = loadCart();
        cart = cart.filter(item => item.id !== itemId);
        saveCart(cart);
        renderCartPage();
        updateCartBadge();
        if (cart.length === 0) removeCoupon(); // Hapus kupon jika keranjang kosong
    }
};

// Checkout Summary
const renderCheckoutSummary = () => {
    const summaryList = document.getElementById('checkout-summary-list');
    if (!summaryList) return; 

    const cart = loadCart();
    summaryList.innerHTML = ''; 
    
    if (cart.length === 0) {
        alert('Keranjang Anda kosong!');
        window.location.href = 'index.html';
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between lh-sm';
        li.innerHTML = `<div><h6 class="my-0">${item.name}</h6><small class="text-muted">Qty: ${item.quantity}, Size: ${item.size}</small></div><span class="text-muted">${formatRupiah(item.price * item.quantity)}</span>`;
        summaryList.appendChild(li);
    });

    const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon'));
    let shipping = 20000;
    let discount = 0;

    if (appliedCoupon) {
        if (appliedCoupon.code === 'HEMAT10') discount = subtotal * 0.10;
        if (appliedCoupon.code === 'GRATISONGKIR') shipping = 0;
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between bg-light';
        li.innerHTML = `<div class="text-success"><h6 class="my-0">Diskon Kupon</h6><small>${appliedCoupon.code}</small></div><span class="text-success">−${formatRupiah(discount)}</span>`;
        summaryList.appendChild(li);
    }
    updateCartTotals(subtotal, shipping, discount);
};

const clearCartAfterPayment = () => {
    saveCart([]);
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('currentProductDetail');
    updateCartBadge();
};

// --- FUNGSI PROFIL ---

const loadProfileData = () => {
    const userProfile = JSON.parse(localStorage.getItem('fashionHubProfile')) || {
        namaDepan: 'Radityarma', namaBelakang: 'Fazani', email: 'radityarma.fazani@gmail.com', telepon: '081239345766'
    };
    const userAddress = JSON.parse(localStorage.getItem('fashionHubAddress')) || {
        penerima: 'Radityarma Fazani', telepon: '081239345766', alamat: 'Jl. Pahlawan No. 123, Surabaya, Jawa Timur'
    };

    // Isi Form Detail Akun
    if (document.getElementById('profilNamaDepan')) {
        document.getElementById('profilNamaDepan').value = userProfile.namaDepan;
        document.getElementById('profilNamaBelakang').value = userProfile.namaBelakang;
        document.getElementById('profilEmail').value = userProfile.email;
        document.getElementById('profilTelepon').value = userProfile.telepon;
        
        // Update Sidebar
        document.getElementById('sidebar-name').textContent = `${userProfile.namaDepan} ${userProfile.namaBelakang}`;
        document.getElementById('sidebar-email').textContent = userProfile.email;
    }

    // Isi Tampilan Alamat
    const addressCard = document.getElementById('address-card-display');
    if (addressCard) {
        addressCard.innerHTML = `<h5 class="fw-bold">${userAddress.penerima}</h5><p class="mb-1">${userAddress.telepon}</p><p class="mb-0">${userAddress.alamat}</p>`;
    }

    // Isi Form Modal Alamat
    if (document.getElementById('editNama')) {
        document.getElementById('editNama').value = userAddress.penerima;
        document.getElementById('editTelepon').value = userAddress.telepon;
        document.getElementById('editAlamat').value = userAddress.alamat;
    }
};

// --- FUNGSI WISHLIST ---
const toggleWishlist = (button) => {
    const icon = button.querySelector('i'); // Dapatkan elemen ikon di dalam tombol
    
    // Periksa apakah ikon saat ini adalah hati kosong atau terisi
    if (icon.classList.contains('bi-heart')) {
        // Jika kosong, ubah menjadi terisi dan beri warna merah
        icon.classList.remove('bi-heart');
        icon.classList.add('bi-heart-fill');
        button.classList.add('text-danger');
        alert('Produk ditambahkan ke Wishlist');
    } else {
        // Jika terisi, ubah menjadi kosong dan hapus warna merah
        icon.classList.remove('bi-heart-fill');
        icon.classList.add('bi-heart');
        button.classList.remove('text-danger');
        alert('Produk dihapus dari Wishlist'); // Notifikasi opsional
    }
};


// --- EVENT LISTENERS UTAMA ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    
    // Tombol Lihat Detail (di index.html, kategori.html, diskon.html)
    document.querySelectorAll('.btn-view-detail').forEach(btn => {
        btn.addEventListener('click', (e) => viewProductDetail(e.currentTarget));
    });

    // Halaman Detail Produk
    if (document.getElementById('product-name')) {
        renderDetailPage();
        const btnAddToCartDetail = document.getElementById('btn-add-to-cart-detail');
        if (btnAddToCartDetail) {
            btnAddToCartDetail.addEventListener('click', (e) => addToCart(e.currentTarget));
        }

        const btnWishlistDetail = document.getElementById('btn-wishlist-detail');
        if (btnWishlistDetail) {
            btnWishlistDetail.addEventListener('click', (e) => toggleWishlist(e.currentTarget));
        }
    }

    // Halaman Keranjang
    if (document.getElementById('cart-table-body')) {
        renderCartPage();
        document.getElementById('cart-table-body').addEventListener('click', (event) => {
            const removeBtn = event.target.closest('.btn-remove-item');
            const quantityBtn = event.target.closest('.btn-quantity-change');
            if (removeBtn) removeCartItem(removeBtn.dataset.id);
            if (quantityBtn) changeCartQuantity(quantityBtn.dataset.id, parseInt(quantityBtn.dataset.change));
        });
        const couponApplyBtn = document.getElementById('coupon-apply-btn');
        if (couponApplyBtn) {
            couponApplyBtn.addEventListener('click', () => applyCoupon());
        }
        const couponNotice = document.getElementById('coupon-notice');
        if (couponNotice) {
            couponNotice.addEventListener('click', (event) => {
                if (event.target.closest('.btn-remove-coupon')) removeCoupon();
            });
        }
    }

    // Halaman Pembayaran
    if (document.getElementById('checkout-form')) {
        renderCheckoutSummary();
        const checkoutForm = document.getElementById('checkout-form');
        const successModal = new bootstrap.Modal(document.getElementById('paymentSuccessModal'));
        checkoutForm.addEventListener('submit', event => {
            event.preventDefault(); event.stopPropagation();
            if (!checkoutForm.checkValidity()) checkoutForm.classList.add('was-validated');
            else { successModal.show(); clearCartAfterPayment(); checkoutForm.classList.remove('was-validated'); }
        }, false);
    }

    // Halaman Profil (Image Preview & Data Simpan)
    const profileImageInput = document.getElementById('profileImageInput');
    const profileImagePreview = document.getElementById('profileImagePreview');
    if (profileImageInput && profileImagePreview) {
        profileImageInput.addEventListener('change', () => {
            const file = profileImageInput.files[0];
            if (file) profileImagePreview.src = URL.createObjectURL(file);
        });
    }
    loadProfileData(); // Panggil fungsi loadProfileData saat DOMContentLoaded
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newProfile = {
                namaDepan: document.getElementById('profilNamaDepan').value,
                namaBelakang: document.getElementById('profilNamaBelakang').value,
                email: document.getElementById('profilEmail').value,
                telepon: document.getElementById('profilTelepon').value
            };
            localStorage.setItem('fashionHubProfile', JSON.stringify(newProfile));
            loadProfileData(); // Refresh data di sidebar dan form
            alert('Profil berhasil diperbarui!');
        });
    }
    const btnSimpanAlamat = document.querySelector('.btn-save-address');
    if (btnSimpanAlamat) {
        btnSimpanAlamat.addEventListener('click', () => {
            const newAddress = {
                penerima: document.getElementById('editNama').value,
                telepon: document.getElementById('editTelepon').value,
                alamat: document.getElementById('editAlamat').value
            };
            localStorage.setItem('fashionHubAddress', JSON.stringify(newAddress));
            loadProfileData(); // Refresh tampilan alamat
            const modalEl = document.getElementById('ubahAlamatModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
            alert('Alamat berhasil diperbarui!');
        });
    }

    // Inisialisasi Tooltips Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Menambahkan fungsionalitas visual untuk memilih warna 
    document.querySelectorAll('.color-circle').forEach(circle => {
        circle.addEventListener('click', () => {
            // Hapus kelas 'active' dari semua lingkaran warna
            document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
            // Tambahkan kelas 'active' ke lingkaran yang diklik
            circle.classList.add('active');
        });
    });

    // Interaksi visual untuk lingkaran warna di halaman DISKON
    document.querySelectorAll('.col-lg-3 .card-body .d-flex.flex-wrap.gap-2 .color-circle').forEach(circle => {
        circle.addEventListener('click', () => {
            // Hapus kelas 'active' dari semua lingkaran warna di halaman DISKON
            document.querySelectorAll('.col-lg-3 .card-body .d-flex.flex-wrap.gap-2 .color-circle').forEach(c => c.classList.remove('active'));
            // Tambahkan kelas 'active' ke lingkaran yang baru saja diklik di halaman DISKON
            circle.classList.add('active');
        });
    });
});