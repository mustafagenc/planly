/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

import prisma from '../lib/prisma';

async function processSheet(data: any[]) {
    console.log(`Processing Main Items (${data.length} rows)...`);

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
            where: { name: String(applicationName).trim() },
            update: {},
            create: { name: String(applicationName).trim() },
        });

        const unit = await prisma.unit.upsert({
            where: { name: String(unitName).trim() },
            update: {},
            create: { name: String(unitName).trim() },
        });

        let person = null;
        if (personName) {
            person = await prisma.person.upsert({
                where: { name: String(personName).trim() },
                update: {},
                create: { name: String(personName).trim() },
            });
        }

        let status = 'Beklemede';
        const s = String(statusRaw).trim().toLowerCase();
        if (s.includes('devam') || s.includes('sürüyor')) status = 'Devam Ediyor';
        else if (s.includes('tamam')) status = 'Tamamlandı';
        else if (s.includes('iptal')) status = 'İptal';

        let progress = 0;
        if (typeof progressRaw === 'number') {
            progress = Math.round(progressRaw * 100);
        } else if (typeof progressRaw === 'string') {
            const match = progressRaw.match(/%(\d+)/);
            if (match) {
                progress = parseInt(match[1], 10);
            } else {
                const digits = progressRaw.replace(/\D/g, '');
                if (digits) progress = parseInt(digits, 10);
            }
        }

        const existingPlan = await prisma.annualPlan.findFirst({
            where: {
                projectId: project.id,
                taskSummary: String(taskSummary).trim()
            }
        });

        if (!existingPlan) {
            await prisma.annualPlan.create({
                data: {
                    projectId: project.id,
                    unitId: unit.id,
                    responsibleId: person ? person.id : undefined,
                    taskSummary: String(taskSummary).trim(),
                    detail: detail ? String(detail).trim() : null,
                    status: status,
                    progress: progress,
                    estimatedDays: daysRaw ? parseFloat(daysRaw) : null,
                    year: new Date().getFullYear()
                }
            });
            console.log(`Created Annual Plan: ${taskSummary}`);
        } else {
            await prisma.annualPlan.update({
                where: { id: existingPlan.id },
                data: {
                    unitId: unit.id,
                    responsibleId: person ? person.id : undefined,
                    status: status,
                    progress: progress,
                    estimatedDays: daysRaw ? parseFloat(daysRaw) : null,
                    detail: detail ? String(detail).trim() : null,
                }
            });
            console.log(`Updated Annual Plan: ${taskSummary}`);
        }
    }
}

