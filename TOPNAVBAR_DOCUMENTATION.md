# TopNavBar Component Documentation

## Overview
The `TopNavBar` component is a comprehensive, production-grade navigation system for the PrintAir e-commerce platform. It features a mega menu, mobile responsiveness, cart integration, theme toggling, and user authentication management.

## Component Location
```
resources/js/Components/Navigation/TopNavBar.jsx
```

## Features

### 1. **Brand Identity Section**
- **Logo Display**: Shows `assets/logo.png` (14rem height)
- **Fallback**: If logo doesn't load, displays a gradient icon with "PrintAir" text
- **Color Scheme**: 
  - Primary: `#f44032` (Red)
  - Secondary: `#000000` (Black)
  - Tertiary: `#ffffff` (White)

### 2. **Top Section (Branding & Actions)**

#### Left Side
- PrintAir logo (clickable, navigates to home)

#### Right Side (Desktop)
- **Authentication Links**:
  - **Guest Users**: Login link + Register button
  - **Authenticated Users**: Dashboard link
- **Cart**: 
  - Shows cart icon with item count badge
  - Integrated with CartContext
  - Real-time count updates
- **Theme Toggle**: 
  - Sun icon (light mode) / Moon icon (dark mode)
  - Persists preference to localStorage
  - Smooth transition between themes

### 3. **Bottom Section (Mega Menu Categories)**

