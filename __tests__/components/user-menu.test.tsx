import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserMenu } from '@/components/user-menu';

vi.mock('next-auth/react', () => ({
	signOut: vi.fn(),
}));

describe('UserMenu', () => {
	it('kullanıcı adı ve rolü gösterir', () => {
		render(<UserMenu user={{ name: 'Mustafa Genç', email: 'test@test.com', role: 'ADMIN' }} />);

		expect(screen.getByText('Mustafa Genç')).toBeInTheDocument();
		expect(screen.getByText('Admin')).toBeInTheDocument();
	});

	it('ad yoksa e-postayı gösterir', () => {
		render(<UserMenu user={{ name: null, email: 'test@test.com', role: 'USER' }} />);

		expect(screen.getByText('test@test.com')).toBeInTheDocument();
		expect(screen.getByText('Kullanıcı')).toBeInTheDocument();
	});

	it('kullanıcının baş harflerini doğru hesaplar', () => {
		render(<UserMenu user={{ name: 'Mustafa Genç', email: 'test@test.com', role: 'ADMIN' }} />);

		expect(screen.getByText('MG')).toBeInTheDocument();
	});

	it('tek isimli kullanıcı baş harfi', () => {
		render(<UserMenu user={{ name: 'Mustafa', email: 'test@test.com', role: 'USER' }} />);

		expect(screen.getByText('M')).toBeInTheDocument();
	});

	it('USER rolü "Kullanıcı" olarak gösterilir', () => {
		render(<UserMenu user={{ name: 'Test', email: 'test@test.com', role: 'USER' }} />);

		expect(screen.getByText('Kullanıcı')).toBeInTheDocument();
	});

	it('ADMIN rolü "Admin" olarak gösterilir', () => {
		render(<UserMenu user={{ name: 'Test', email: 'test@test.com', role: 'ADMIN' }} />);

		expect(screen.getByText('Admin')).toBeInTheDocument();
	});

	it('çıkış butonu render edilir', () => {
		render(<UserMenu user={{ name: 'Test', email: 'test@test.com', role: 'USER' }} />);

		const logoutButton = screen.getByRole('button');
		expect(logoutButton).toBeInTheDocument();
	});
});
