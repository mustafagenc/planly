import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (classname merge utility)', () => {
	it('tek string birleştirir', () => {
		expect(cn('text-red-500')).toBe('text-red-500');
	});

	it('birden fazla class birleştirir', () => {
		expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
	});

	it('çakışan tailwind classlarında sonuncuyu korur', () => {
		const result = cn('text-red-500', 'text-blue-500');
		expect(result).toBe('text-blue-500');
	});

	it('koşullu classları destekler', () => {
		const result = cn('base', false && 'hidden', true && 'visible');
		expect(result).toBe('base visible');
	});

	it('undefined ve null değerleri yok sayar', () => {
		const result = cn('base', undefined, null, 'extra');
		expect(result).toBe('base extra');
	});

	it('boş çağrıda boş string döner', () => {
		expect(cn()).toBe('');
	});

	it('obje syntax destekler', () => {
		const result = cn({ 'text-red-500': true, 'bg-blue-500': false });
		expect(result).toBe('text-red-500');
	});

	it('dizi syntax destekler', () => {
		const result = cn(['text-red-500', 'bg-blue-500']);
		expect(result).toBe('text-red-500 bg-blue-500');
	});

	it('padding çakışmalarını çözer', () => {
		const result = cn('p-4', 'p-2');
		expect(result).toBe('p-2');
	});
});
