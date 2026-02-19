import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Planly',
		short_name: 'Planly',
		description: 'Kişisel iş planlama ve takip uygulaması.',
		start_url: '/',
		display: 'standalone',
		background_color: '#09090b',
		theme_color: '#09090b',
		orientation: 'portrait-primary',
		categories: ['productivity', 'business'],
		icons: [
			{
				src: '/icons/favicon-16x16.png',
				sizes: '16x16',
				type: 'image/png',
			},
			{
				src: '/icons/favicon-32x32.png',
				sizes: '32x32',
				type: 'image/png',
			},
			{
				src: '/icons/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-192x192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'maskable',
			},
			{
				src: '/icons/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
			{
				src: '/icons/apple-touch-icon.png',
				sizes: '180x180',
				type: 'image/png',
			},
		],
		screenshots: [
			{
				src: 'https://raw.githubusercontent.com/mustafagenc/planly/refs/heads/main/public/screenshots/desktop-dashboard.png',
				sizes: '1920x1080',
				type: 'image/png',
				form_factor: 'wide',
				label: 'Raporlar — Aylık efor dağılımı ve proje analizi',
			},
			{
				src: 'https://raw.githubusercontent.com/mustafagenc/planly/refs/heads/main/public/screenshots/desktop-tasks.png',
				sizes: '1920x1080',
				type: 'image/png',
				form_factor: 'wide',
				label: 'İş Listesi — Görev yönetimi ve filtreleme',
			},
			{
				src: 'https://raw.githubusercontent.com/mustafagenc/planly/refs/heads/main/public/screenshots/desktop-board.png',
				sizes: '1920x1080',
				type: 'image/png',
				form_factor: 'wide',
				label: 'Kanban Board — Sürükle-bırak görev takibi',
			},
			{
				src: 'https://raw.githubusercontent.com/mustafagenc/planly/refs/heads/main/public/screenshots/mobile-dashboard.png',
				sizes: '750x1334',
				type: 'image/png',
				form_factor: 'narrow',
				label: 'Raporlar — Mobil görünüm',
			},
			{
				src: 'https://raw.githubusercontent.com/mustafagenc/planly/refs/heads/main/public/screenshots/mobile-tasks.png',
				sizes: '750x1334',
				type: 'image/png',
				form_factor: 'narrow',
				label: 'İş Listesi — Mobil görünüm',
			},
		],
	};
}
