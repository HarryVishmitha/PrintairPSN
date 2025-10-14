import { Head, Link } from '@inertiajs/react';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { Button } from '@/Components/ui/Button';

export default function ThemedWelcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome - Dark/Light Theme Demo" />
            <div className="bg-background text-foreground min-h-screen">
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-primary selection:text-primary-foreground">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                <div className="text-6xl font-bold text-primary">
                                    🎨 Theme Demo
                                </div>
                            </div>
                            <nav className="-mx-3 flex flex-1 justify-end items-center gap-4">
                                <ThemeToggle />
                                {auth.user ? (
                                    <Button asChild>
                                        <Link href={route('dashboard')}>
                                            Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button variant="ghost" asChild>
                                            <Link href={route('login')}>
                                                Log in
                                            </Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href={route('register')}>
                                                Register
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </nav>
                        </header>

                        <main className="mt-6">
                            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                                <div className="flex flex-col items-start gap-6 overflow-hidden rounded-lg bg-card p-6 shadow-sm border ring-1 ring-border">
                                    <div className="relative flex w-full flex-1 items-stretch">
                                        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <h3 className="text-2xl font-semibold text-card-foreground mb-2">
                                                    Theme Support
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    Toggle between light, dark, and system themes
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative flex items-center gap-6 lg:items-end">
                                        <div className="flex items-start gap-6 lg:flex-col">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:size-16">
                                                <div className="text-2xl">🌙</div>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-card-foreground">
                                                    Automatic Theme Detection
                                                </h2>
                                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                                    Supports system preference, manual light/dark mode selection, 
                                                    and persistent theme storage across sessions.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-6 overflow-hidden rounded-lg bg-card p-6 shadow-sm border ring-1 ring-border">
                                    <div className="relative flex w-full flex-1 items-stretch">
                                        <div className="w-full h-48 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <h3 className="text-2xl font-semibold text-card-foreground mb-2">
                                                    shadcn/ui Integration
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    Beautiful components with consistent theming
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative flex items-center gap-6 lg:items-end">
                                        <div className="flex items-start gap-6 lg:flex-col">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary/10 sm:size-16">
                                                <div className="text-2xl">🎯</div>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-card-foreground">
                                                    Component Library
                                                </h2>
                                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                                    Pre-built components that automatically adapt to your chosen theme
                                                    with consistent styling and accessibility features.
                                                </p>
                                                <Button className="mt-4" asChild>
                                                    <Link href="/shadcn-example">
                                                        View Examples
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 flex items-center gap-6 lg:gap-8">
                                <div className="text-sm text-muted-foreground">
                                    Laravel v{laravelVersion} | PHP v{phpVersion}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}