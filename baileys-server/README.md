# 📱 InspectAI Baileys WhatsApp Gateway (Standalone Service)

Layanan microservice standalone **WhatsApp Multi-Device Gateway** menggunakan `@whiskeysockets/baileys` untuk aplikasi **InspectAI Quality Inspection OS**.

Layanan ini dirancang untuk berjalan di server Node.js persistent (seperti **Railway**, **Render**, **VPS**, atau **Fly.io**), karena Vercel bersifat Serverless (ephemeral) dan tidak mendukung koneksi WebSocket jangka panjang.

---

## 🚀 Fitur Utama
- ✅ **QR Code WhatsApp Multi-Device Nyata** (Bisa discan langsung via menu *Tautkan Perangkat / Linked Devices* di WhatsApp HP).
- ✅ **Auto-Reconnect & Persistent Session** (Menyimpan kredensial sesi WhatsApp multi-file auth).
- ✅ **REST API Lengkap** (`/status`, `/connect`, `/send`, `/disconnect`).
- ✅ **Inbound Webhook Forwarder** (Meneruskan pesan & foto audit dari WhatsApp inspector lapangan ke API Webhook Vercel Next.js).
- ✅ **Docker Ready** (Siap dideploy dengan 1-klik ke Railway / Render / VPS).

---

## 🛠️ Cara Deploy & Integrasi ke Vercel

### Opsi 1: Deploy ke Railway (Direkomendasikan)
1. Buat akun di [Railway.app](https://railway.app).
2. Klik **New Project** > **Deploy from GitHub repo** (atau pilih subfolder `baileys-server`).
3. Tambahkan Environment Variable di Railway:
   - `PORT`: `4000`
   - `WEBHOOK_URL`: `https://aqs-inspection.vercel.app/api/webhooks/whatsapp`
   - *(Opsional)* `API_SECRET`: `rahasia-api-anda`
4. Copy domain publik yang diberikan Railway (contoh: `https://inspectai-baileys.up.railway.app`).
5. Buka dashboard Vercel pada proyek Anda:
   - Tambahkan Environment Variable:
     - `BAILEYS_SERVER_URL`: `https://inspectai-baileys.up.railway.app`
     - `BAILEYS_API_SECRET`: `rahasia-api-anda` *(jika diisi di Railway)*
6. Redeploy Vercel. Selesai!

---

### Opsi 2: Deploy ke VPS / Ubuntu Server
```bash
# Clone repo & masuk ke folder baileys-server
cd baileys-server
npm install

# Setup env
cp .env.example .env
nano .env

# Jalankan dengan PM2 agar aktif 24/7
npm install -g pm2
pm2 start index.js --name "baileys-gateway"
pm2 save
pm2 startup
```

---

### Opsi 3: Test di Komputer Lokal (Localhost)
1. Buka terminal baru:
   ```bash
   cd baileys-server
   npm install
   npm start
   ```
2. Server akan aktif di `http://localhost:4000`.
3. Di file `.env` root Next.js Anda:
   ```env
   BAILEYS_SERVER_URL=http://localhost:4000
   ```
4. Buka `http://localhost:3000/agents/whatsapp-gateway` dan klik **Generate QR**. Scan QR yang muncul dengan WhatsApp di HP Anda!

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/status` | Mendapatkan status koneksi, nomor HP yang terhubung, dan QR Code aktif |
| `POST` | `/connect` | Memulai socket Baileys dan generate QR code baru |
| `POST` | `/send` | Mengirim pesan WhatsApp (`{ "to": "+62812345", "text": "Pesan" }`) |
| `POST` | `/disconnect` | Logout dan menghapus sesi WhatsApp |
