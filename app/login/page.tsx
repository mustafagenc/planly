'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { login, register } from '@/app/actions/auth';
import { PlanlyLogo } from '@/components/planly-logo';
import { version } from '@/package.json';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = isRegister
                ? await register(name, email, password)
                : await login(email, password);

            if (result.success) {
                router.push('/');
                router.refresh();
            } else {
                setError(result.error ?? 'Bir hata oluştu.');
            }
        } catch {
            setError('Beklenmeyen bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-sm border-border/60">
                <CardHeader className="text-center space-y-3">
                    <div className="flex justify-center">
                        <PlanlyLogo size={140} />
                    </div>
                    <div>
                        <CardTitle className="text-xl">
                            {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {isRegister
                                ? 'İlk kullanıcı hesabınızı oluşturun.'
                                : 'Devam etmek için giriş yapın.'}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Ad Soyad</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Adınız Soyadınız"
                                    required={isRegister}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@email.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            >
                                {isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="flex items-center justify-between w-full max-w-sm mt-4 px-2">
                <p className="text-xs text-muted-foreground/70">
                    &copy; {new Date().getFullYear()}{' '}
                    <Link href="https://mustafagenc.info" className="hover:text-foreground transition-colors">Mustafa Genç</Link>
                </p>
                <span className="text-xs text-muted-foreground/50 font-mono">v{version}</span>
            </div>
        </div>
    );
}
