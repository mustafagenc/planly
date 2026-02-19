# planly

## 1.0.0

### Major Changes

- - Next.js 16 App Router, React 19, TypeScript, Prisma ORM, PostgreSQL ile proje kurulumu
  - Auth.js (NextAuth v5) ile kimlik doğrulama ve JWT session yönetimi
  - Kullanıcı rol sistemi (ADMIN/USER) ve çoklu kullanıcı (multi-tenancy) desteği
  - Login/Register sayfası ve Server Layout Guard ile rota koruması
  - AnnualPlan ve AdHocTask modelleri birleştirilerek tek Task modeline geçildi (type: ANNUAL_PLAN/ADHOC)
  - Tüm modellere userId eklenerek kullanıcı bazlı veri izolasyonu sağlandı
  - Setting modeli ile esnek key-value ayar sistemi (STRING, NUMBER, BOOLEAN, DATE)
  - Raporlar, İşler, Kanban Board ve Tanımlamalar ayrı sayfalara taşındı
  - Kanban board ile sürükle-bırak görev yönetimi
  - @tanstack/react-table ile İş Listesi ve Efor Kayıtları data table'ları (sıralama, filtreleme, sayfalama)
  - Raporlar sayfasında günlük/aylık/yıllık efor dağılımı chartları (recharts)
  - Efor girişinde tarih aralığı desteği ve otomatik iş günü hesaplama
  - Tanımlamalarda satır içi düzenleme ve ayarlar yönetimi
  - Rapor bileşenleri 6 bağımsız widget'a ayrıldı (components/widget/)
  - Prettier + ESLint entegrasyonu
  - Vitest test altyapısı (30 test)
  - Husky + Commitlint ile commit standartları
  - Changesets ile versiyon yönetimi
  - Demo seed verisi ve şifre hash script'i
  - Proje genelinde modern UI tasarımı (shadcn/ui, Tailwind CSS v4)
  - Header'da kullanıcı bilgisi ve rol gösterimi
