document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    const getElement = (id) => document.getElementById(id);
    const querySelector = (selector) => document.querySelector(selector);
    const querySelectorAll = (selector) => document.querySelectorAll(selector);

    const notFoundEl = getElement('not-found');
    const contentEl = getElement('content');

    const isApiMode = window.SHHub?.isApiMode?.() === true;

    let userServices = [];
    let userReviews = [];
    let user = null;

    if (isApiMode && userId) {
        try {
            // Fetch user profile, services, and reviews in parallel for performance.
            // Using allSettled makes the page resilient if one of the calls fails.
            const [userResult, servicesResult, reviewsResult] = await Promise.allSettled([
                window.SHHub.apiGetUserById(userId),
                window.SHHub.apiGetServices({ userId }),
                window.SHHub.apiGetReviewsForUser(userId)
            ]);

            if (userResult.status === 'fulfilled') {
                user = userResult.value;
            } else {
                // If we can't get the user profile, we cannot render the page.
                throw userResult.reason;
            }

            if (servicesResult.status === 'fulfilled') {
                userServices = servicesResult.value;
            } else {
                console.error("Failed to fetch user services:", servicesResult.reason);
            }

            if (reviewsResult.status === 'fulfilled') {
                userReviews = reviewsResult.value;
            } else {
                console.error("Failed to fetch user reviews:", reviewsResult.reason);
            }
        } catch (error) {
            console.error("Failed to load profile data from API:", error);
            notFoundEl.innerHTML = `<p>Could not load profile. The server might be down or the user does not exist.</p>`;
        }
    } else if (userId) {
        // Fallback to local data if not in API mode
        user = window.SHHub.getUserByIdLocal(userId);
        userServices = (window.SHHub.getAllServices() ?? []).filter(s => s.user?._id === userId);
        userReviews = window.SHHub.getReviewsForUser(userId) ?? [];
    }

    if (!user) {
        notFoundEl.classList.remove('hidden');
        window.SHHub?.refreshIcons?.();
        return;
    }

    contentEl.classList.remove('hidden');

    // Render Profile Info
    getElement('profile-img').src = user.image || `https://i.pravatar.cc/150?u=${encodeURIComponent(user.email)}`;
    getElement('user-name').innerText = user.name;
    querySelectorAll('.provider-name-placeholder').forEach(el => el.innerText = user.name.split(' ')[0]);
    getElement('user-uni').innerText = user.university;
    getElement('user-bio').innerText = user.bio || 'No bio provided.';

    const contactInfo = user.whatsappNumber || 'No public contact.';
    const contactEl = getElement('user-contact');
    contactEl.innerText = contactInfo;
    if (user.whatsappNumber && window.SHHub?.createCopyButton) {
        const copyBtn = window.SHHub.createCopyButton(user.whatsappNumber, { toastMessage: 'Contact info copied!' });
        contactEl.insertAdjacentElement('afterend', copyBtn);
    }

    const ratingSummary = window.SHHub?.getRatingSummaryForUser?.(userId) ?? { average: 0, count: 0 };
    getElement('user-rating').innerText = ratingSummary.count > 0
        ? `★ ${ratingSummary.average.toFixed(1)} (${ratingSummary.count} reviews)`
        : 'No reviews yet';

    // Render Services
    const servicesListEl = getElement('services-list');

    if (userServices.length === 0) {
        servicesListEl.innerHTML = `<div class="rounded-xl border border-slate-200/70 bg-white/60 p-4 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-950/40 dark:text-slate-300">This student has no active services.</div>`;
    } else {
        servicesListEl.innerHTML = userServices.map(service => {
            const listingType = service.listingType === 'buyer' ? 'Buyer Request' : 'Seller Offer';
            const typeClass = service.listingType === 'buyer'
                ? 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:bg-amber-400/15 dark:text-amber-200'
                : 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:bg-emerald-400/15 dark:text-emerald-200';
            const price = window.SHHub?.formatKES?.(service.price) ?? `KES ${service.price}`;

            return `
                <a href="service.html?id=${service._id}" class="block rounded-xl border border-slate-200/70 bg-white/60 p-4 transition hover:border-primary/40 hover:bg-white dark:border-slate-700/60 dark:bg-slate-950/40 dark:hover:border-primary/50 dark:hover:bg-slate-950/60">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">${service.title}</p>
                            <p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">${service.category} • ${price}</p>
                        </div>
                        <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${typeClass}">${listingType}</span>
                    </div>
                </a>
            `;
        }).join('');
    }

    // Render Reviews
    const reviewsListEl = getElement('reviews-list');

    if (userReviews.length === 0) {
        reviewsListEl.innerHTML = `<div class="rounded-xl border border-slate-200/70 bg-white/60 p-4 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-950/40 dark:text-slate-300">No reviews yet.</div>`;
    } else {
        reviewsListEl.innerHTML = userReviews.map(review => {
            const reviewerName = review?.reviewerName ?? 'Student';
            const rating = Math.max(1, Math.min(5, Math.round(Number(review?.rating ?? 0))));
            const stars = '★'.repeat(rating);
            const createdAt = review?.createdAt ? new Date(review.createdAt).toLocaleDateString() : '';

            return `
                <article class="rounded-xl border border-slate-200/70 bg-white/60 p-4 dark:border-slate-700/60 dark:bg-slate-950/40">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-semibold text-slate-900 dark:text-white">${reviewerName}</p>
                            <p class="text-xs font-medium text-amber-600 dark:text-amber-300">${stars} (${rating}/5)</p>
                        </div>
                        <span class="text-xs text-slate-500 dark:text-slate-400">${createdAt}</span>
                    </div>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${String(review?.comment ?? '').trim()}</p>
                </article>
            `;
        }).join('');
    }

    window.SHHub?.refreshIcons?.();
});