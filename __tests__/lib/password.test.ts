import { describe, it, expect } from 'vitest';
import { saltAndHashPassword, verifyPassword } from '@/lib/password';

describe('password utilities', () => {
	it('şifreyi hashler ve doğrular', async () => {
		const password = 'test-password-123';
		const hash = await saltAndHashPassword(password);

		expect(hash).toBeDefined();
		expect(hash).not.toBe(password);
		expect(hash.startsWith('$2')).toBe(true);

		const isValid = await verifyPassword(password, hash);
		expect(isValid).toBe(true);
	});

	it('yanlış şifreyi reddeder', async () => {
		const hash = await saltAndHashPassword('correct-password');
		const isValid = await verifyPassword('wrong-password', hash);
		expect(isValid).toBe(false);
	});

	it('aynı şifre için farklı hashler üretir (salt)', async () => {
		const password = 'same-password';
		const hash1 = await saltAndHashPassword(password);
		const hash2 = await saltAndHashPassword(password);

		expect(hash1).not.toBe(hash2);

		expect(await verifyPassword(password, hash1)).toBe(true);
		expect(await verifyPassword(password, hash2)).toBe(true);
	});

	it('boş şifre hashlenir', async () => {
		const hash = await saltAndHashPassword('');
		expect(hash).toBeDefined();
		expect(await verifyPassword('', hash)).toBe(true);
		expect(await verifyPassword('not-empty', hash)).toBe(false);
	});

	it('özel karakterli şifreyi destekler', async () => {
		const password = 'P@$$w0rd!#%^&*()_+{}|:<>?';
		const hash = await saltAndHashPassword(password);
		expect(await verifyPassword(password, hash)).toBe(true);
	});

	it('uzun şifreyi destekler', async () => {
		const password = 'a'.repeat(72); // bcrypt 72 karakter limiti
		const hash = await saltAndHashPassword(password);
		expect(await verifyPassword(password, hash)).toBe(true);
	});
});