#### Desktop Navigation
- **All Products Link**: Direct link to `/products/all`
- **Category Dropdowns**: Hover-activated mega menus
- **Animated Underline**: Red (#f44032) underline appears on hover

#### Mega Menu Structure
Each category dropdown includes:
- **Header Section**:
  - Category name (large, bold)
  - Category description (subtitle)
  
- **Products Grid**:
  - 3-column responsive grid (1 col mobile, 2 tablet, 3 desktop)
  - Each product card shows:
    - Product image (20x20 rounded, hover scale effect)
    - Product name (bold, truncated)
    - Short description (2-line clamp)
    - Price in LKR (red color)
    - Arrow icon (animates on hover)
  
- **Empty State**:
  - Box icon with "No products available" message
  
- **Footer**:
  - "View All {Category}" link

### 4. **Mobile Menu**

#### Mobile Toggle Button
- Hamburger icon when closed
- Close icon when open
- Visible on screens < 768px (md breakpoint)

#### Mobile Drawer
- Slides down from top
- Includes all desktop features:
  - Authentication links
  - Cart (with count)
  - Theme toggle
  - All Products link
  - Category links (navigates to category page)

### 5. **Accessibility Features**
- **Keyboard Navigation**: Tab, Enter, Escape keys supported
- **Screen Reader Support**: Proper aria-labels on interactive elements
- **Focus Management**: Visible focus states
- **Click Outside**: Closes menus when clicking outside
- **ESC Key**: Closes open menus

## Props

```jsx
<TopNavBar 
    auth={{ user: object | null }}  // Authentication state from Inertia
    categories={[                   // Array of category objects
        {
            id: number,
            name: string,
            description: string,
            products: [
                {
                    id: number,
                    name: string,
                    image: string,
                    price: string,
                    description: string
                }
            ]
        }
    ]}
/>
```

### Default Categories (Fallback)
If no categories prop provided, uses these defaults:
1. **Quick Products**: Pre-printed products for quick purchase
2. **Business**: Professional stationery and marketing materials
3. **Canvas**: High-quality canvas prints
4. **Marketing Materials**: Brochures, flyers, posters

## Integration with CartContext

### CartContext Setup
The component requires `CartContext` to be set up in `app.jsx`:

```jsx
import { CartProvider } from '@/context/CartContext';

<ThemeWrapper>
    <CartProvider>
        <App {...props} />
    </CartProvider>
</ThemeWrapper>
```

### CartContext API
```javascript
const { count, items, addToCart, removeFromCart, clearCart } = useCart();
```

- `count`: Number of items in cart
- `items`: Array of cart items
- `addToCart(product)`: Add product to cart
- `removeFromCart(productId)`: Remove product from cart
- `clearCart()`: Empty entire cart

### Local Storage
Cart data persists to `localStorage` under key `printair_cart`:
```json
{
    "items": [...],
    "count": 0
}
```

## Styling

### Tailwind Classes
The component uses custom Tailwind classes:
- Container: `container mx-auto` for centered layout
- Colors: `bg-[#f44032]`, `text-[#f44032]`, `hover:bg-[#d63027]`
- Transitions: `transition-colors`, `transition-transform`
- Dark Mode: `dark:bg-gray-900`, `dark:text-white`

### Animations
- **Hover Underline**: Scale-x transform (0 → 1)
- **Dropdown Arrow**: Rotate 180° on hover
- **Product Images**: Scale 110% on hover
- **Mobile Menu**: Slide-in from top
- **Mega Menu**: Fade-in with slide-in-from-top-2

## Responsive Breakpoints
- **Mobile**: < 768px (md breakpoint)
  - Hamburger menu
  - Single column layout
  - Stacked navigation items

- **Tablet**: 768px - 1024px
  - Desktop menu visible
  - 2-column product grid in mega menu

- **Desktop**: > 1024px
  - Full mega menu
  - 3-column product grid
  - All features visible

## Usage Example

### In Home.jsx
```jsx
import TopNavBar from '@/Components/Navigation/TopNavBar';

export default function Home({ auth, categories }) {
    return (
        <>
            <Head title="PrintAir Advertising" />
            
            <div className="min-h-screen">
                <TopNavBar auth={auth} categories={categories} />
                
                {/* Rest of page content */}
            </div>
        </>
    );
}
```

### In Laravel Controller
```php
public function index()
{
    $categories = Category::with(['products' => function($query) {
        $query->limit(6); // Limit products in mega menu
    }])->get();

    return Inertia::render('Home', [
        'categories' => $categories
    ]);
}
```

## State Management

### Component State
```javascript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [openMenu, setOpenMenu] = useState(null);
```

- `mobileMenuOpen`: Controls mobile drawer visibility
- `openMenu`: Tracks currently open mega menu (by category ID)

### Mouse Events
- `onMouseEnter`: Opens mega menu on hover
- `onMouseLeave`: Closes mega menu on hover exit

### Click Events
- Logo click: Navigate to home
- Category click: Toggle mobile accordion OR hover desktop menu
- Mobile toggle: Open/close drawer
- Theme toggle: Switch dark/light mode

## Performance Optimizations

### Image Loading
- Lazy loading for product images
- Fallback SVG for missing images
- Error handling with `onError` callback

### Event Handling
- Debounced search (if implemented)
- Click outside detection
- ESC key listener

### CSS Optimizations
- Backdrop blur for modern browsers
- GPU-accelerated transforms
- Will-change hints for animations

## Browser Compatibility
- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **IE11**: Not supported (uses modern CSS features)
- **Mobile Browsers**: Fully responsive and touch-optimized

## Customization

### Colors
Update colors in the component:
```jsx
// Primary brand color
className="bg-[#f44032] hover:bg-[#d63027]"

// Replace with your hex codes
className="bg-[#YOUR_COLOR] hover:bg-[#YOUR_HOVER_COLOR]"
```

### Logo
Replace logo path:
```jsx
<img 
    src="/assets/logo.png"  // Change this path
    alt="PrintAir Logo" 
    className="h-14 w-auto object-contain"
/>
```

### Categories
Modify default categories in component:
```javascript
const defaultCategories = [
    {
        id: 1,
        name: 'Your Category',
        description: 'Category description',
        products: [...]
    }
];
```

## Testing Checklist

- [ ] Logo displays correctly
- [ ] Login/Register buttons work for guests
- [ ] Dashboard link appears for authenticated users
- [ ] Cart count updates correctly
- [ ] Theme toggle switches modes
- [ ] Mobile menu opens/closes
- [ ] Mega menu appears on hover (desktop)
- [ ] Category products display in grid
- [ ] Product images load or fallback
- [ ] "View All" links navigate correctly
- [ ] Responsive on mobile, tablet, desktop
- [ ] Dark mode styles apply
- [ ] Local storage persists theme and cart
- [ ] Keyboard navigation works
- [ ] Click outside closes menus

## Troubleshooting

### Issue: Logo Not Displaying
**Solution**: Ensure `public/assets/logo.png` exists. Check file path and permissions.

### Issue: Cart Count Always Shows 0
**Solution**: Verify CartProvider wraps the App component in `app.jsx`. Check localStorage for `printair_cart` key.

### Issue: Mega Menu Not Opening
**Solution**: Check `categories` prop is passed correctly. Verify products array exists in each category.

### Issue: Theme Toggle Not Working
**Solution**: Ensure Tailwind dark mode is enabled in `tailwind.config.js`:
```javascript
module.exports = {
    darkMode: 'class',
    // ...
}
```

### Issue: Mobile Menu Not Closing
**Solution**: Check `setMobileMenuOpen(false)` is called on link clicks. Verify mobile breakpoint is correct.

## Future Enhancements

### Potential Features
1. **Search Bar**: Add command palette (Ctrl+K) with debounced search
2. **User Menu**: Dropdown for user profile, settings, logout
3. **Notifications**: Bell icon with notification count
4. **Wishlist**: Heart icon for saved items
5. **Multi-language**: i18n support for multiple languages
6. **Currency Switcher**: USD, EUR, LKR options
7. **Mega Menu Images**: Category banners in mega menu
8. **Recently Viewed**: Show recently viewed products
9. **Quick Add to Cart**: Add button in mega menu
10. **Sticky Behavior**: Hide on scroll down, show on scroll up

## Dependencies

### Required Packages
```json
{
    "@inertiajs/react": "^1.0.0",
    "@iconify/react": "^6.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
}
```

### Iconify Icons Used
- `solar:printer-bold-duotone` - Logo fallback
- `solar:home-2-bold-duotone` - Dashboard
- `solar:login-3-bold-duotone` - Login
- `solar:user-plus-bold-duotone` - Register
- `solar:cart-large-2-bold-duotone` - Cart
- `solar:sun-bold-duotone` - Light mode
- `solar:moon-bold-duotone` - Dark mode
- `solar:hamburger-menu-bold-duotone` - Mobile menu
- `solar:close-circle-bold-duotone` - Close menu
- `solar:alt-arrow-down-linear` - Dropdown arrow
- `solar:arrow-right-linear` - Product card arrow
- `solar:arrow-right-bold` - View all link
- `solar:box-bold-duotone` - Empty state

## File Structure
```
resources/js/
├── Components/
│   └── Navigation/
│       └── TopNavBar.jsx          (Main component)
├── context/
│   └── CartContext.jsx             (Cart state management)
├── app.jsx                          (App setup with providers)
└── Pages/
    └── Home.jsx                     (Example usage)
```

## License & Credits
Built for PrintAir Advertising e-commerce platform.
Uses Tailwind CSS, React, Inertia.js, and Iconify.

## Support
For issues or questions about the TopNavBar component:
1. Check this documentation
2. Review the troubleshooting section
3. Inspect browser console for errors
4. Verify all dependencies are installed
5. Ensure CartProvider is properly set up

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0  
**Author**: PrintAir Development Team
