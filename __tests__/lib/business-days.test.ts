import { describe, it, expect } from 'vitest';

// seed-demo'daki iş günü mantığını test ediyoruz — aynı fonksiyonları tekrar tanımlıyoruz
// çünkü orijinalleri export edilmiyor

function isBusinessDay(date: Date): boolean {
	const day = date.getDay();
	return day !== 0 && day !== 6;
}

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

describe('isBusinessDay', () => {
	it('Pazartesi-Cuma iş günüdür', () => {
		// 2026-02-16 Pazartesi
		expect(isBusinessDay(new Date(2026, 1, 16))).toBe(true);
		// 2026-02-17 Salı
		expect(isBusinessDay(new Date(2026, 1, 17))).toBe(true);
		// 2026-02-18 Çarşamba
		expect(isBusinessDay(new Date(2026, 1, 18))).toBe(true);
		// 2026-02-19 Perşembe
		expect(isBusinessDay(new Date(2026, 1, 19))).toBe(true);
		// 2026-02-20 Cuma
		expect(isBusinessDay(new Date(2026, 1, 20))).toBe(true);
	});

	it('Cumartesi ve Pazar iş günü değildir', () => {
		// 2026-02-14 Cumartesi
		expect(isBusinessDay(new Date(2026, 1, 14))).toBe(false);
		// 2026-02-15 Pazar
		expect(isBusinessDay(new Date(2026, 1, 15))).toBe(false);
	});
});

describe('getBusinessDays', () => {
	it('Ocak 2026 iş günlerini doğru hesaplar', () => {
		const days = getBusinessDays(2026, 0);
		// Ocak 2026: 1 Perşembe başlar, 31 gün, 22 iş günü
		expect(days.length).toBe(22);
	});

	it('Şubat 2026 tüm iş günlerini doğru hesaplar', () => {
		const days = getBusinessDays(2026, 1);
		// Şubat 2026: 1 Pazar başlar, 28 gün, 20 iş günü
		expect(days.length).toBe(20);
	});

	it('Şubat 2026 19 Şubata kadar iş günleri', () => {
		const days = getBusinessDays(2026, 1, 19);
		// 1 Şubat Pazar, 2-6 (5), 9-13 (5), 16-19 (4) = 14 iş günü
		expect(days.length).toBe(14);
	});

	it('upToDay ayın gün sayısını aşarsa sınırlar', () => {
		const days = getBusinessDays(2026, 1, 50);
		// Şubat 28 gün, 50'ye sınırlanır → 28'e kadar hesaplar
		expect(days.length).toBe(20);
	});

	it('tüm dönen tarihler iş günüdür', () => {
		const days = getBusinessDays(2026, 0);
		for (const day of days) {
			const dow = day.getDay();
			expect(dow).not.toBe(0); // Pazar değil
			expect(dow).not.toBe(6); // Cumartesi değil
		}
	});

	it('tarihler sıralı döner', () => {
		const days = getBusinessDays(2026, 0);
		for (let i = 1; i < days.length; i++) {
			expect(days[i].getTime()).toBeGreaterThan(days[i - 1].getTime());
		}
	});
});
