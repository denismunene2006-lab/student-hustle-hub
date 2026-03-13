document.addEventListener('DOMContentLoaded', async () => {
  const isApiMode = window.SHHub?.isApiMode?.() === true;
  let currentUser = window.SHHub?.getUser?.();
  const isNetworkError = (error) => {
    const message = String(error?.message ?? '').toLowerCase();
    return message.includes('failed to fetch')
      || message.includes('networkerror')
      || message.includes('network request failed')
      || message.includes('request timeout')
      || message.includes('aborterror');
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(String(event.target?.result ?? ''));
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });

  const loadImageFromFile = (file) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });

  const optimizeProfileImage = async (file) => {
    const MAX_DIMENSION = 512;
    const LARGE_FILE_BYTES = 300 * 1024;
    const JPEG_QUALITY = 0.8;

    if (!file || !file.type?.startsWith('image/')) {
      throw new Error('Please select a valid image file.');
    }

    const image = await loadImageFromFile(file);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) {
      return await readFileAsDataUrl(file);
    }

    const maxSide = Math.max(width, height);
    const scale = Math.min(1, MAX_DIMENSION / maxSide);
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const shouldResize = scale < 1;
    const shouldReencode = shouldResize || file.size > LARGE_FILE_BYTES;

    if (!shouldReencode) {
      return await readFileAsDataUrl(file);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return await readFileAsDataUrl(file);
    }

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    return canvas.toDataURL(outputType, outputType === 'image/jpeg' ? JPEG_QUALITY : undefined);
  };

  if (isApiMode && window.SHHub?.apiGetProfile) {
    try {
      currentUser = await window.SHHub.apiGetProfile();
    } catch (error) {
      if (!isNetworkError(error) || !currentUser) {
        window.SHHub?.showToast?.(error?.message || 'Please login again.', 'error');
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
  const ratingStatEl = getElement('stat-rating');
  const profileImg = getElement('profile-img');
  const upload = getElement('profile-upload');
  const modeSellerBtn = getElement('mode-seller-btn');
  const modeBuyerBtn = getElement('mode-buyer-btn');
  const profileCurrentPassword = getElement('profile-current-password');
  const profileNewPassword = getElement('profile-new-password');
  const profileConfirmPassword = getElement('profile-confirm-password');

  const profileModal = getElement('profile-modal');
  const profileForm = getElement('profile-form');
  const serviceModal = getElement('service-modal');
  const serviceForm = getElement('service-form');
  const servicesGrid = getElement('my-services-grid');
  const historyBody = getElement('history-table-body');

  let myServicesCache = [];
  let myJobsCache = [];

  const getMarketMode = (user) => (user?.marketMode === 'buyer' ? 'buyer' : 'seller');

  const formatKES = (value) => {
    if (window.SHHub?.formatKES) return window.SHHub.formatKES(value);
    const amount = Number(value ?? 0);
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    return `KES ${safeAmount.toLocaleString('en-KE')}`;
  };

  const updateProfileData = async (updates) => {
    if (isApiMode && window.SHHub?.apiUpdateProfile) {
      return await window.SHHub.apiUpdateProfile(updates);
    }
    throw new Error('API not configured. Cannot update profile.');
  };

  const fetchMyServices = async () => {
    if (isApiMode && window.SHHub?.apiGetMyServices) {
      return await window.SHHub.apiGetMyServices();
    }
    return []; // If not in API mode, there are no services.
  };

  const saveServiceData = async (serviceId, updates) => {
    if (isApiMode && window.SHHub?.apiUpdateService) {
      return await window.SHHub.apiUpdateService(serviceId, updates);
    }
    throw new Error('API not configured. Cannot save service.');
  };

  const removeServiceData = async (serviceId) => {
    if (isApiMode && window.SHHub?.apiDeleteService) {
      return await window.SHHub.apiDeleteService(serviceId);
    }
    throw new Error('API not configured. Cannot delete service.');
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
    if (profileCurrentPassword) profileCurrentPassword.value = '';
    if (profileNewPassword) profileNewPassword.value = '';
    if (profileConfirmPassword) profileConfirmPassword.value = '';
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

  const renderStatsAndHistory = async () => {
    const summary = window.SHHub?.getRatingSummaryForUser?.(currentUser?._id) ?? { average: 0, count: 0 };
    ratingStatEl.innerText =
      summary.count > 0 ? `★ ${summary.average.toFixed(1)} (${summary.count})` : 'No reviews yet';

    if (isApiMode && window.SHHub?.apiGetMyJobs) {
      try {
        const jobs = await window.SHHub.apiGetMyJobs();
        myJobsCache = Array.isArray(jobs) ? jobs : [];
      } catch (error) {
        myJobsCache = [];
        if (!isNetworkError(error)) {
          window.SHHub?.showToast?.(error?.message || 'Failed to load job history.', 'error');
        }
      }
    } else {
      myJobsCache = [];
    }

    const getJobAmount = (job) => Number(job?.serviceSnapshot?.price ?? job?.service?.price ?? 0);
    const getJobTitle = (job) => job?.serviceSnapshot?.title ?? job?.service?.title ?? 'Service';
    const getCounterparty = (job) => {
      const isSeller = String(job?.seller?._id ?? '') === String(currentUser?._id ?? '');
      const other = isSeller ? job?.buyer : job?.seller;
      return other?.name ?? other?.email ?? 'Student';
    };

    const statusLabels = {
      requested: 'Requested',
      accepted: 'Accepted',
      in_progress: 'In progress',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
      disputed: 'Disputed',
    };

    const statusClasses = {
      requested: 'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:bg-white/10 dark:text-slate-200 dark:ring-white/20',
      accepted: 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200 dark:ring-sky-500/30',
      in_progress: 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200 dark:ring-sky-500/30',
      delivered: 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/30',
      completed: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30',
      cancelled: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30',
      disputed: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30',
    };

    const renderActions = (job) => {
      const isSeller = String(job?.seller?._id ?? '') === String(currentUser?._id ?? '');
      const isBuyer = String(job?.buyer?._id ?? '') === String(currentUser?._id ?? '');
      const actions = [];

      const pushAction = (label, next, tone = 'primary') => {
        const base = 'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition';
        const tones = {
          primary: 'bg-primary/10 text-primary hover:bg-primary/15',
          danger: 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-300',
        };
        actions.push(
          `<button type="button" data-job-action data-job-id="${job._id}" data-next-status="${next}" class="${base} ${tones[tone] || tones.primary}">${label}</button>`
        );
      };

      if (isSeller && job.status === 'requested') pushAction('Accept', 'accepted');
      if (isSeller && (job.status === 'accepted' || job.status === 'in_progress')) pushAction('Mark delivered', 'delivered');
      if (isBuyer && job.status === 'delivered') pushAction('Confirm complete', 'completed');
      if ((isBuyer || isSeller) && ['requested', 'accepted', 'in_progress'].includes(job.status)) {
        pushAction('Cancel', 'cancelled', 'danger');
      }

      if (!actions.length) return '';
      return `<div class="mt-2 flex flex-wrap gap-2">${actions.join('')}</div>`;
    };

    const activeRole = getMarketMode(currentUser);
    const completedJobs = myJobsCache.filter((job) => {
      const isSeller = String(job?.seller?._id ?? '') === String(currentUser?._id ?? '');
      const isBuyer = String(job?.buyer?._id ?? '') === String(currentUser?._id ?? '');
      return job.status === 'completed' && (activeRole === 'seller' ? isSeller : isBuyer);
    });
    const totalValue = completedJobs.reduce((sum, job) => sum + getJobAmount(job), 0);
    getElement('total-completed').innerText = String(completedJobs.length);
    getElement('total-earnings').innerText = formatKES(totalValue);

    if (!historyBody) return;

    if (myJobsCache.length === 0) {
      historyBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">No jobs yet. Start one from a service page.</td>
        </tr>
      `;
      return;
    }

    historyBody.innerHTML = myJobsCache
      .map((job) => {
        const date = new Date(job.updatedAt ?? job.createdAt ?? Date.now()).toLocaleDateString();
        const status = job.status ?? 'requested';
        const statusLabel = statusLabels[status] ?? status;
        const statusClass = statusClasses[status] ?? statusClasses.requested;
        const amount = getJobAmount(job);

        return `
          <tr>
            <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">${getJobTitle(job)}</td>
            <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${getCounterparty(job)}</td>
            <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${date}</td>
            <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${formatKES(amount)}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}">
                ${statusLabel}
              </span>
              ${renderActions(job)}
            </td>
          </tr>
        `;
      })
      .join('');
  };

  const renderMyServices = async () => {
    try {
      const loadedServices = await fetchMyServices();
      myServicesCache = Array.isArray(loadedServices) ? loadedServices : [];
    } catch (error) {
      myServicesCache = [];
      window.SHHub?.showToast?.(error?.message || 'Failed to load your services.', 'error');
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
      window.SHHub?.showToast?.('Switched to Seller mode', 'success');
    } catch (error) {
      window.SHHub?.showToast?.(error?.message || 'Failed to switch mode.', 'error');
    }
  });
  modeBuyerBtn?.addEventListener('click', async () => {
    try {
      currentUser = (await updateProfileData({ marketMode: 'buyer' })) ?? currentUser;
      applyUserUI(currentUser);
      window.SHHub?.showToast?.('Switched to Buyer mode', 'success');
    } catch (error) {
      window.SHHub?.showToast?.(error?.message || 'Failed to switch mode.', 'error');
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
    const currentPassword = profileCurrentPassword?.value ?? '';
    const newPassword = profileNewPassword?.value ?? '';
    const confirmPassword = profileConfirmPassword?.value ?? '';
    const wantsPasswordChange = Boolean(currentPassword || newPassword || confirmPassword);

    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword) {
        window.SHHub?.showToast?.('Enter your current password and a new password.', 'error');
        return;
      }
      if (String(newPassword).length < 8) {
        window.SHHub?.showToast?.('New password must be 8 or more characters.', 'error');
        return;
      }
      if (confirmPassword && newPassword !== confirmPassword) {
        window.SHHub?.showToast?.('New passwords do not match.', 'error');
        return;
      }
      if (!isApiMode || !window.SHHub?.apiUpdatePassword) {
        window.SHHub?.showToast?.('API not configured. Cannot update password.', 'error');
        return;
      }
    }

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
      await renderMyServices();

      if (wantsPasswordChange) {
        await window.SHHub.apiUpdatePassword({ currentPassword, newPassword });
        if (profileCurrentPassword) profileCurrentPassword.value = '';
        if (profileNewPassword) profileNewPassword.value = '';
        if (profileConfirmPassword) profileConfirmPassword.value = '';
        window.SHHub?.showToast?.('Profile and password updated.', 'success');
      } else {
        window.SHHub?.showToast?.('Profile updated successfully', 'success');
      }

      closeModal(profileModal);
    } catch (error) {
      window.SHHub?.showToast?.(error?.message || 'Failed to update profile.', 'error');
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
      window.SHHub?.showToast?.('Service saved successfully', 'success');
    } catch (error) {
      window.SHHub?.showToast?.(error?.message || 'Failed to update service.', 'error');
    }
  });

  upload?.addEventListener('change', () => {
    const file = upload.files?.[0];
    if (!file) return;
    (async () => {
      try {
        const nextImage = await optimizeProfileImage(file);
        if (!nextImage) return;
        currentUser = (await updateProfileData({ image: nextImage })) ?? currentUser;
        applyUserUI(currentUser);
        window.SHHub?.showToast?.('Profile photo updated', 'success');
      } catch (error) {
        window.SHHub?.showToast?.(error?.message || 'Failed to update profile image.', 'error');
      } finally {
        upload.value = '';
      }
    })();
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
        window.SHHub?.showToast?.('Service deleted', 'success');
      } catch (error) {
        window.SHHub?.showToast?.(error?.message || 'Failed to delete service.', 'error');
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

  historyBody?.addEventListener('click', async (event) => {
    const actionBtn = event.target.closest?.('[data-job-action]');
    if (!actionBtn) return;
    const jobId = actionBtn.getAttribute('data-job-id');
    const nextStatus = actionBtn.getAttribute('data-next-status');
    if (!jobId || !nextStatus) return;
    if (nextStatus === 'cancelled' && !confirm('Cancel this job?')) return;
    try {
      await window.SHHub?.apiUpdateJobStatus?.(jobId, nextStatus);
      await renderStatsAndHistory();
      window.SHHub?.showToast?.('Job status updated', 'success');
    } catch (error) {
      window.SHHub?.showToast?.(error?.message || 'Failed to update job status.', 'error');
    }
  });

  applyUserUI(currentUser);
  await renderStatsAndHistory();
  await renderMyServices();
  window.SHHub?.refreshIcons?.();
});

