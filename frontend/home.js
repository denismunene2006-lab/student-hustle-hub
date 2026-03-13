document.addEventListener('DOMContentLoaded', () => {
    const servicesGrid = document.getElementById('services-grid');
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const clearBtn = document.getElementById('clear-filters');
    const resultCount = document.getElementById('result-count');
    const listingFilterButtons = Array.from(document.querySelectorAll('[data-listing-filter]'));
    let activeListingFilter = 'all';

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // Security: Escape HTML to prevent XSS attacks
    const escapeHtml = (unsafe) => {
        return String(unsafe ?? '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Performance: Debounce search input
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const STUDENT_THEMES = [
        { from: '#0F766E', to: '#14B8A6', rgb: '15,118,110' },
        { from: '#B45309', to: '#F59E0B', rgb: '180,83,9' },
        { from: '#0369A1', to: '#38BDF8', rgb: '3,105,161' },
        { from: '#7C3AED', to: '#C084FC', rgb: '124,58,237' },
        { from: '#BE123C', to: '#FB7185', rgb: '190,18,60' },
        { from: '#1D4ED8', to: '#60A5FA', rgb: '29,78,216' },
        { from: '#166534', to: '#4ADE80', rgb: '22,101,52' },
    ];

    const hashKey = (value) => {
        let hash = 0;
        const text = String(value ?? '');
        for (let i = 0; i < text.length; i += 1) {
            hash = ((hash << 5) - hash) + text.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    const getStudentTheme = (service) => {
        const key = service?.user?._id || service?.user?.email || service?.user?.name || service?._id || 'default';
        return STUDENT_THEMES[hashKey(key) % STUDENT_THEMES.length];
    };

    const renderServiceCard = (service) => {
        const theme = getStudentTheme(service);
        const cardStyle = `--accent-1:${theme.from}; --accent-2:${theme.to}; --accent-rgb:${theme.rgb};`;
        const listingType = service?.listingType === 'buyer' ? 'buyer' : 'seller';
        const provider = service?.user ?? {};
        const rawProviderName = provider.name ?? 'Student';
        const providerName = escapeHtml(rawProviderName);
        const providerUniversity = escapeHtml(provider.university ?? 'Campus');
        const providerImage = escapeHtml(provider.image ?? `https://i.pravatar.cc/150?u=${encodeURIComponent(provider.email ?? providerName)}`);
        const contactInfo = escapeHtml(String(service?.contactInfo ?? '').trim());
        const providerId = String(provider._id ?? '');
        const ratingSummary = window.SHHub?.getRatingSummaryForUser?.(providerId) ?? { average: 0, count: 0 };
        const ratingText = ratingSummary.count > 0
            ? `★ ${ratingSummary.average.toFixed(1)} (${ratingSummary.count})`
            : 'No reviews yet';
        const modeLabel = listingType === 'buyer' ? 'Buyer Request' : 'Seller Offer';
        const modeClasses = listingType === 'buyer'
            ? 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:bg-amber-400/15 dark:text-amber-200'
            : 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:bg-emerald-400/15 dark:text-emerald-200';
        const amountLabel = listingType === 'buyer' ? 'Budget' : 'Price';
        const amountValue = window.SHHub?.formatKES?.(service.price) ?? `KES ${Number(service.price ?? 0).toLocaleString('en-KE')}`;
        const whatsappText = listingType === 'buyer'
            ? `Hi ${rawProviderName}, I can help with your request: ${service.title}`
            : `Hi ${rawProviderName}, I'm interested in your service: ${service.title}`;
        const actionText = listingType === 'buyer' ? 'Offer Help' : 'Chat';
        const isFav = window.SHHub?.isFavorite?.(service._id);
        const favClass = isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500';

        return `
        <article class="service-card card-hover group rounded-2xl p-6" style="${cardStyle}">
            <div class="flex items-start justify-between gap-3">
                <a href="profile.html?id=${providerId}" class="flex items-center gap-3 min-w-0 group/profile">
                    <img src="${providerImage}" alt="${providerName}" class="service-avatar h-10 w-10 rounded-full" loading="lazy" decoding="async" width="40" height="40">
                    <div class="min-w-0">
                        <p class="truncate text-sm font-semibold text-slate-900 dark:text-white group-hover/profile:text-primary dark:group-hover/profile:text-secondary">${providerName}</p>
                        <p class="truncate text-xs text-slate-500 dark:text-slate-400">${providerUniversity}</p>
                        <p class="truncate text-xs font-medium text-amber-600 dark:text-amber-300">${ratingText}</p>
                    </div>
                </a>
                <div class="flex flex-col items-end gap-1">
                    <span class="${modeClasses} shrink-0 rounded-full px-3 py-1 text-xs font-semibold">${modeLabel}</span>
                    <span class="service-pill shrink-0 rounded-full px-3 py-1 text-xs font-semibold">${escapeHtml(service.category)}</span>
                </div>

            </div>

            <h3 class="mt-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">${escapeHtml(service.title)}</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">${escapeHtml(service.description)}</p>

            <div class="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/50 pt-4 dark:border-slate-700/50">
                <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${amountLabel}</p>
                    <p class="text-lg font-semibold text-secondary">${amountValue}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" data-action="toggle-fav" data-id="${service._id}" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-slate-700/60 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950/60" title="Save to favorites">
                        <i data-lucide="heart" class="h-4 w-4 ${favClass} transition-colors"></i>
                    </button>
                    <a href="https://wa.me/${contactInfo}?text=${encodeURIComponent(whatsappText)}" target="_blank" class="inline-flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20" title="Chat on WhatsApp">
                        <i data-lucide="message-circle" class="h-4 w-4"></i>
                        ${actionText}
                    </a>
                    <a href="service.html?id=${service._id}" class="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-95">
                        View
                        <i data-lucide="arrow-right" class="h-4 w-4"></i>
                    </a>
                </div>
            </div>
        </article>
        `;
    };

    const updateUrlWithFilters = () => {
        const params = new URLSearchParams();
        const keyword = searchInput?.value.trim() ?? '';
        const category = categorySelect?.value ?? '';

        if (keyword) params.set('q', keyword);
        if (category) params.set('category', category);
        if (activeListingFilter !== 'all') params.set('type', activeListingFilter);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        // Use replaceState to avoid polluting browser history on every keystroke
        window.history.replaceState({ path: newUrl }, '', newUrl);
    };

    async function fetchServices() {
        const keyword = searchInput?.value.trim().toLowerCase() ?? '';
        const category = categorySelect?.value ?? '';

        // Modern Skeleton Loading
        const skeletonCard = `
            <div class="glass rounded-2xl p-6 animate-pulse">
                <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
                        <div class="h-2 w-16 rounded bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                </div>
                <div class="mt-4 space-y-2">
                    <div class="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
                    <div class="h-3 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div class="mt-5 border-t border-slate-200/50 pt-4 dark:border-slate-700/50 h-8 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>
        `;
        servicesGrid.innerHTML = Array(6).fill(skeletonCard).join('');
        // await sleep(50); // Removed artificial delay for faster local loading
        updateUrlWithFilters();

        let services = [];
        if (window.SHHub?.isApiMode?.() && window.SHHub?.apiGetServices) {
            try {
                services = await window.SHHub.apiGetServices({
                    keyword,
                    category,
                    listingType: activeListingFilter === 'all' ? '' : activeListingFilter,
                });
            } catch (error) {
                // Log the actual error to the console for debugging
                console.error("Failed to fetch services from API:", error);
                services = []; // On error, show no services
                window.SHHub?.showToast?.('Could not connect to the server.', 'error');
            }
        } else {
            services = []; // If not in API mode, show no services
            window.SHHub?.showToast?.('API not configured. Go to settings.', 'error');
        }

        services = Array.isArray(services) ? services : [];

        if (resultCount) {
            resultCount.innerText = `${services.length} result${services.length === 1 ? '' : 's'}`;
        }

        if (services.length === 0) {
            const isFiltering = keyword || category || activeListingFilter !== 'all';
            const emptyStateHtml = isFiltering
                ? `
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-600 dark:bg-white/10 dark:text-slate-200">
                        <i data-lucide="search-x" class="h-5 w-5"></i>
                    </div>
                    <p class="mt-4 font-medium">No services found</p>
                    <p class="mt-1 text-slate-500 dark:text-slate-400">Try a different keyword or category.</p>
                `
                : `
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
                        <i data-lucide="sparkles" class="h-5 w-5"></i>
                    </div>
                    <p class="mt-4 font-medium">The marketplace is ready!</p>
                    <p class="mt-1 text-slate-500 dark:text-slate-400">Be the first to post a service and get started.</p>
                    <a href="create-service.html" class="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-95">
                        <i data-lucide="plus-circle" class="h-4 w-4"></i>
                        Post a service
                    </a>
                `;
            servicesGrid.innerHTML = `
                <div class="glass rounded-2xl p-10 text-center text-sm text-slate-600 dark:text-slate-300 md:col-span-2 lg:col-span-3">${emptyStateHtml}</div>
            `;
            window.SHHub?.refreshIcons?.();
            return;
        }

        servicesGrid.innerHTML = services.map(renderServiceCard).join('');
        
        window.SHHub?.refreshIcons?.();
    }

    const updateListingFilterUI = (filterValue) => {
        activeListingFilter = filterValue;
        listingFilterButtons.forEach((button) => {
            const buttonFilter = button.getAttribute('data-listing-filter');
            const isActive = buttonFilter === filterValue;
            button.classList.toggle('bg-primary', isActive);
            button.classList.toggle('text-white', isActive);
            button.classList.toggle('border-primary', isActive);
            button.classList.toggle('bg-white', !isActive);
            button.classList.toggle('text-slate-700', !isActive);
        });
    };

    const applyFiltersFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        if (searchInput) searchInput.value = params.get('q') || '';
        if (categorySelect) categorySelect.value = params.get('category') || '';
        const listingType = params.get('type') || 'all';
        updateListingFilterUI(listingType);
    };

    const init = () => {
        applyFiltersFromUrl();
        fetchServices();

        searchInput?.addEventListener('input', debounce(fetchServices, 300));
        categorySelect?.addEventListener('change', fetchServices);
        listingFilterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-listing-filter') || 'all';
                updateListingFilterUI(filter);
                fetchServices();
            });
        });
        clearBtn?.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (categorySelect) categorySelect.value = '';
            updateListingFilterUI('all');
            fetchServices();
        });
        window.addEventListener('popstate', () => {
            applyFiltersFromUrl();
            fetchServices();
        });

        servicesGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="toggle-fav"]');
            if (!btn) return;
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const added = window.SHHub?.toggleFavorite?.(id);
            
            const icon = btn.querySelector('i');
            if (added) {
                icon.classList.add('fill-rose-500', 'text-rose-500');
                icon.classList.remove('text-slate-400');
                window.SHHub?.showToast?.('Saved to favorites', 'success');
            } else {
                icon.classList.remove('fill-rose-500', 'text-rose-500');
                icon.classList.add('text-slate-400');
                window.SHHub?.showToast?.('Removed from favorites');
            }
        });
    };

    init();
});
