(() => {
  const SHARED_TAILWIND_CONFIG = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: '#0F766E',
          secondary: '#F59E0B',
        },
      },
    },
  };

  const applyInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const theme = savedTheme === 'dark' || savedTheme === 'light'
        ? savedTheme
        : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
      return theme;
    } catch (error) {
      return 'light';
    }
  };

  const setTailwindConfig = () => {
    window.tailwind = window.tailwind || {};
    window.tailwind.config = SHARED_TAILWIND_CONFIG;
    return SHARED_TAILWIND_CONFIG;
  };

  const templates = {
    navbar: ({ initialTheme, userLinksHtml, mobileLinksHtml }) => `
      <nav class="app-navbar-shell sticky top-0 z-50 border-b border-white/60 bg-white/86 shadow-[0_10px_32px_-22px_rgba(15,23,42,.55)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/80 dark:shadow-[0_12px_34px_-22px_rgba(2,6,23,.9)]">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <a href="index.html" class="inline-flex items-center gap-3 rounded-xl px-2 py-1 text-base font-semibold tracking-tight text-slate-900 hover:bg-slate-900/5 dark:text-white dark:hover:bg-white/10">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white ring-1 ring-primary/30 shadow-sm">
              <i data-lucide="briefcase" class="h-5 w-5"></i>
            </span>
            <span class="leading-tight">
              <span class="block">Student Hustle Hub</span>
              <span class="hidden text-xs font-medium text-slate-500 dark:text-slate-300 sm:block">Campus Service Marketplace</span>
            </span>
          </a>

          <div class="hidden items-center gap-1 md:flex">
            ${userLinksHtml}
            <button type="button" data-action="toggle-theme" class="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-950/80" aria-label="Toggle theme">
              <i data-theme-icon data-lucide="${initialTheme === 'dark' ? 'sun' : 'moon'}" class="h-4 w-4"></i>
            </button>
          </div>

          <div class="flex items-center gap-1 md:hidden">
            <button type="button" data-action="toggle-theme" class="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-950/80" aria-label="Toggle theme">
              <i data-theme-icon data-lucide="${initialTheme === 'dark' ? 'sun' : 'moon'}" class="h-4 w-4"></i>
            </button>
            <button type="button" data-action="toggle-menu" class="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-950/80" aria-label="Open menu">
              <i data-lucide="menu" class="h-5 w-5"></i>
            </button>
          </div>
        </div>

        <div id="mobile-menu" class="hidden border-t border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/75 md:hidden">
          <div class="flex flex-col gap-1">
            ${mobileLinksHtml}
          </div>
        </div>
      </nav>
    `,
    footer: ({ quickLinksHtml, supportLink, supportNumberDisplay }) => `
      <div class="mx-auto max-w-7xl px-4">
        <div class="floating-footer-card rounded-2xl px-4 py-3 sm:px-5">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white ring-1 ring-primary/30 shadow-sm">
                <i data-lucide="briefcase" class="h-4 w-4"></i>
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">Student Hustle Hub</p>
                <p class="truncate text-xs text-slate-500 dark:text-slate-400">Find trusted student services on campus.</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <div class="hidden items-center gap-2 md:flex">
                ${quickLinksHtml}
              </div>
              <a href="${supportLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600">
                <i data-lucide="message-circle" class="h-4 w-4"></i>
                <span class="sm:hidden">Help</span>
                <span class="hidden sm:inline">Help WhatsApp ${supportNumberDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `,
  };

  applyInitialTheme();
  setTailwindConfig();

  window.SHHubShell = {
    applyInitialTheme,
    setTailwindConfig,
    templates,
    tailwindConfig: SHARED_TAILWIND_CONFIG,
  };
})();
