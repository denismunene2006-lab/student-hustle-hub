(function (global) {
    const SITE_URL = 'https://student-hustle-hub.vercel.app';
    const SITE_NAME = 'Student Hustle Hub';
    const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/favicons/favicon.ico`;

    function upsertMeta(by, key, value) {
        if (value == null || value === '') return;
        let el = document.head.querySelector(`meta[${by}="${key}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(by, key);
            document.head.appendChild(el);
        }
        el.setAttribute('content', value);
    }

    function upsertLink(rel, href) {
        if (!href) return;
        let el = document.head.querySelector(`link[rel="${rel}"]`);
        if (!el) {
            el = document.createElement('link');
            el.setAttribute('rel', rel);
            document.head.appendChild(el);
        }
        el.setAttribute('href', href);
    }

    function truncate(text, max = 160) {
        const normalized = String(text ?? '').trim().replace(/\s+/g, ' ');
        if (normalized.length <= max) return normalized;
        return `${normalized.slice(0, max - 1).trimEnd()}…`;
    }

    function resolveUrl(path) {
        if (!path) return SITE_URL;
        if (/^https?:\/\//i.test(path)) return path;
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${SITE_URL}${normalizedPath}`;
    }

    function setPageMeta(options = {}) {
        const {
            title,
            description,
            path = '',
            image = DEFAULT_OG_IMAGE,
            type = 'website',
            robots = 'index, follow',
            keywords,
        } = options;

        const pageUrl = resolveUrl(path);
        const canonicalUrl = pageUrl.split('?')[0];

        if (title) document.title = title;
        if (description) {
            upsertMeta('name', 'description', description);
            upsertMeta('property', 'og:description', description);
            upsertMeta('name', 'twitter:description', description);
        }
        if (title) {
            upsertMeta('property', 'og:title', title);
            upsertMeta('name', 'twitter:title', title);
        }

        upsertMeta('property', 'og:url', pageUrl);
        upsertMeta('property', 'og:type', type);
        upsertMeta('property', 'og:site_name', SITE_NAME);
        upsertMeta('property', 'og:locale', 'en_KE');
        upsertMeta('property', 'og:image', image);
        upsertMeta('name', 'twitter:card', 'summary');
        upsertMeta('name', 'twitter:image', image);
        if (keywords) upsertMeta('name', 'keywords', keywords);
        if (robots) upsertMeta('name', 'robots', robots);
        upsertLink('canonical', canonicalUrl);
    }

    global.SHHubSEO = {
        SITE_URL,
        SITE_NAME,
        DEFAULT_OG_IMAGE,
        setPageMeta,
        truncate,
    };
})(window);
