import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
	trustHost: true,
	adapter: PrismaAdapter(prisma),
	session: { strategy: 'jwt' },
	pages: {
		signIn: '/login',
	},
	providers: [
		Credentials({
			credentials: {
				email: { label: 'E-posta', type: 'email' },
				password: { label: 'Şifre', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const email = credentials.email as string;
				const password = credentials.password as string;

				const user = await prisma.user.findUnique({
					where: { email },
				});

				if (!user || !user.password) {
					return null;
				}

				const isValid = await verifyPassword(password, user.password);

				if (!isValid) {
					return null;
				}

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id as string;
				const dbUser = await prisma.user.findUnique({
					where: { id: user.id as string },
					select: { role: true },
				});
				token.role = (dbUser?.role ?? 'USER') as 'ADMIN' | 'USER';
			}
			return token;
		},
		async session({ session, token }) {
			if (token?.id) {
				session.user.id = token.id as string;
				(session.user as { role: string }).role = token.role as string;
			}
			return session;
		},
	},
});
