# FinanceFlow - Smart Finance Manager

Aplikasi manajemen keuangan multi-user dengan fitur PWA (Progressive Web App).

## File yang Harus Di-Deploy ke GitHub

### 📁 File Utama (WAJIB)
```
├── index.html          # Halaman utama aplikasi
├── style.css           # Styling aplikasi
├── app.js              # Logika aplikasi dan JavaScript
├── manifest.json       # Konfigurasi PWA
└── service-worker.js   # Service Worker untuk PWA
```

### 🎨 File Icon (WAJIB untuk PWA)
```
├── favicon.svg         # Favicon SVG (utama)
├── favicon.png         # Favicon PNG (fallback)
├── icon.svg            # Icon aplikasi SVG
├── icon-192.png        # Icon 192x192 untuk PWA
└── icon-512.png        # Icon 512x512 untuk PWA
```

### 🛠️ File Tambahan (Opsional)
```
├── generate-icon.html  # Tool untuk generate icon PNG
├── create-icons.js     # Script untuk membuat icon
└── README.md           # Dokumentasi proyek
```

## Cara Generate Icon PNG

1. Buka file `generate-icon.html` di browser
2. Klik tombol download untuk setiap ukuran icon
3. Simpan file PNG yang di-download ke folder proyek

## Konfigurasi GitHub Pages

1. Upload semua file ke repository GitHub
2. Aktifkan GitHub Pages di Settings > Pages
3. Pilih source: "Deploy from a branch"
4. Pilih branch: "main" atau "master"
5. Folder: "/ (root)"

## Testing PWA

1. Buka aplikasi di browser desktop
2. Klik tombol "Install App" jika muncul
3. Atau buka di mobile browser
4. Pilih "Add to Home Screen" dari menu browser

## Fitur PWA

- ✅ Installable di mobile dan desktop
- ✅ Offline support dengan Service Worker
- ✅ Icon muncul di home screen
- ✅ Splash screen saat membuka
- ✅ Multi-user support
- ✅ Auto-sync transaksi tabungan

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support (iOS 11.3+)
- Samsung Internet: Full support
