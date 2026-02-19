/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

import prisma from '../lib/prisma';

function parseStatus(statusRaw: any): 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' {
	const s = String(statusRaw ?? '')
		.trim()
		.toLowerCase();
	if (s.includes('tamam')) return 'DONE';
	if (s.includes('devam') || s.includes('sürüyor')) return 'IN_PROGRESS';
	if (s.includes('iptal')) return 'DONE';
	return 'BACKLOG';
}

function parseProgress(progressRaw: any): number {
	if (typeof progressRaw === 'number') {
		return progressRaw <= 1 ? Math.round(progressRaw * 100) : Math.round(progressRaw);
	}
	if (typeof progressRaw === 'string') {
		const match = progressRaw.match(/%(\d+)/);
		if (match) return parseInt(match[1], 10);
		const digits = progressRaw.replace(/\D/g, '');
		if (digits) return parseInt(digits, 10);
	}
	return 0;
}

async function processAnnualPlanSheet(data: any[], userId: string) {
	console.log(`Processing Annual Plan Items (${data.length} rows)...`);

	for (const row of data) {
		const applicationName = row['Uygulama'] || 'Genel';
		const unitName = row['Talep Eden Birim'] || 'Bilinmiyor';
		const personName = row['Sorumlu'];
		const taskSummary = row['Tamamlanacak İş'];
		if (!taskSummary) continue;

		const detail = row['Detay'];
		const statusRaw = row['Durum '] || 'Beklemede';
		const daysRaw = row['Tahmini Süre (İş Günü)'];
		const progressRaw = row['İlerleme'];

		const project = await prisma.project.upsert({
			where: { name_userId: { name: String(applicationName).trim(), userId } },
			update: {},
			create: { name: String(applicationName).trim(), userId },
		});

		const unit = await prisma.unit.upsert({
			where: { name_userId: { name: String(unitName).trim(), userId } },
			update: {},
			create: { name: String(unitName).trim(), userId },
		});

		let person = null;
		if (personName) {
			person = await prisma.person.upsert({
				where: { name_userId: { name: String(personName).trim(), userId } },
				update: {},
				create: { name: String(personName).trim(), userId },
			});
		}

		const status = parseStatus(statusRaw);
		const progress = parseProgress(progressRaw);

		const existing = await prisma.task.findFirst({
			where: {
				userId,
				projectId: project.id,
				title: String(taskSummary).trim(),
				type: 'ANNUAL_PLAN',
			},
		});

		if (!existing) {
			await prisma.task.create({
				data: {
					type: 'ANNUAL_PLAN',
					status,
					userId,
					projectId: project.id,
					unitId: unit.id,
					responsibleId: person?.id,
					title: String(taskSummary).trim(),
					detail: detail ? String(detail).trim() : null,
					progress,
					estimatedDays: daysRaw ? parseFloat(daysRaw) : null,
					year: new Date().getFullYear(),
				},
			});
			console.log(`Created: ${taskSummary}`);
		} else {
			await prisma.task.update({
				where: { id: existing.id },
				data: {
					unitId: unit.id,
					responsibleId: person?.id,
					status,
					progress,
					estimatedDays: daysRaw ? parseFloat(daysRaw) : null,
					detail: detail ? String(detail).trim() : null,
				},
			});
			console.log(`Updated: ${taskSummary}`);
		}
	}
}

