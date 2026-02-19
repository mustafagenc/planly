import { version } from "@/package.json";
import { CompactThemeSwitcher } from "@/components/compact-theme-switcher";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-6 mt-auto">
            <div className="container flex items-center justify-between ">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Mustafa Genç. Tüm hakları saklıdır.
                </p>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        v{version}
                    </p>
                    <CompactThemeSwitcher />
                </div>
            </div>
        </footer>
    );
}
