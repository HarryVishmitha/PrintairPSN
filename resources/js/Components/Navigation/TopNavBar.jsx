import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { ThemeToggle } from "@/Components/ThemeToggle";
import { Icon } from "@iconify/react";

/**
 * Advanced Printair Header with Dark Mode
 * - Full dark mode toggle & persistence
 * - Enhanced hover effects, animations, icons
 * - Improved a11y (keyboard nav, focus states)
 * - Mega menu, mobile drawer, command palette
 */

const Header = () => {
    const { auth } = usePage().props;
    const { count } = useCart();

    // Dark mode state (persisted in localStorage)
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") === "dark";
        }
        return false;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [openCategory, setOpenCategory] = useState(null);
    const [hoverCategory, setHoverCategory] = useState(null);

    const shellRef = useRef(null);
    const desktopMenuRef = useRef(null);
    const drawerRef = useRef(null);

    // Activity logger
    const track = useCallback((event, payload = {}) => {
        const body = {
            event,
            payload,
            ts: new Date().toISOString(),
            path: window.location.pathname,
        };
        if (import.meta?.env?.DEV) console.info("[activity]", body);
    }, []);

    // Close on outside click & ESC
    useEffect(() => {
        const onDown = (e) => {
            if (!shellRef.current) return;
            if (!shellRef.current.contains(e.target)) {
                setHoverCategory(null);
            }
            if (
                mobileNavOpen &&
                drawerRef.current &&
                !drawerRef.current.contains(e.target)
            ) {
                setMobileNavOpen(false);
            }
        };
        const onEsc = (e) => {
            if (e.key === "Escape") {
                setHoverCategory(null);
                setMobileNavOpen(false);
            }
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onEsc);
        };
    }, [mobileNavOpen]);

    // Load nav categories
    const [navCategories, setNavCategories] = useState([]);
    const [navLoading, setNavLoading] = useState(false);
    const [navError, setNavError] = useState(null);

    const fetchNavCategories = async () => {
        try {
            setNavLoading(true);
            const res = await axios.get("/api/nav-categories");
            if (res?.data?.success) {
                setNavCategories(res.data.data);
            } else {
                setNavError(
                    res?.data?.message ||
                        "Failed to load navigation categories."
                );
            }
        } catch (err) {
            setNavError(err.message || "Something went wrong.");
        } finally {
            setNavLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchNavCategories, 250);
        return () => clearTimeout(t);
    }, []);

    // Search (command palette)
    const [q, setQ] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const debounceRef = useRef(null);

    const buildLocalSuggestions = useCallback(
        (value) => {
            const v = value.trim().toLowerCase();
            if (!v) return [];
            const items = [];
            navCategories.forEach((c) => {
                const cat = c?.category;
                if (!cat) return;
                if (cat?.name?.toLowerCase()?.includes(v)) {
                    items.push({
                        id: `cat-${cat.id}`,
                        name: cat.name,
                        href: `/categories/${cat.id}`,
                        description: (cat.description || "")
                            .replace(/<[^>]+>/g, "")
                            .slice(0, 140),
                        image:
                            Array.isArray(cat.products) &&
                            cat.products[0]?.images?.[0]?.image_url,
                        type: "Category",
                    });
                }
                (cat.products || []).forEach((p) => {
                    if (p?.name?.toLowerCase()?.includes(v)) {
                        items.push({
                            id: `p-${p.id}`,
                            name: p.name,
                            href: `/public/${p.id}/product/${p.name
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")}`,
                            description: p.meta_description || "",
                            image:
                                Array.isArray(p.images) &&
                                p.images[0]?.image_url,
                            type: "Product",
                        });
                    }
                });
            });
            return items.slice(0, 8);
        },
        [navCategories]
    );

    const runSearch = useCallback(
        async (value) => {
            const local = buildLocalSuggestions(value);
            let remote = [];
            try {
                if (value.trim().length >= 2) {
                    const r = await axios.get("/api/search", {
                        params: { q: value.trim() },
                    });
                    if (Array.isArray(r?.data)) remote = r.data;
                    if (r?.data?.results) remote = r.data.results;
                }
            } catch (_) {}
            const map = new Map();
            [...local, ...remote].forEach((it) => {
                const key = it.href || `${it.type}:${it.id}`;
                if (key && !map.has(key)) map.set(key, it);
            });
            setSuggestions(Array.from(map.values()).slice(0, 8));
        },
        [buildLocalSuggestions]
    );

    const onChangeQ = (e) => {
        const value = e.target.value;
        setQ(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (value.trim().length >= 2) {
                runSearch(value);
                track("search:typing", { q: value.trim() });
            } else {
                setSuggestions([]);
            }
        }, 200);
    };

    // Ctrl/⌘ + K toggles palette
    useEffect(() => {
        const onKey = (e) => {
            const mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
            const mod = mac ? e.metaKey : e.ctrlKey;
            if (mod && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setPaletteOpen((v) => !v);
                track("palette:toggled");
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [track]);

    return (
        <header
            className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-300"
            ref={shellRef}
        >
            {/* Top Bar */}
            <div className="container mx-auto flex justify-between items-center px-4 py-4">
                <Link
                    href="/"
                    className="flex items-center space-x-2 group"
                    onClick={() => track("nav:logo")}
                >
                    <img
                        src="/assets/logo-XXL.png"
                        alt="Printair Logo"
                        className="h-14 transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center space-x-4">
                    {/* Search trigger */}
                    <button
                        onClick={() => setPaletteOpen(true)}
                        className="hidden lg:inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300"
                        aria-label="Open search (Ctrl or ⌘ + K)"
                    >
                        <Icon icon="solar:magnifer-bold-duotone" className="text-lg" />
                        <span className="text-sm font-medium">Search</span>
                        <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            ⌘K
                        </span>
                    </button>

                    {/* Quote */}
                    <Link
                        href="/requests/quotations"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] transition-all duration-300 group"
                        onClick={() => track("nav:quote")}
                    >
                        <Icon 
                            icon="solar:document-add-bold-duotone" 
                            className="text-xl group-hover:scale-110 transition-transform" 
                        />
                        <span className="font-medium">Quote</span>
                    </Link>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        className="relative flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] transition-all duration-300 group"
                        onClick={() => track("cart:open")}
                    >
                        <div className="relative">
                            <Icon 
                                icon="solar:cart-large-2-bold-duotone" 
                                className="text-2xl group-hover:scale-110 transition-transform" 
                            />
                            {count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#f44032] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                                    {count}
                                </span>
                            )}
                        </div>
                        <span className="font-medium">Cart</span>
                    </Link>

                    {/* Dashboard or Login */}
                    {auth?.user ? (
                        <Link
                            href={route("dashboard")}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] transition-all duration-300 group"
                            onClick={() => track("nav:dashboard")}
                        >
                            <Icon 
                                icon="solar:widget-2-bold-duotone" 
                                className="text-xl group-hover:scale-110 transition-transform" 
                            />
                            <span className="font-medium">Dashboard</span>
                        </Link>
                    ) : (
                        <Link
                            href={route("login")}
                            className="flex items-center gap-2 bg-[#f44032] hover:bg-[#d63027] text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            onClick={() => track("auth:login:click")}
                        >
                            <Icon icon="solar:login-3-bold-duotone" className="text-lg" />
                            <span className="font-medium">Login</span>
                        </Link>
                    )}

                    {/* Theme Toggle Component */}
                    <ThemeToggle />
                </div>

                {/* Mobile Nav Toggle */}
                <button
                    onClick={() => {
                        setMobileNavOpen(true);
                        track("nav:mobile:open");
                    }}
                    className="block md:hidden text-gray-600 dark:text-gray-300 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300"
                    aria-label="Open menu"
                >
                    <i className="fas fa-bars"></i>
                </button>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Desktop Navigation */}
            <div className="w-full hidden md:flex justify-center py-3 bg-gray-50 dark:bg-gray-800/50">
                <nav className="flex gap-8" aria-label="Primary">
                    <Link
                        href={"#"}
                        className="group relative pb-2 text-gray-700 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] font-medium transition-all duration-300"
                        onMouseEnter={() => setHoverCategory(null)}
                        onFocus={() => setHoverCategory(null)}
                    >
                        <i className="fa-solid fa-layer-group mr-2"></i>
                        All Products
                        <span className="absolute w-full h-0.5 rounded-full bg-gradient-to-r from-[#f44032] to-[#ff6b5a] transform scale-x-0 origin-center transition-transform duration-300 bottom-0 group-hover:scale-x-100 left-0"></span>
                    </Link>

                    {navLoading ? (
                        [...Array(6)].map((_, idx) => (
                            <div
                                key={idx}
                                className="w-24 h-4 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse"
                            />
                        ))
                    ) : navError ? (
                        <span className="text-red-500 dark:text-red-400 text-sm">
                            {navError}
                        </span>
                    ) : (
                        navCategories.map((category, idx) => (
                            <div
                                className="relative group"
                                key={idx}
                                onMouseEnter={() => setHoverCategory(idx)}
                                onMouseLeave={() =>
                                    setHoverCategory((v) =>
                                        v === idx ? null : v
                                    )
                                }
                            >
                                <button
                                    className="group relative pb-2 text-gray-700 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] font-medium transition-all duration-300"
                                    aria-haspopup="true"
                                    aria-expanded={hoverCategory === idx}
                                    onFocus={() => setHoverCategory(idx)}
                                >
                                    {category?.category?.name}
                                    <i className="fa-solid fa-chevron-down ml-2 text-xs transform transition-transform duration-300 group-hover:rotate-180"></i>
                                    <span className="absolute w-full h-0.5 rounded-full bg-gradient-to-r from-[#f44032] to-[#ff6b5a] transform scale-x-0 origin-center transition-transform duration-300 bottom-0 group-hover:scale-x-100 left-0"></span>
                                </button>

                                {/* Mega Dropdown */}
                                {hoverCategory === idx && (
                                    <div className="fixed mt-2 left-0 right-0 z-50 animate-fade-in">
                                        <div className="container mx-auto px-4">
                                            <div
                                                ref={desktopMenuRef}
                                                className="w-full max-w-7xl mx-auto p-6 text-gray-600 dark:text-gray-300 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700"
                                            >
                                                <div className="flex items-center justify-center gap-3 mb-4">
                                                    <div className="w-12 h-1 bg-gradient-to-r from-[#f44032] to-[#ff6b5a] rounded-full"></div>
                                                    <h5 className="font-bold text-xl text-gray-800 dark:text-white">
                                                        {
                                                            category?.category
                                                                ?.name
                                                        }
                                                    </h5>
                                                    <div className="w-12 h-1 bg-gradient-to-r from-[#ff6b5a] to-[#f44032] rounded-full"></div>
                                                </div>
                                                <div
                                                    className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 text-center max-w-3xl mx-auto mb-6"
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            category?.category
                                                                ?.description ||
                                                            "Explore our collection",
                                                    }}
                                                />

                                                {Array.isArray(
                                                    category?.category?.products
                                                ) &&
                                                category.category.products
                                                    .length > 0 ? (
                                                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {category.category.products
                                                            .slice(0, 9)
                                                            .map(
                                                                (
                                                                    product,
                                                                    pIdx
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            pIdx
                                                                        }
                                                                    >
                                                                        <Link
                                                                            href={`/public/${
                                                                                product.id
                                                                            }/product/${product.name
                                                                                .toLowerCase()
                                                                                .replace(
                                                                                    /[^a-z0-9]+/g,
                                                                                    "-"
                                                                                )}`}
                                                                            className="flex gap-3 items-start p-4 rounded-xl hover:text-[#f44032] dark:hover:text-[#f44032] transition-all duration-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-[#f44032]/30 hover:shadow-lg transform hover:-translate-y-1 group"
                                                                            onClick={() =>
                                                                                track(
                                                                                    "menu:product:click",
                                                                                    {
                                                                                        categoryId:
                                                                                            category
                                                                                                ?.category
                                                                                                ?.id,
                                                                                        productId:
                                                                                            product.id,
                                                                                    }
                                                                                )
                                                                            }
                                                                        >
                                                                            <div className="relative">
                                                                                <img
                                                                                    src={
                                                                                        (Array.isArray(
                                                                                            product.images
                                                                                        ) &&
                                                                                            product
                                                                                                .images[0]
                                                                                                ?.image_url) ||
                                                                                        "/images/default.png"
                                                                                    }
                                                                                    alt={
                                                                                        product.name
                                                                                    }
                                                                                    className="w-20 h-20 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300"
                                                                                />
                                                                                <div className="absolute inset-0 bg-gradient-to-br from-[#f44032]/0 to-[#f44032]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                                            </div>
                                                                            <div className="flex-1 space-y-1 overflow-hidden">
                                                                                <h6 className="font-bold text-sm text-gray-800 dark:text-white truncate group-hover:text-[#f44032] transition-colors">
                                                                                    {
                                                                                        product.name
                                                                                    }
                                                                                </h6>
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                                                    {product.meta_description ||
                                                                                        "Premium quality product"}
                                                                                </p>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-sm font-bold text-[#f44032]">
                                                                                        {product.pricing_method ===
                                                                                        "roll"
                                                                                            ? `${product.price_per_sqft} LKR/sqft`
                                                                                            : `${product.price} LKR`}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <i className="fa-solid fa-arrow-right-long text-gray-400 dark:text-gray-500 group-hover:text-[#f44032] group-hover:translate-x-1 transition-all duration-300" />
                                                                        </Link>
                                                                    </li>
                                                                )
                                                            )}
                                                    </ul>
                                                ) : (
                                                    <div className="p-8 text-center">
                                                        <i className="fa-solid fa-box-open text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            No products found
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                                    <Link
                                                        href={`/category/${category?.category?.id}`}
                                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f44032] to-[#ff6b5a] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                                                    >
                                                        <span>
                                                            View All{" "}
                                                            {
                                                                category
                                                                    ?.category
                                                                    ?.name
                                                            }
                                                        </span>
                                                        <i className="fa-solid fa-arrow-right" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </nav>
            </div>

            {/* Mobile Drawer */}
            {mobileNavOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
                    <div
                        ref={drawerRef}
                        className="bg-white dark:bg-gray-900 w-[85%] max-w-sm h-full p-6 relative animate-slide-in-right shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                    >
                        <button
                            onClick={() => setMobileNavOpen(false)}
                            className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300"
                            aria-label="Close menu"
                        >
                            <i className="fas fa-times text-2xl" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                Menu
                            </h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] transition-colors"
                                >
                                    <i
                                        className={`fas ${
                                            darkMode ? "fa-sun" : "fa-moon"
                                        }`}
                                    ></i>
                                    <span>
                                        {darkMode ? "Light" : "Dark"} Mode
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setPaletteOpen(true);
                                setMobileNavOpen(false);
                            }}
                            className="w-full flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                            <i className="fa-solid fa-magnifying-glass text-lg" />
                            <span className="font-medium">Search Products</span>
                        </button>

                        <nav className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-280px)] mb-4">
                            {navLoading ? (
                                [...Array(5)].map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="w-full h-12 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse"
                                    />
                                ))
                            ) : navError ? (
                                <span className="text-red-500 dark:text-red-400 text-sm">
                                    {navError}
                                </span>
                            ) : (
                                navCategories.map((category, idx) => (
                                    <div
                                        key={idx}
                                        className="border-b border-gray-200 dark:border-gray-700 pb-2"
                                    >
                                        <button
                                            onClick={() =>
                                                setOpenCategory(
                                                    openCategory === idx
                                                        ? null
                                                        : idx
                                                )
                                            }
                                            className="flex justify-between items-center w-full text-gray-700 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] text-base font-semibold transition-all duration-300 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                                            aria-expanded={openCategory === idx}
                                        >
                                            <span>
                                                {category?.category?.name}
                                            </span>
                                            <i
                                                className={`fas fa-chevron-${
                                                    openCategory === idx
                                                        ? "up"
                                                        : "down"
                                                } text-sm transition-transform duration-300`}
                                            />
                                        </button>

                                        {openCategory === idx &&
                                            Array.isArray(
                                                category?.category?.products
                                            ) && (
                                                <ul className="mt-2 space-y-2 pl-2">
                                                    {category.category.products
                                                        .slice(0, 6)
                                                        .map(
                                                            (product, pIdx) => (
                                                                <li key={pIdx}>
                                                                    <Link
                                                                        href={`/public/${
                                                                            product.id
                                                                        }/products/${product.name
                                                                            .toLowerCase()
                                                                            .replace(
                                                                                /[^a-z0-9]+/g,
                                                                                "-"
                                                                            )}`}
                                                                        onClick={() =>
                                                                            setMobileNavOpen(
                                                                                false
                                                                            )
                                                                        }
                                                                        className="flex gap-3 items-center text-gray-700 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] transition-all duration-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                (Array.isArray(
                                                                                    product.images
                                                                                ) &&
                                                                                    product
                                                                                        .images[0]
                                                                                        ?.image_url) ||
                                                                                "/images/default.png"
                                                                            }
                                                                            alt={
                                                                                product.name
                                                                            }
                                                                            className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                                                        />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium truncate">
                                                                                {
                                                                                    product.name
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                                                {product.meta_description ||
                                                                                    "Premium product"}
                                                                            </p>
                                                                            <span className="text-xs font-semibold text-[#f44032]">
                                                                                {product.pricing_method ===
                                                                                "roll"
                                                                                    ? `${product.price_per_sqft} LKR/sqft`
                                                                                    : `${product.price} LKR`}
                                                                            </span>
                                                                        </div>
                                                                    </Link>
                                                                </li>
                                                            )
                                                        )}
                                                </ul>
                                            )}
                                    </div>
                                ))
                            )}
                        </nav>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                            <Link
                                href={"#"}
                                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                                onClick={() => setMobileNavOpen(false)}
                            >
                                <i className="fa-solid fa-file-pen text-lg" />
                                <span className="font-medium">
                                    Request Quote
                                </span>
                            </Link>
                            <Link
                                href={"#"}
                                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                                onClick={() => setMobileNavOpen(false)}
                            >
                                <div className="relative">
                                    <i className="fa-solid fa-cart-shopping text-lg" />
                                    {count > 0 && (
                                        <span className="absolute -top-2 -left-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                            {count}
                                        </span>
                                    )}
                                </div>
                                <span className="font-medium">View Cart</span>
                            </Link>
                            {!auth?.user ? (
                                <Link
                                    href={route("login")}
                                    className="flex items-center gap-3 bg-[#f44032] hover:bg-[#d63027] text-white p-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                                    onClick={() => setMobileNavOpen(false)}
                                >
                                    <i className="fas fa-user" />
                                    <span>Login</span>
                                </Link>
                            ) : (
                                <Link
                                    href={route("dashboard")}
                                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-[#f44032] dark:hover:text-[#f44032] p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                                    onClick={() => setMobileNavOpen(false)}
                                >
                                    <i className="fas fa-tachometer-alt text-lg" />
                                    <span className="font-medium">
                                        Dashboard
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Command Palette */}
            {paletteOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-20 animate-fade-in"
                >
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setPaletteOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-slide-up">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <i className="fa-solid fa-magnifying-glass text-gray-500 dark:text-gray-400 text-lg" />
                            <input
                                autoFocus
                                type="search"
                                value={q}
                                onChange={onChangeQ}
                                placeholder="Search products, categories…"
                                className="w-full bg-transparent outline-none text-sm py-1 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                aria-label="Search"
                            />
                            <kbd className="hidden md:inline-flex px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                                ESC
                            </kbd>
                        </div>
                        <div className="max-h-96 overflow-auto">
                            {suggestions.length ? (
                                <ul>
                                    {suggestions.map((s, i) => (
                                        <li key={i}>
                                            <Link
                                                href={s.href}
                                                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group border-b border-gray-100 dark:border-gray-800"
                                                onClick={() => {
                                                    setPaletteOpen(false);
                                                    setSuggestions([]);
                                                    setQ("");
                                                    track("palette:select", {
                                                        id: s.id,
                                                        name: s.name,
                                                    });
                                                }}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={
                                                            s.image ||
                                                            "/images/default.png"
                                                        }
                                                        alt=""
                                                        className="w-14 h-14 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[#f44032]/0 to-[#f44032]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#f44032] transition-colors">
                                                        {s.name}
                                                    </p>
                                                    {s.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                                                            {s.description}
                                                        </p>
                                                    )}
                                                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                        {s.type}
                                                    </span>
                                                </div>
                                                <i className="fa-solid fa-arrow-right-long text-gray-400 dark:text-gray-500 group-hover:text-[#f44032] group-hover:translate-x-1 transition-all duration-300" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-5 py-16 text-center">
                                    <i className="fa-solid fa-magnifying-glass text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        {q.trim().length < 2
                                            ? "Type at least 2 characters to search…"
                                            : "No results found"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
