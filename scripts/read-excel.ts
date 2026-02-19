import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), '.notes/2026.xlsx');

if (!fs.existsSync(filePath)) {
	console.error('File not found:', filePath);
	process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Get headers (first row)
const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
console.log('Headers:', headers);

// Get first few rows of data
const data = XLSX.utils.sheet_to_json(worksheet).slice(0, 3);
console.log('First 3 rows:', JSON.stringify(data, null, 2));
