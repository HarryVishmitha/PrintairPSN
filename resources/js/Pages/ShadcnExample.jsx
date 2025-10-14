import { Head } from '@inertiajs/react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Label, Badge, Separator, Switch, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/Components/ui';
import { Mail, User2, LogIn } from 'lucide-react'
import { InputWithIcon } from '@/Components/ui/InputWithIcon';
import { PasswordInput } from '@/Components/ui/PasswordInput';
import { ThemeToggle } from '@/Components/ThemeToggle';

export default function ShadcnExample() {
    return (
    <>
            <Head title="shadcn/ui Example" />
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold text-foreground">
                            shadcn/ui Components Demo
                        </h1>
                        <ThemeToggle />
                    </div>
                    
                    <div className="space-y-8">
                        <Card hover="lift">
                            <CardHeader>
                                <CardTitle>Button Variants</CardTitle>
                                <CardDescription>
                                    Different styles of buttons available in shadcn/ui
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4">
                                    <Button>Default</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="destructive">Destructive</Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="link">Link</Button>
                                    <Button variant="subtle">Subtle</Button>
                                    <Button variant="shadow">Shadow</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card variant="elevated" hover="border">
                            <CardHeader>
                                <CardTitle>Button Sizes</CardTitle>
                                <CardDescription>
                                    Different sizes available for buttons
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-4">
                                    <Button size="sm" leftIcon={User2}>Small</Button>
                                    <Button size="default" leftIcon={User2} rightIcon={LogIn}>Default</Button>
                                    <Button size="lg" leftIcon={User2}>Large</Button>
                                    <Button size="icon" aria-label="target">🎯</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card variant="outline" hover="glow">
                            <CardHeader>
                                <CardTitle>Form Components</CardTitle>
                                <CardDescription>
                                    Input fields and form elements
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" required>Email</Label>
                                        <InputWithIcon id="email" type="email" placeholder="you@example.com" leftIcon={Mail} helperText="We'll never share your email." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" required>Password</Label>
                                        <PasswordInput id="password" placeholder="Enter a strong password" helperText="At least 8 characters" />
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label htmlFor="remember" optional>Remember Me</Label>
                                        <p className="text-sm text-muted-foreground">Keep me signed in on this device</p>
                                    </div>
                                    <TooltipProvider>
                                        <div>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <Switch checked={true} onCheckedChange={() => {}} />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>Toggle remember me</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button leftIcon={LogIn}>Sign in</Button>
                                <Button variant="outline" loading>Processing</Button>
                                <Button variant="secondary" fullWidth>Full width</Button>
                            </CardFooter>
                        </Card>

                        <Card hover="lift">
                            <CardHeader>
                                <CardTitle>Theme Support</CardTitle>
                                <CardDescription>
                                    Toggle between light, dark, and system themes using the button in the top-right corner
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                                        <h4 className="font-semibold">Primary Colors</h4>
                                        <p className="text-sm opacity-90">Adapts to theme</p>
                                    </div>
                                    <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
                                        <h4 className="font-semibold">Secondary Colors</h4>
                                        <p className="text-sm opacity-90">Theme-aware</p>
                                    </div>
                                    <div className="p-4 bg-muted text-muted-foreground rounded-lg">
                                        <h4 className="font-semibold">Muted Colors</h4>
                                        <p className="text-sm">Contextual colors</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge>Default</Badge>
                                    <Badge variant="secondary">Secondary</Badge>
                                    <Badge variant="destructive">Destructive</Badge>
                                    <Badge variant="outline">Outline</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card variant="elevated" hover="border">
                            <CardHeader>
                                <CardTitle>Interactive Examples</CardTitle>
                                <CardDescription>
                                    Test the interactive functionality
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4">
                                    <Button onClick={() => alert('Hello from shadcn/ui!')} leftIcon={User2}>Click me</Button>
                                    <Button disabled loading>Disabled</Button>
                                    <Button variant="outline" onClick={() => console.log('Logged to console')} rightIcon={LogIn}>Log to Console</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            </>
    );
}