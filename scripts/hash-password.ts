import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

const password = process.argv[2];

if (!password) {
	console.error('Kullanım: npx tsx scripts/hash-password.ts <şifre>');
	process.exit(1);
}

async function main(): Promise<void> {
	const hash = await bcrypt.hash(password, SALT_ROUNDS);
	console.log('\n🔐 Şifre Hash Sonucu');
	console.log('─'.repeat(50));
	console.log(`Şifre : ${password}`);
	console.log(`Hash  : ${hash}`);
	console.log('─'.repeat(50));
}

main();