async function processAdHocSheet(data: any[]) {
    console.log(`Processing Ad-Hoc Items (${data.length} rows)...`);

    for (const row of data) {
        // Headers: Application, Co-Responded, Work Accomplished, Remarks, Ticket No, Responsible, Working Days Spent, Progress Status, Önceki Durum, Ay

        const applicationName = row['Application'] || 'Genel';
        const personName = row['Responsible'];
        
        const description = row['Work Accomplished'];
        if (!description) continue;

        const remarks = row['Remarks'];
        const ticketNo = row['Ticket No'];
        const coResponsible = row['Co-Responded'];
        
        const daysSpentRaw = row['Working Days Spent'];
        const progressRaw = row['Progress Status'];
        const previousStatus = row['Önceki Durum'];
        const monthRaw = row['Ay']; // Expecting 1-12

        const project = await prisma.project.upsert({
            where: { name: String(applicationName).trim() },
            update: {},
            create: { name: String(applicationName).trim() },
        });

        let person = null;
        if (personName) {
            person = await prisma.person.upsert({
                where: { name: String(personName).trim() },
                update: {},
                create: { name: String(personName).trim() },
            });
        }

        let progress = 0;
        if (typeof progressRaw === 'number') {
            if (progressRaw <= 1) {
                progress = Math.round(progressRaw * 100);
            } else {
                progress = Math.round(progressRaw);
            }
        } else if (typeof progressRaw === 'string') {
            const match = progressRaw.match(/%(\d+)/);
            if (match) {
                progress = parseInt(match[1], 10);
            } else {
                const digits = progressRaw.replace(/\D/g, '');
                if (digits) progress = parseInt(digits, 10);
            }
        }

        let daysSpent = 0;
        if (typeof daysSpentRaw === 'number') {
            daysSpent = daysSpentRaw;
        } else if (typeof daysSpentRaw === 'string') {
             daysSpent = parseFloat(daysSpentRaw);
        }

        // Clean up if it was wrongly created as AnnualPlan
        const existingAnnualPlan = await prisma.annualPlan.findFirst({
            where: {
                projectId: project.id,
                taskSummary: String(description).trim()
            }
        });
        if (existingAnnualPlan) {
            await prisma.annualPlan.delete({ where: { id: existingAnnualPlan.id } });
            console.log(`Removed wrongly created Annual Plan: ${description}`);
        }

        // Find or Create AdHocTask
        let adHocTask = await prisma.adHocTask.findFirst({
            where: {
                projectId: project.id,
                description: String(description).trim()
            }
        });

        if (!adHocTask) {
            adHocTask = await prisma.adHocTask.create({
                data: {
                    projectId: project.id,
                    responsibleId: person ? person.id : undefined,
                    description: String(description).trim(),
                    remarks: remarks ? String(remarks).trim() : null,
                    ticketNo: ticketNo ? String(ticketNo).trim() : null,
                    coResponsible: coResponsible ? String(coResponsible).trim() : null,
                    previousStatus: previousStatus ? String(previousStatus).trim() : null,
                    daysSpent: daysSpent,
                    progress: progress,
                }
            });
            console.log(`Created Ad-Hoc Task: ${description}`);
        } else {
            adHocTask = await prisma.adHocTask.update({
                where: { id: adHocTask.id },
                data: {
                    responsibleId: person ? person.id : undefined,
                    remarks: remarks ? String(remarks).trim() : null,
                    ticketNo: ticketNo ? String(ticketNo).trim() : null,
                    coResponsible: coResponsible ? String(coResponsible).trim() : null,
                    previousStatus: previousStatus ? String(previousStatus).trim() : null,
                    daysSpent: daysSpent,
                    progress: progress,
                }
            });
            console.log(`Updated Ad-Hoc Task: ${description}`);
        }

        // Seed WorkLog if Month is provided and daysSpent > 0
        if (monthRaw && daysSpent > 0) {
            const monthIndex = parseInt(monthRaw, 10) - 1; // 0-based for JS Date
            if (monthIndex >= 0 && monthIndex < 12) {
                const year = new Date().getFullYear(); // 2026
                // Set date to the 1st of the month, at noon to avoid timezone issues
                const workDate = new Date(year, monthIndex, 1, 12, 0, 0);

                // Check if a worklog already exists for this task on this approximate date (same month/year)
                // Since we force 1st of month, exact match check is fine.
                const existingLog = await prisma.workLog.findFirst({
                    where: {
                        adHocTaskId: adHocTask.id,
                        date: workDate
                    }
                });

                if (!existingLog) {
                    await prisma.workLog.create({
                        data: {
                            adHocTaskId: adHocTask.id,
                            date: workDate,
                            daysWorked: daysSpent,
                            description: `${description} (${monthRaw}. Ay Eforu)`
                        }
                    });
                    console.log(`Created WorkLog for: ${description} (${daysSpent} days/Month ${monthRaw})`);
                } else {
                     // Update if needed
                     await prisma.workLog.update({
                        where: { id: existingLog.id },
                        data: {
                            daysWorked: daysSpent,
                            description: `${description} (${monthRaw}. Ay Eforu)` // Update description too
                        }
                    });
                    console.log(`Updated WorkLog for: ${description} (${daysSpent} days/Month ${monthRaw})`);
                }
            }
        }
    }
}

async function main() {
    const filePath = path.join(process.cwd(), '.notes/2026.xlsx');

    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }

    const workbook = XLSX.readFile(filePath);

    // Process Sheet 1 (Main Items) -> AnnualPlan
    if (workbook.SheetNames.length > 0) {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        await processSheet(data);
    }

    // Process Sheet 2 (Additional Items) -> AdHocTask
    if (workbook.SheetNames.length > 1) {
        const sheetName = workbook.SheetNames[1];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        await processAdHocSheet(data);
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
