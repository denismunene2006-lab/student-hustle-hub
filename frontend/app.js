(() => {
  const USER_KEY = 'user';
  const THEME_KEY = 'theme';
  const SERVICES_KEY = 'shhub_services';
  const USERS_INDEX_KEY = 'shhub_users_index';
  const REVIEWS_KEY = 'shhub_reviews';
  const HIDDEN_DEMO_SERVICES_KEY = 'shhub_hidden_demo_services';
  const HIDDEN_DEMO_REVIEWS_KEY = 'shhub_hidden_demo_reviews';
  const FAVORITES_KEY = 'shhub_favorites';
  const API_BASE_KEY = 'shhub_api_base_url';
  const API_REQUEST_TIMEOUT_MS = 12000;
  const ADMIN_EMAILS = [];

  const storageGet = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const storageSet = (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  };

  const storageRemove = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  };

  const normalizeUrl = (value) => String(value ?? '').trim().replace(/\/+$/, '');
  const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();
  const normalizeListingType = (value) => (value === 'buyer' ? 'buyer' : 'seller');
  const isAdminEmail = (email) => ADMIN_EMAILS.includes(normalizeEmail(email));

  const getApiBaseUrl = () => {
    const metaValue = document.querySelector('meta[name="api-base-url"]')?.content;
    const globalValue = globalThis.SHHub_API_BASE_URL;
    const savedValue = storageGet(API_BASE_KEY);
    const explicit = normalizeUrl(savedValue || globalValue || metaValue || '');
    return explicit;
  };

  const setApiBaseUrl = (value) => {
    const normalized = normalizeUrl(value);
    if (normalized) {
      storageSet(API_BASE_KEY, normalized);
      return normalized;
    }
    storageRemove(API_BASE_KEY);
    return '';
  };

  const isApiMode = () => Boolean(getApiBaseUrl());

  const DEMO_SERVICES = [];

  const DEMO_REVIEWS = [];

  const safeJsonParse = (value) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const getStoredUsersIndex = () => {
    const users = safeJsonParse(storageGet(USERS_INDEX_KEY));
    return Array.isArray(users) ? users : [];
  };

  const setStoredUsersIndex = (users) => {
    storageSet(USERS_INDEX_KEY, JSON.stringify(users));
  };

  const findUserByEmailLocal = (email) => {
    if (!email) return null;
    const users = getStoredUsersIndex();
    const normalizedEmail = normalizeEmail(email);
    return users.find((user) => normalizeEmail(user?.email) === normalizedEmail) ?? null;
  };

  const getUserByIdLocal = (userId) => {
    if (!userId) return null;
    const users = getStoredUsersIndex();
    return users.find((user) => user?._id === userId) ?? null;
  };

  const getStoredReviews = () => {
    const reviews = safeJsonParse(storageGet(REVIEWS_KEY));
    return Array.isArray(reviews) ? reviews : [];
  };

  const setStoredReviews = (reviews) => {
    storageSet(REVIEWS_KEY, JSON.stringify(reviews));
  };

  const getHiddenDemoServiceIds = () => {
    const ids = safeJsonParse(storageGet(HIDDEN_DEMO_SERVICES_KEY));
    return Array.isArray(ids) ? ids : [];
  };

  const setHiddenDemoServiceIds = (ids) => {
    storageSet(HIDDEN_DEMO_SERVICES_KEY, JSON.stringify(ids));
  };

  const getHiddenDemoReviewIds = () => {
    const ids = safeJsonParse(storageGet(HIDDEN_DEMO_REVIEWS_KEY));
    return Array.isArray(ids) ? ids : [];
  };

  const setHiddenDemoReviewIds = (ids) => {
    storageSet(HIDDEN_DEMO_REVIEWS_KEY, JSON.stringify(ids));
  };

  const getFavorites = () => {
    const favs = safeJsonParse(storageGet(FAVORITES_KEY));
    return Array.isArray(favs) ? favs : [];
  };

  const isFavorite = (serviceId) => {
    const favs = getFavorites();
    return favs.includes(serviceId);
  };

  const toggleFavorite = (serviceId) => {
    let favs = getFavorites();
    const index = favs.indexOf(serviceId);
    let added = false;
    if (index === -1) {
      favs.push(serviceId);
      added = true;
    } else {
      favs.splice(index, 1);
    }
    storageSet(FAVORITES_KEY, JSON.stringify(favs));
    return added;
  };

    const ensureCountryCode = (number) => {
    const numStr = String(number ?? '').trim();
    if (!numStr) return '';
    if (numStr.startsWith('+254')) return numStr;
    if (numStr.startsWith('254') && numStr.length === 12) return `+${numStr}`;
    return `+254${numStr.startsWith('0') ? numStr.slice(1) : numStr}`;
  };

  const normalizeUserPayload = (user, existing = {}) => {
    const email = normalizeEmail(user?.email ?? existing?.email ?? '');
    return {
      ...existing,
      ...(user ?? {}),
      _id: String(user?._id ?? existing?._id ?? `local-user-${Date.now()}`),
      name: String(user?.name ?? existing?.name ?? 'Student User').trim(),
      email,
      university: String(user?.university ?? existing?.university ?? 'Campus University').trim(),
      course: String(user?.course ?? existing?.course ?? 'N/A').trim(),
      image: String(user?.image ?? existing?.image ?? '').trim(),
      whatsappNumber: ensureCountryCode(user?.whatsappNumber ?? existing?.whatsappNumber ?? ''),
      bio: String(user?.bio ?? existing?.bio ?? '').trim(),
      marketMode: normalizeListingType(user?.marketMode ?? existing?.marketMode),
      isAdmin: Boolean(user?.isAdmin ?? existing?.isAdmin ?? isAdminEmail(email)),
      isSuspended: Boolean(user?.isSuspended ?? existing?.isSuspended ?? false),
      suspensionReason: String(user?.suspensionReason ?? existing?.suspensionReason ?? '').trim(),
      token: String(user?.token ?? existing?.token ?? '').trim(),
    };
  };

  const getUser = () => {
    const parsed = safeJsonParse(storageGet(USER_KEY));
    if (!parsed) return null;
    return normalizeUserPayload(parsed);
  };

  const upsertUsersIndex = (user) => {
    const users = getStoredUsersIndex();
    const email = normalizeEmail(user?.email);
    const idxByEmail = email ? users.findIndex((item) => normalizeEmail(item?.email) === email) : -1;
    const idxById = idxByEmail >= 0 ? idxByEmail : users.findIndex((item) => item?._id === user?._id);
    const existing = idxById >= 0 ? users[idxById] : null;
    const isFirstUser = users.length === 0 && idxById < 0;
    const normalizedUser = normalizeUserPayload(user, existing ?? {});

    const now = new Date().toISOString();
    const nextUser = {
      ...normalizedUser,
      isAdmin: Boolean(normalizedUser.isAdmin || isFirstUser),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      lastSeenAt: now,
    };

    if (idxById >= 0) users[idxById] = nextUser;
    else users.unshift(nextUser);

    setStoredUsersIndex(users);
    return nextUser;
  };

  const setUser = (user) => {
    const mergedUser = upsertUsersIndex(user ?? {});
    storageSet(USER_KEY, JSON.stringify(mergedUser));
    return mergedUser;
  };

  const clearUser = () => {
    storageRemove(USER_KEY);
  };

  const getStoredServices = () => {
    const services = safeJsonParse(storageGet(SERVICES_KEY));
    return Array.isArray(services) ? services : [];
  };

  const setStoredServices = (services) => {
    storageSet(SERVICES_KEY, JSON.stringify(services));
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

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS) : null;

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller?.signal,
      });

      const payload = await parseApiResponse(response);
      if (!response.ok) {
        const fallback = `Request failed (${response.status})`;
        throw new Error(getApiErrorMessage(payload, fallback));
      }

      return payload;
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error(`Request timeout after ${Math.round(API_REQUEST_TIMEOUT_MS / 1000)} seconds`);
      }
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const formatKES = (value) => {
    const amount = Number(value ?? 0);
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    return `KES ${safeAmount.toLocaleString('en-KE')}`;
  };

  const getAllServices = () => {
    const hiddenDemoIds = new Set(getHiddenDemoServiceIds());
    const visibleDemoServices = DEMO_SERVICES.filter((service) => !hiddenDemoIds.has(service._id));
    const merged = [...getStoredServices(), ...visibleDemoServices];
    return merged.sort((a, b) => {
      const aTime = new Date(a.createdAt ?? 0).getTime();
      const bTime = new Date(b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
  };

  const getServiceById = (id) => {
    if (!id) return null;
    const hiddenDemoIds = new Set(getHiddenDemoServiceIds());
    const demo = hiddenDemoIds.has(id) ? null : DEMO_SERVICES.find((s) => s._id === id) ?? null;
    return getStoredServices().find((s) => s._id === id) ?? demo;
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
        image: user.image ?? `https://i.pravatar.cc/100?u=${encodeURIComponent(user.email ?? user.name ?? 'user')}`,
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

  const addServiceToLocalCache = (service) => {
    if (!service?._id) return;
    const services = getStoredServices();
    const index = services.findIndex((s) => s._id === service._id);
    if (index > -1) {
      // Update if it already exists
      services[index] = service;
    } else {
      // Add if it's new
      services.unshift(service);
    }
    setStoredServices(services);
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

  const getAllReviews = () => {
    const hiddenDemoReviewIds = new Set(getHiddenDemoReviewIds());
    const visibleDemoReviews = DEMO_REVIEWS.filter((review) => !hiddenDemoReviewIds.has(review._id));
    const merged = [...getStoredReviews(), ...visibleDemoReviews];
    return merged.sort((a, b) => {
      const aTime = new Date(a.createdAt ?? 0).getTime();
      const bTime = new Date(b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
  };

  const getReviewsForUser = (studentId) => {
    const targetId = String(studentId ?? '').trim();
    if (!targetId) return [];
    return getAllReviews().filter((review) => String(review?.studentId ?? '') === targetId);
  };

  const getRatingSummaryForUser = (studentId) => {
    const reviews = getReviewsForUser(studentId);
    const count = reviews.length;
    if (count === 0) return { average: 0, count: 0 };
    const total = reviews.reduce((sum, review) => sum + Number(review?.rating ?? 0), 0);
    const average = total / count;
    return {
      average: Number.isFinite(average) ? average : 0,
      count,
    };
  };

  const addReview = (payload) => {
    const reviewer = getUser();
    if (!reviewer) throw new Error('Please login to leave a review');

    const studentId = String(payload?.studentId ?? '').trim();
    if (!studentId) throw new Error('Student ID is required');
    if (reviewer._id === studentId) throw new Error('You cannot review your own profile');

    const rating = Number(payload?.rating ?? 0);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const comment = String(payload?.comment ?? '').trim();
    if (comment.length < 6) throw new Error('Please write a slightly longer review');

    const serviceId = String(payload?.serviceId ?? '').trim();
    const now = new Date().toISOString();
    const storedReviews = getStoredReviews();

    const existingIndex = storedReviews.findIndex((review) =>
      review?.serviceId === serviceId
      && review?.studentId === studentId
      && review?.reviewerUserId === reviewer._id);

    if (existingIndex >= 0) {
      const updated = {
        ...storedReviews[existingIndex],
        rating,
        comment,
        updatedAt: now,
      };
      storedReviews[existingIndex] = updated;
      setStoredReviews(storedReviews);
      return updated;
    }

    const newReview = {
      _id: globalThis.crypto?.randomUUID?.() ?? `local-review-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      studentId,
      serviceId,
      reviewerUserId: reviewer._id,
      reviewerName: reviewer.name ?? 'Anonymous student',
      reviewerEmail: reviewer.email ?? '',
      rating,
      comment,
      createdAt: now,
    };
    storedReviews.unshift(newReview);
    setStoredReviews(storedReviews);
    return newReview;
  };

  const deleteReview = (reviewId) => {
    const user = getUser();
    if (!user) throw new Error('Not authenticated');

    const targetId = String(reviewId ?? '').trim();
    if (!targetId) throw new Error('Review ID is required');

    const storedReviews = getStoredReviews();
    const index = storedReviews.findIndex((review) => review?._id === targetId);
    if (index >= 0) {
      const review = storedReviews[index];
      if (review?.reviewerUserId !== user._id && !user.isAdmin) {
        throw new Error('Not authorized to delete this review');
      }
      storedReviews.splice(index, 1);
      setStoredReviews(storedReviews);
      return true;
    }

    const isDemoReview = DEMO_REVIEWS.some((review) => review._id === targetId);
    if (!isDemoReview) return false;
    if (!user.isAdmin) throw new Error('Only admins can hide demo reviews');

    const hiddenIds = getHiddenDemoReviewIds();
    if (!hiddenIds.includes(targetId)) {
      hiddenIds.push(targetId);
      setHiddenDemoReviewIds(hiddenIds);
    }
    return true;
  };

  const getAdminUsersLocal = () => {
    const users = getStoredUsersIndex();
    return users.sort((a, b) => new Date(b.lastSeenAt ?? 0).getTime() - new Date(a.lastSeenAt ?? 0).getTime());
  };

  const getAdminServicesLocal = () => getAllServices();
  const getAdminReviewsLocal = () => getAllReviews();

  const getAdminStatsLocal = () => {
    const users = getAdminUsersLocal();
    const services = getAdminServicesLocal();
    const reviews = getAdminReviewsLocal();
    const now = Date.now();
    const activeUsers = users.filter((user) => (now - new Date(user.lastSeenAt ?? 0).getTime()) <= (1000 * 60 * 60 * 24 * 7)).length;
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + Number(review?.rating ?? 0), 0) / reviews.length
      : 0;

    return {
      usersCount: users.length,
      activeUsers,
      servicesCount: services.length,
      reviewsCount: reviews.length,
      buyersCount: services.filter((service) => service?.listingType === 'buyer').length,
      sellersCount: services.filter((service) => service?.listingType !== 'buyer').length,
      averageRating: Number.isFinite(averageRating) ? averageRating : 0,
    };
  };

  const setUserAdminLocal = (userId, enabled) => {
    const users = getStoredUsersIndex();
    const index = users.findIndex((item) => item?._id === userId);
    if (index === -1) throw new Error('User not found');

    users[index] = {
      ...users[index],
      isAdmin: Boolean(enabled),
      updatedAt: new Date().toISOString(),
    };
    setStoredUsersIndex(users);

    const current = getUser();
    if (current?._id === userId) {
      setUser({
        ...current,
        isAdmin: Boolean(enabled),
      });
    }
    return users[index];
  };

  const setUserSuspendedLocal = (userId, enabled, reason = '') => {
    const cleanReason = String(reason ?? '').trim();
    const users = getStoredUsersIndex();
    const index = users.findIndex((item) => item?._id === userId);
    if (index === -1) throw new Error('User not found');

    users[index] = {
      ...users[index],
      isSuspended: Boolean(enabled),
      suspensionReason: Boolean(enabled) ? cleanReason : '',
      updatedAt: new Date().toISOString(),
    };
    setStoredUsersIndex(users);

    const current = getUser();
    if (current?._id === userId) {
      setUser({
        ...current,
        isSuspended: Boolean(enabled),
        suspensionReason: Boolean(enabled) ? cleanReason : '',
      });
    }
    return users[index];
  };

  const adminDeleteUserLocal = (userId) => {
    const currentUser = getUser();
    if (!currentUser?.isAdmin) throw new Error('Admin access required');

    const targetId = String(userId ?? '').trim();
    if (!targetId) throw new Error('User ID is required');
    if (currentUser?._id === targetId) throw new Error('You cannot delete your own account');

    const users = getStoredUsersIndex();
    const index = users.findIndex((item) => item?._id === targetId);
    if (index === -1) throw new Error('User not found');

    users.splice(index, 1);
    setStoredUsersIndex(users);

    const storedServices = getStoredServices();
    const removedServiceIds = storedServices
      .filter((service) => service?.user?._id === targetId)
      .map((service) => service._id);
    const remainingServices = storedServices.filter((service) => service?.user?._id !== targetId);
    setStoredServices(remainingServices);

    const storedReviews = getStoredReviews();
    const filteredReviews = storedReviews.filter((review) => {
      const byUser = String(review?.reviewerUserId ?? '') === targetId;
      const aboutUser = String(review?.studentId ?? '') === targetId;
      const forService = removedServiceIds.includes(review?.serviceId);
      return !(byUser || aboutUser || forService);
    });
    setStoredReviews(filteredReviews);

    return true;
  };

  const adminDeleteServiceLocal = (serviceId) => {
    const user = getUser();
    if (!user?.isAdmin) throw new Error('Admin access required');

    const targetId = String(serviceId ?? '').trim();
    if (!targetId) throw new Error('Service ID is required');

    const storedServices = getStoredServices();
    const storedIndex = storedServices.findIndex((service) => service?._id === targetId);
    if (storedIndex >= 0) {
      storedServices.splice(storedIndex, 1);
      setStoredServices(storedServices);
    } else {
      const isDemo = DEMO_SERVICES.some((service) => service._id === targetId);
      if (!isDemo) return false;
      const hiddenIds = getHiddenDemoServiceIds();
      if (!hiddenIds.includes(targetId)) {
        hiddenIds.push(targetId);
        setHiddenDemoServiceIds(hiddenIds);
      }
    }

    const storedReviews = getStoredReviews().filter((review) => review?.serviceId !== targetId);
    setStoredReviews(storedReviews);

    const demoReviewsToHide = DEMO_REVIEWS.filter((review) => review?.serviceId === targetId).map((review) => review._id);
    if (demoReviewsToHide.length) {
      const hiddenReviewIds = getHiddenDemoReviewIds();
      const mergedHiddenIds = Array.from(new Set([...hiddenReviewIds, ...demoReviewsToHide]));
      setHiddenDemoReviewIds(mergedHiddenIds);
    }

    return true;
  };

  const adminDeleteReviewLocal = (reviewId) => {
    const user = getUser();
    if (!user?.isAdmin) throw new Error('Admin access required');
    return deleteReview(reviewId);
  };

  const resetLocalDemoData = () => {
    const currentUser = getUser();
    storageRemove(SERVICES_KEY);
    storageRemove(REVIEWS_KEY);
    storageRemove(USERS_INDEX_KEY);
    storageRemove(HIDDEN_DEMO_SERVICES_KEY);
    storageRemove(HIDDEN_DEMO_REVIEWS_KEY);

    if (currentUser) setUser(currentUser);
    return true;
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

  const apiUpdatePassword = async (payload) => {
    return apiRequest('/auth/password', {
      method: 'PUT',
      body: payload,
    });
  };

  const apiGetUserById = async (id) => {
    if (!id) throw new Error('User ID is required');
    return apiRequest(`/users/${encodeURIComponent(id)}`, { auth: false });
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

  const apiGetReviewsForUser = async (studentId) => {
    if (!studentId) throw new Error('Student ID is required');
    return apiRequest(`/reviews/user/${encodeURIComponent(studentId)}`, { auth: false });
  };

  const apiCreateReview = async (payload) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: payload,
    });
  };

  const apiDeleteReview = async (reviewId) => {
    if (!reviewId) throw new Error('Review ID is required');
    await apiRequest(`/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
    });
    return true;
  };

  const apiCreateReport = async (payload) => {
    return apiRequest('/reports', {
      method: 'POST',
      body: payload,
    });
  };

  const apiCreateJob = async (payload) => {
    return apiRequest('/jobs', {
      method: 'POST',
      body: payload,
    });
  };

  const apiGetMyJobs = async (filters = {}) => {
    const query = buildQueryString(filters);
    return apiRequest(`/jobs/my${query}`);
  };

  const apiUpdateJobStatus = async (jobId, status) => {
    if (!jobId) throw new Error('Job ID is required');
    return apiRequest(`/jobs/${encodeURIComponent(jobId)}/status`, {
      method: 'PUT',
      body: { status },
    });
  };

  const apiGetAdminStats = async () => apiRequest('/admin/stats');
  const apiGetAdminUsers = async () => apiRequest('/admin/users');
  const apiGetAdminServices = async () => apiRequest('/admin/services');
  const apiGetAdminReviews = async () => apiRequest('/admin/reviews');

  const apiSetUserAdmin = async (userId, enabled) => {
    if (!userId) throw new Error('User ID is required');
    return apiRequest(`/admin/users/${encodeURIComponent(userId)}/role`, {
      method: 'PUT',
      body: { isAdmin: Boolean(enabled) },
    });
  };

  const apiSetUserSuspended = async (userId, enabled, reason = '') => {
    if (!userId) throw new Error('User ID is required');
    return apiRequest(`/admin/users/${encodeURIComponent(userId)}/suspend`, {
      method: 'PUT',
      body: { isSuspended: Boolean(enabled), reason: String(reason ?? '').trim() },
    });
  };

  const apiAdminDeleteService = async (serviceId) => {
    if (!serviceId) throw new Error('Service ID is required');
    await apiRequest(`/admin/services/${encodeURIComponent(serviceId)}`, {
      method: 'DELETE',
    });
    return true;
  };

  const apiAdminDeleteUser = async (userId) => {
    if (!userId) throw new Error('User ID is required');
    await apiRequest(`/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    return true;
  };

  const apiAdminDeleteReview = async (reviewId) => {
    if (!reviewId) throw new Error('Review ID is required');
    await apiRequest(`/admin/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
    });
    return true;
  };

  const refreshIcons = () => {
    if (window.lucide?.createIcons) window.lucide.createIcons();
  };

  const getThemePreference = () => {
    const saved = storageGet(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  };

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    storageSet(THEME_KEY, isDark ? 'dark' : 'light');

    document.querySelectorAll('[data-theme-icon]').forEach((iconHost) => {
      iconHost.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    });
    refreshIcons();
  };

  const toggleTheme = () => {
    applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  };

  const showToast = (message, type = 'neutral') => {
    let container = document.getElementById('shhub-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'shhub-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-500 text-white shadow-emerald-500/20',
      error: 'bg-rose-600 text-white shadow-rose-600/20',
      neutral: 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-slate-900/10',
    };
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';

    toast.className = `toast flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${colors[type] || colors.neutral}`;
    toast.innerHTML = `
      <i data-lucide="${icon}" class="h-5 w-5 shrink-0"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide?.createIcons) window.lucide.createIcons();

    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
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
    const adminLink = user?.isAdmin ? navLink('admin.html', 'shield-check', 'Admin', isMobile) : '';

    if (user) {
      return [
        browse,
        navLink('create-service.html', 'plus-circle', 'Post Service', isMobile),
        navLink('dashboard.html', 'layout-dashboard', 'Dashboard', isMobile),
        adminLink,
        supportLink(isMobile),
        `<button type="button" data-action="logout" class="${buttonClass('danger', isMobile)}"><i data-lucide="log-out" class="h-4 w-4"></i>Logout</button>`,
      ].filter(Boolean).join('');
    }

    return [
      browse,
      navLink('login.html', 'log-in', 'Login', isMobile),
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
    const user = getUser();

    const footer = document.createElement('footer');
    footer.id = 'app-footer';
    footer.className = 'floating-footer-shell fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-4 sm:pb-4';

    const quickLinks = [
      `<a href="index.html" class="${linkClass(false, getCurrentPage() === 'index.html')}">Browse</a>`,
      `<a href="terms.html" class="${linkClass(false, getCurrentPage() === 'terms.html')}">Terms</a>`,
      `<a href="guidelines.html" class="${linkClass(false, getCurrentPage() === 'guidelines.html')}">Guidelines</a>`,
      user ? `<a href="dashboard.html" class="${linkClass(false, getCurrentPage() === 'dashboard.html')}">Dashboard</a>` : `<a href="login.html" class="${linkClass(false, getCurrentPage() === 'login.html')}">Login</a>`,
      user ? `<a href="create-service.html" class="${linkClass(false, getCurrentPage() === 'create-service.html')}">Post Service</a>` : `<a href="register.html" class="${buttonClass('primary', false)}">Register</a>`,
      user?.isAdmin ? `<a href="admin.html" class="${linkClass(false, getCurrentPage() === 'admin.html')}">Admin</a>` : '',
    ].filter(Boolean).join('');

    footer.innerHTML = `
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
                ${quickLinks}
              </div>
              <a href="${SUPPORT_LINK}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600">
                <i data-lucide="message-circle" class="h-4 w-4"></i>
                <span class="sm:hidden">Help</span>
                <span class="hidden sm:inline">Help WhatsApp ${SUPPORT_NUMBER_LOCAL}</span>
              </a>
            </div>
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
    const activeUser = getUser();
    if (activeUser) setUser(activeUser);
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
    showToast,
    getAllServices,
    getServiceById,
    createService,
    addServiceToLocalCache,
    getMyServices,
    deleteService,
    updateService,
    updateProfile,
    getAllReviews,
    getReviewsForUser,
    getRatingSummaryForUser,
    addReview,
    deleteReview,
    findUserByEmailLocal,
    getUserByIdLocal,
    getFavorites,
    isFavorite,
    toggleFavorite,
    getAdminStatsLocal,
    getAdminUsersLocal,
    getAdminServicesLocal,
    getAdminReviewsLocal,
    setUserAdminLocal,
    setUserSuspendedLocal,
    adminDeleteUserLocal,
    adminDeleteServiceLocal,
    adminDeleteReviewLocal,
    resetLocalDemoData,
    formatKES,
    getApiBaseUrl,
    setApiBaseUrl,
    isApiMode,
    apiLogin,
    apiRegister,
    apiGetProfile,
    apiUpdateProfile,
    apiUpdatePassword,
    apiGetUserById,
    apiGetServices,
    apiGetServiceById,
    apiGetMyServices,
    apiCreateService,
    apiUpdateService,
    apiDeleteService,
    apiGetReviewsForUser,
    apiCreateReview,
    apiDeleteReview,
    apiCreateReport,
    apiCreateJob,
    apiGetMyJobs,
    apiUpdateJobStatus,
    apiGetAdminStats,
    apiGetAdminUsers,
    apiGetAdminServices,
    apiGetAdminReviews,
    apiSetUserAdmin,
    apiSetUserSuspended,
    apiAdminDeleteUser,
    apiAdminDeleteService,
    apiAdminDeleteReview,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
