import 'dotenv/config';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

// İş günü mü kontrolü (Cumartesi=6, Pazar=0 hariç)
function isBusinessDay(date: Date): boolean {
	const day = date.getDay();
	return day !== 0 && day !== 6;
}

// Belirli ay aralığındaki iş günlerini döndür
function getBusinessDays(year: number, month: number, upToDay?: number): Date[] {
	const days: Date[] = [];
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const limit = upToDay ? Math.min(upToDay, daysInMonth) : daysInMonth;

	for (let d = 1; d <= limit; d++) {
		const date = new Date(year, month, d, 12, 0, 0);
		if (isBusinessDay(date)) {
			days.push(date);
		}
	}
	return days;
}

// Rastgele seçici
function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
	const shuffled = [...arr].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, n);
}

function randomFloat(min: number, max: number): number {
	return Math.round((Math.random() * (max - min) + min) * 2) / 2; // 0.5 hassasiyet
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Demo Verileri ────────────────────────────────────────

const PROJECT_NAMES = [
	'E-Ticaret Platformu',
	'İK Yönetim Sistemi',
	'Müşteri Portal',
	'Mobil Uygulama',
	'Veri Analiz Paneli',
	'API Gateway',
	'Ödeme Sistemi',
	'Bildirim Servisi',
];

const UNIT_NAMES = [
	'Yazılım Geliştirme',
	'İnsan Kaynakları',
	'Pazarlama',
	'Finans',
	'Operasyon',
	'Satış',
];

const PERSON_NAMES = ['Mustafa Genç', 'Ahmet Yılmaz', 'Ayşe Kaya', 'Mehmet Demir', 'Zeynep Çelik'];

const ANNUAL_PLAN_TASKS = [
	{
		title: 'Ödeme altyapısı yenileme',
		detail: 'Mevcut ödeme sisteminin mikroservis mimarisine taşınması',
		estimatedDays: 45,
	},
	{
		title: 'Kullanıcı yetkilendirme modülü',
		detail: 'RBAC tabanlı yetkilendirme sistemi geliştirme',
		estimatedDays: 30,
	},
	{
		title: 'Performans optimizasyonu',
		detail: 'Veritabanı sorguları ve API yanıt sürelerinin iyileştirilmesi',
		estimatedDays: 20,
	},
	{
		title: 'CI/CD pipeline kurulumu',
		detail: 'GitHub Actions ile otomatik test ve deploy süreçleri',
		estimatedDays: 15,
	},
	{
		title: 'Mobil uygulama v2 geliştirme',
		detail: 'React Native ile yeni mobil uygulama versiyonu',
		estimatedDays: 60,
	},
	{
		title: 'Raporlama dashboard geliştirme',
		detail: 'Yönetim için gerçek zamanlı raporlama paneli',
		estimatedDays: 35,
	},
	{
		title: 'API dokümantasyon sistemi',
		detail: 'OpenAPI/Swagger entegrasyonu ve otomatik dokümantasyon',
		estimatedDays: 10,
	},
	{
		title: 'Müşteri self-servis portal',
		detail: 'Müşterilerin kendi işlemlerini yapabilecekleri portal',
		estimatedDays: 40,
	},
	{
		title: 'Veri göçü projesi',
		detail: 'Legacy sistemden yeni platforma veri aktarımı',
		estimatedDays: 25,
	},
	{
		title: 'Güvenlik denetimi ve iyileştirme',
		detail: 'Penetrasyon testi ve güvenlik açıklarının giderilmesi',
		estimatedDays: 20,
	},
	{
		title: 'E-posta bildirim sistemi',
		detail: 'Transactional ve marketing e-posta altyapısı',
		estimatedDays: 15,
	},
	{
		title: 'Arama motoru entegrasyonu',
		detail: 'Elasticsearch ile gelişmiş arama özellikleri',
		estimatedDays: 18,
	},
];

const ADHOC_TASKS = [
	{ title: 'Üretim ortamı acil hata düzeltme', ticketNo: 'INC-2026-001' },
	{ title: 'SSL sertifika yenileme', ticketNo: 'INC-2026-002' },
	{ title: 'Kullanıcı şikayet analizi', ticketNo: 'SR-2026-015' },
	{ title: 'Veritabanı yedekleme kontrolü', ticketNo: 'CHG-2026-003' },
	{ title: 'Yeni çalışan hesap açılışları', ticketNo: 'SR-2026-020' },
	{ title: 'Sunucu kapasite artırımı', ticketNo: 'CHG-2026-008' },
	{ title: 'Müşteri veri düzeltme talebi', ticketNo: 'SR-2026-031' },
	{ title: 'Log analiz ve temizlik', ticketNo: 'CHG-2026-012' },
	{ title: '3. parti API kesinti müdahale', ticketNo: 'INC-2026-009' },
	{ title: 'Rapor şablonu güncelleme', ticketNo: 'SR-2026-044' },
	{ title: 'Test ortamı yeniden kurulum', ticketNo: 'CHG-2026-015' },
	{ title: 'Performans izleme alarmları kurulumu', ticketNo: 'CHG-2026-018' },
	{ title: 'Kullanıcı eğitim materyali hazırlama', ticketNo: 'SR-2026-052' },
	{ title: 'DNS yapılandırma değişikliği', ticketNo: 'CHG-2026-021' },
	{ title: 'Eski modül devre dışı bırakma', ticketNo: 'CHG-2026-025' },
];

async function main() {
	console.log('🚀 Demo seed başlıyor...\n');

	// ─── Admin kullanıcı oluştur/bul ────────────────────────
	const email = 'eposta@mustafagenc.info';
	let user = await prisma.user.findUnique({ where: { email } });

	if (!user) {
		const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
		user = await prisma.user.create({
			data: {
				name: 'Mustafa Genç',
				email,
				password: hashedPassword,
				role: 'ADMIN',
			},
		});
		console.log('✅ Admin kullanıcı oluşturuldu');
	} else {
		console.log('ℹ️  Admin kullanıcı zaten mevcut');
	}

	const userId = user.id;

	// ─── Projeler ───────────────────────────────────────────
	const projects: Record<string, number> = {};
	for (const name of PROJECT_NAMES) {
		const p = await prisma.project.upsert({
			where: { name_userId: { name, userId } },
			update: {},
			create: { name, userId },
		});
		projects[name] = p.id;
	}
	console.log(`✅ ${PROJECT_NAMES.length} proje oluşturuldu`);

	// ─── Birimler ───────────────────────────────────────────
	const units: Record<string, number> = {};
	for (const name of UNIT_NAMES) {
		const u = await prisma.unit.upsert({
			where: { name_userId: { name, userId } },
			update: {},
			create: { name, userId },
		});
		units[name] = u.id;
	}
	console.log(`✅ ${UNIT_NAMES.length} birim oluşturuldu`);

	// ─── Kişiler ────────────────────────────────────────────
	const people: Record<string, number> = {};
	for (const name of PERSON_NAMES) {
		const p = await prisma.person.upsert({
			where: { name_userId: { name, userId } },
			update: {},
			create: { name, userId },
		});
		people[name] = p.id;
	}
	console.log(`✅ ${PERSON_NAMES.length} kişi oluşturuldu`);

	const projectIds = Object.values(projects);
	const unitIds = Object.values(units);
	const personIds = Object.values(people);

	// ─── Yıllık İş Planı Görevleri (2026) ──────────────────
	console.log('\n📋 Yıllık İş Planı görevleri oluşturuluyor...');
	const annualTasks: number[] = [];

	for (let i = 0; i < ANNUAL_PLAN_TASKS.length; i++) {
		const t = ANNUAL_PLAN_TASKS[i];
		const progress = randomInt(0, 10) * 10;
		const status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' =
			progress === 100
				? 'DONE'
				: progress >= 50
					? 'IN_PROGRESS'
					: progress > 0
						? 'TODO'
						: 'BACKLOG';

		const existing = await prisma.task.findFirst({
			where: { userId, title: t.title, type: 'ANNUAL_PLAN' },
		});

		if (!existing) {
			const task = await prisma.task.create({
				data: {
					type: 'ANNUAL_PLAN',
					status,
					userId,
					projectId: pick(projectIds),
					unitId: pick(unitIds),
					responsibleId: pick(personIds),
					title: t.title,
					detail: t.detail,
					estimatedDays: t.estimatedDays,
					progress,
					year: 2026,
					order: i,
				},
			});
			annualTasks.push(task.id);
			console.log(`  + ${t.title} (%${progress})`);
		} else {
			annualTasks.push(existing.id);
			console.log(`  ~ ${t.title} (mevcut)`);
		}
	}

	// ─── Plan Harici İşler (Ocak-Şubat 2026) ───────────────
	console.log('\n⚡ Plan Harici İşler oluşturuluyor...');
	const adhocTasks: number[] = [];

	for (let i = 0; i < ADHOC_TASKS.length; i++) {
		const t = ADHOC_TASKS[i];
		const progress = randomInt(3, 10) * 10;
		const status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' =
			progress === 100 ? 'DONE' : progress >= 50 ? 'IN_PROGRESS' : 'TODO';
		const daysSpent = randomFloat(0.5, 5);

		const existing = await prisma.task.findFirst({
			where: { userId, title: t.title, type: 'ADHOC' },
		});

		if (!existing) {
			const task = await prisma.task.create({
				data: {
					type: 'ADHOC',
					status,
					userId,
					projectId: pick(projectIds),
					responsibleId: pick(personIds),
					title: t.title,
					ticketNo: t.ticketNo,
					daysSpent,
					progress,
					order: i,
				},
			});
			adhocTasks.push(task.id);
			console.log(`  + ${t.title} (${t.ticketNo})`);
		} else {
			adhocTasks.push(existing.id);
			console.log(`  ~ ${t.title} (mevcut)`);
		}
	}

	const allTaskIds = [...annualTasks, ...adhocTasks];

	// ─── Ocak 2026 WorkLog'ları ─────────────────────────────
	console.log('\n📅 Ocak 2026 efor kayıtları oluşturuluyor...');
	const janDays = getBusinessDays(2026, 0); // Ocak tüm iş günleri
	let janCount = 0;

	for (const day of janDays) {
		// Her iş günü 1-3 arası farklı göreve efor girişi
		const taskCount = randomInt(1, 3);
		const dayTasks = pickN(allTaskIds, taskCount);

		for (const taskId of dayTasks) {
			const existing = await prisma.workLog.findFirst({
				where: { userId, taskId, date: day },
			});

			if (!existing) {
				await prisma.workLog.create({
					data: {
						userId,
						taskId,
						date: day,
						daysWorked: 1,
						description: `Günlük çalışma — ${day.toLocaleDateString('tr-TR')}`,
					},
				});
				janCount++;
			}
		}
	}
	console.log(`  ✅ Ocak: ${janCount} efor kaydı oluşturuldu (${janDays.length} iş günü)`);

	// ─── Şubat 2026 WorkLog'ları (19'una kadar) ─────────────
	console.log("\n📅 Şubat 2026 efor kayıtları oluşturuluyor (19'una kadar)...");
	const febDays = getBusinessDays(2026, 1, 19); // Şubat 1-19 arası iş günleri
	let febCount = 0;

	for (const day of febDays) {
		const taskCount = randomInt(1, 3);
		const dayTasks = pickN(allTaskIds, taskCount);

		for (const taskId of dayTasks) {
			const existing = await prisma.workLog.findFirst({
				where: { userId, taskId, date: day },
			});

			if (!existing) {
				await prisma.workLog.create({
					data: {
						userId,
						taskId,
						date: day,
						daysWorked: 1,
						description: `Günlük çalışma — ${day.toLocaleDateString('tr-TR')}`,
					},
				});
				febCount++;
			}
		}
	}
	console.log(`  ✅ Şubat: ${febCount} efor kaydı oluşturuldu (${febDays.length} iş günü)`);

	// ─── Özet ───────────────────────────────────────────────
	console.log('\n' + '─'.repeat(50));
	console.log('📊 Demo Seed Özeti:');
	console.log(`   Projeler      : ${PROJECT_NAMES.length}`);
	console.log(`   Birimler      : ${UNIT_NAMES.length}`);
	console.log(`   Kişiler       : ${PERSON_NAMES.length}`);
	console.log(`   Yıllık Plan   : ${annualTasks.length} görev`);
	console.log(`   Plan Harici   : ${adhocTasks.length} görev`);
	console.log(`   Ocak Efor     : ${janCount} kayıt`);
	console.log(`   Şubat Efor    : ${febCount} kayıt`);
	console.log('─'.repeat(50));
	console.log('✅ Demo seed tamamlandı!\n');
}

main()
	.catch((e) => {
		console.error('❌ Demo seed hatası:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
