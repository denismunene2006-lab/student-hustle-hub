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

  const listEl = document.getElementById('jobs-list');
  const emptyEl = document.getElementById('jobs-empty');
  const statTotal = document.getElementById('stat-total');
  const statInProgress = document.getElementById('stat-in-progress');
  const statCompleted = document.getElementById('stat-completed');

  const roleButtons = Array.from(document.querySelectorAll('[data-role-filter]'));
  const statusButtons = Array.from(document.querySelectorAll('[data-status-filter]'));

  let activeRole = 'all';
  let activeStatus = 'all';

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

  const buttonClass = (active) => [
    'rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition',
    active
      ? 'border-primary bg-primary text-white'
      : 'border-slate-200/70 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:bg-slate-950/70',
  ].join(' ');

  const updateButtons = () => {
    roleButtons.forEach((btn) => {
      const value = btn.getAttribute('data-role-filter');
      btn.className = buttonClass(value === activeRole);
    });
    statusButtons.forEach((btn) => {
      const value = btn.getAttribute('data-status-filter');
      btn.className = buttonClass(value === activeStatus);
    });
  };

  const getJobAmount = (job) => Number(job?.serviceSnapshot?.price ?? job?.service?.price ?? 0);
  const getJobTitle = (job) => job?.serviceSnapshot?.title ?? job?.service?.title ?? 'Service';
  const getCounterparty = (job) => {
    const isSeller = String(job?.seller?._id ?? '') === String(currentUser?._id ?? '');
    const other = isSeller ? job?.buyer : job?.seller;
    return other?.name ?? other?.email ?? 'Student';
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
    return `<div class="mt-3 flex flex-wrap gap-2">${actions.join('')}</div>`;
  };

  const renderJobs = (jobs) => {
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    if (statTotal) statTotal.innerText = String(safeJobs.length);
    if (statInProgress) statInProgress.innerText = String(safeJobs.filter((job) => job.status === 'in_progress').length);
    if (statCompleted) statCompleted.innerText = String(safeJobs.filter((job) => job.status === 'completed').length);

    if (!safeJobs.length) {
      listEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      window.SHHub?.refreshIcons?.();
      return;
    }

    emptyEl.classList.add('hidden');
    listEl.innerHTML = safeJobs.map((job) => {
      const status = job.status ?? 'requested';
      const statusLabel = statusLabels[status] ?? status;
      const statusClass = statusClasses[status] ?? statusClasses.requested;
      const amount = getJobAmount(job);
      const date = new Date(job.updatedAt ?? job.createdAt ?? Date.now()).toLocaleDateString();
      const listingType = job?.serviceSnapshot?.listingType === 'buyer' ? 'Buyer request' : 'Seller offer';

      return `
        <article class="glass rounded-2xl border border-slate-200/60 p-6 shadow-sm dark:border-slate-700/60">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">${listingType}</p>
              <h3 class="mt-1 truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">${getJobTitle(job)}</h3>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">With ${getCounterparty(job)}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}">
                ${statusLabel}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">${date}</span>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/50 pt-4 dark:border-slate-700/50">
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Amount</p>
              <p class="text-lg font-semibold text-secondary">${window.SHHub?.formatKES?.(amount) ?? `KES ${amount.toLocaleString('en-KE')}`}</p>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Payment: Manual (off-platform)</div>
          </div>

          ${renderActions(job)}
        </article>
      `;
    }).join('');

    window.SHHub?.refreshIcons?.();
  };

  const loadJobs = async () => {
    if (!isApiMode || !window.SHHub?.apiGetMyJobs) {
      renderJobs([]);
      return;
    }

    const filters = {};
    if (activeRole !== 'all') filters.role = activeRole;
    if (activeStatus !== 'all') filters.status = activeStatus;

    try {
      const jobs = await window.SHHub.apiGetMyJobs(filters);
      renderJobs(jobs);
    } catch (error) {
      renderJobs([]);
      if (!isNetworkError(error)) {
        window.SHHub?.showToast?.(error?.message || 'Failed to load jobs.', 'error');
      }
    }
  };

  roleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeRole = button.getAttribute('data-role-filter') || 'all';
      updateButtons();
      loadJobs();
    });
  });

  statusButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeStatus = button.getAttribute('data-status-filter') || 'all';
      updateButtons();
      loadJobs();
    });
  });

  listEl?.addEventListener('click', async (event) => {
    const button = event.target.closest?.('[data-job-action]');
    if (!button) return;
    const jobId = button.getAttribute('data-job-id');
    const nextStatus = button.getAttribute('data-next-status');
    if (!jobId || !nextStatus) return;
    if (nextStatus === 'cancelled' && !confirm('Cancel this job?')) return;
    try {
      await window.SHHub?.apiUpdateJobStatus?.(jobId, nextStatus);
      await loadJobs();
      window.SHHub?.showToast?.('Job status updated', 'success');
    } catch (error) {
      window.SHHub?.showToast?.(error?.message || 'Failed to update job.', 'error');
    }
  });

  updateButtons();
  await loadJobs();
});
