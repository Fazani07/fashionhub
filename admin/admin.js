// Menunggu sampai semua halaman (DOM) selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    'use strict'

    const productModalElement = document.getElementById('productModal');
    
    if (productModalElement) {
        // ... (Kode untuk Manajemen Produk Anda yang sudah ada - disingkat) ...
        const productModal = new bootstrap.Modal(productModalElement);
        const productForm = document.getElementById('productForm');
        const productTableBody = document.getElementById('product-table-body');
        const modalTitle = document.getElementById('productModalLabel');
        const modalImagePreview = document.getElementById('modalImagePreview');
        const priceInput = document.getElementById('productPrice');
        const fileInput = document.getElementById('productImageFile');
        let currentRowBeingEdited = null;
        fileInput.addEventListener('change', () => { const file = fileInput.files[0]; if (file) { modalImagePreview.src = URL.createObjectURL(file); } });
        document.getElementById('btnTambahProduk').addEventListener('click', () => { currentRowBeingEdited = null; modalTitle.textContent = 'Tambah Produk Baru'; productForm.reset(); modalImagePreview.src = 'https://via.placeholder.com/150x200?text=Preview'; });
        productTableBody.addEventListener('click', (event) => {
            const target = event.target;
            const editButton = target.closest('.btn-edit');
            const deleteButton = target.closest('.btn-delete');
            if (deleteButton) { const row = deleteButton.closest('tr'); if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) { row.remove(); } }
            if (editButton) {
                currentRowBeingEdited = editButton.closest('tr');
                const imageUrl = currentRowBeingEdited.cells[1].querySelector('img').src;
                const nama = currentRowBeingEdited.cells[2].textContent;
                const kategori = currentRowBeingEdited.cells[3].textContent;
                const hargaString = currentRowBeingEdited.cells[4].textContent; 
                const stok = currentRowBeingEdited.cells[5].textContent;
                const hargaAngka = hargaString.replace('Rp ', '').replace(/\./g, '');
                modalTitle.textContent = 'Edit Produk';
                document.getElementById('productName').value = nama;
                document.getElementById('productCategory').value = kategori;
                priceInput.value = hargaAngka; 
                document.getElementById('productStock').value = stok;
                modalImagePreview.src = imageUrl;
                productModal.show();
            }
        });
        productForm.addEventListener('submit', (event) => {
            event.preventDefault(); 
            const nama = document.getElementById('productName').value;
            const kategori = document.getElementById('productCategory').value;
            const harga = priceInput.value; 
            const stok = document.getElementById('productStock').value;
            const file = fileInput.files[0];
            const hargaFormatted = "Rp " + new Intl.NumberFormat('id-ID').format(harga);
            let imageUrl;
            if (file) { imageUrl = URL.createObjectURL(file); } else if (currentRowBeingEdited) { imageUrl = currentRowBeingEdited.cells[1].querySelector('img').src; } else { imageUrl = 'https://via.placeholder.com/80x100?text=No+Img'; }
            if (currentRowBeingEdited) {
                currentRowBeingEdited.cells[1].querySelector('img').src = imageUrl;
                currentRowBeingEdited.cells[2].textContent = nama;
                currentRowBeingEdited.cells[3].textContent = kategori;
                currentRowBeingEdited.cells[4].textContent = hargaFormatted; 
                currentRowBeingEdited.cells[5].textContent = stok;
            } else {
                const newRowId = productTableBody.rows.length + 1;
                const newRowHtml = `<tr><td>${newRowId}</td><td><img src="${imageUrl}" alt="${nama}" class="rounded admin-table-img"></td><td>${nama}</td><td>${kategori}</td><td>${hargaFormatted}</td><td>${stok}</td><td><button class="btn btn-sm btn-outline-secondary btn-edit" title="Edit"><i class="bi bi-pencil-fill"></i></button> <button class="btn btn-sm btn-outline-danger btn-delete" title="Hapus"><i class="bi bi-trash-fill"></i></button></td></tr>`;
                productTableBody.insertAdjacentHTML('beforeend', newRowHtml);
            }
            productModal.hide(); 
            productForm.reset(); 
        });
    }

    /* Logika untuk admin/admin-manajemen-pesanan.html */
    const orderTableBody = document.getElementById('order-table-body');
    if (orderTableBody) {
        // ... (Kode warna status dropdown Anda yang sudah ada - disingkat) ...
        const updateSelectColor = (selectElement) => {
            selectElement.classList.remove('text-bg-success', 'text-bg-info', 'text-bg-warning', 'text-bg-danger', 'text-bg-secondary');
            switch (selectElement.value) {
                case 'selesai': selectElement.classList.add('text-bg-success'); break;
                case 'diproses': case 'dikirim': selectElement.classList.add('text-bg-info'); break;
                case 'menunggu': selectElement.classList.add('text-bg-warning'); break;
                case 'batal': selectElement.classList.add('text-bg-danger'); break;
                default: selectElement.classList.add('text-bg-secondary');
            }
        };
        orderTableBody.querySelectorAll('.status-select').forEach(updateSelectColor);
        orderTableBody.addEventListener('change', (event) => {
            if (event.target.classList.contains('status-select')) {
                updateSelectColor(event.target);
            }
        });
    }

    /* Bagian 3: Logika untuk admin/admin-laporan-penjualan.html */
    const ctx = document.getElementById('myChart');
    if (ctx && typeof Chart !== 'undefined') {
        // ... (Kode Chart.js Anda yang sudah ada - disingkat) ...
        new Chart(ctx, { type: 'line', data: { labels: ['Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November'], datasets: [{ label: 'Pendapatan (Juta Rp)', data: [5, 7, 10, 8, 12, 15], backgroundColor: 'rgba(0, 123, 255, 0.1)', borderColor: 'rgba(0, 123, 255, 1)', borderWidth: 2, fill: true }] }, options: { responsive: true, scales: { y: { beginAtZero: true } } } });
        const pieCtx = document.getElementById('myPieChart');
        new Chart(pieCtx, { type: 'pie', data: { labels: ['Vintage Denim Jacket', 'Kemeja Flanel', 'White Sneakers'], datasets: [{ label: 'Produk Terlaris', data: [300, 150, 100], backgroundColor: ['#0d6efd', '#198754', '#ffc107'], hoverOffset: 4 }] }, options: { responsive: true } });
    }

    /* Bagian 4: Logika untuk admin/admin-manajemen-diskon.html */
    const diskonModalElement = document.getElementById('diskonModal');

    // Cek apakah kita ada di halaman yang TEPAT
    if (diskonModalElement) {
        
        const diskonModal = new bootstrap.Modal(diskonModalElement);
        const diskonForm = document.getElementById('diskonForm');
        const diskonTableBody = document.getElementById('diskon-table-body');
        const modalTitle = document.getElementById('diskonModalLabel');
        let currentDiskonRowBeingEdited = null;

        // --- Fungsi Helper untuk memformat Nilai Diskon ---
        const formatDiskonValue = (nilai, tipe) => {
            if (tipe === 'Persen (%)') {
                return nilai + '%'; // Tambah simbol %
            } else {
                return "Rp " + new Intl.NumberFormat('id-ID').format(nilai); // Format jadi Rupiah
            }
        };

        // --- Fungsi Helper untuk memformat Status ---
        const formatDiskonStatus = (status) => {
            if (status === 'Aktif') {
                return '<span class="badge text-bg-success">Aktif</span>';
            } else {
                return '<span class="badge text-bg-danger">Kadaluarsa</span>';
            }
        };

        // --- Tombol "Tambah Kupon Baru" ---
        document.getElementById('btnTambahDiskon').addEventListener('click', () => {
            currentDiskonRowBeingEdited = null;
            modalTitle.textContent = 'Tambah Kupon Baru';
            diskonForm.reset();
        });

        // --- Tabel Diskon (Edit & Hapus) ---
        diskonTableBody.addEventListener('click', (event) => {
            const target = event.target;
            const editButton = target.closest('.btn-edit-diskon');
            const deleteButton = target.closest('.btn-delete-diskon');

            // --- Logika HAPUS ---
            if (deleteButton) {
                const row = deleteButton.closest('tr');
                if (confirm('Apakah Anda yakin ingin menghapus kupon ini?')) {
                    row.remove();
                }
            }

            // --- Logika EDIT ---
            if (editButton) {
                currentDiskonRowBeingEdited = editButton.closest('tr');
                
                // Ambil data dari sel (td)
                const kode = currentDiskonRowBeingEdited.cells[0].textContent;
                const tipe = currentDiskonRowBeingEdited.cells[1].textContent;
                const nilaiString = currentDiskonRowBeingEdited.cells[2].textContent; // "20%" atau "Rp 20.000"
                const status = currentDiskonRowBeingEdited.cells[3].textContent; // "Aktif" atau "Kadaluarsa"

                // Ubah nilaiString menjadi angka murni
                const nilaiAngka = nilaiString.replace('Rp ', '').replace(/\./g, '').replace('%', '');

                modalTitle.textContent = 'Edit Kupon: ' + kode;
                
                // Isi form modal
                document.getElementById('kuponKode').value = kode;
                document.getElementById('kuponTipe').value = tipe;
                document.getElementById('kuponNilai').value = nilaiAngka;
                document.getElementById('kuponStatus').value = status;

                diskonModal.show();
            }
        });

        // --- Form Diskon Submit (Simpan) ---
        diskonForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // Ambil data dari form
            const kode = document.getElementById('kuponKode').value.toUpperCase(); // Paksa huruf besar
            const tipe = document.getElementById('kuponTipe').value;
            const nilai = document.getElementById('kuponNilai').value;
            const status = document.getElementById('kuponStatus').value;

            // Format data untuk ditampilkan di tabel
            const nilaiFormatted = formatDiskonValue(nilai, tipe);
            const statusFormatted = formatDiskonStatus(status);

            if (currentDiskonRowBeingEdited) {
                // --- Mode EDIT ---
                currentDiskonRowBeingEdited.cells[0].textContent = kode;
                currentDiskonRowBeingEdited.cells[1].textContent = tipe;
                currentDiskonRowBeingEdited.cells[2].textContent = nilaiFormatted;
                currentDiskonRowBeingEdited.cells[3].innerHTML = statusFormatted; // Pakai .innerHTML karena ada HTML <span>
            } else {
                // --- Mode TAMBAH ---
                const newRowHtml = `
                    <tr>
                        <td class="fw-bold">${kode}</td>
                        <td>${tipe}</td>
                        <td>${nilaiFormatted}</td>
                        <td>${statusFormatted}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-secondary btn-edit-diskon" title="Edit">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete-diskon" title="Hapus">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </td>
                    </tr>
                `;
                diskonTableBody.insertAdjacentHTML('beforeend', newRowHtml);
            }

            diskonModal.hide();
            diskonForm.reset();
        });
    }

});