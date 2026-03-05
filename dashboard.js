document.addEventListener('DOMContentLoaded', async () => {
  const isApiMode = window.SHHub?.isApiMode?.() === true;
  let currentUser = window.SHHub?.getUser?.();
  const isNetworkError = (error) => {
    const message = String(error?.message ?? '').toLowerCase();
    return message.includes('failed to fetch') || message.includes('networkerror') || message.includes('network request failed');
  };

  if (isApiMode && window.SHHub?.apiGetProfile) {
    try {
      currentUser = await window.SHHub.apiGetProfile();
    } catch (error) {
      if (!isNetworkError(error) || !currentUser) {
        alert(error?.message || 'Please login again.');
        window.SHHub?.logout?.('login.html');
        return;
      }
    }
  }

  if (!currentUser) return;

  const getElement = (id) => document.getElementById(id);

  const nameEl = getElement('user-name');
  const metaEl = getElement('user-meta');
  const whatsappEl = getElement('user-whatsapp');
  const modeEl = getElement('user-mode');
  const uniEl = getElement('user-uni');
  const profileImg = getElement('profile-img');
  const upload = getElement('profile-upload');
  const modeSellerBtn = getElement('mode-seller-btn');
  const modeBuyerBtn = getElement('mode-buyer-btn');

  const profileModal = getElement('profile-modal');
  const profileForm = getElement('profile-form');
  const serviceModal = getElement('service-modal');
  const serviceForm = getElement('service-form');
  const servicesGrid = getElement('my-services-grid');

  let myServicesCache = [];

  const getMarketMode = (user) => (user?.marketMode === 'buyer' ? 'buyer' : 'seller');

  const formatKES = (value) => {
    if (window.SHHub?.formatKES) return window.SHHub.formatKES(value);
    const amount = Number(value ?? 0);
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    return `KES ${safeAmount.toLocaleString('en-KE')}`;
  };

  const updateProfileData = async (updates) => {
    if (isApiMode && window.SHHub?.apiUpdateProfile) {
      try {
        return await window.SHHub.apiUpdateProfile(updates);
      } catch (error) {
        if (!isNetworkError(error)) throw error;
      }
    }
    return window.SHHub?.updateProfile?.(updates);
  };

  const fetchMyServices = async () => {
    if (isApiMode && window.SHHub?.apiGetMyServices) {
      try {
        return await window.SHHub.apiGetMyServices();
      } catch (error) {
        if (!isNetworkError(error)) throw error;
      }
    }
    return window.SHHub?.getMyServices?.() ?? [];
  };

  const saveServiceData = async (serviceId, updates) => {
    if (isApiMode && window.SHHub?.apiUpdateService) {
      try {
        return await window.SHHub.apiUpdateService(serviceId, updates);
      } catch (error) {
        if (!isNetworkError(error)) throw error;
      }
    }
    return window.SHHub?.updateService?.(serviceId, updates);
  };

  const removeServiceData = async (serviceId) => {
    if (isApiMode && window.SHHub?.apiDeleteService) {
      try {
        return await window.SHHub.apiDeleteService(serviceId);
      } catch (error) {
        if (!isNetworkError(error)) throw error;
      }
    }
    return window.SHHub?.deleteService?.(serviceId);
  };

  const applyModeButtons = (mode) => {
    const setButtonState = (button, active) => {
      if (!button) return;
      button.classList.toggle('bg-primary', active);
      button.classList.toggle('text-white', active);
      button.classList.toggle('border-primary', active);
      button.classList.toggle('bg-white', !active);
      button.classList.toggle('text-slate-700', !active);
    };
    setButtonState(modeSellerBtn, mode === 'seller');
    setButtonState(modeBuyerBtn, mode === 'buyer');
  };

  const applyUserUI = (user) => {
    nameEl.innerText = user.name ?? 'Student';
    metaEl.innerText = `${user.email ?? ''}${user.course ? ` | ${user.course}` : ''}`;
    whatsappEl.innerText = user.whatsappNumber ? `WhatsApp: ${user.whatsappNumber}` : 'WhatsApp: not set';
    const marketMode = getMarketMode(user);
    modeEl.innerText = marketMode === 'buyer' ? 'Current mode: Buyer' : 'Current mode: Seller';
    applyModeButtons(marketMode);
    uniEl.innerText = user.university ?? '-';
    profileImg.src = user.image || profileImg.src;
  };

  const openModal = (modal) => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    window.SHHub?.refreshIcons?.();
  };

  const closeModal = (modal) => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  const openProfileModal = () => {
    getElement('profile-name').value = currentUser?.name ?? '';
    getElement('profile-email').value = currentUser?.email ?? '';
    getElement('profile-university').value = currentUser?.university ?? '';
    getElement('profile-course').value = currentUser?.course ?? '';
    getElement('profile-market-mode').value = getMarketMode(currentUser);
    getElement('profile-whatsapp').value = currentUser?.whatsappNumber ?? '';
    getElement('profile-bio').value = currentUser?.bio ?? '';
    openModal(profileModal);
  };

  const openServiceModal = (service) => {
    getElement('service-id').value = service._id ?? '';
    getElement('service-listing-type').value = service.listingType === 'buyer' ? 'buyer' : 'seller';
    getElement('service-title').value = service.title ?? '';
    getElement('service-category').value = service.category ?? 'Tutoring';
    getElement('service-price').value = Number(service.price ?? 0);
    getElement('service-contact').value = service.contactInfo ?? '';
    getElement('service-description').value = service.description ?? '';
    openModal(serviceModal);
  };

  const renderStatsAndHistory = () => {
    const historyRows = [
      { title: 'Calculus Tutoring', client: 'John Doe', date: '2026-02-18', price: 2500, status: 'Completed' },
      { title: 'Logo Design', client: 'Alice Smith', date: '2026-02-12', price: 5000, status: 'Completed' },
      { title: 'Python Script', client: 'Bob Johnson', date: '2026-02-05', price: 3000, status: 'Completed' },
      { title: 'Research Paper Edit', client: 'Sarah Lee', date: '2026-01-28', price: 2500, status: 'Completed' },
    ];

    const completedCount = historyRows.length;
    const totalEarnings = historyRows.reduce((sum, row) => sum + Number(row.price ?? 0), 0);
    getElement('total-completed').innerText = String(completedCount);
    getElement('total-earnings').innerText = formatKES(totalEarnings);

    const historyBody = getElement('history-table-body');
    historyBody.innerHTML = historyRows
      .map(
        (row) => `
      <tr>
        <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">${row.title}</td>
        <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${row.client}</td>
        <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${row.date}</td>
        <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${formatKES(row.price)}</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30">
            ${row.status}
          </span>
        </td>
      </tr>
    `
      )
      .join('');
  };

  const renderMyServices = async () => {
    try {
      myServicesCache = await fetchMyServices();
    } catch (error) {
      myServicesCache = [];
      alert(error?.message || 'Failed to load your services.');
    }

    getElement('stat-services').innerText = String(myServicesCache.length);

    if (myServicesCache.length === 0) {
      servicesGrid.innerHTML = `
        <div class="glass rounded-2xl p-10 text-center text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-600 dark:bg-white/10 dark:text-slate-200">
            <i data-lucide="inbox" class="h-5 w-5"></i>
          </div>
          <p class="mt-4 font-medium">No services yet</p>
          <p class="mt-1 text-slate-500 dark:text-slate-400">Post your first service to appear on the browse page.</p>
          <a href="create-service.html" class="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-95">
            <i data-lucide="plus-circle" class="h-4 w-4"></i>
            Post a service
          </a>
        </div>
      `;
      window.SHHub?.refreshIcons?.();
      return;
    }

    servicesGrid.innerHTML = myServicesCache
      .map(
        (service) => `
      <article class="glass card-hover rounded-2xl border border-slate-200/60 p-6 shadow-sm dark:border-slate-700/60">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-1.5">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">${service.category}</p>
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${service.listingType === 'buyer' ? 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:bg-amber-400/15 dark:text-amber-200' : 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:bg-emerald-400/15 dark:text-emerald-200'}">${service.listingType === 'buyer' ? 'Buyer' : 'Seller'}</span>
            </div>
            <h3 class="mt-1 truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">${service.title}</h3>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${formatKES(service.price)}</p>
            <p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">Contact: ${service.contactInfo}</p>
          </div>
          <span class="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-200">
            ${new Date(service.createdAt ?? Date.now()).toLocaleDateString()}
          </span>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200/50 pt-4 dark:border-slate-700/50">
          <a href="service.html?id=${service._id}" class="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-slate-700/60 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950/60">
            <i data-lucide="external-link" class="h-4 w-4"></i>
            View
          </a>
          <button type="button" data-action="edit-service" data-id="${service._id}" class="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/15">
            <i data-lucide="pencil" class="h-4 w-4"></i>
            Edit
          </button>
          <button type="button" data-action="delete-service" data-id="${service._id}" class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-600/10 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-300/10 dark:hover:text-rose-200">
            <i data-lucide="trash-2" class="h-4 w-4"></i>
            Delete
          </button>
        </div>
      </article>
    `
      )
      .join('');

    window.SHHub?.refreshIcons?.();
  };

  getElement('open-profile-modal')?.addEventListener('click', openProfileModal);
  modeSellerBtn?.addEventListener('click', async () => {
    try {
      currentUser = (await updateProfileData({ marketMode: 'seller' })) ?? currentUser;
      applyUserUI(currentUser);
    } catch (error) {
      alert(error?.message || 'Failed to switch mode.');
    }
  });
  modeBuyerBtn?.addEventListener('click', async () => {
    try {
      currentUser = (await updateProfileData({ marketMode: 'buyer' })) ?? currentUser;
      applyUserUI(currentUser);
    } catch (error) {
      alert(error?.message || 'Failed to switch mode.');
    }
  });

  profileModal?.querySelectorAll('[data-close-profile]')?.forEach((button) => {
    button.addEventListener('click', () => closeModal(profileModal));
  });

  serviceModal?.querySelectorAll('[data-close-service]')?.forEach((button) => {
    button.addEventListener('click', () => closeModal(serviceModal));
  });

  profileModal?.addEventListener('click', (event) => {
    if (event.target === profileModal) closeModal(profileModal);
  });

  serviceModal?.addEventListener('click', (event) => {
    if (event.target === serviceModal) closeModal(serviceModal);
  });

  profileForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      currentUser =
        (await updateProfileData({
          name: getElement('profile-name').value,
          email: getElement('profile-email').value,
          university: getElement('profile-university').value,
          course: getElement('profile-course').value,
          marketMode: getElement('profile-market-mode').value,
          whatsappNumber: getElement('profile-whatsapp').value,
          bio: getElement('profile-bio').value,
        })) ?? currentUser;
      applyUserUI(currentUser);
      closeModal(profileModal);
      await renderMyServices();
    } catch (error) {
      alert(error?.message || 'Failed to update profile.');
    }
  });

  serviceForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const serviceId = getElement('service-id').value;
    try {
      await saveServiceData(serviceId, {
        listingType: getElement('service-listing-type').value,
        title: getElement('service-title').value,
        category: getElement('service-category').value,
        price: getElement('service-price').value,
        contactInfo: getElement('service-contact').value,
        description: getElement('service-description').value,
      });
      closeModal(serviceModal);
      await renderMyServices();
    } catch (error) {
      alert(error?.message || 'Failed to update service.');
    }
  });

  upload?.addEventListener('change', () => {
    const file = upload.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const nextImage = String(event.target?.result ?? '');
      if (!nextImage) return;
      try {
        currentUser = (await updateProfileData({ image: nextImage })) ?? currentUser;
        applyUserUI(currentUser);
      } catch (error) {
        alert(error?.message || 'Failed to update profile image.');
      }
    };
    reader.readAsDataURL(file);
  });

  servicesGrid?.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest?.('[data-action="delete-service"]');
    if (deleteButton) {
      const id = deleteButton.getAttribute('data-id');
      if (!id) return;
      if (!confirm('Delete this service?')) return;
      try {
        await removeServiceData(id);
        await renderMyServices();
      } catch (error) {
        alert(error?.message || 'Failed to delete service.');
      }
      return;
    }

    const editButton = event.target.closest?.('[data-action="edit-service"]');
    if (!editButton) return;
    const id = editButton.getAttribute('data-id');
    if (!id) return;
    const service = myServicesCache.find((item) => item._id === id);
    if (!service) return;
    openServiceModal(service);
  });

  applyUserUI(currentUser);
  renderStatsAndHistory();
  await renderMyServices();
  window.SHHub?.refreshIcons?.();
});
