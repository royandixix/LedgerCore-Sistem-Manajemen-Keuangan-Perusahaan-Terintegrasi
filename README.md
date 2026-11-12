
# LedgerCore
## Sistem Manajemen Keuangan Perusahaan Terintegrasi

LedgerCore merupakan proyek pengembangan sistem informasi manajemen keuangan perusahaan yang dirancang untuk mengintegrasikan aktivitas akuntansi, pengelolaan transaksi, persetujuan keuangan, dan pelaporan dalam satu platform terpusat.

Sistem ini dikembangkan dengan pendekatan arsitektur modular agar dapat diperluas sesuai kebutuhan operasional perusahaan, sekaligus mendukung pengendalian akses, konsistensi data, dan keterlacakan aktivitas pengguna.

> Status proyek: Dalam pengembangan. Fondasi frontend, backend, dan koneksi database telah berhasil dibangun. Modul bisnis masih dikembangkan secara bertahap.

---

## 1. Tujuan Pengembangan

Pengembangan LedgerCore bertujuan untuk:

- Mengintegrasikan pengelolaan keuangan perusahaan dalam satu sistem.
- Mendukung pencatatan transaksi dan aktivitas akuntansi secara terstruktur.
- Mempermudah proses pemeriksaan dan persetujuan transaksi.
- Menyediakan dasar pengembangan laporan keuangan.
- Mendukung pengelolaan pengguna berdasarkan peran dan hak akses.
- Meningkatkan keterlacakan aktivitas melalui pencatatan audit.

## 2. Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js 16, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | NestJS 12, TypeScript |
| Database | PostgreSQL melalui Supabase |
| ORM | Prisma 7 |
| Authentication | Supabase Auth (direncanakan) |
| Package Manager | pnpm |
| Monorepo | Turborepo |
| Lingkungan Pengembangan | macOS, Visual Studio Code |

## 3. Arsitektur Sistem

LedgerCore menggunakan arsitektur frontend dan backend yang terpisah.

- **Frontend:** Menangani antarmuka dan interaksi pengguna.
- **Backend:** Menyediakan REST API dan logika bisnis.
- **Prisma ORM:** Menghubungkan aplikasi backend dengan PostgreSQL.
- **PostgreSQL:** Menyimpan data aplikasi secara terstruktur.
- **Supabase:** Menyediakan layanan database dan infrastruktur autentikasi yang direncanakan.

Alur komunikasi:

Frontend Next.js
→ REST API NestJS
→ Prisma ORM
→ PostgreSQL Supabase

## 4. Modul yang Direncanakan

### Manajemen Pengguna
- Login dan logout.
- Manajemen sesi.
- Pengelolaan pengguna.
- Pengaturan peran dan hak akses.

### Akuntansi
- Chart of Accounts.
- Jurnal umum.
- Validasi jurnal double-entry.
- Buku besar.
- Periode akuntansi.

### Manajemen Transaksi
- Pengelolaan transaksi keuangan.
- Pengelolaan piutang usaha.
- Pengelolaan utang usaha.
- Pengelolaan invoice.
- Riwayat transaksi.

### Persetujuan dan Pengawasan
- Alur persetujuan transaksi.
- Status pemeriksaan dan persetujuan.
- Riwayat aktivitas.
- Audit trail.

### Pelaporan Keuangan
- Laporan laba rugi.
- Neraca.
- Arus kas.
- Rekapitulasi transaksi.
- Dashboard analitik keuangan.

Modul-modul tersebut merupakan rencana pengembangan dan belum seluruhnya tersedia.

## 5. Peran Pengguna

LedgerCore direncanakan menggunakan tujuh peran utama:

| Peran | Tanggung Jawab |
|---|---|
| SUPER_ADMIN | Pengelolaan sistem dan konfigurasi utama |
| FINANCE_ADMIN | Administrasi keuangan dan pengelolaan pengguna terkait |
| ACCOUNTANT | Pencatatan akuntansi dan penyusunan laporan |
| FINANCE_MANAGER | Pemeriksaan dan persetujuan aktivitas keuangan |
| AP_OFFICER | Pengelolaan utang usaha |
| AR_OFFICER | Pengelolaan piutang usaha |
| AUDITOR | Pemeriksaan aktivitas dan laporan audit |

Implementasi hak akses akan dilakukan melalui Role-Based Access Control (RBAC).

## 6. Struktur Proyek

```text
ledgercore/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   ├── src/
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   ├── health/
│   │   │   ├── infrastructure/
│   │   │   └── modules/
│   │   └── package.json
│   │
│   └── web/
│       ├── src/
│       │   └── app/
│       └── package.json
│
├── packages/
│   └── shared/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## 7. Menjalankan Proyek

Persyaratan pengembangan:

- Node.js versi yang kompatibel dengan Next.js dan NestJS.
- pnpm.
- Database PostgreSQL yang dapat diakses.
- Konfigurasi environment backend yang valid.

### Instalasi Dependency

```bash
pnpm install
```

### Konfigurasi Database

Atur variabel lingkungan di:

```text
apps/api/.env
```

Variabel yang diperlukan mencakup:

```dotenv
NODE_ENV=development
HOST=127.0.0.1
PORT=4000

FRONTEND_URL=http://localhost:3000

SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=

DATABASE_URL=
DIRECT_URL=
```

Isi URL database dan konfigurasi SSL sesuai koneksi Supabase yang digunakan.

Jangan mengunggah file `.env`, password, service role key, atau kredensial database ke repositori.

### Menjalankan Backend

```bash
pnpm dev:api
```

Backend tersedia di:

```text
http://127.0.0.1:4000/api/v1
```

### Menjalankan Frontend

```bash
pnpm dev:web
```

Frontend tersedia di:

```text
http://localhost:3000
```

Jalankan frontend dan backend pada Terminal terpisah.

## 8. Pengujian Koneksi

Endpoint backend yang tersedia:

```text
GET /api/v1/health
GET /api/v1/health/database
```

Endpoint pertama memeriksa status API.

Endpoint kedua memeriksa koneksi database PostgreSQL melalui Prisma.

Kedua endpoint telah berhasil memberikan respons HTTP 200 pada lingkungan pengembangan.

## 9. Status Pengembangan

| Tahap | Fokus | Status |
|---|---|---|
| 1 | Fondasi proyek, API, database, frontend | Berjalan |
| 2 | Authentication dan RBAC | Direncanakan |
| 3 | Modul akuntansi | Direncanakan |
| 4 | Manajemen transaksi dan invoice | Direncanakan |
| 5 | Persetujuan dan audit | Direncanakan |
| 6 | Rekonsiliasi keuangan | Direncanakan |
| 7 | Pelaporan dan analitik | Direncanakan |
| 8 | Pengujian dan persiapan produksi | Direncanakan |

## 10. Keamanan dan Pengembangan

LedgerCore dirancang dengan memperhatikan:

- Pemisahan konfigurasi aplikasi dan kredensial.
- Penggunaan koneksi PostgreSQL melalui SSL.
- Validasi data pada sisi backend.
- Pengaturan hak akses berdasarkan peran.
- Pencatatan audit untuk aktivitas penting.
- Pengujian sebelum implementasi produksi.

Fitur keamanan dan modul bisnis akan disempurnakan secara bertahap.

---

**LedgerCore — Sistem Manajemen Keuangan Perusahaan Terintegrasi**

Dikembangkan sebagai proyek rekayasa perangkat lunak dengan pendekatan modular, terstruktur, dan berorientasi pada kebutuhan pengelolaan keuangan perusahaan.
