import { ThemeProvider } from '@/Components/ThemeProvider';

export default function ThemeWrapper({ children }) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="laravel-app-theme">
            {children}
        </ThemeProvider>
    );
}