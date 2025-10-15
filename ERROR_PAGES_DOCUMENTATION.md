# Custom Error Pages Documentation

## Overview

This application features beautifully designed, modern error pages for enhanced user experience. Each error page includes animations, gradients, helpful information, and clear calls-to-action.

## Available Error Pages

### 1. 403 - Access Denied (Forbidden)
**File:** `resources/js/Pages/Errors/403.jsx`

**Design:**
- 🎨 Purple/Pink gradient theme
- 🔒 Lock icon animation
- 💫 Animated blob backgrounds
- 🃏 Three feature cards (Restricted, Authorized Only, Secure)

**Features:**
- Gradient animated "403" text
- Clear access denial message
- Helpful context about authorization
- Two action buttons:
  - "Go to Dashboard" (primary, gradient blue/purple)
  - "Go Back" (secondary, glass morphism)
- Support link for requesting access
- Error code reference display

**When Triggered:**
- User tries to access a route without proper role/permission
- `CheckRole` middleware denies access
- Manual `abort(403)` calls

### 2. 404 - Page Not Found
**File:** `resources/js/Pages/Errors/404.jsx`

**Design:**
- 🎨 Blue/Indigo/Cyan gradient theme
- 💡 Light bulb icon (floating animation)
- 💫 Animated blob backgrounds
- 🃏 Two helpful suggestion cards

**Features:**
- Large "404" display
- Friendly "Page Not Found" message
- Suggestions:
  - Check the URL spelling
  - Use search functionality
- Two action buttons:
  - "Go to Dashboard" (primary, gradient cyan/blue)
  - "Go Back" (secondary, glass morphism)
- Support contact link
- Error code reference display

**When Triggered:**
- User navigates to non-existent route
- Deleted/moved resources
- Broken links

### 3. 500 - Internal Server Error
**File:** `resources/js/Pages/Errors/500.jsx`

**Design:**
- 🎨 Red/Orange/Yellow gradient theme
- ⚠️ Alert icon with shake animation
- 💫 Animated blob backgrounds
- 🃏 Three status indicator cards
- 📋 "What you can do" checklist

**Features:**
- Animated "500" text
- Reassuring "we're working on it" message
- Status indicators:
  - Server Issue (technical problem)
  - Team Notified (auto-reported)
  - Try Again (refresh page)
- Actionable steps list:
  - Try refreshing
  - Go back to previous page
  - Return to dashboard
  - Contact support if persists
- Two action buttons:
  - "Refresh Page" (primary, gradient orange/red)
  - "Go to Dashboard" (secondary, glass morphism)
- Unique reference ID for error tracking
- Support contact link

**When Triggered:**
- Server-side exceptions
- Database errors
- Unhandled exceptions
- Fatal PHP errors

## Technical Implementation

### Exception Handling

**File:** `bootstrap/app.php`

```php
->withExceptions(function (Exceptions $exceptions): void {
    // Custom 404 error page
    $exceptions->render(function (NotFoundHttpException $e, $request) {
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Page not found'], 404);
        }
        return Inertia::render('Errors/404')->toResponse($request)->setStatusCode(404);
    });

    // Custom 403 error page
    $exceptions->render(function (AccessDeniedHttpException $e, $request) {
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Access denied'], 403);
        }
        return Inertia::render('Errors/403')->toResponse($request)->setStatusCode(403);
    });
})
```

### CheckRole Middleware Integration

**File:** `app/Http/Middleware/CheckRole.php`

```php
// User doesn't have required role - show custom 403 page
return Inertia::render('Errors/403')->toResponse($request)->setStatusCode(403);
```

## Design System

### Color Schemes

