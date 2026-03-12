# Unstructured Data Management System

Kurumsal dosya sistemlerindeki hassas verileri (TCKN, IBAN, kredi kartı, sağlık verileri vb.) tespit edip yöneten bir Veri Koruma platformu. On-prem çalışacak şekilde tasarlanmıştır.

## Mimari

```
├── src/                    # React 19 + Vite frontend
│   ├── pages/              # 9 sayfa (Dashboard, DetectedFiles, Rules, WorkflowBuilder,
│   │                       #   WorkflowTemplates, Policies, Exceptions, AuditLog, Settings)
│   ├── components/         # Ortak bileşenler (StatusBadge, ClassificationBadge, Sidebar)
│   ├── services/api.js     # Backend API istemcisi (tüm fetch çağrıları)
│   ├── hooks/useApi.js     # Genel amaçlı veri çekme hook'u
│   ├── data/mockData.js    # Statik referans veriler (classifications, fileTypes, nodeTypes)
│   └── styles/index.css    # Global dark theme stilleri
├── server/                 # Express 5 + Prisma ORM backend
│   ├── index.js            # Sunucu giriş noktası (port 3001)
│   ├── routes/             # 9 REST API route modülü (scan dahil)
│   ├── services/           # İş mantığı servisleri
│   │   ├── scanner.js      # Tarama motoru (throttle, batch, concurrency)
│   │   ├── textExtractor.js # PDF/DOCX/XLSX metin çıkarma
│   │   └── patternMatcher.js # Regex tabanlı hassas veri tespiti
│   ├── prisma/
│   │   ├── schema.prisma   # Veritabanı şeması (8 model)
│   │   ├── seed.js         # Başlangıç verisi
│   │   └── migrations/     # Prisma migration'ları
│   └── .env.example        # Ortam değişkenleri şablonu
└── vite.config.js          # Vite yapılandırması + API proxy
```

## Teknoloji Yığını

- **Frontend:** React 19, Vite 7, React Router 7, @xyflow/react (workflow builder), dnd-kit, Lucide icons
- **Backend:** Express 5, Prisma ORM, SQLite (PostgreSQL'e geçiş kolay)
- **Dil:** Türkçe UI, JavaScript (ESM)
- **Stil:** CSS custom properties, dark theme

## Çalıştırma

```bash
# Backend
cd server
cp .env.example .env
npm install
npx prisma migrate dev
node prisma/seed.js
npm run dev              # http://localhost:3001

# Frontend (ayrı terminal)
cd ..
npm install
npm run dev              # http://localhost:5173 (API proxy -> 3001)
```

## Build & Komutlar

```bash
# Frontend
npm run build            # Production build -> dist/
npm run lint             # ESLint

# Backend
cd server
npm run dev              # node --watch ile geliştirme
npm start                # Production
npm run db:migrate       # Prisma migration
npm run db:seed          # Seed data yükle
npm run db:generate      # Prisma client oluştur
```

## API Endpoint'leri

| Kaynak | GET | POST | PUT | DELETE |
|--------|-----|------|-----|--------|
| `/api/files` | Liste + filtreleme | - | `/:id` durum güncelle | `/:id` |
| `/api/files/stats/summary` | Dashboard istatistikleri | - | - | - |
| `/api/rules` | Liste | Yeni kural | `/:id` güncelle | `/:id` |
| `/api/policies` | Liste | Yeni politika | `/:id` güncelle | `/:id` |
| `/api/exceptions` | Liste | Yeni istisna talebi | `/:id` onayla/reddet | `/:id` |
| `/api/audit` | Liste + filtreleme | Yeni kayıt | - | - |
| `/api/workflows` | Liste (?templates=true/false) | Yeni akış | `/:id` güncelle | `/:id` |
| `/api/scan-locations` | Liste | Yeni konum | `/:id` durum güncelle | `/:id` |
| `/api/settings` | Tüm ayarlar | - | `/:key` upsert | - |
| `/api/scan` | `GET /status` durum | `POST /start,pause,resume,cancel` | - | - |
| `/api/scan/progress` | SSE gerçek zamanlı ilerleme | - | - | - |
| `/api/health` | Sağlık kontrolü | - | - | - |

## Veritabanı Modelleri

`DetectedFile`, `Rule`, `Policy`, `Exception`, `AuditLog`, `ScanLocation`, `Workflow`, `Setting`

JSON alanları (detectedData, fileTypes, steps, nodes, edges, setting values) string olarak saklanır, API katmanında parse/stringify yapılır.

## Dağıtım Notları

- **On-prem** çalışacak, GitHub Pages deploy'u sadece demo amaçlı
- SQLite varsayılan DB; PostgreSQL'e geçiş için `schema.prisma`'da provider ve `DATABASE_URL` değiştirmek yeterli
- Frontend build çıktısı (`dist/`) Express'ten statik servis edilebilir

## Sonraki Adımlar (Yol Haritası)

### Faz 2: Kimlik Doğrulama & Yetkilendirme
- [ ] Active Directory (LDAP) entegrasyonu (`ldapjs` veya `passport-ldapauth`)
- [ ] E-posta ile kullanıcı oluşturma/davet sistemi
- [ ] JWT tabanlı oturum yönetimi (access + refresh token)
- [ ] Login sayfası + protected routes
- [ ] Rol tabanlı erişim kontrolü (RBAC): admin, dpo, manager, user
- [ ] `server/middleware/auth.js`, `server/services/ldapAuth.js`

### Faz 3: Dosya Tarama Motoru
- [ ] Dosya sistemi bağlantıları (SMB/NFS — başlangıçta lokal dosya sistemi)
- [ ] Metin çıkarma: `pdf-parse` (PDF), `mammoth` (DOCX), `xlsx` (Excel)
- [ ] Regex tabanlı hassas veri tespiti (Rules tablosundaki kurallar)
- [ ] Kuyruk sistemi ile arka plan taraması (BullMQ + Redis)
- [ ] WebSocket/SSE ile gerçek zamanlı tarama ilerleme durumu
- [ ] `node-cron` ile zamanlanmış taramalar (Settings'teki yapılandırmaya göre)

### Faz 4: Bildirim & Aksiyon Motoru
- [ ] SMTP e-posta gönderimi (`nodemailer`) — UI'daki ayarlar kullanılacak
- [ ] E-posta şablonları (uyarı, şifreleme bildirimi, yönetici bildirimi)
- [ ] Politika yürütme motoru (adım adım: bildir → bekle → şifrele/taşı)
- [ ] Workflow engine — tasarlanan akışları çalıştırma
- [ ] Dosya aksiyonları: şifreleme, taşıma, silme, karantina

### Faz 5: Kalite & Güvenlik
- [ ] Test altyapısı: Vitest (frontend) + Jest/Supertest (backend)
- [ ] React Error Boundaries
- [ ] Server-side validation (Zod)
- [ ] Input sanitization, rate limiting, Helmet.js
- [ ] TypeScript geçişi (opsiyonel)

### Faz 6: DevOps & Dağıtım
- [ ] Dockerfile + docker-compose.yml (app + PostgreSQL + Redis)
- [ ] CI/CD pipeline'a test aşaması ekleme
- [ ] Staging/Production ortam ayrımı
