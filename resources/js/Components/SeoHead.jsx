import { Head } from '@inertiajs/react';
import PropTypes from 'prop-types';

const defaultSiteName = import.meta.env.VITE_APP_NAME || 'Laravel';

const toArray = (value) => {
    if (!value && value !== 0) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
};

const normalizedString = (value) => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : undefined;
};

const buildRefreshMeta = (refresh) => {
    if (refresh === undefined || refresh === null) {
        return undefined;
    }

    if (typeof refresh === 'number') {
        return `${refresh}`;
    }

    if (typeof refresh === 'string') {
        return refresh;
    }

    if (typeof refresh === 'object') {
        const seconds = Number.isFinite(refresh.seconds)
            ? refresh.seconds
            : Number.parseInt(refresh.seconds ?? 0, 10) || 0;

        if (refresh.url) {
            return `${seconds};url=${refresh.url}`;
        }

        return `${seconds}`;
    }

    return undefined;
};

const createKey = (tag, fallback, index) => {
    if (tag?.key) {
        return tag.key;
    }

    const identifier =
        tag?.name ??
        tag?.property ??
        tag?.rel ??
        tag?.href ??
        tag?.['http-equiv'] ??
        fallback;

    return `${identifier ?? fallback}-${index}`;
};

// Centralizes SEO metadata, social cards, resource hints, and structured data handling.
const SeoHead = ({
    title,
    titleTemplate,
    siteName,
    description,
    canonicalUrl,
    lang = 'en',
    dir,
    robots = 'index,follow',
    noIndex = false,
    keywords = [],
    authors = [],
    openGraph = {},
    twitter = {},
    alternates = [],
    icons = [],
    links = [],
    preconnect = [],
    preload = [],
    meta = [],
    manifest,
    structuredData,
    themeColor,
    colorScheme,
    facebookAppId,
    generator = 'Inertia.js',
    applicationName,
    referrerPolicy = 'strict-origin-when-cross-origin',
    viewport,
    refresh,
    noTranslate = false,
    children,
}) => {
    const resolvedSiteName = normalizedString(siteName) ?? defaultSiteName;
    const resolvedApplicationName =
        normalizedString(applicationName) ?? resolvedSiteName;

    const explicitTitle = normalizedString(title);
    const ogTitle = normalizedString(openGraph.title);
    const twitterTitle = normalizedString(twitter.title);
    const fallbackTitle = ogTitle ?? twitterTitle ?? resolvedSiteName;

    const template = titleTemplate ?? `%s | ${resolvedSiteName}`;
    const computedTitle = explicitTitle
        ? (template.includes('%s')
              ? template.replace('%s', explicitTitle)
              : `${explicitTitle} | ${resolvedSiteName}`)
        : fallbackTitle;

    const resolvedDescription =
        normalizedString(description) ??
        normalizedString(openGraph.description) ??
        normalizedString(twitter.description);

    const canonical = normalizedString(canonicalUrl) ?? normalizedString(openGraph.url);

    const robotsContent = noIndex ? 'noindex,nofollow' : robots;

    const metaEntries = [
        resolvedDescription && { name: 'description', content: resolvedDescription },
        robotsContent && { name: 'robots', content: robotsContent },
        noIndex && { name: 'googlebot', content: 'noindex,nofollow' },
        keywords?.length > 0 && {
            name: 'keywords',
            content: keywords.map((phrase) => phrase.trim()).filter(Boolean).join(', '),
        },
        generator && { name: 'generator', content: generator },
        resolvedApplicationName && {
            name: 'application-name',
            content: resolvedApplicationName,
        },
        referrerPolicy && { name: 'referrer', content: referrerPolicy },
        colorScheme && { name: 'color-scheme', content: colorScheme },
        noTranslate && { name: 'google', content: 'notranslate' },
        viewport && { name: 'viewport', content: viewport },
    ];

    authors.forEach((author) => {
        if (typeof author === 'string') {
            const value = normalizedString(author);

            if (value) {
                metaEntries.push({ name: 'author', content: value });
            }

            return;
        }

        if (author?.name) {
            metaEntries.push({ name: 'author', content: author.name });
        }
    });

    const ogType = openGraph.type ?? 'website';
    const ogLocale =
        openGraph.locale ??
        (lang ? lang.replace('-', '_') : undefined);

    const ogImages = toArray(openGraph.images).map((image) => {
        if (typeof image === 'string') {
            return { url: image };
        }

        return image;
    });

    const primaryOgImage = ogImages.find((image) => image?.url);

    const ogMeta = [
        { property: 'og:type', content: ogType },
        { property: 'og:site_name', content: openGraph.siteName ?? resolvedSiteName },
        { property: 'og:title', content: explicitTitle ?? ogTitle ?? twitterTitle ?? resolvedSiteName },
        resolvedDescription && { property: 'og:description', content: resolvedDescription },
        canonical && { property: 'og:url', content: canonical },
        ogLocale && { property: 'og:locale', content: ogLocale },
        openGraph.determiner && { property: 'og:determiner', content: openGraph.determiner },
        openGraph.publishedTime && {
            property: 'article:published_time',
            content: openGraph.publishedTime,
        },
        openGraph.modifiedTime && {
            property: 'article:modified_time',
            content: openGraph.modifiedTime,
        },
        openGraph.expirationTime && {
            property: 'article:expiration_time',
            content: openGraph.expirationTime,
        },
        openGraph.section && { property: 'article:section', content: openGraph.section },
    ];

    toArray(openGraph.tags).forEach((tag) => {
        const value = normalizedString(tag);

        if (value) {
            ogMeta.push({ property: 'article:tag', content: value });
        }
    });

    ogImages.forEach((image, index) => {
        if (!image?.url) {
            return;
        }

        ogMeta.push({ property: `og:image`, content: image.url, key: `og-image-${index}` });

        if (image.width) {
            ogMeta.push({
                property: 'og:image:width',
                content: image.width,
                key: `og-image-width-${index}`,
            });
        }

        if (image.height) {
            ogMeta.push({
                property: 'og:image:height',
                content: image.height,
                key: `og-image-height-${index}`,
            });
        }

        if (image.alt) {
            ogMeta.push({
                property: 'og:image:alt',
                content: image.alt,
                key: `og-image-alt-${index}`,
            });
        }

        if (image.type) {
            ogMeta.push({
                property: 'og:image:type',
                content: image.type,
                key: `og-image-type-${index}`,
            });
        }
    });

    if (facebookAppId) {
        ogMeta.push({ property: 'fb:app_id', content: facebookAppId });
    }

    const twitterCard = twitter.card ?? 'summary_large_image';
    const twitterImage =
        twitter.image ?? twitter.imageAlt ?? primaryOgImage?.url;

    const twitterMeta = [
        { name: 'twitter:card', content: twitterCard },
        twitter.site && { name: 'twitter:site', content: twitter.site },
        twitter.creator && { name: 'twitter:creator', content: twitter.creator },
        (explicitTitle ?? twitterTitle ?? ogTitle) && {
            name: 'twitter:title',
            content: explicitTitle ?? twitterTitle ?? ogTitle ?? resolvedSiteName,
        },
        resolvedDescription && {
            name: 'twitter:description',
            content: resolvedDescription,
        },
        twitterImage && { name: 'twitter:image', content: twitterImage },
        twitter.imageAlt && { name: 'twitter:image:alt', content: twitter.imageAlt },
    ];

    const themeColorEntries = [];

    if (Array.isArray(themeColor)) {
        themeColor.forEach((item, index) => {
            if (typeof item === 'string') {
                themeColorEntries.push({
                    name: 'theme-color',
                    content: item,
                    key: `theme-color-${index}`,
                });

                return;
            }

            if (item?.color) {
                themeColorEntries.push({
                    name: 'theme-color',
                    content: item.color,
                    media: item.media,
                    key: `theme-color-${index}`,
                });
            }
        });
    } else if (typeof themeColor === 'string') {
        themeColorEntries.push({ name: 'theme-color', content: themeColor });
    }

    const linkEntries = [
        canonical && { rel: 'canonical', href: canonical },
        manifest && { rel: 'manifest', href: manifest },
    ];

    authors.forEach((author, index) => {
        if (author && typeof author === 'object' && author.url) {
            linkEntries.push({
                rel: 'author',
                href: author.url,
                title: author.name,
                key: `author-link-${index}`,
            });
        }
    });

    toArray(alternates).forEach((alternate, index) => {
        if (!alternate?.href) {
            return;
        }

        linkEntries.push({
            rel: 'alternate',
            href: alternate.href,
            hrefLang: alternate.hrefLang,
            type: alternate.type,
            title: alternate.title,
            key: `alternate-${index}`,
        });
    });

    toArray(icons).forEach((icon, index) => {
        if (!icon?.href) {
            return;
        }

        linkEntries.push({
            rel: icon.rel ?? 'icon',
            href: icon.href,
            sizes: icon.sizes,
            type: icon.type,
            media: icon.media,
            fetchpriority: icon.fetchpriority,
            referrerPolicy: icon.referrerPolicy,
            key: `icon-${index}`,
        });
    });

    toArray(preconnect).forEach((item, index) => {
        if (!item?.href) {
            return;
        }

        linkEntries.push({
            rel: 'preconnect',
            href: item.href,
            crossOrigin: item.crossOrigin,
            key: `preconnect-${index}`,
        });
    });

    toArray(preload).forEach((item, index) => {
        if (!item?.href || !item?.as) {
            return;
        }

        linkEntries.push({
            rel: 'preload',
            href: item.href,
            as: item.as,
            type: item.type,
            crossOrigin: item.crossOrigin,
            media: item.media,
            imagesrcset: item.imageSrcSet,
            imagesizes: item.imageSizes,
            key: `preload-${index}`,
        });
    });

    toArray(links).forEach((item, index) => {
        if (!item?.href && !item?.rel) {
            return;
        }

        linkEntries.push({ ...item, key: item.key ?? `custom-link-${index}` });
    });

    const additionalMeta = toArray(meta);

    const refreshContent = buildRefreshMeta(refresh);

    if (refreshContent) {
        metaEntries.push({
            'http-equiv': 'refresh',
            content: refreshContent,
        });
    }

    const metaElements = [...metaEntries, ...ogMeta, ...twitterMeta, ...themeColorEntries, ...additionalMeta]
        .filter((tag) => Boolean(tag?.content) || Boolean(tag?.charSet))
        .map((tag, index) => {
            const { key, ...rest } = tag;

            return (
                <meta
                    key={createKey(tag, 'meta', index)}
                    {...rest}
                />
            );
        });

    const linkElements = linkEntries
        .filter(Boolean)
        .map((tag, index) => {
            const { key, ...rest } = tag;

            return (
                <link
                    key={createKey(tag, 'link', index)}
                    {...rest}
                />
            );
        });

    const jsonLdItems = toArray(structuredData)
        .filter(Boolean)
        .map((schema, index) => {
            const json = JSON.stringify(schema);

            return (
                <script
                    key={`jsonld-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: json }}
                />
            );
        });

    return (
        <Head title={computedTitle}>
            {lang && (
                <html lang={lang} {...(dir ? { dir } : {})} />
            )}
            {metaElements}
            {linkElements}
            {jsonLdItems}
            {children}
        </Head>
    );
};

SeoHead.propTypes = {
    title: PropTypes.string,
    titleTemplate: PropTypes.string,
    siteName: PropTypes.string,
    description: PropTypes.string,
    canonicalUrl: PropTypes.string,
    lang: PropTypes.string,
    dir: PropTypes.oneOf(['ltr', 'rtl', 'auto']),
    robots: PropTypes.string,
    noIndex: PropTypes.bool,
    keywords: PropTypes.arrayOf(PropTypes.string),
    authors: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                name: PropTypes.string,
                url: PropTypes.string,
            }),
        ]),
    ),
    openGraph: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        url: PropTypes.string,
        type: PropTypes.string,
        siteName: PropTypes.string,
        locale: PropTypes.string,
        determiner: PropTypes.string,
        publishedTime: PropTypes.string,
        modifiedTime: PropTypes.string,
        expirationTime: PropTypes.string,
        section: PropTypes.string,
        tags: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.string),
            PropTypes.string,
        ]),
        images: PropTypes.oneOfType([
            PropTypes.arrayOf(
                PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.shape({
                        url: PropTypes.string.isRequired,
                        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                        alt: PropTypes.string,
                        type: PropTypes.string,
                    }),
                ]),
            ),
            PropTypes.string,
        ]),
    }),
    twitter: PropTypes.shape({
        card: PropTypes.string,
        site: PropTypes.string,
        creator: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.string,
        imageAlt: PropTypes.string,
    }),
    alternates: PropTypes.arrayOf(
        PropTypes.shape({
            href: PropTypes.string.isRequired,
            hrefLang: PropTypes.string,
            title: PropTypes.string,
            type: PropTypes.string,
        }),
    ),
    icons: PropTypes.arrayOf(
        PropTypes.shape({
            rel: PropTypes.string,
            href: PropTypes.string.isRequired,
            sizes: PropTypes.string,
            type: PropTypes.string,
            media: PropTypes.string,
            fetchpriority: PropTypes.string,
            referrerPolicy: PropTypes.string,
        }),
    ),
    links: PropTypes.arrayOf(PropTypes.object),
    preconnect: PropTypes.arrayOf(
        PropTypes.shape({
            href: PropTypes.string.isRequired,
            crossOrigin: PropTypes.string,
        }),
    ),
    preload: PropTypes.arrayOf(
        PropTypes.shape({
            href: PropTypes.string.isRequired,
            as: PropTypes.string.isRequired,
            type: PropTypes.string,
            crossOrigin: PropTypes.string,
            media: PropTypes.string,
            imageSrcSet: PropTypes.string,
            imageSizes: PropTypes.string,
        }),
    ),
    meta: PropTypes.arrayOf(PropTypes.object),
    manifest: PropTypes.string,
    structuredData: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.arrayOf(PropTypes.object),
    ]),
    themeColor: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.shape({
                    color: PropTypes.string.isRequired,
                    media: PropTypes.string,
                }),
            ]),
        ),
    ]),
    colorScheme: PropTypes.string,
    facebookAppId: PropTypes.string,
    generator: PropTypes.string,
    applicationName: PropTypes.string,
    referrerPolicy: PropTypes.string,
    viewport: PropTypes.string,
    refresh: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.shape({
            seconds: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            url: PropTypes.string,
        }),
    ]),
    noTranslate: PropTypes.bool,
    children: PropTypes.node,
};

export default SeoHead;


// // // // //////
// Use this component as like this

// import SeoHead from '@/Components/SeoHead';

// <SeoHead
//   title="Dashboard"
//   description="Manage orders, inventory, and customer activity."
//   canonicalUrl="https://printair.example.com/dashboard"
//   keywords={['print on demand', 'orders', 'analytics']}
//   openGraph={{
//     type: 'website',
//     images: [
//       {
//         url: 'https://cdn.printair.example.com/og/dashboard-hero.jpg',
//         width: 1200,
//         height: 630,
//         alt: 'Dashboard overview',
//       },
//     ],
//   }}
//   twitter={{
//     site: '@printair',
//     creator: '@printair',
//   }}
//   structuredData={{
//     '@context': 'https://schema.org',
//     '@type': 'WebPage',
//     name: 'Dashboard',
//     url: 'https://printair.example.com/dashboard',
//   }}
// />