**403 (Access Denied):**
- Primary: Purple (#9333EA, #EC4899)
- Background: Slate/Purple gradient
- Accent: Blue, Pink

**404 (Not Found):**
- Primary: Cyan (#06B6D4), Blue (#3B82F6), Indigo (#6366F1)
- Background: Indigo/Blue gradient
- Accent: Cyan

**500 (Server Error):**
- Primary: Orange (#EA580C), Red (#DC2626)
- Background: Red/Orange gradient
- Accent: Yellow

### Common Elements

**Animated Backgrounds:**
- Three blob shapes with `mix-blend-multiply`
- Blur effect (3xl)
- Continuous blob animation (7s cycle)
- Staggered animation delays (0s, 2s, 4s)

**Glass Morphism:**
- `backdrop-blur-lg` effect
- White overlay with opacity (10-20%)
- Border with white/20% opacity
- Smooth transitions

**Typography:**
- Error codes: 8xl-9xl, bold, gradient text
- Headings: 3xl-4xl, bold, white
- Body text: lg-xl, gray-300
- Helper text: sm, gray-400

**Buttons:**
- Primary: Gradient background, hover scale, shadow
- Secondary: Glass morphism, border, hover effects
- All buttons: rounded-xl, smooth transitions

**Icons:**
- Heroicons SVG icons
- Consistent sizing (w-5 h-5 for buttons, w-6 h-6 for cards)
- Stroke width: 2
- Color-coded per theme

## Animation System

### CSS Animations

**Blob Animation:**
```css
@keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(20px, -50px) scale(1.1); }
    50% { transform: translate(-20px, 20px) scale(0.9); }
    75% { transform: translate(50px, 50px) scale(1.05); }
}
```

**Gradient Animation:**
```css
@keyframes gradient-x {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}
```

**Float Animation (404):**
```css
@keyframes float {
    0%, 100% { transform: translateY(0) rotate(-5deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
}
```

**Shake Animation (500):**
```css
@keyframes shake {
    0%, 100% { transform: rotate(-1deg); }
    50% { transform: rotate(1deg); }
}
```

### React Mount Animation

All pages use `useState` and `useEffect` for mount animation:
```javascript
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

// Applied as:
className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
```

## Responsive Design

### Breakpoints

- **Mobile First:** Base styles for mobile (< 640px)
- **sm:** 640px+ (small tablets)
- **md:** 768px+ (tablets, small laptops)
- **lg:** 1024px+ (desktops)

### Responsive Adjustments

**Padding:**
- Mobile: p-8
- Tablet: p-12
- Desktop: p-16

**Error Code Size:**
- Mobile: text-8xl
- Desktop: text-9xl

**Icon Size:**
- Mobile: w-16 h-16
- Desktop: w-20 h-20

**Grid Layout:**
- Mobile: grid-cols-1 (stacked)
- Tablet: grid-cols-2 or grid-cols-3

**Button Layout:**
- Mobile: flex-col (stacked)
- Tablet: flex-row (side-by-side)

## Testing Error Pages

### Test 403 (Access Denied)

**Method 1: Try accessing protected route without permission**
```
1. Login as a Member user
2. Try to access: http://localhost:8000/admin/working-groups
3. Should see 403 page
```

**Method 2: Direct test route**
```php
// Add to routes/web.php temporarily:
Route::get('/test-403', function () {
    abort(403);
});

// Visit: http://localhost:8000/test-403
```

### Test 404 (Not Found)

**Method: Access non-existent route**
```
Visit: http://localhost:8000/this-page-does-not-exist
Should see 404 page
```

### Test 500 (Server Error)

**Method 1: Throw exception**
```php
// Add to routes/web.php temporarily:
Route::get('/test-500', function () {
    throw new \Exception('Test server error');
});

// Visit: http://localhost:8000/test-500
```

**Method 2: Cause database error**
```php
// Temporarily rename .env database name to non-existent DB
// Then access any database-dependent page
```

## Browser Compatibility

### Supported Features

✅ **CSS Backdrop Filter** (blur effects)
- Chrome 76+
- Safari 9+
- Firefox 103+
- Edge 79+

✅ **CSS Gradient**
- All modern browsers

✅ **CSS Animations**
- All modern browsers

✅ **CSS Transform**
- All modern browsers

### Fallbacks

If `backdrop-blur` not supported, background will:
- Still show with opacity
- Border remains visible
- Content still readable

## Customization Guide

### Changing Colors

**403 Page (Purple theme):**
```javascript
// Change gradient colors in:
className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"

// Change primary button:
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

**404 Page (Blue theme):**
```javascript
className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-900"
className="bg-gradient-to-r from-cyan-600 to-blue-600"
```

**500 Page (Red theme):**
```javascript
className="bg-gradient-to-br from-red-900 via-orange-900 to-red-900"
className="bg-gradient-to-r from-orange-600 to-red-600"
```

### Adding More Error Pages

**Create new error page:**
```javascript
// resources/js/Pages/Errors/503.jsx (Service Unavailable)
// Copy structure from existing error page
// Customize colors, icon, and message
```

**Register in bootstrap/app.php:**
```php
$exceptions->render(function (ServiceUnavailableHttpException $e, $request) {
    if ($request->expectsJson()) {
        return response()->json(['message' => 'Service unavailable'], 503);
    }
    return Inertia::render('Errors/503')->toResponse($request)->setStatusCode(503);
});
```

### Changing Button Actions

**Dashboard redirect:**
```javascript
// Change route name:
href={route('your-custom-route')}
```

**Custom action button:**
```javascript
<button
    onClick={() => {
        // Your custom action
        window.location.href = '/custom-url';
    }}
    className="..."
>
    Custom Action
</button>
```

## Best Practices

### Do's ✅

1. **Keep error messages user-friendly**
   - Avoid technical jargon
   - Be reassuring and helpful
   - Provide clear next steps

2. **Maintain consistent design**
   - Use established color schemes
   - Keep animation styles consistent
   - Follow spacing/padding patterns

3. **Provide actionable options**
   - Always offer "Go Back" or "Go to Dashboard"
   - Include support/help links
   - Show error reference codes

4. **Optimize performance**
   - Use CSS animations (not JavaScript)
   - Lazy load heavy elements if needed
   - Keep bundle size small

5. **Test on multiple devices**
   - Mobile phones (various sizes)
   - Tablets
   - Desktop screens

### Don'ts ❌

1. **Don't expose sensitive information**
   - No stack traces on production
   - No database query details
   - No internal server paths

2. **Don't use too many animations**
   - Can be distracting
   - May cause performance issues
   - Can trigger motion sickness

3. **Don't forget API responses**
   - Always check `$request->expectsJson()`
   - Return proper JSON for API calls
   - Include appropriate status codes

4. **Don't hard-code URLs**
   - Use `route()` helper
   - Use relative paths when possible
   - Make URLs configurable

5. **Don't make pages too heavy**
   - Optimize SVG icons
   - Use CSS instead of images when possible
   - Minimize dependencies

## Accessibility Considerations

### Current Features

✅ **Semantic HTML**
- Proper heading hierarchy (h1, h2, h3)
- Meaningful button text
- Clear link descriptions

✅ **Color Contrast**
- Text on dark backgrounds meets WCAG AA
- Button colors have sufficient contrast
- Icon colors are distinguishable

✅ **Keyboard Navigation**
- All buttons/links are focusable
- Tab order is logical
- No keyboard traps

### Future Improvements

🔄 **Add ARIA labels**
```javascript
<button aria-label="Go back to previous page" onClick={...}>
```

🔄 **Add skip navigation**
```javascript
<a href="#main-content" className="sr-only">Skip to main content</a>
```

🔄 **Reduce motion for users who prefer it**
```css
@media (prefers-reduced-motion: reduce) {
    .animate-blob { animation: none; }
}
```

## Monitoring & Analytics

### Error Tracking

**Sentry Integration** (already configured):
- Automatically captures 500 errors
- Includes stack traces
- User context and breadcrumbs

**Custom Reference IDs:**
```javascript
// 500 page generates unique ID:
<span className="font-mono">{Date.now()}</span>
```

### Usage Analytics

**Track error page views:**
```javascript
// Add to useEffect in error pages:
useEffect(() => {
    // Google Analytics
    window.gtag?.('event', 'error_view', {
        error_code: '403',
        error_type: 'access_denied'
    });
}, []);
```

## Support & Resources

### Related Files

- Error Pages: `resources/js/Pages/Errors/`
- Exception Handler: `bootstrap/app.php`
- CheckRole Middleware: `app/Http/Middleware/CheckRole.php`
- Routes: `routes/web.php`

### External Resources

- **Tailwind CSS:** https://tailwindcss.com/docs
- **Inertia.js:** https://inertiajs.com/
- **React Docs:** https://react.dev/
- **Heroicons:** https://heroicons.com/

### Getting Help

If you encounter issues with error pages:

1. Check browser console for JavaScript errors
2. Verify Inertia is properly configured
3. Ensure routes are registered correctly
4. Test in different browsers
5. Check for conflicting CSS styles

---

**Last Updated:** October 15, 2025
**Version:** 1.0.0
**Maintainer:** Development Team
