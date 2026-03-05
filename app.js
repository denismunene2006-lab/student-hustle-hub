(() => {
  const USER_KEY = 'user';
  const THEME_KEY = 'theme';
  const SERVICES_KEY = 'shhub_services';
  const API_BASE_KEY = 'shhub_api_base_url';

  const normalizeUrl = (value) => String(value ?? '').trim().replace(/\/+$/, '');

  const getApiBaseUrl = () => {
    const metaValue = document.querySelector('meta[name="api-base-url"]')?.content;
    const globalValue = globalThis.SHHub_API_BASE_URL;
    const savedValue = localStorage.getItem(API_BASE_KEY);
    const explicit = normalizeUrl(metaValue || globalValue || savedValue || '');
    return explicit;
  };

  const setApiBaseUrl = (value) => {
    const normalized = normalizeUrl(value);
    if (normalized) {
      localStorage.setItem(API_BASE_KEY, normalized);
      return normalized;
    }
    localStorage.removeItem(API_BASE_KEY);
    return '';
  };

  const isApiMode = () => Boolean(getApiBaseUrl());

  const DEMO_SERVICES = [
    {
      _id: 'demo-1',
      title: 'Calculus & Engineering Maths Tutoring',
      description: 'Expert help with Calculus I, II, and III. Clear explanations, practice questions, and exam prep.',
      category: 'Tutoring',
      listingType: 'seller',
      price: 2500,
      contactInfo: '254712345678',
      createdAt: '2026-03-01T10:00:00.000Z',
      user: {
        _id: 'demo-user-1',
        name: 'Wanjiku Njeri',
        university: 'University of Nairobi',
        email: 'wanjiku@example.com',
        image: 'https://i.pravatar.cc/150?u=demo-1',
      },
    },
    {
      _id: 'demo-2',
      title: 'Logo & Poster Design',
      description: 'Professional logo design for your startup: 2-3 concepts, revisions included, brand-ready exports.',
      category: 'Graphic Design',
      listingType: 'seller',
      price: 5000,
      contactInfo: '254722345678',
      createdAt: '2026-03-02T12:30:00.000Z',
      user: {
        _id: 'demo-user-2',
        name: 'Otieno Kevin',
        university: 'Kenyatta University',
        email: 'otieno@example.com',
        image: 'https://i.pravatar.cc/150?u=demo-2',
      },
    },
    {
      _id: 'demo-3',
      title: 'Python Automation Scripts',
      description: 'Automation scripts, data cleanup, scraping, and small tools. Fast turnaround with clean code.',
      category: 'Programming Help',
      listingType: 'seller',
      price: 3000,
      contactInfo: '254732345678',
      createdAt: '2026-03-03T08:15:00.000Z',
      user: {
        _id: 'demo-user-3',
        name: 'Kiptoo Cheruiyot',
        university: 'JKUAT',
        email: 'kiptoo@example.com',
        image: 'https://i.pravatar.cc/150?u=demo-3',
      },
    },
    {
      _id: 'demo-4',
      title: 'Assignment Proofreading',
      description: 'Fast and accurate proofreading for essays and reports. Grammar, clarity, structure, and citations.',
      category: 'Assignment Help',
      listingType: 'seller',
      price: 1500,
      contactInfo: '254742345678',
      createdAt: '2026-03-03T14:45:00.000Z',
      user: {
        _id: 'demo-user-4',
        name: 'Achieng Auma',
        university: 'Egerton University',
        email: 'achieng@example.com',
        image: 'https://i.pravatar.cc/150?u=demo-4',
      },
    },
    {
      _id: 'demo-5',
      title: 'Resume Revamp',
      description: 'Get your CV ready for internships: ATS-friendly layout, bullet rewrites, and LinkedIn tips.',
      category: 'CV Writing',
      listingType: 'seller',
      price: 4000,
      contactInfo: '254752345678',
      createdAt: '2026-03-04T09:10:00.000Z',
      user: {
        _id: 'demo-user-5',
        name: 'Muthoni Wairimu',
        university: 'Moi University',
        email: 'muthoni@example.com',
        image: 'https://i.pravatar.cc/150?u=demo-5',
      },
    },
    {
      _id: 'demo-6',
      title: 'Need React Assignment Help',
      description: 'Looking for someone to guide me through a React assignment due this week.',
      category: 'Programming Help',
      listingType: 'buyer',
      price: 3000,
      contactInfo: '254701112233',
      createdAt: '2026-03-05T08:30:00.000Z',
      user: {
        _id: 'demo-user-6',
        name: 'Brian Mwangi',
        university: 'Strathmore University',
        email: 'brian.mwangi@example.com',
        image: 'https://i.pravatar.cc/150?u=demo-6',
      },
    },
    {
      _id: 'demo-7',
      title: 'Looking for CV Rewrite',
      description: 'Need a strong internship CV rewrite and LinkedIn profile polish.',
      category: 'CV Writing',
      listingType: 'buyer',
      price: 2500,
      contactInfo: '254709998877',
      createdAt: '2026-03-05T09:20:00.000Z',
      user: {
        _id: 'demo-user-7',
        name: 'Mercy Atieno',
        university: 'USIU-Africa',
        email: 'mercy.atieno@example.com',
        image: 'https://i.pravatar.cc/150?u=demo-7',
      },
    },
    {
      _id: 'demo-8',
      title: 'Excel & SPSS Data Analysis',
      description: 'I provide clean data analysis, charts, and report-ready summaries for projects and research work.',
      category: 'Assignment Help',
      listingType: 'seller',
      price: 4200,
      contactInfo: '254711223344',
      createdAt: '2026-03-05T11:05:00.000Z',
      user: {
        _id: 'demo-user-8',
        name: 'Amina Noor',
        university: 'Daystar University',
        email: 'amina.noor@example.com',
        image: 'https://i.pravatar.cc/150?u=demo-8',
      },
    },
    {
      _id: 'demo-9',
      title: 'Need Event Photographer',
      description: 'Looking for a student photographer for a campus event this weekend. Edited photos required.',
      category: 'Other',
      listingType: 'buyer',
      price: 6500,
      contactInfo: '254733889900',
      createdAt: '2026-03-05T12:10:00.000Z',
      user: {
        _id: 'demo-user-9',
        name: 'Kevin Mutiso',
        university: 'Mount Kenya University',
        email: 'kevin.mutiso@example.com',
        image: 'https://i.pravatar.cc/150?u=demo-9',
      },
    },
    {
      _id: 'demo-10',
      title: 'UI/UX Mobile App Screens',
      description: 'Modern Figma screens for student startups: onboarding, dashboard, and clean design system included.',
      category: 'Graphic Design',
      listingType: 'seller',
      price: 7800,
      contactInfo: '254722991122',
      createdAt: '2026-03-05T13:20:00.000Z',
      user: {
        _id: 'demo-user-10',
        name: 'Njeri Waithera',
        university: 'Technical University of Kenya',
        email: 'njeri.waithera@example.com',
        image: 'https://i.pravatar.cc/150?u=demo-10',
      },
    },
  ];

  const safeJsonParse = (value) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const getUser = () => safeJsonParse(localStorage.getItem(USER_KEY));

  const setUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clearUser = () => {
    localStorage.removeItem(USER_KEY);
  };

  const getStoredServices = () => {
    const services = safeJsonParse(localStorage.getItem(SERVICES_KEY));
    return Array.isArray(services) ? services : [];
  };

  const setStoredServices = (services) => {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  };

  const parseApiResponse = async (response) => {
    const raw = await response.text();
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const getApiErrorMessage = (payload, fallback) => {
    if (payload?.message) return payload.message;
    if (Array.isArray(payload?.errors) && payload.errors[0]?.msg) return payload.errors[0].msg;
    return fallback;
  };

  const apiRequest = async (path, options = {}) => {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) throw new Error('API base URL is not configured');

    const method = options.method ?? 'GET';
    const body = options.body;
    const requireAuthHeader = options.auth !== false;

    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    if (requireAuthHeader) {
      const token = getUser()?.token;
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await parseApiResponse(response);
    if (!response.ok) {
      const fallback = `Request failed (${response.status})`;
      throw new Error(getApiErrorMessage(payload, fallback));
    }

    return payload;
  };

  const normalizeListingType = (value) => (value === 'buyer' ? 'buyer' : 'seller');

  const formatKES = (value) => {
    const amount = Number(value ?? 0);
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    return `KES ${safeAmount.toLocaleString('en-KE')}`;
  };

  const getAllServices = () => {
    const merged = [...getStoredServices(), ...DEMO_SERVICES];
    return merged.sort((a, b) => {
      const aTime = new Date(a.createdAt ?? 0).getTime();
      const bTime = new Date(b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
  };

  const getServiceById = (id) => {
    if (!id) return null;
    return getStoredServices().find((s) => s._id === id) ?? DEMO_SERVICES.find((s) => s._id === id) ?? null;
  };

  const createService = (data) => {
    const user = getUser();
    if (!user) throw new Error('Not authenticated');

    const now = new Date().toISOString();
    const id = (globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(16).slice(2)}`);

    const listingType = normalizeListingType(data?.listingType ?? user.marketMode);
    const contactValue = String(data?.contactInfo ?? user.whatsappNumber ?? user.email ?? '').trim();

    const service = {
      _id: id,
      title: String(data?.title ?? '').trim(),
      description: String(data?.description ?? '').trim(),
      category: String(data?.category ?? '').trim(),
      listingType,
      price: Number(data?.price ?? 0),
      contactInfo: contactValue,
      createdAt: now,
      user: {
        _id: user._id ?? 'local-user',
        name: user.name ?? 'Student User',
        university: user.university ?? 'Campus University',
        email: user.email ?? '',
        whatsappNumber: user.whatsappNumber ?? '',
        image: user.image ?? `https://i.pravatar.cc/150?u=${encodeURIComponent(user.email ?? user.name ?? 'user')}`,
      },
    };

    if (!service.title || !service.description || !service.category || !service.contactInfo || !Number.isFinite(service.price) || service.price <= 0) {
      throw new Error('Please fill all fields correctly');
    }

    const services = getStoredServices();
    services.unshift(service);
    setStoredServices(services);
    return service;
  };

  const getMyServices = () => {
    const user = getUser();
    if (!user) return [];
    return getStoredServices().filter((s) => s.user?._id === user._id);
  };

  const deleteService = (id) => {
    const user = getUser();
    if (!user) throw new Error('Not authenticated');

    const services = getStoredServices();
    const index = services.findIndex((s) => s._id === id);
    if (index === -1) return false;
    if (services[index]?.user?._id !== user._id) throw new Error('Not authorized');

    services.splice(index, 1);
    setStoredServices(services);
    return true;
  };

  const updateService = (id, updates) => {
    const user = getUser();
    if (!user) throw new Error('Not authenticated');

    const services = getStoredServices();
    const index = services.findIndex((s) => s._id === id);
    if (index === -1) throw new Error('Service not found');

    const existingService = services[index];
    if (existingService?.user?._id !== user._id) throw new Error('Not authorized');

    const title = String(updates?.title ?? existingService.title ?? '').trim();
    const description = String(updates?.description ?? existingService.description ?? '').trim();
    const category = String(updates?.category ?? existingService.category ?? '').trim();
    const listingType = normalizeListingType(updates?.listingType ?? existingService.listingType);
    const contactInfo = String(updates?.contactInfo ?? existingService.contactInfo ?? '').trim();
    const price = Number(updates?.price ?? existingService.price ?? 0);

    if (!title || !description || !category || !contactInfo || !Number.isFinite(price) || price <= 0) {
      throw new Error('Please fill all fields correctly');
    }

    const nextService = {
      ...existingService,
      title,
      description,
      category,
      listingType,
      contactInfo,
      price,
      updatedAt: new Date().toISOString(),
    };

    services[index] = nextService;
    setStoredServices(services);
    return nextService;
  };

  const updateProfile = (updates) => {
    const currentUser = getUser();
    if (!currentUser) throw new Error('Not authenticated');

    const nextUser = {
      ...currentUser,
      name: String(updates?.name ?? currentUser.name ?? '').trim(),
      email: String(updates?.email ?? currentUser.email ?? '').trim(),
      university: String(updates?.university ?? currentUser.university ?? '').trim(),
      course: String(updates?.course ?? currentUser.course ?? '').trim(),
      whatsappNumber: String(updates?.whatsappNumber ?? currentUser.whatsappNumber ?? '').trim(),
      bio: String(updates?.bio ?? currentUser.bio ?? '').trim(),
      image: String(updates?.image ?? currentUser.image ?? '').trim(),
      marketMode: normalizeListingType(updates?.marketMode ?? currentUser.marketMode),
    };

    if (!nextUser.name) throw new Error('Name is required');
    if (!nextUser.email) throw new Error('Email is required');
    if (!nextUser.university) throw new Error('University is required');

    setUser(nextUser);

    const services = getStoredServices();
    const syncedServices = services.map((service) => {
      if (service?.user?._id !== currentUser._id) return service;
      return {
        ...service,
        user: {
          ...service.user,
          name: nextUser.name,
          email: nextUser.email,
          university: nextUser.university,
          whatsappNumber: nextUser.whatsappNumber,
          image: nextUser.image || service.user?.image,
        },
      };
    });

    setStoredServices(syncedServices);
    return nextUser;
  };

  const mergeAndSetUser = (payload) => {
    const existing = getUser() ?? {};
    const nextUser = {
      ...existing,
      ...(payload ?? {}),
    };
    if (payload?.token) nextUser.token = payload.token;
    else if (existing.token) nextUser.token = existing.token;
    setUser(nextUser);
    return nextUser;
  };

  const apiLogin = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    return mergeAndSetUser(data);
  };

  const apiRegister = async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      auth: false,
      body: userData,
    });
    return mergeAndSetUser(data);
  };

  const apiGetProfile = async () => {
    const data = await apiRequest('/auth/me');
    return mergeAndSetUser(data);
  };

  const apiUpdateProfile = async (updates) => {
    const data = await apiRequest('/auth/me', {
      method: 'PUT',
      body: updates,
    });
    return mergeAndSetUser(data);
  };

  const buildQueryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      const text = String(value ?? '').trim();
      if (text) query.set(key, text);
    });
    const serialized = query.toString();
    return serialized ? `?${serialized}` : '';
  };

  const apiGetServices = async (filters = {}) => {
    const query = buildQueryString(filters);
    return apiRequest(`/services${query}`, { auth: false });
  };

  const apiGetServiceById = async (id) => {
    if (!id) throw new Error('Service ID is required');
    return apiRequest(`/services/${encodeURIComponent(id)}`, { auth: false });
  };

  const apiGetMyServices = async () => apiRequest('/services/my-services');

  const apiCreateService = async (data) => {
    return apiRequest('/services', {
      method: 'POST',
      body: data,
    });
  };

  const apiUpdateService = async (id, updates) => {
    if (!id) throw new Error('Service ID is required');
    return apiRequest(`/services/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: updates,
    });
  };

  const apiDeleteService = async (id) => {
    if (!id) throw new Error('Service ID is required');
    await apiRequest(`/services/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return true;
  };

  const refreshIcons = () => {
    if (window.lucide?.createIcons) window.lucide.createIcons();
  };

  const getThemePreference = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  };

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');

    document.querySelectorAll('[data-theme-icon]').forEach((iconHost) => {
      iconHost.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    });
    refreshIcons();
  };

  const toggleTheme = () => {
    applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  };

  const requireAuth = () => {
    if (!getUser()) window.location.replace('login.html');
  };

  const logout = (redirectTo = 'login.html') => {
    clearUser();
    window.location.href = redirectTo;
  };

  const SUPPORT_NUMBER_INTL = '254710236087';
  const SUPPORT_NUMBER_LOCAL = '0710 236 087';
  const SUPPORT_MESSAGE = encodeURIComponent('Hi, I need help with Student Hustle Hub.');
  const SUPPORT_LINK = `https://wa.me/${SUPPORT_NUMBER_INTL}?text=${SUPPORT_MESSAGE}`;

  const getCurrentPage = () => {
    const page = window.location.pathname.split('/').pop();
    return (page && page.length ? page : 'index.html').toLowerCase();
  };

  const linkClass = (isMobile = false, isActive = false) =>
    [
      'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary/15 text-slate-900 ring-1 ring-primary/25 dark:bg-primary/25 dark:text-white dark:ring-primary/30'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/10',
      isMobile ? 'w-full justify-start' : '',
    ].filter(Boolean).join(' ');

  const buttonClass = (variant = 'ghost', isMobile = false) => {
    const base = [
      'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium',
      'transition-colors',
      isMobile ? 'w-full justify-start' : '',
    ];

    const variants = {
      ghost: [
        'text-slate-700 hover:text-slate-900 hover:bg-slate-900/5',
        'dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/10',
      ],
      primary: [
        'bg-primary text-white hover:brightness-95',
      ],
      support: [
        'bg-emerald-500 text-white hover:bg-emerald-600',
      ],
      danger: [
        'text-rose-600 hover:text-rose-700 hover:bg-rose-600/10',
        'dark:text-rose-300 dark:hover:text-rose-200 dark:hover:bg-rose-300/10',
      ],
    };

    return base.concat(variants[variant] ?? variants.ghost).join(' ');
  };

  const navLink = (href, icon, label, isMobile = false) => {
    const isActive = getCurrentPage() === href.toLowerCase();
    return `<a href="${href}" class="${linkClass(isMobile, isActive)}"${isActive ? ' aria-current="page"' : ''}><i data-lucide="${icon}" class="h-4 w-4"></i>${label}</a>`;
  };

  const supportLink = (isMobile = false) =>
    `<a href="${SUPPORT_LINK}" target="_blank" rel="noopener noreferrer" class="${buttonClass('support', isMobile)}"><i data-lucide="message-circle" class="h-4 w-4"></i>Help</a>`;

  const buildLinks = (user, isMobile = false) => {
    const browse = navLink('index.html', 'search', 'Browse', isMobile);

    if (user) {
      return [
        browse,
        navLink('create-service.html', 'plus-circle', 'Post Service', isMobile),
        navLink('dashboard.html', 'layout-dashboard', 'Dashboard', isMobile),
        navLink('settings.html', 'settings', 'Settings', isMobile),
        supportLink(isMobile),
        `<button type="button" data-action="logout" class="${buttonClass('danger', isMobile)}"><i data-lucide="log-out" class="h-4 w-4"></i>Logout</button>`,
      ].join('');
    }

    return [
      browse,
      navLink('login.html', 'log-in', 'Login', isMobile),
      navLink('settings.html', 'settings', 'Settings', isMobile),
      supportLink(isMobile),
      `<a href="register.html" class="${buttonClass('primary', isMobile)}">${isMobile ? '<i data-lucide="user-plus" class="h-4 w-4"></i>' : ''}Register</a>`,
    ].join('');
  };

  const renderNavbar = () => {
    const host = document.getElementById('app-navbar');
    if (!host) return;

    const user = getUser();
    const initialTheme = getThemePreference();
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    host.innerHTML = `
      <nav class="sticky top-0 z-50 border-b border-white/60 bg-white/86 shadow-[0_10px_32px_-22px_rgba(15,23,42,.55)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/80 dark:shadow-[0_12px_34px_-22px_rgba(2,6,23,.9)]">
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
            ${buildLinks(user, false)}
            <button type="button" data-action="toggle-theme" class="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-950/80" aria-label="Toggle theme">
              <i data-theme-icon data-lucide="${initialTheme === 'dark' ? 'sun' : 'moon'}" class="h-4 w-4"></i>
            </button>
          </div>

          <div class="flex items-center gap-1 md:hidden">
            <button type="button" data-action="toggle-theme" class="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-950/80" aria-label="Toggle theme">
              <i data-theme-icon data-lucide="${initialTheme === 'dark' ? 'sun' : 'moon'}" class="h-4 w-4"></i>
            </button>
            <button type="button" data-action="toggle-menu" class="${buttonClass('ghost', false)}" aria-label="Open menu">
              <i data-lucide="menu" class="h-5 w-5"></i>
            </button>
          </div>
        </div>

        <div id="mobile-menu" class="hidden border-t border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/75 md:hidden">
          <div class="flex flex-col gap-1">
            ${buildLinks(user, true)}
          </div>
        </div>
      </nav>
    `;

    host.querySelectorAll('[data-action="toggle-theme"]').forEach((button) => {
      button.addEventListener('click', toggleTheme);
    });
    host.querySelectorAll('[data-action="logout"]').forEach((button) => {
      button.addEventListener('click', () => logout('login.html'));
    });

    const menuButton = host.querySelector('[data-action="toggle-menu"]');
    const menu = host.querySelector('#mobile-menu');
    menuButton?.addEventListener('click', () => {
      menu?.classList.toggle('hidden');
      refreshIcons();
    });

    refreshIcons();
  };

  const renderFooter = () => {
    const existingFooter = document.getElementById('app-footer');
    existingFooter?.remove();

    const footer = document.createElement('footer');
    footer.id = 'app-footer';
    footer.className = 'mt-12 pb-8';

    const year = new Date().getFullYear();
    footer.innerHTML = `
      <div class="mx-auto max-w-7xl px-4">
        <div class="glass rounded-2xl px-5 py-5 sm:px-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-3">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white ring-1 ring-primary/30 shadow-sm">
                <i data-lucide="briefcase" class="h-5 w-5"></i>
              </span>
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">Student Hustle Hub</p>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Find and offer trusted student services on campus.</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <a href="index.html" class="${linkClass(false, getCurrentPage() === 'index.html')}">Browse</a>
              <a href="dashboard.html" class="${linkClass(false, getCurrentPage() === 'dashboard.html')}">Dashboard</a>
              <a href="create-service.html" class="${linkClass(false, getCurrentPage() === 'create-service.html')}">Post Service</a>
              <a href="settings.html" class="${linkClass(false, getCurrentPage() === 'settings.html')}">Settings</a>
              <a href="${SUPPORT_LINK}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600">
                <i data-lucide="message-circle" class="h-4 w-4"></i>
                Help WhatsApp ${SUPPORT_NUMBER_LOCAL}
              </a>
            </div>
          </div>

          <div class="mt-4 border-t border-slate-200/70 pt-3 text-xs text-slate-500 dark:border-slate-700/70 dark:text-slate-400">
            <p>&copy; ${year} Student Hustle Hub. Built for campus creators.</p>
          </div>
        </div>
      </div>
    `;

    const main = document.querySelector('main');
    if (main) {
      main.insertAdjacentElement('afterend', footer);
    } else {
      document.body.appendChild(footer);
    }
  };

  const init = () => {
    if (document.body?.dataset?.requiresAuth === 'true') requireAuth();
    renderNavbar();
    renderFooter();
    refreshIcons();
  };

  window.SHHub = {
    getUser,
    setUser,
    logout,
    requireAuth,
    applyTheme,
    toggleTheme,
    refreshIcons,
    getAllServices,
    getServiceById,
    createService,
    getMyServices,
    deleteService,
    updateService,
    updateProfile,
    formatKES,
    getApiBaseUrl,
    setApiBaseUrl,
    isApiMode,
    apiLogin,
    apiRegister,
    apiGetProfile,
    apiUpdateProfile,
    apiGetServices,
    apiGetServiceById,
    apiGetMyServices,
    apiCreateService,
    apiUpdateService,
    apiDeleteService,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