async function processAdHocSheet(data: any[], userId: string) {
	console.log(`Processing Ad-Hoc Items (${data.length} rows)...`);

	for (const row of data) {
		const applicationName = row['Application'] || 'Genel';
		const personName = row['Responsible'];
		const description = row['Work Accomplished'];
		if (!description) continue;

		const remarks = row['Remarks'];
		const ticketNo = row['Ticket No'];
		const coResponsible = row['Co-Responded'];
		const daysSpentRaw = row['Working Days Spent'];
		const progressRaw = row['Progress Status'];
		const monthRaw = row['Ay'];

		const project = await prisma.project.upsert({
			where: { name_userId: { name: String(applicationName).trim(), userId } },
			update: {},
			create: { name: String(applicationName).trim(), userId },
		});

		let person = null;
		if (personName) {
			person = await prisma.person.upsert({
				where: { name_userId: { name: String(personName).trim(), userId } },
				update: {},
				create: { name: String(personName).trim(), userId },
			});
		}

		const progress = parseProgress(progressRaw);
		const daysSpent =
			typeof daysSpentRaw === 'number' ? daysSpentRaw : parseFloat(daysSpentRaw) || 0;
		const status =
			progress === 100
				? ('DONE' as const)
				: progress > 0
					? ('IN_PROGRESS' as const)
					: ('BACKLOG' as const);

		let task = await prisma.task.findFirst({
			where: {
				userId,
				projectId: project.id,
				title: String(description).trim(),
				type: 'ADHOC',
			},
		});

		if (!task) {
			task = await prisma.task.create({
				data: {
					type: 'ADHOC',
					status,
					userId,
					projectId: project.id,
					responsibleId: person?.id,
					title: String(description).trim(),
					remarks: remarks ? String(remarks).trim() : null,
					ticketNo: ticketNo ? String(ticketNo).trim() : null,
					coResponsible: coResponsible ? String(coResponsible).trim() : null,
					daysSpent,
					progress,
				},
			});
			console.log(`Created: ${description}`);
		} else {
			task = await prisma.task.update({
				where: { id: task.id },
				data: {
					responsibleId: person?.id,
					remarks: remarks ? String(remarks).trim() : null,
					ticketNo: ticketNo ? String(ticketNo).trim() : null,
					coResponsible: coResponsible ? String(coResponsible).trim() : null,
					daysSpent,
					progress,
				},
			});
			console.log(`Updated: ${description}`);
		}

		if (monthRaw && daysSpent > 0) {
			const monthIndex = parseInt(monthRaw, 10) - 1;
			if (monthIndex >= 0 && monthIndex < 12) {
				const workDate = new Date(new Date().getFullYear(), monthIndex, 1, 12, 0, 0);
				const existingLog = await prisma.workLog.findFirst({
					where: { userId, taskId: task.id, date: workDate },
				});

				if (!existingLog) {
					await prisma.workLog.create({
						data: {
							userId,
							taskId: task.id,
							date: workDate,
							daysWorked: daysSpent,
							description: `${description} (${monthRaw}. Ay Eforu)`,
						},
					});
					console.log(`  WorkLog: ${daysSpent} days (Month ${monthRaw})`);
				} else {
					await prisma.workLog.update({
						where: { id: existingLog.id },
						data: {
							daysWorked: daysSpent,
							description: `${description} (${monthRaw}. Ay Eforu)`,
						},
					});
				}
			}
		}
	}
}

async function seedAdminUser() {
	const bcrypt = await import('bcryptjs');
	const email = 'eposta@mustafagenc.info';

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		console.log('Admin user already exists, skipping...');
		return existing;
	}

	const hashedPassword = await bcrypt.hash('admin123', 12);
	const admin = await prisma.user.create({
		data: {
			name: 'Mustafa Genç',
			email,
			password: hashedPassword,
			role: 'ADMIN',
		},
	});
	console.log(`Admin user created: ${admin.email}`);
	return admin;
}

async function main() {
	const admin = await seedAdminUser();

	const filePath = path.join(process.cwd(), '.notes/2026.xlsx');
	if (!fs.existsSync(filePath)) {
		console.error('File not found:', filePath);
		process.exit(1);
	}

	const workbook = XLSX.readFile(filePath);

	if (workbook.SheetNames.length > 0) {
		const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
		await processAnnualPlanSheet(data, admin.id);
	}

	if (workbook.SheetNames.length > 1) {
		const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]);
		await processAdHocSheet(data, admin.id);
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
