/**
 * PWA ikon üretici.
 * SVG'den PNG ikonlar oluşturur.
 *
 * Kullanım: npx tsx scripts/generate-icons.ts
 * Not: Bu script sharp paketi gerektirir (npx ile otomatik kurulur).
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#09090b"/>
  <text x="256" y="310" font-family="system-ui, -apple-system, sans-serif" font-size="240" font-weight="700" fill="#fafafa" text-anchor="middle" dominant-baseline="central">P</text>
</svg>`;

const sizes = [192, 512];

async function main(): Promise<void> {
	let sharp: typeof import('sharp');
	try {
		sharp = (await import('sharp')).default;
	} catch {
		console.error('sharp paketi bulunamadı. Kurulum: pnpm add -D sharp');
		console.log('\nAlternatif: SVG dosyası oluşturuluyor...');
		const outPath = resolve('public/icons/icon.svg');
		writeFileSync(outPath, SVG);
		console.log(`  ✅ ${outPath}`);
		return;
	}

	for (const size of sizes) {
		const outPath = resolve(`public/icons/icon-${size}x${size}.png`);
		await sharp(Buffer.from(SVG)).resize(size, size).png().toFile(outPath);
		console.log(`✅ ${outPath}`);
	}

	// Apple touch icon
	const applePath = resolve('public/apple-touch-icon.png');
	await sharp(Buffer.from(SVG)).resize(180, 180).png().toFile(applePath);
	console.log(`✅ ${applePath}`);

	// Favicon 32x32
	const faviconPath = resolve('public/favicon.ico');
	await sharp(Buffer.from(SVG)).resize(32, 32).png().toFile(faviconPath);
	console.log(`✅ ${faviconPath}`);

	console.log('\n✅ Tüm ikonlar oluşturuldu!');
}

main();
