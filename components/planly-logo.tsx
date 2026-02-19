import Link from 'next/link';

interface PlanlyLogoProps {
	size?: number;
	showText?: boolean;
	showSubtitle?: boolean;
	className?: string;
}

export function PlanlyLogo({
	size = 200,
	showText = true,
	showSubtitle = false,
	className = '',
}: PlanlyLogoProps) {
	const iconSize = showText ? size * 0.4 : size;

	return (
		<Link href='/' className={`flex items-center gap-3 ${className}`}>
			{/* Logo Icon */}
			<svg
				width={iconSize}
				height={iconSize}
				viewBox='0 0 100 100'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				style={{ flexShrink: 0 }}
			>
				{/* Background Circle with Gradient */}
				<defs>
					<linearGradient id='planlyGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop offset='0%' style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
						<stop offset='100%' style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
					</linearGradient>
					<linearGradient id='accentGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop offset='0%' style={{ stopColor: '#10b981', stopOpacity: 1 }} />
						<stop offset='100%' style={{ stopColor: '#059669', stopOpacity: 1 }} />
					</linearGradient>
					<linearGradient id='warningGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop offset='0%' style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
						<stop offset='100%' style={{ stopColor: '#d97706', stopOpacity: 1 }} />
					</linearGradient>
					<linearGradient id='dangerGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop offset='0%' style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
						<stop offset='100%' style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
					</linearGradient>
				</defs>

				{/* Main Circle Background */}
				<circle cx='50' cy='50' r='45' fill='url(#planlyGradient)' />

				{/* Calendar/Grid Icon */}
				<rect x='25' y='28' width='50' height='44' rx='4' fill='white' fillOpacity='0.95' />

				{/* Calendar Header */}
				<rect x='25' y='28' width='50' height='10' rx='4' fill='white' />
				<rect
					x='25'
					y='28'
					width='50'
					height='10'
					fill='url(#planlyGradient)'
					fillOpacity='0.3'
				/>

				{/* Calendar Dots (Days) */}
				<circle cx='33' cy='46' r='2.5' fill='url(#planlyGradient)' fillOpacity='0.6' />
				<circle cx='42' cy='46' r='2.5' fill='url(#accentGradient)' />
				<circle cx='51' cy='46' r='2.5' fill='url(#planlyGradient)' fillOpacity='0.6' />
				<circle cx='60' cy='46' r='2.5' fill='url(#planlyGradient)' fillOpacity='0.6' />
				<circle cx='67' cy='46' r='2.5' fill='url(#warningGradient)' />

				<circle cx='33' cy='54' r='2.5' fill='url(#planlyGradient)' fillOpacity='0.6' />
				<circle cx='42' cy='54' r='2.5' fill='url(#planlyGradient)' fillOpacity='0.6' />
				<circle cx='51' cy='54' r='2.5' fill='url(#accentGradient)' />
				<circle cx='60' cy='54' r='2.5' fill='url(#planlyGradient)' fillOpacity='0.6' />
				<circle cx='67' cy='54' r='2.5' fill='url(#planlyGradient)' fillOpacity='0.6' />

				<circle cx='33' cy='62' r='2.5' fill='url(#planlyGradient)' fillOpacity='0.6' />
				<circle cx='42' cy='62' r='2.5' fill='url(#dangerGradient)' />
				<circle cx='51' cy='62' r='2.5' fill='url(#planlyGradient)' fillOpacity='0.6' />
				<circle cx='60' cy='62' r='2.5' fill='url(#accentGradient)' />
				<circle cx='67' cy='62' r='2.5' fill='url(#planlyGradient)' fillOpacity='0.6' />
			</svg>

			{/* Text Logo */}
			{showText && (
				<div className='flex flex-col justify-center'>
					<span
						className='font-bold tracking-tight'
						style={{
							fontSize: `${size * 0.25}px`,
							background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text',
							paddingRight: `${size * 0.05}px`,
							paddingBottom: `${size * 0.05}px`,
							display: 'inline-block',
							lineHeight: 1,
						}}
					>
						Planly
					</span>
					{showSubtitle && (
						<span
							className='text-gray-600 whitespace-nowrap'
							style={{
								fontSize: `${size * 0.08}px`,
								marginTop: `${size * 0.02}px`,
								letterSpacing: '0.05em',
							}}
						>
							Kişisel iş planlama ve takip uygulaması
						</span>
					)}
				</div>
			)}
		</Link>
	);
}
