'use client';

import { Suspense, useEffect, useState } from 'react';
import { MonitorIcon, MoonIcon, SunIcon, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CompactThemeSwitcherProps {
    className?: string;
}

function SmallLoading() {
    return <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>;
}

export function CompactThemeSwitcher(props: CompactThemeSwitcherProps) {
    const { className } = props;
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <SmallLoading />;
    }

    const themes = [
        { value: 'light', icon: SunIcon, label: 'Light' },
        { value: 'dark', icon: MoonIcon, label: 'Dark' },
        { value: 'system', icon: MonitorIcon, label: 'System' },
    ];

    return (
        <Suspense fallback={<SmallLoading />}>
            <ToggleGroup
                type="single"
                value={theme || 'system'}
                onValueChange={(value) => {
                    if (value) setTheme(value);
                }}
                className={cn(
                    'border-border/30 bg-background/60 rounded-lg border p-1 backdrop-blur-sm',
                    className
                )}
                size="sm"
            >
                {themes.map(({ value, icon: Icon, label }) => (
                    <Tooltip key={value}>
                        <TooltipTrigger asChild>
                            <ToggleGroupItem
                                value={value}
                                aria-label={`Switch to ${label} theme`}
                                className={`data-[state=on]:ring-primary/20 h-6 w-6 cursor-pointer p-0 transition-all duration-300 hover:scale-105 data-[state=on]:scale-105 data-[state=on]:ring-2 ${theme === value
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-accent/30 opacity-60 hover:opacity-100'
                                    } `}
                            >
                                <Icon size={12} className={theme === value ? 'text-primary' : 'opacity-70'} />
                            </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs font-medium">
                                {theme === value && <span className="text-primary mr-1">●</span>}
                                {label}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </ToggleGroup>
        </Suspense>
    );
}
