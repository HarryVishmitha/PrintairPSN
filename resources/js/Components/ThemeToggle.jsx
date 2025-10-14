import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";

import { Button } from "@/Components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/DropdownMenu";
import { useTheme } from "@/Components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const themes = [
    { label: "Light", value: "light", icon: Sun },
    { label: "Dark", value: "dark", icon: Moon },
    { label: "System", value: "system", icon: Laptop },
  ];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full w-10 h-10 border-opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-lg border-slate-200 shadow-lg animate-in slide-in-from-top-1">
        {themes.map(({ label, value, icon: Icon }) => (
          <DropdownMenuItem 
            key={value} 
            onClick={() => setTheme(value)}
            className={`flex items-center gap-2 cursor-pointer ${theme === value ? "bg-slate-100 dark:bg-slate-800" : ""} hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors`}
          >
            <Icon className={`h-4 w-4 ${
              value === "light" ? "text-yellow-500" : 
              value === "dark" ? "text-indigo-400" : 
              "text-slate-500"
            }`} />
            <span>{label}</span>
            {theme === value && <span className="ml-auto text-xs text-slate-500">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
