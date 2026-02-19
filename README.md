<div align="center">
  <a href="https://planly.mustafagenc.info">
    <img alt="Nitrokit Logo" src="https://raw.githubusercontent.com/mustafagenc/planly/refs/heads/main/public/apple-touch-icon.png" height="100">
  </a>

# Planly

Kişisel iş planlama ve takip uygulaması. Yıllık iş planı, plan harici işler, efor takibi ve raporlama özelliklerini tek bir platformda sunar.

[![Release](https://github.com/mustafagenc/planly/actions/workflows/release.yml/badge.svg)](https://github.com/mustafagenc/planly/actions/workflows/release.yml) [![codecov](https://codecov.io/gh/mustafagenc/planly/graph/badge.svg?token=U2u3tsQohg)](https://codecov.io/gh/mustafagenc/planly) [![CodeFactor](https://www.codefactor.io/repository/github/mustafagenc/planly/badge)](https://www.codefactor.io/repository/github/mustafagenc/planly)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmustafagenc%2Fplanly&env=DATABASE_URL,AUTH_SECRET,CODECOV_TOKEN&project-name=planly&repository-name=planly&redirect-url=https%3A%2F%2Fplanly.mustafagenc.info&developer-id=team_GGO1uoUHSkEmCgnnxlakap7Z&demo-title=Planly&demo-description=Ki%C5%9Fisel%20i%C5%9F%20planlama%20ve%20takip%20uygulamas%C4%B1&demo-url=https%3A%2F%2Fplanly.mustafagenc.info&demo-image=https%3A%2F%2Fraw.githubusercontent.com%2Fmustafagenc%2Fplanly%2Frefs%2Fheads%2Fmain%2Fpublic%2Fscreenshots%2Fhome.png)

</div>

## Ekran Görüntüleri

| Raporlar | İş Listesi |
|---|---|
| ![Raporlar](/public/screenshots/home.png) | ![Kanban Board](/public/screenshots/kanban.png) |

| Kanban Board | Tanımlamalar |
|---|---|
| ![İş Listesi](/public/screenshots/tasks.png) | ![Tanımlamalar](/public/screenshots/definitions.png) |

## Teknolojiler

| Katman           | Teknoloji                                        |
| ---------------- | ------------------------------------------------ |
| Framework        | Next.js 16 (App Router)                          |
| UI               | React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Veritabanı       | PostgreSQL, Prisma ORM                           |
| Kimlik Doğrulama | Auth.js (NextAuth v5), JWT, bcrypt               |
| Grafikler        | Recharts                                         |
| Data Table       | TanStack Table                                   |
| Test             | Vitest, Testing Library                          |
| CI/CD            | GitHub Actions, Changesets, Husky, Commitlint    |

## Özellikler

- **Görev Yönetimi** — Yıllık iş planı ve plan harici işleri tek bir görev modelinde yönet
- **Kanban Board** — Sürükle-bırak ile görev durumlarını güncelle (Backlog, Todo, In Progress, Done)
- **Efor Takibi** — Tarih aralığı ile efor girişi, otomatik iş günü hesaplama
- **Raporlar** — Günlük, aylık ve yıllık efor dağılımı chartları, proje bazlı analiz
- **Tanımlamalar** — Proje, birim, kişi ve ayar yönetimi
- **Çoklu Kullanıcı** — Rol tabanlı erişim (Admin/User), kullanıcı bazlı veri izolasyonu
- **Koyu/Açık Tema** — Sistem temasına uyumlu tema desteği

## Kurulum

### Gereksinimler

- Node.js 20+
- pnpm 10+
- PostgreSQL

### Adımlar

```bash
# Repoyu klonla
git clone https://github.com/mustafagenc/planly.git
cd planly

# Bağımlılıkları kur
pnpm install

# Ortam değişkenlerini ayarla
cp .env.example .env.local
```

`.env.local` dosyasını düzenle:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/planly"
AUTH_SECRET="openssl rand -base64 32 ile oluştur"
```

```bash
# Veritabanını oluştur
pnpm db:push

# (Opsiyonel) Demo verisi yükle
npx tsx prisma/seed-demo.ts

# Geliştirme sunucusunu başlat
pnpm dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışır.

## Scriptler

| Komut                    | Açıklama                      |
| ------------------------ | ----------------------------- |
| `pnpm dev`               | Geliştirme sunucusu           |
| `pnpm build`             | Üretim derlemesi              |
| `pnpm test`              | Testleri çalıştır             |
| `pnpm test:watch`        | Testleri izle                 |
| `pnpm test:coverage`     | Coverage raporu               |
| `pnpm lint:check`        | Lint kontrolü                 |
| `pnpm lint:fix`          | Lint düzeltme                 |
| `pnpm format:check`      | Format kontrolü               |
| `pnpm format:fix`        | Kod formatlama                |
| `pnpm db:push`           | Schema'yı veritabanına uygula |
| `pnpm db:migrate`        | Migration oluştur             |
| `pnpm db:studio`         | Prisma Studio                 |
| `pnpm db:seed`           | Excel'den veri yükle          |
| `pnpm changeset`         | Changeset oluştur             |
| `pnpm changeset:version` | Versiyon güncelle             |

## Proje Yapısı

```text
app/
├── (protected)/          # Kimlik doğrulama gerektiren sayfalar
│   ├── page.tsx          # Raporlar (Ana sayfa)
│   ├── tasks/            # İş listesi
│   ├── board/            # Kanban board
│   └── definitions/      # Tanımlamalar & Ayarlar
├── login/                # Giriş/Kayıt sayfası
├── actions/              # Server actions
├── api/auth/             # Auth.js API rotası
└── auth.ts               # Auth.js yapılandırması
components/
├── widget/               # Rapor widget bileşenleri
├── ui/                   # shadcn/ui bileşenleri
└── ...                   # Sayfa bileşenleri
lib/                      # Yardımcı fonksiyonlar
prisma/
├── schema.prisma         # Veritabanı şeması
├── seed.ts               # Excel import seed
└── seed-demo.ts          # Demo veri seed
__tests__/                # Vitest testleri
```

## Lisans

[Apache-2.0](LICENSE)
