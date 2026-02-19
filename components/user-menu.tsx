'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function UserMenu() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    const initials = (session.user.name ?? session.user.email ?? '?')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const role = (session.user as { role?: string }).role;
    const roleLabel = role === 'ADMIN' ? 'Admin' : 'Kullanıcı';

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {initials}
                </div>
                <div className="hidden md:flex flex-col leading-tight">
                    <span className="text-sm font-medium text-foreground/80">
                        {session.user.name ?? session.user.email}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {roleLabel}
                    </span>
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => signOut({ callbackUrl: '/login' })}
            >
                <LogOut className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
