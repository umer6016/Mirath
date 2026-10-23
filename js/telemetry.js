/**
 * ==============================================================================
 * MIRATH (ميراث) — VISITOR TELEMETRY & INTELLIGENCE ENGINE
 * ==============================================================================
 * Tracks IP address, Geolocation, ISP, Device Fingerprint, Hardware Specs,
 * Screen Resolution, Language, Referrer, Navigation, and Session Analytics.
 * Stores data locally in localStorage with real-time sync to Supabase.
 */

const Telemetry = {
  config: {
    storageKey: 'mirath_telemetry_logs',
    eventsStorageKey: 'mirath_telemetry_events',
    maxLocalLogs: 200,
    maxLocalEvents: 500,
    ipApiUrl: 'https://ipwho.is/'
  },

  state: {
    visitorId: '',
    sessionId: '',
    visitCount: 1,
    currentSession: null,
    sessionStartTime: Date.now(),
    pageviewsCount: 1,
    activeSeconds: 0,
    timerInterval: null,
    isInitialized: false
  },

  /**
   * Initialize telemetry tracking on page load
   */
  async init() {
    if (this.state.isInitialized) return;
    this.state.isInitialized = true;

    // 1. Setup persistent visitor ID and session ID
    this.setupIdentity();

    // 2. Gather device, browser, hardware, and environment specs
    const deviceSpecs = this.collectDeviceSpecs();

    // 3. Assemble initial session record
    const record = {
      id: 'session-' + this.state.sessionId,
      visitor_id: this.state.visitorId,
      session_id: this.state.sessionId,
      visit_count: this.state.visitCount,
      timestamp: new Date().toISOString(),
      updated_at: new Date().toISOString(),

      // Network & Geolocation (populated async below)
      ip: 'Detecting...',
      ip_type: 'IPv4',
      continent: 'Detecting...',
      continent_code: '',
      country: 'Detecting...',
      country_code: '',
      flag_emoji: '🌐',
      region: 'Detecting...',
      city: 'Detecting...',
      postal: '',
      latitude: null,
      longitude: null,
      isp: 'Detecting...',
      org: 'Detecting...',
      asn: '',
      timezone_geo: '',

      // High-accuracy GPS location (populated when browser location permission granted)
      has_exact_gps: false,
      exact_latitude: null,
      exact_longitude: null,
      exact_accuracy: null,
      exact_altitude: null,
      qibla_bearing: null,
      qibla_distance_km: null,

      // Device & Browser
      ...deviceSpecs,

      // Session & Navigation metrics
      referrer: (typeof document !== 'undefined' && document.referrer) || 'Direct / Bookmark',
      landing_page: (typeof window !== 'undefined' && window.location && window.location.href) || '/',
      current_path: (typeof window !== 'undefined' && window.location) ? (window.location.pathname + window.location.hash) : '/',
      pageviews: 1,
      session_duration_seconds: 0,
      synced_to_supabase: false,

      // Rich visitor intelligence metadata
      metadata: {
        gpu: {
          vendor: deviceSpecs.gpu_vendor,
          renderer: deviceSpecs.gpu_renderer
        },
        battery: {
          level: null,
          charging: null
        },
        display: {
          color_depth: deviceSpecs.color_depth,
          pixel_ratio: deviceSpecs.pixel_ratio,
          orientation: deviceSpecs.screen_orientation,
          hdr_supported: deviceSpecs.hdr_supported,
          color_gamut: deviceSpecs.color_gamut,
          prefers_dark: deviceSpecs.prefers_dark_mode
        },
        network: {
          connection_type: deviceSpecs.connection_type,
          downlink: deviceSpecs.connection_downlink,
          rtt: deviceSpecs.connection_rtt,
          save_data: deviceSpecs.connection_save_data
        },
        locale: {
          timezone: deviceSpecs.client_timezone,
          utc_offset: deviceSpecs.client_utc_offset,
          local_time: deviceSpecs.client_local_time,
          calendar: deviceSpecs.calendar_system,
          numbering: deviceSpecs.numbering_system
        },
        attribution: {
          traffic_source: deviceSpecs.traffic_source,
          referrer_domain: deviceSpecs.referrer_domain,
          utm: deviceSpecs.utm_parameters
        },
        performance: {
          page_load_ms: deviceSpecs.page_load_ms,
          dom_interactive_ms: deviceSpecs.dom_interactive_ms
        },
        capabilities: {
          webassembly: deviceSpecs.webassembly_supported,
          cookies: deviceSpecs.cookies_enabled,
          max_touch_points: deviceSpecs.max_touch_points,
          do_not_track: deviceSpecs.do_not_track
        }
      }
    };

    this.state.currentSession = record;
    this.saveSessionLocally(record);

    // Battery Status API (async, non-blocking)
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      navigator.getBattery().then(b => {
        if (this.state.currentSession) {
          const lvl = Math.round(b.level * 100);
          this.state.currentSession.battery_level = lvl;
          this.state.currentSession.is_charging = b.charging;
          if (this.state.currentSession.metadata) {
            this.state.currentSession.metadata.battery = {
              level: lvl,
              charging: b.charging
            };
          }
          this.saveSessionLocally(this.state.currentSession);
        }
      }).catch(() => {});
    }

    // 4. Start heartbeat timer for active session duration
    this.startHeartbeat();

    // 5. Fetch IP & Geolocation asynchronously (non-blocking)
    await this.fetchIpAndGeo();

    // 6. Send to Supabase if configured
    await this.syncSessionToSupabase(this.state.currentSession);

    // 7. Attach unload handler to persist final duration
    this.bindLifecycleEvents();
  },

  /**
   * Setup or retrieve persistent visitor ID & session ID
   */
  setupIdentity() {
    // Visitor ID (permanent in localStorage)
    let vid = localStorage.getItem('mirath_vid');
    if (!vid) {
      vid = 'vid_' + this.generateUUID();
      localStorage.setItem('mirath_vid', vid);
    }
    this.state.visitorId = vid;

    // Visit counter
    let visits = parseInt(localStorage.getItem('mirath_visit_count') || '0', 10) + 1;
    localStorage.setItem('mirath_visit_count', visits.toString());
    this.state.visitCount = visits;

    // Session ID (per tab in sessionStorage)
    let sid = sessionStorage.getItem('mirath_sid');
    if (!sid) {
      sid = 'sid_' + this.generateUUID();
      sessionStorage.setItem('mirath_sid', sid);
    }
    this.state.sessionId = sid;
  },

  /**
   * Generate RFC4122 v4 compliant UUID
   */
  generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * Collect hardware, browser, screen, and system fingerprint specs
   */
  collectDeviceSpecs() {
    const ua = navigator.userAgent || '';
    
    // Browser detection
    let browser = 'Unknown Browser';
    let browserVersion = '';
    if (/edg\/([\d.]+)/i.test(ua)) {
      browser = 'Microsoft Edge';
      browserVersion = RegExp.$1;
    } else if (/opr\/([\d.]+)|opera/i.test(ua)) {
      browser = 'Opera';
      browserVersion = RegExp.$1;
    } else if (/chrome|crios/i.test(ua)) {
      browser = 'Google Chrome';
      browserVersion = (ua.match(/(?:chrome|crios)\/([\d.]+)/i) || [])[1] || '';
    } else if (/firefox|fxios/i.test(ua)) {
      browser = 'Mozilla Firefox';
      browserVersion = (ua.match(/(?:firefox|fxios)\/([\d.]+)/i) || [])[1] || '';
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
      browser = 'Apple Safari';
      browserVersion = (ua.match(/version\/([\d.]+)/i) || [])[1] || '';
    } else if (/samsungbrowser\/([\d.]+)/i.test(ua)) {
      browser = 'Samsung Internet';
      browserVersion = RegExp.$1;
    }

    // OS detection
    let os = 'Unknown OS';
    if (/windows nt 10.0/i.test(ua)) os = 'Windows 10 / 11';
    else if (/windows nt 6.3/i.test(ua)) os = 'Windows 8.1';
    else if (/windows nt 6.1/i.test(ua)) os = 'Windows 7';
    else if (/macintosh|mac os x/i.test(ua)) {
      os = /ipad|iphone|ipod/i.test(ua) ? 'iOS' : 'macOS';
    } else if (/android/i.test(ua)) os = 'Android';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/cros/i.test(ua)) os = 'ChromeOS';

    // Device type
    let deviceType = 'Desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      deviceType = 'Tablet';
    } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(ua)) {
      deviceType = 'Mobile';
    }

    // GPU Hardware Detection via WebGL unmasked renderer
    let gpuRenderer = 'N/A';
    let gpuVendor = 'N/A';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'N/A';
          gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'N/A';
        }
      }
    } catch (_) {}

    // Hardware & display
    const screenRes = typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'N/A';
    const viewport = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A';
    const colorDepth = typeof screen !== 'undefined' ? `${screen.colorDepth}-bit` : 'N/A';
    const pixelRatio = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    const cpuCores = navigator.hardwareConcurrency || 'N/A';
    const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'N/A';
    const touch = Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    
    // Network & connection metrics
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const connType = conn ? conn.effectiveType || conn.type || 'N/A' : 'N/A';
    const connDownlink = conn && conn.downlink ? `${conn.downlink} Mbps` : 'N/A';
    const connRtt = conn && conn.rtt ? `${conn.rtt} ms` : 'N/A';
    const connSaveData = Boolean(conn && conn.saveData);

    // Locale & Timezone
    const lang = navigator.language || 'en';
    const languages = navigator.languages ? navigator.languages.join(', ') : lang;
    const tzOptions = (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions() : {};
    const timezone = tzOptions.timeZone || 'UTC';
    const calendar = tzOptions.calendar || 'gregory';
    const numberingSystem = tzOptions.numberingSystem || 'latn';
    const offsetMin = new Date().getTimezoneOffset();
    const utcOffset = (offsetMin <= 0 ? '+' : '-') + String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0') + ':' + String(Math.abs(offsetMin) % 60).padStart(2, '0');
    const localTimeStr = new Date().toLocaleTimeString();

    // Display & Graphics capabilities
    const screenOrientation = (typeof screen !== 'undefined' && screen.orientation) ? screen.orientation.type : (typeof window !== 'undefined' && window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    const isHdr = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(dynamic-range: high)').matches;
    const isDarkMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isP3Gamut = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(color-gamut: p3)').matches;
    const colorGamut = isP3Gamut ? 'Wide Gamut (Display P3)' : 'Standard (sRGB)';

    // Traffic Source & UTM Attribution
    const ref = (typeof document !== 'undefined' && document.referrer) || '';
    let trafficSource = 'Direct Navigation';
    let referrerDomain = '';
    if (ref) {
      try {
        const url = new URL(ref);
        referrerDomain = url.hostname;
        if (/google\./i.test(referrerDomain)) trafficSource = 'Google Search (Organic)';
        else if (/bing\./i.test(referrerDomain)) trafficSource = 'Bing Search';
        else if (/yahoo\./i.test(referrerDomain)) trafficSource = 'Yahoo Search';
        else if (/duckduckgo\./i.test(referrerDomain)) trafficSource = 'DuckDuckGo';
        else if (/instagram\.com/i.test(referrerDomain)) trafficSource = 'Instagram';
        else if (/(twitter|t\.co|x\.com)/i.test(referrerDomain)) trafficSource = 'X (Twitter)';
        else if (/facebook\.com/i.test(referrerDomain)) trafficSource = 'Facebook';
        else if (/tiktok\.com/i.test(referrerDomain)) trafficSource = 'TikTok';
        else if (/reddit\.com/i.test(referrerDomain)) trafficSource = 'Reddit';
        else if (/youtube\.com/i.test(referrerDomain)) trafficSource = 'YouTube';
        else if (/whatsapp/i.test(referrerDomain)) trafficSource = 'WhatsApp';
        else if (/telegram/i.test(referrerDomain)) trafficSource = 'Telegram';
        else trafficSource = `Referral (${referrerDomain})`;
      } catch (_) {
        trafficSource = 'Referral';
      }
    }

    // UTM query parameter parsing
    const utm = {};
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      try {
        const params = new URLSearchParams(window.location.search);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => {
          if (params.has(k)) utm[k] = params.get(k);
        });
      } catch (_) {}
    }

    // Performance Timing
    let pageLoadMs = null;
    let domInteractiveMs = null;
    try {
      if (typeof performance !== 'undefined') {
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries && navEntries.length > 0) {
          pageLoadMs = Math.round(navEntries[0].duration);
          domInteractiveMs = Math.round(navEntries[0].domInteractive);
        } else if (performance.timing) {
          pageLoadMs = performance.timing.loadEventEnd ? (performance.timing.loadEventEnd - performance.timing.navigationStart) : null;
        }
      }
    } catch (_) {}

    const webassemblySupported = typeof WebAssembly === 'object';
    const cookiesEnabled = typeof navigator !== 'undefined' ? navigator.cookieEnabled : true;
    const doNotTrack = (typeof navigator !== 'undefined' && (navigator.doNotTrack || window.doNotTrack)) ? 'Enabled' : 'Disabled';

    return {
      browser,
      browser_version: browserVersion,
      os,
      device_type: deviceType,
      user_agent: ua,
      screen_resolution: screenRes,
      viewport,
      color_depth: colorDepth,
      pixel_ratio: pixelRatio,
      cpu_cores: cpuCores,
      device_memory: memory,
      touch_support: touch,
      max_touch_points: maxTouchPoints,
      connection_type: connType,
      connection_downlink: connDownlink,
      connection_rtt: connRtt,
      connection_save_data: connSaveData,
      language: lang,
      languages: languages,
      client_timezone: timezone,
      client_utc_offset: utcOffset,
      client_local_time: localTimeStr,
      calendar_system: calendar,
      numbering_system: numberingSystem,
      screen_orientation: screenOrientation,
      hdr_supported: isHdr,
      color_gamut: colorGamut,
      prefers_dark_mode: isDarkMode,
      prefers_reduced_motion: isReducedMotion,
      gpu_renderer: gpuRenderer,
      gpu_vendor: gpuVendor,
      traffic_source: trafficSource,
      referrer_domain: referrerDomain,
      utm_parameters: utm,
      page_load_ms: pageLoadMs,
      dom_interactive_ms: domInteractiveMs,
      webassembly_supported: webassemblySupported,
      cookies_enabled: cookiesEnabled,
      do_not_track: doNotTrack
    };
  },

  /**
   * Fetch IP address and Geolocation details
   */
  async fetchIpAndGeo() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const resp = await fetch(this.config.ipApiUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.success !== false) {
          this.applyGeoData(data);
          return;
        }
      }
    } catch (e) {
      console.warn('Primary IP Geo API unavailable:', e.message);
    }

    // Secondary fallback for public IP
    try {
      const fallbackResp = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
      if (fallbackResp.ok) {
        const fbData = await fallbackResp.json();
        if (fbData && fbData.ip && this.state.currentSession) {
          this.state.currentSession.ip = fbData.ip;
          this.saveSessionLocally(this.state.currentSession);
        }
      }
    } catch (_) {}
  },

  /**
   * Map Geo API data to session record
   */
  applyGeoData(data) {
    if (!this.state.currentSession) return;
    const s = this.state.currentSession;

    s.ip = data.ip || s.ip;
    s.ip_type = data.type || 'IPv4';
    s.continent = data.continent || 'N/A';
    s.continent_code = data.continent_code || '';
    s.country = data.country || 'N/A';
    s.country_code = data.country_code || '';
    s.flag_emoji = (data.flag && data.flag.emoji) ? data.flag.emoji : '🌐';
    s.flag_img = (data.flag && data.flag.img) ? data.flag.img : '';
    s.region = data.region || 'N/A';
    s.city = data.city || 'N/A';
    s.postal = data.postal || '';
    s.latitude = data.latitude || null;
    s.longitude = data.longitude || null;
    s.isp = (data.connection && (data.connection.isp || data.connection.org)) || 'N/A';
    s.org = (data.connection && data.connection.org) || 'N/A';
    s.asn = (data.connection && data.connection.asn) || '';
    s.timezone_geo = (data.timezone && data.timezone.id) || '';
    s.utc_offset = (data.timezone && data.timezone.utc) || '';

    this.saveSessionLocally(s);
  },

  /**
   * Apply exact GPS coordinates from browser Geolocation API
   */
  applyExactGps(coords, qiblaBearing = null, qiblaDistance = null) {
    if (!coords || !this.state.currentSession) return;
    const s = this.state.currentSession;
    s.has_exact_gps = true;
    s.exact_latitude = coords.latitude;
    s.exact_longitude = coords.longitude;
    s.exact_accuracy = coords.accuracy ? Math.round(coords.accuracy) : null;
    s.exact_altitude = coords.altitude ? Math.round(coords.altitude) : null;
    // Overwrite primary coordinates with exact GPS
    s.latitude = coords.latitude;
    s.longitude = coords.longitude;
    if (qiblaBearing !== null && qiblaBearing !== undefined) {
      s.qibla_bearing = parseFloat(Number(qiblaBearing).toFixed(2));
    }
    if (qiblaDistance !== null && qiblaDistance !== undefined) {
      s.qibla_distance_km = Math.round(qiblaDistance);
    }
    s.updated_at = new Date().toISOString();

    this.saveSessionLocally(s);
    this.syncSessionToSupabase(s);
    this.logEvent('location', 'gps_granted', `Accuracy ±${s.exact_accuracy}m`, {
      latitude: s.exact_latitude,
      longitude: s.exact_longitude,
      accuracy: s.exact_accuracy,
      qibla_bearing: s.qibla_bearing,
      qibla_distance_km: s.qibla_distance_km
    });
  },

  /**
   * Save or update session record in localStorage
   */
  saveSessionLocally(sessionRecord) {
    try {
      const raw = localStorage.getItem(this.config.storageKey);
      let logs = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(logs)) logs = [];

      const idx = logs.findIndex(item => item.session_id === sessionRecord.session_id);
      if (idx >= 0) {
        logs[idx] = { ...logs[idx], ...sessionRecord };
      } else {
        logs.unshift(sessionRecord);
      }

      // Limit stored sessions
      if (logs.length > this.config.maxLocalLogs) {
        logs = logs.slice(0, this.config.maxLocalLogs);
      }

      localStorage.setItem(this.config.storageKey, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save telemetry locally:', e);
    }
  },

  /**
   * Retrieve all saved telemetry logs
   */
  getLogs() {
    try {
      const raw = localStorage.getItem(this.config.storageKey);
      const logs = raw ? JSON.parse(raw) : [];
      return Array.isArray(logs) ? logs : [];
    } catch (_) {
      return [];
    }
  },

  /**
   * Retrieve aggregate statistics from collected logs
   */
  getStats() {
    const logs = this.getLogs();
    const totalSessions = logs.length;
    const uniqueIPs = new Set(logs.map(l => l.ip).filter(ip => ip && !ip.includes('Detecting'))).size;
    const uniqueVisitors = new Set(logs.map(l => l.visitor_id)).size;
    const exactGpsSessions = logs.filter(l => l.has_exact_gps).length;

    // Device breakdown
    const devices = { Mobile: 0, Tablet: 0, Desktop: 0 };
    const countries = {};
    const browsers = {};
    const oses = {};
    const gpus = {};
    const trafficSources = {};

    logs.forEach(l => {
      if (devices[l.device_type] !== undefined) devices[l.device_type]++;
      if (l.country && l.country !== 'Detecting...') {
        const countryKey = `${l.flag_emoji || ''} ${l.country}`.trim();
        countries[countryKey] = (countries[countryKey] || 0) + 1;
      }
      if (l.browser) {
        browsers[l.browser] = (browsers[l.browser] || 0) + 1;
      }
      if (l.os) {
        oses[l.os] = (oses[l.os] || 0) + 1;
      }
      const gpu = (l.metadata && l.metadata.gpu && l.metadata.gpu.renderer) || l.gpu_renderer;
      if (gpu && gpu !== 'N/A') {
        const cleanGpu = gpu.replace(/^ANGLE \((.+)\)$/, '$1').trim();
        gpus[cleanGpu] = (gpus[cleanGpu] || 0) + 1;
      }
      const traffic = (l.metadata && l.metadata.attribution && l.metadata.attribution.traffic_source) || l.traffic_source;
      if (traffic) {
        trafficSources[traffic] = (trafficSources[traffic] || 0) + 1;
      }
    });

    // Top country
    const sortedCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]);
    const topCountry = sortedCountries.length ? sortedCountries[0][0] : 'N/A';
    const sortedGpus = Object.entries(gpus).sort((a, b) => b[1] - a[1]);
    const topGpu = sortedGpus.length ? sortedGpus[0][0] : 'Standard GPU';
    const sortedTraffic = Object.entries(trafficSources).sort((a, b) => b[1] - a[1]);
    const topTraffic = sortedTraffic.length ? sortedTraffic[0][0] : 'Direct Navigation';

    return {
      totalSessions,
      uniqueIPs,
      uniqueVisitors,
      exactGpsSessions,
      devices,
      countries: sortedCountries,
      topCountry,
      browsers: Object.entries(browsers).sort((a, b) => b[1] - a[1]),
      oses: Object.entries(oses).sort((a, b) => b[1] - a[1]),
      gpus: sortedGpus,
      topGpu,
      trafficSources: sortedTraffic,
      topTraffic
    };
  },

  /**
   * Active heartbeat timer
   */
  startHeartbeat() {
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    this.state.timerInterval = setInterval(() => {
      this.state.activeSeconds += 10;
      if (this.state.currentSession) {
        this.state.currentSession.session_duration_seconds = this.state.activeSeconds;
        this.state.currentSession.updated_at = new Date().toISOString();
        this.saveSessionLocally(this.state.currentSession);
      }
    }, 10000);
  },

  /**
   * Log individual user actions / interactions
   */
  logEvent(category, action, label = '', metadata = {}) {
    const event = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      visitor_id: this.state.visitorId,
      session_id: this.state.sessionId,
      category,
      action,
      label,
      metadata,
      timestamp: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem(this.config.eventsStorageKey);
      let events = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(events)) events = [];
      events.unshift(event);
      if (events.length > this.config.maxLocalEvents) {
        events = events.slice(0, this.config.maxLocalEvents);
      }
      localStorage.setItem(this.config.eventsStorageKey, JSON.stringify(events));
    } catch (_) {}

    // Increment pageviews in current session if tab switch
    if (category === 'navigation' && this.state.currentSession) {
      this.state.pageviewsCount++;
      this.state.currentSession.pageviews = this.state.pageviewsCount;
      this.state.currentSession.current_path = (typeof window !== 'undefined' && window.location) ? (window.location.pathname + window.location.hash) : '/';
      this.saveSessionLocally(this.state.currentSession);
    }

    // Sync event to Supabase if configured
    this.syncEventToSupabase(event);
  },

  /**
   * Get Supabase credentials from local configuration or global config
   */
  getSupabaseConfig() {
    // 1. Check mirath_cloud_config in localStorage
    try {
      const cloudRaw = localStorage.getItem('mirath_cloud_config');
      if (cloudRaw) {
        const parsed = JSON.parse(cloudRaw);
        if (parsed && parsed.type === 'supabase' && parsed.url && parsed.key) {
          return { url: parsed.url.replace(/\/$/, ''), key: parsed.key };
        }
      }
    } catch (_) {}

    // 2. Check dedicated keys in localStorage
    const url = localStorage.getItem('mirath_supabase_url');
    const key = localStorage.getItem('mirath_supabase_key');
    if (url && key) {
      return { url: url.replace(/\/$/, ''), key };
    }

    // 3. Check window.MIRATH_CONFIG
    if (window.MIRATH_CONFIG && window.MIRATH_CONFIG.supabaseUrl && window.MIRATH_CONFIG.supabaseAnonKey) {
      return {
        url: window.MIRATH_CONFIG.supabaseUrl.replace(/\/$/, ''),
        key: window.MIRATH_CONFIG.supabaseAnonKey
      };
    }

    // 4. Default built-in Supabase credentials
    return {
      url: 'https://qhsryqtgkojmvulnkmfh.supabase.co',
      key: 'sb_publishable_66GHB0ToIeESgeSVcyeNQQ_fUQWtxpc'
    };
  },

  /**
   * Sync single visitor session to Supabase table
   */
  async syncSessionToSupabase(sessionRecord) {
    const creds = this.getSupabaseConfig();
    if (!creds || !creds.url || !creds.key) return false;

    try {
      const payload = {
        visitor_id: sessionRecord.visitor_id,
        session_id: sessionRecord.session_id,
        ip: sessionRecord.ip,
        ip_type: sessionRecord.ip_type,
        continent: sessionRecord.continent,
        continent_code: sessionRecord.continent_code,
        country: sessionRecord.country,
        country_code: sessionRecord.country_code,
        flag_emoji: sessionRecord.flag_emoji,
        region: sessionRecord.region,
        city: sessionRecord.city,
        postal: sessionRecord.postal,
        latitude: sessionRecord.latitude,
        longitude: sessionRecord.longitude,
        has_exact_gps: Boolean(sessionRecord.has_exact_gps),
        exact_latitude: sessionRecord.exact_latitude !== null && sessionRecord.exact_latitude !== undefined ? Number(sessionRecord.exact_latitude) : null,
        exact_longitude: sessionRecord.exact_longitude !== null && sessionRecord.exact_longitude !== undefined ? Number(sessionRecord.exact_longitude) : null,
        exact_accuracy: sessionRecord.exact_accuracy !== null && sessionRecord.exact_accuracy !== undefined ? Number(sessionRecord.exact_accuracy) : null,
        exact_altitude: sessionRecord.exact_altitude !== null && sessionRecord.exact_altitude !== undefined ? Number(sessionRecord.exact_altitude) : null,
        qibla_bearing: sessionRecord.qibla_bearing !== null && sessionRecord.qibla_bearing !== undefined ? Number(sessionRecord.qibla_bearing) : null,
        qibla_distance_km: sessionRecord.qibla_distance_km !== null && sessionRecord.qibla_distance_km !== undefined ? Number(sessionRecord.qibla_distance_km) : null,
        isp: sessionRecord.isp,
        org: sessionRecord.org,
        asn: sessionRecord.asn ? String(sessionRecord.asn) : '',
        timezone_geo: sessionRecord.timezone_geo,
        browser: sessionRecord.browser,
        browser_version: sessionRecord.browser_version,
        os: sessionRecord.os,
        device_type: sessionRecord.device_type,
        screen_resolution: sessionRecord.screen_resolution,
        viewport: sessionRecord.viewport,
        language: sessionRecord.language,
        languages: sessionRecord.languages,
        cpu_cores: sessionRecord.cpu_cores ? String(sessionRecord.cpu_cores) : '',
        device_memory: sessionRecord.device_memory,
        connection_type: sessionRecord.connection_type,
        touch_support: sessionRecord.touch_support,
        referrer: sessionRecord.referrer,
        landing_page: sessionRecord.landing_page,
        current_path: sessionRecord.current_path,
        visit_count: sessionRecord.visit_count,
        pageviews: sessionRecord.pageviews,
        session_duration_seconds: sessionRecord.session_duration_seconds,
        created_at: sessionRecord.timestamp,
        updated_at: new Date().toISOString()
      };

      // 1. First attempt to update existing session row if it already exists
      let patchUpdated = false;
      try {
        const patchRes = await fetch(`${creds.url}/rest/v1/visitor_telemetry?session_id=eq.${encodeURIComponent(sessionRecord.session_id)}`, {
          method: 'PATCH',
          headers: {
            'apikey': creds.key,
            'Authorization': `Bearer ${creds.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        });

        if (patchRes.ok) {
          const updatedRows = await patchRes.json();
          if (Array.isArray(updatedRows) && updatedRows.length > 0) {
            patchUpdated = true;
          }
        }
      } catch (_) {}

      // 2. If session doesn't exist yet in Supabase, INSERT it as a new record
      if (!patchUpdated) {
        const insertRes = await fetch(`${creds.url}/rest/v1/visitor_telemetry`, {
          method: 'POST',
          headers: {
            'apikey': creds.key,
            'Authorization': `Bearer ${creds.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });

        if (!insertRes.ok) {
          console.warn('Supabase visitor insert response:', insertRes.status, await insertRes.text());
          return false;
        }
      }

      sessionRecord.synced_to_supabase = true;
      this.saveSessionLocally(sessionRecord);

      // 3. Sync rich visitor intelligence metadata to analytics_events
      if (sessionRecord.metadata && !sessionRecord._fingerprint_synced) {
        sessionRecord._fingerprint_synced = true;
        const gpuName = sessionRecord.metadata.gpu ? sessionRecord.metadata.gpu.renderer : 'N/A';
        const netType = sessionRecord.metadata.network ? sessionRecord.metadata.network.connection_type : 'N/A';
        const traffic = sessionRecord.metadata.attribution ? sessionRecord.metadata.attribution.traffic_source : 'Direct';
        this.syncEventToSupabase({
          visitor_id: sessionRecord.visitor_id,
          session_id: sessionRecord.session_id,
          category: 'visitor_intelligence',
          action: 'session_fingerprint',
          label: `${sessionRecord.device_type} | ${traffic} | GPU: ${gpuName} | Net: ${netType}`,
          metadata: sessionRecord.metadata,
          timestamp: new Date().toISOString()
        });
      }

      return true;
    } catch (err) {
      console.warn('Supabase telemetry sync failed:', err);
      return false;
    }
  },

  /**
   * Sync event record to Supabase
   */
  async syncEventToSupabase(eventRecord) {
    const creds = this.getSupabaseConfig();
    if (!creds || !creds.url || !creds.key) return false;

    try {
      await fetch(`${creds.url}/rest/v1/analytics_events`, {
        method: 'POST',
        headers: {
          'apikey': creds.key,
          'Authorization': `Bearer ${creds.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          visitor_id: eventRecord.visitor_id,
          session_id: eventRecord.session_id,
          category: eventRecord.category,
          action: eventRecord.action,
          label: eventRecord.label,
          metadata: eventRecord.metadata,
          created_at: eventRecord.timestamp
        })
      });
    } catch (_) {}
  },

  /**
   * Sync all unsynced local logs to Supabase
   */
  async syncAllToSupabase() {
    const creds = this.getSupabaseConfig();
    if (!creds) {
      return { success: false, message: 'No Supabase credentials configured.' };
    }

    const logs = this.getLogs();
    if (!logs.length) {
      return { success: true, count: 0, message: 'No local logs to sync.' };
    }

    let synced = 0;
    for (const log of logs) {
      const ok = await this.syncSessionToSupabase(log);
      if (ok) synced++;
    }

    return {
      success: true,
      count: synced,
      total: logs.length,
      message: `Successfully synced ${synced} of ${logs.length} visitor records to Supabase!`
    };
  },

  /**
   * Bind unload events to send final duration
   */
  bindLifecycleEvents() {
    const finalizeSession = () => {
      if (this.state.currentSession) {
        this.state.currentSession.session_duration_seconds = this.state.activeSeconds;
        this.state.currentSession.updated_at = new Date().toISOString();
        this.saveSessionLocally(this.state.currentSession);

        const creds = this.getSupabaseConfig();
        if (creds && creds.url && creds.key && navigator.sendBeacon) {
          const payload = JSON.stringify({
            visitor_id: this.state.currentSession.visitor_id,
            session_id: this.state.currentSession.session_id,
            session_duration_seconds: this.state.activeSeconds,
            pageviews: this.state.currentSession.pageviews,
            updated_at: new Date().toISOString()
          });
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(`${creds.url}/rest/v1/visitor_telemetry?on_conflict=session_id`, blob);
        }
      }
    };

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('beforeunload', finalizeSession);
    }
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          finalizeSession();
        }
      });
    }
  },

  /**
   * Export all collected logs as CSV
   */
  exportCSV() {
    const logs = this.getLogs();
    if (!logs.length) {
      alert('No visitor logs collected yet.');
      return;
    }

    const headers = [
      'Timestamp',
      'IP Address',
      'IP Type',
      'Country',
      'Country Code',
      'Region',
      'City',
      'Postal Code',
      'Latitude',
      'Longitude',
      'Has Exact GPS',
      'Exact Latitude',
      'Exact Longitude',
      'GPS Accuracy (m)',
      'Qibla Bearing (deg)',
      'Qibla Distance (km)',
      'Google Maps Link',
      'ISP / Carrier',
      'Organization',
      'ASN',
      'Timezone',
      'Device Type',
      'Operating System',
      'Browser',
      'Browser Version',
      'Screen Resolution',
      'Viewport',
      'Color Depth',
      'CPU Cores',
      'Device RAM',
      'Connection Type',
      'Network Downlink',
      'Network RTT Latency',
      'GPU Hardware',
      'Battery Status',
      'Traffic Attribution',
      'Color Gamut',
      'HDR Display',
      'Touch Support',
      'Language',
      'Referrer',
      'Landing Page',
      'Visit Count',
      'Pageviews',
      'Session Duration (s)',
      'Visitor ID',
      'Session ID'
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = logs.map(l => [
      escapeCSV(l.timestamp),
      escapeCSV(l.ip),
      escapeCSV(l.ip_type),
      escapeCSV(l.country),
      escapeCSV(l.country_code),
      escapeCSV(l.region),
      escapeCSV(l.city),
      escapeCSV(l.postal),
      escapeCSV(l.latitude),
      escapeCSV(l.longitude),
      escapeCSV(l.has_exact_gps ? 'Yes (GPS)' : 'No (IP Geo)'),
      escapeCSV(l.exact_latitude !== null && l.exact_latitude !== undefined ? l.exact_latitude : (l.has_exact_gps ? l.latitude : '')),
      escapeCSV(l.exact_longitude !== null && l.exact_longitude !== undefined ? l.exact_longitude : (l.has_exact_gps ? l.longitude : '')),
      escapeCSV(l.exact_accuracy ? `±${l.exact_accuracy}m` : ''),
      escapeCSV(l.qibla_bearing ? `${l.qibla_bearing}°` : ''),
      escapeCSV(l.qibla_distance_km ? `${l.qibla_distance_km} km` : ''),
      escapeCSV(l.latitude && l.longitude ? `https://www.google.com/maps?q=${l.latitude},${l.longitude}` : ''),
      escapeCSV(l.isp),
      escapeCSV(l.org),
      escapeCSV(l.asn),
      escapeCSV(l.timezone_geo || l.client_timezone),
      escapeCSV(l.device_type),
      escapeCSV(l.os),
      escapeCSV(l.browser),
      escapeCSV(l.browser_version),
      escapeCSV(l.screen_resolution),
      escapeCSV(l.viewport),
      escapeCSV(l.color_depth),
      escapeCSV(l.cpu_cores),
      escapeCSV(l.device_memory),
      escapeCSV(l.connection_type),
      escapeCSV((l.metadata && l.metadata.network && l.metadata.network.downlink) || l.connection_downlink || 'N/A'),
      escapeCSV((l.metadata && l.metadata.network && l.metadata.network.rtt) || l.connection_rtt || 'N/A'),
      escapeCSV((l.metadata && l.metadata.gpu && l.metadata.gpu.renderer) || l.gpu_renderer || 'N/A'),
      escapeCSV(l.metadata && l.metadata.battery && l.metadata.battery.level !== null ? `${l.metadata.battery.level}% (${l.metadata.battery.charging ? 'Charging' : 'Battery'})` : (l.battery_level ? `${l.battery_level}%` : 'N/A')),
      escapeCSV((l.metadata && l.metadata.attribution && l.metadata.attribution.traffic_source) || l.traffic_source || 'Direct'),
      escapeCSV((l.metadata && l.metadata.display && l.metadata.display.color_gamut) || l.color_gamut || 'Standard'),
      escapeCSV((l.metadata && l.metadata.display && l.metadata.display.hdr_supported) ? 'Yes (HDR)' : 'SDR'),
      escapeCSV(l.touch_support ? 'Yes' : 'No'),
      escapeCSV(l.language),
      escapeCSV(l.referrer),
      escapeCSV(l.landing_page),
      escapeCSV(l.visit_count),
      escapeCSV(l.pageviews),
      escapeCSV(l.session_duration_seconds),
      escapeCSV(l.visitor_id),
      escapeCSV(l.session_id)
    ].join(','));

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mirath_visitor_intelligence_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export all collected logs as JSON
   */
  exportJSON() {
    const logs = this.getLogs();
    if (!logs.length) {
      alert('No visitor logs collected yet.');
      return;
    }

    const jsonContent = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mirath_visitor_intelligence_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Clear all local visitor logs
   */
  clearLocalLogs() {
    localStorage.removeItem(this.config.storageKey);
    localStorage.removeItem(this.config.eventsStorageKey);
  }
};

// Start telemetry tracking immediately when DOM is ready or executing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    Telemetry.init().catch(err => console.warn('Telemetry init issue:', err));
  });
} else {
  Telemetry.init().catch(err => console.warn('Telemetry init issue:', err));
}

window.Telemetry = Telemetry;
