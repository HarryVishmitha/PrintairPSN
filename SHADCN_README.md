# shadcn/ui Integration

This project now includes shadcn/ui components integrated with Laravel, Inertia.js, and React.

## What's been added:

### Dependencies
- `class-variance-authority` - For creating component variants
- `clsx` - For conditional class names
- `tailwind-merge` - For merging Tailwind classes
- `@radix-ui/react-slot` - For polymorphic components
- `lucide-react` - For icons
- `tailwindcss-animate` - For animations

### Configuration
- Updated `tailwind.config.js` with shadcn/ui theme configuration
- Added CSS variables in `resources/css/app.css` for consistent theming
- Updated `vite.config.js` with path alias `@` pointing to `resources/js`
- Created `components.json` for shadcn/ui configuration

### Components
The following components have been created in `resources/js/Components/ui/`:
- `Button.jsx` - Button component with variants and sizes
- `Card.jsx` - Card components (Card, CardHeader, CardTitle, etc.)
- `Input.jsx` - Input field component

### Utility Functions
- `resources/js/lib/utils.js` - Contains the `cn()` function for class merging

## Usage Examples

### Importing Components
```jsx
import { Button, Card, CardHeader, CardTitle, Input } from '@/Components/ui';
```

### Using Components
```jsx
// Basic button
<Button>Click me</Button>

// Button with variant
<Button variant="secondary">Secondary</Button>

// Button with different size
<Button size="lg">Large Button</Button>

// Card component
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>

// Input field
<Input type="email" placeholder="Enter email" />
```

## Demo Page

Visit `/shadcn-example` to see all components in action.

## Theme Support 🎨

The integration includes full dark/light mode support with these features:

### Theme Provider
- Global theme management with React Context
- Automatic system preference detection
- Persistent theme storage in localStorage
- Three modes: light, dark, and system

### Theme Toggle Component
```jsx
import { ThemeToggle } from '@/Components/ThemeToggle';

// Add to any page or layout
<ThemeToggle />
```

### Using Themes in Your Components
All shadcn/ui components automatically support theming via CSS variables:

```jsx
// These classes automatically adapt to the current theme
<div className="bg-background text-foreground">
  <div className="bg-card text-card-foreground border border-border">
    <h1 className="text-primary">Themed Content</h1>
    <p className="text-muted-foreground">Secondary text</p>
  </div>
</div>
```

### Demo Pages
- `/shadcn-example` - Component showcase with theme toggle
- `/themed-welcome` - Themed version of the welcome page

## Adding More Components

To add more shadcn/ui components:

1. Create the component file in `resources/js/Components/ui/`
2. Follow the shadcn/ui patterns for styling and variants
3. Export the component from `resources/js/Components/ui/index.js`
4. Use the `cn()` utility function for class merging

## Theme Customization

You can customize the theme by modifying the CSS variables in `resources/css/app.css`. The color scheme automatically supports both light and dark modes.

## Important Notes

- The Tailwind prefix has been removed to work with shadcn/ui
- All components use CSS variables for theming
- Components are built with accessibility in mind using Radix UI primitives
- The setup supports both light and dark themes out of the box