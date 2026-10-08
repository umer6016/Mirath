/**
 * MIRATH (ميراث) - Main Application Controller
 * Handles Navigation, Audio Player, Hifdh Mode, Interactive Tasbih, Zakat Calculator, Quiz, Bookmarks & Search.
 */

document.addEventListener('DOMContentLoaded', () => {
  const App = {
    state: {
      activeTab: 'home',
      currentSurahIndex: 0,
      currentSurahNumber: 1,
      quranViewMode: 'reader',
      surahDirectoryFilter: 'all',
      surahDirectorySearch: '',
      currentAyahIndex: 0,
      audioPlaying: false,
      audioLoopCount: 0,
      audioLoopMax: 1, // 1, 3, 5, 10, Infinity
      hifdhWordMask: false,
      hifdhHideTranslation: false,
      tasbihCount: 0,
      tasbihTarget: 33,
      tasbihDua: 'سُبْحَانَ اللَّهِ',
      tasbihMeaning: 'Glory be to Allah',
      bookmarks: JSON.parse(localStorage.getItem('mirath_bookmarks') || '[]'),
      memorizedAyahs: JSON.parse(localStorage.getItem('mirath_memorized') || '[]'),
      quizCurrentIndex: 0,
      quizScore: 0,
      quizAnswered: false,
      searchQuery: '',
      adminActiveSubTab: 'hadith',
      adminFilterCategory: 'all',
      adminUnlocked: localStorage.getItem('mirath_admin_auth') === 'true',
      adminPasscodeHash: localStorage.getItem('mirath_admin_hash') || '2f8d63c0748355b03107576bac17048321cc893e6fee836a3fa5cc1b3ab959aa',
      hideStudioFromNav: localStorage.getItem('mirath_hide_studio_nav') === 'true',
      cloudSyncConfig: JSON.parse(localStorage.getItem('mirath_cloud_config') || '{"type":"none","url":"","key":""}'),
      customData: {
        hadiths: [],
        duas: [],
        scholarQuotes: [],
        prophetStories: [],
        sahabah: [],
        quiz: []
      },
      detailModalState: {
        isOpen: false,
        type: null,
        id: null,
        index: 0,
        items: []
      }
    },

    elements: {},
    audio: new Audio(),
    audioContext: null,
    loadedSurahs: {},

    async init() {
      localStorage.removeItem('mirath_admin_pin');
      this.cacheElements();
      this.initSurahsCache();
      await this.loadCustomData();
      this.bindEvents();
      this.renderAll();
      this.renderSurahDirectory();
      this.calculateZakat();
      this.onQiblaCitySelected('karachi');
      this.updateAdminLockUI();
      this.applyNavVisibility();
      this.renderAdminCustomList();
      this.updateBookmarkBadge();
      this.setupGlobalKeyboard();
      console.log('Mirath Islamic Library initialized.');
    },

    cacheElements() {
      this.elements = {
        navTabs: document.querySelectorAll('[data-tab-target]'),
        tabContents: document.querySelectorAll('.tab-content-panel'),
        globalSearchInput: document.getElementById('globalSearchInput'),
        searchModal: document.getElementById('searchModal'),
        searchResultsContainer: document.getElementById('searchResultsContainer'),
        bookmarksModal: document.getElementById('bookmarksModal'),
        bookmarksList: document.getElementById('bookmarksList'),
        bookmarkBadge: document.getElementById('bookmarkCountBadge'),
        cardDetailModal: document.getElementById('cardDetailModal'),
        cardDetailBadges: document.getElementById('cardDetailBadges'),
        cardDetailContent: document.getElementById('cardDetailContent'),
        cardDetailFooter: document.getElementById('cardDetailFooter'),
        cardDetailPrevBtn: document.getElementById('cardDetailPrevBtn'),
        cardDetailNextBtn: document.getElementById('cardDetailNextBtn'),
        cardDetailBookmarkBtn: document.getElementById('cardDetailBookmarkBtn'),
        audioBar: document.getElementById('audioPlayerBar'),
        audioPlayBtn: document.getElementById('audioPlayBtn'),
        audioSurahTitle: document.getElementById('audioSurahTitle'),
        audioAyahInfo: document.getElementById('audioAyahInfo'),
        audioProgressBar: document.getElementById('audioProgressBar'),
        audioLoopBtn: document.getElementById('audioLoopBtn'),
        tasbihNumberDisplay: document.getElementById('tasbihCounterDisplay'),
        tasbihProgressCircle: document.getElementById('tasbihProgressCircle'),
        tasbihLabel: document.getElementById('tasbihActiveLabel'),
        tasbihMeaningLabel: document.getElementById('tasbihActiveMeaning')
      };
    },

    bindEvents() {
      // Navigation
      document.querySelectorAll('[data-tab-target]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tab = e.currentTarget.getAttribute('data-tab-target');
          this.switchTab(tab);
        });
      });

      // Audio Event Listeners
      this.audio.addEventListener('timeupdate', () => this.onAudioTimeUpdate());
      this.audio.addEventListener('ended', () => this.onAudioEnded());
      this.audio.addEventListener('pause', () => this.setAudioPlayState(false));
      this.audio.addEventListener('play', () => this.setAudioPlayState(true));

      // Global Search input focus
      const searchTrigger = document.getElementById('searchTriggerBtn');
      if (searchTrigger) {
        searchTrigger.addEventListener('click', () => this.openSearchModal());
      }
      const globalSearch = document.getElementById('globalSearchInput');
      if (globalSearch) {
        globalSearch.addEventListener('click', () => this.openSearchModal());
        globalSearch.addEventListener('focus', () => this.openSearchModal());
      }

      // Audio loop button click
      if (this.elements.audioLoopBtn) {
        this.elements.audioLoopBtn.addEventListener('click', () => this.cycleAudioLoop());
      }

      // Close modal on click outside
      window.addEventListener('click', (e) => {
        if (e.target === this.elements.searchModal) this.closeSearchModal();
        if (e.target === this.elements.bookmarksModal) this.closeBookmarksModal();
        if (e.target === this.elements.cardDetailModal) this.closeCardDetailModal();
      });
    },

    setupGlobalKeyboard() {
      window.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K or "/"
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.openSearchModal();
        } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          this.openSearchModal();
        } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
          e.preventDefault();
          this.switchTab('admin');
        } else if (e.key === 'Escape') {
          this.closeSearchModal();
          this.closeBookmarksModal();
          this.closeCardDetailModal();
        } else if (e.key === 'ArrowLeft') {
          if (this.state.detailModalState && this.state.detailModalState.isOpen) {
            this.navigateCardDetail(-1);
          }
        } else if (e.key === 'ArrowRight') {
          if (this.state.detailModalState && this.state.detailModalState.isOpen) {
            this.navigateCardDetail(1);
          }
        }
      });
    },

    onLogoClick() {
      this._logoClicks = (this._logoClicks || 0) + 1;
      clearTimeout(this._logoClickTimeout);
      this._logoClickTimeout = setTimeout(() => {
        this._logoClicks = 0;
      }, 900);

      if (this._logoClicks >= 3) {
        this._logoClicks = 0;
        this.switchTab('admin');
        this.showToast('Curator Studio unlocked shortcut!');
      } else if (this._logoClicks === 1) {
        this.switchTab('home');
      }
    },

    switchTab(tabId) {
      this.state.activeTab = tabId;
      document.querySelectorAll('[data-tab-target]').forEach(btn => {
        if (btn.getAttribute('data-tab-target') === tabId) {
          btn.classList.add('bg-gradient-to-r', 'from-[#d4af37]/20', 'to-[#b38728]/20', 'text-[#F6E27A]', 'border-[#D4AF37]');
          btn.classList.remove('text-neutral-400');
        } else {
          btn.classList.remove('bg-gradient-to-r', 'from-[#d4af37]/20', 'to-[#b38728]/20', 'text-[#F6E27A]', 'border-[#D4AF37]');
          btn.classList.add('text-neutral-400');
        }
      });

      document.querySelectorAll('.tab-content-panel').forEach(panel => {
        if (panel.id === `tab-${tabId}`) {
          panel.classList.remove('hidden');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          panel.classList.add('hidden');
        }
      });

      // If switching to certain tabs, refresh their view
      if (tabId === 'quran') this.renderQuranSection();
      if (tabId === 'hadith') this.renderHadiths();
      if (tabId === 'duas') this.renderDuas();
      if (tabId === 'quiz') this.renderQuiz();
      if (tabId === 'zakat') this.calculateZakat();
      if (tabId === 'tasbih') this.updateTasbihUI();
      if (tabId === 'admin') {
        this.updateAdminLockUI();
        this.renderAdminCustomList();
      }
    },

    renderAll() {
      this.renderQuranSection();
      this.renderHadiths();
      this.renderDuas();
      this.renderSeerah();
      this.renderProphets();
      this.renderSahabah();
      this.renderAqeedah();
      this.renderQuotes();
      this.renderQuiz();
      this.updateTasbihUI();
      this.renderAdminCustomList();
    },

    // =========================================================================
    // QUR'AN & HIFDH MEMORISATION TOOL (ALL 114 CHAPTERS)
    // =========================================================================
    initSurahsCache() {
      this.loadedSurahs = {};
      if (window.MIRATH_DATA && window.MIRATH_DATA.quran) {
        window.MIRATH_DATA.quran.forEach(s => {
          this.loadedSurahs[s.surahNumber] = s;
        });
      }
    },

    setQuranViewMode(mode) {
      this.state.quranViewMode = mode;
      const readerBtn = document.getElementById('btnQuranReaderView');
      const dirBtn = document.getElementById('btnQuranDirectoryView');
      const dirSection = document.getElementById('quranDirectorySection');
      const readerSection = document.getElementById('quranSurahContainer');

      if (mode === 'directory') {
        if (readerBtn) {
          readerBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-all';
        }
        if (dirBtn) {
          dirBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] text-black transition-all';
        }
        if (dirSection) dirSection.classList.remove('hidden');
        if (readerSection) readerSection.classList.add('hidden');
        this.renderSurahDirectory();
      } else {
        if (readerBtn) {
          readerBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] text-black transition-all';
        }
        if (dirBtn) {
          dirBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-all';
        }
        if (dirSection) dirSection.classList.add('hidden');
        if (readerSection) readerSection.classList.remove('hidden');
      }
    },

    setSurahDirectoryFilter(filter) {
      this.state.surahDirectoryFilter = filter;
      const allBtn = document.getElementById('filterSurahAll');
      const meccBtn = document.getElementById('filterSurahMeccan');
      const medBtn = document.getElementById('filterSurahMedinan');

      const activeClass = 'px-3 py-1 rounded-lg bg-[#D4AF37] text-black font-semibold';
      const inactiveClass = 'px-3 py-1 rounded-lg bg-[#14161f] text-neutral-300 hover:text-white border border-neutral-800';

      if (allBtn) allBtn.className = filter === 'all' ? activeClass : inactiveClass;
      if (meccBtn) meccBtn.className = filter === 'Meccan' ? activeClass : inactiveClass;
      if (medBtn) medBtn.className = filter === 'Medinan' ? activeClass : inactiveClass;

      this.renderSurahDirectory();
    },

    filterSurahDirectory(query) {
      this.state.surahDirectorySearch = query.trim().toLowerCase();
      this.renderSurahDirectory();
    },

    renderSurahDirectory() {
      const container = document.getElementById('quranSurahsGridContainer');
      if (!container || !window.MIRATH_SURAHS) return;

      const filter = this.state.surahDirectoryFilter || 'all';
      const q = this.state.surahDirectorySearch || '';

      const filtered = window.MIRATH_SURAHS.filter(s => {
        const matchesFilter = filter === 'all' || s.revelationType === filter;
        if (!matchesFilter) return false;
        if (!q) return true;
        return (
          s.nameEnglish.toLowerCase().includes(q) ||
          s.nameArabic.includes(q) ||
          s.translation.toLowerCase().includes(q) ||
          String(s.number) === q ||
          `surah ${s.number}`.includes(q)
        );
      });

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="col-span-full text-center py-12 text-neutral-400">
            <p class="text-sm">No chapters found matching "${this.state.surahDirectorySearch}".</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(s => {
        const isCurrent = this.state.currentSurahNumber === s.number;
        return `
          <div 
            onclick="App.selectSurah(${s.number})"
            class="glass-card p-5 border ${isCurrent ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#D4AF37]/20'} hover:border-[#D4AF37] cursor-pointer group flex flex-col justify-between transition-all"
          >
            <div>
              <div class="flex items-center justify-between mb-3 border-b border-neutral-800/80 pb-2">
                <span class="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F6E27A] font-bold text-xs flex items-center justify-center font-mono">
                  ${s.number}
                </span>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded ${s.revelationType === 'Meccan' ? 'bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'}">
                  ${s.revelationType}
                </span>
              </div>

              <div class="flex items-baseline justify-between gap-2 mb-1">
                <h4 class="font-serif text-base font-bold text-white group-hover:text-[#F6E27A] transition-colors truncate">
                  ${s.nameEnglish}
                </h4>
                <span class="font-arabic text-xl gold-text font-bold shrink-0">
                  ${s.nameArabic}
                </span>
              </div>

              <p class="text-xs text-neutral-400 truncate mb-3">
                ${s.translation}
              </p>
            </div>

            <div class="pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
              <span>${s.numberOfAyahs} Verses</span>
              <span class="text-[#D4AF37] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                Read →
              </span>
            </div>
          </div>
        `;
      }).join('');
    },

    async selectSurah(surahNumber) {
      this.state.currentSurahNumber = parseInt(surahNumber, 10);
      this.state.currentAyahIndex = 0;
      this.setQuranViewMode('reader');
      this.switchTab('quran');
      await this.renderQuranSection();
      const container = document.getElementById('quranSurahContainer');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    async getSurah(surahNumber) {
      // 1. Memory check
      if (this.loadedSurahs && this.loadedSurahs[surahNumber]) {
        return this.loadedSurahs[surahNumber];
      }

      // 2. Pre-packaged check
      if (window.MIRATH_DATA && window.MIRATH_DATA.quran) {
        const found = window.MIRATH_DATA.quran.find(s => s.surahNumber === surahNumber);
        if (found) {
          this.loadedSurahs[surahNumber] = found;
          return found;
        }
      }

      // 3. LocalStorage cache check
      try {
        const cached = localStorage.getItem('mirath_surah_' + surahNumber);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.ayahs && parsed.ayahs.length) {
            this.loadedSurahs[surahNumber] = parsed;
            return parsed;
          }
        }
      } catch (e) {}

      // 4. Fetch from AlQuran Cloud API
      const meta = (window.MIRATH_SURAHS && window.MIRATH_SURAHS.find(s => s.number === surahNumber)) || {
        number: surahNumber,
        nameArabic: '',
        nameEnglish: 'Surah ' + surahNumber,
        translation: '',
        numberOfAyahs: 0,
        revelationType: 'Meccan'
      };

      const resp = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`);
      if (!resp.ok) throw new Error('Network error loading Surah ' + surahNumber);
      const json = await resp.json();
      if (!json || json.code !== 200 || !json.data || json.data.length < 2) {
        throw new Error('Invalid response from Quran API');
      }

      const arData = json.data[0];
      const enData = json.data[1];

      const ayahs = arData.ayahs.map((arAyah, idx) => {
        const enAyah = enData.ayahs[idx] || { text: '' };
        let arText = arAyah.text || '';
        if (surahNumber !== 1 && surahNumber !== 9 && idx === 0 && arText.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ')) {
          arText = arText.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '').trim();
        }
        const words = arText.split(/\s+/).filter(Boolean);
        return {
          numberInSurah: arAyah.numberInSurah,
          globalNumber: arAyah.number,
          arabic: arText,
          transliteration: '',
          translation: enAyah.text,
          audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${arAyah.number}.mp3`,
          words: words
        };
      });

      const surahObj = {
        id: 'surah-' + surahNumber,
        surahNumber: surahNumber,
        nameArabic: meta.nameArabic || arData.name,
        nameEnglish: meta.nameEnglish || arData.englishName,
        translation: meta.translation || arData.englishNameTranslation,
        revelationType: meta.revelationType || arData.revelationType,
        totalVerses: meta.numberOfAyahs || ayahs.length,
        bismillah: surahNumber !== 1 && surahNumber !== 9,
        ayahs: ayahs
      };

      this.loadedSurahs[surahNumber] = surahObj;
      try {
        localStorage.setItem('mirath_surah_' + surahNumber, JSON.stringify(surahObj));
      } catch (e) {}
      return surahObj;
    },

    async renderQuranSection() {
      const container = document.getElementById('quranSurahContainer');
      const selector = document.getElementById('surahSelectDropdown');
      if (!container) return;

      const surahNumber = this.state.currentSurahNumber || 1;

      // Populate selector dropdown with all 114 Surahs if not done
      if (selector && (selector.children.length <= 1 || selector.children.length < 114)) {
        if (window.MIRATH_SURAHS && window.MIRATH_SURAHS.length) {
          selector.innerHTML = window.MIRATH_SURAHS.map(s => `
            <option value="${s.number}" ${s.number === surahNumber ? 'selected' : ''}>
              ${s.number}. ${s.nameEnglish} (${s.nameArabic}) - ${s.translation} [${s.numberOfAyahs} Ayahs]
            </option>
          `).join('');
        }
        selector.addEventListener('change', (e) => {
          this.selectSurah(e.target.value);
        });
      }
      if (selector) {
        selector.value = surahNumber;
      }

      // Check if data is ready or needs fetching
      let currentSurah = this.loadedSurahs && this.loadedSurahs[surahNumber];
      if (!currentSurah) {
        const meta = (window.MIRATH_SURAHS && window.MIRATH_SURAHS.find(s => s.number === surahNumber)) || {
          nameEnglish: `Surah ${surahNumber}`,
          nameArabic: '',
          translation: ''
        };
        container.innerHTML = `
          <div class="glass-card p-12 text-center border border-[#D4AF37]/30 my-8">
            <div class="w-16 h-16 mx-auto mb-5 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
            <h3 class="font-serif text-2xl font-bold text-white mb-2">Loading ${meta.nameEnglish}</h3>
            <p class="font-arabic text-xl gold-text mb-4">${meta.nameArabic}</p>
            <p class="text-xs text-neutral-400">Fetching Uthmani text, Saheeh International translation, and Mishary Alafasy audio...</p>
          </div>
        `;
        try {
          currentSurah = await this.getSurah(surahNumber);
        } catch (err) {
          container.innerHTML = `
            <div class="glass-card p-8 text-center border border-red-500/40 my-8">
              <p class="text-red-400 font-bold mb-2">Unable to load Surah ${surahNumber}</p>
              <p class="text-xs text-neutral-400 mb-4">${err.message || 'Please check your internet connection.'}</p>
              <button class="btn-gold text-xs" onclick="App.selectSurah(${surahNumber})">Retry</button>
            </div>
          `;
          return;
        }
      }

      // Metadata for Prev and Next Surahs
      const prevSurahNum = surahNumber > 1 ? surahNumber - 1 : null;
      const nextSurahNum = surahNumber < 114 ? surahNumber + 1 : null;
      const prevMeta = prevSurahNum && window.MIRATH_SURAHS ? window.MIRATH_SURAHS.find(s => s.number === prevSurahNum) : null;
      const nextMeta = nextSurahNum && window.MIRATH_SURAHS ? window.MIRATH_SURAHS.find(s => s.number === nextSurahNum) : null;

      // Render Ayahs
      container.innerHTML = `
        <div class="glass-card p-6 md:p-8 mb-8 border border-[#D4AF37]/30">
          
          <!-- Surah Header Banner -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-6 mb-6">
            <div>
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-sm font-mono shadow-sm">
                  ${currentSurah.surahNumber}
                </span>
                <div>
                  <h2 class="text-2xl md:text-3xl font-bold font-serif text-white">${currentSurah.nameEnglish}</h2>
                  <p class="text-neutral-400 text-xs mt-0.5">${currentSurah.translation} • ${currentSurah.totalVerses} Verses</p>
                </div>
                <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30 font-semibold self-start">${currentSurah.revelationType}</span>
              </div>
            </div>
            
            <div class="flex items-center gap-4 self-end md:self-center">
              <span class="font-arabic text-3xl md:text-5xl gold-text font-bold">${currentSurah.nameArabic}</span>
            </div>
          </div>

          <!-- Top Navigation (Prev / Next Surah) -->
          <div class="flex items-center justify-between text-xs pb-4 border-b border-neutral-800/80 mb-6 gap-2">
            ${prevSurahNum ? `
              <button onclick="App.selectSurah(${prevSurahNum})" class="px-3 py-1.5 rounded-lg bg-[#141620] hover:bg-[#D4AF37]/20 text-neutral-300 hover:text-white border border-neutral-800 flex items-center gap-1.5 transition-all">
                <span>← Surah ${prevSurahNum} (${prevMeta ? prevMeta.nameEnglish : ''})</span>
              </button>
            ` : '<div></div>'}

            <button onclick="App.setQuranViewMode('directory')" class="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#F6E27A] border border-[#D4AF37]/30 font-semibold flex items-center gap-1.5 transition-all">
              <span>🏛️ All 114 Chapters</span>
            </button>

            ${nextSurahNum ? `
              <button onclick="App.selectSurah(${nextSurahNum})" class="px-3 py-1.5 rounded-lg bg-[#141620] hover:bg-[#D4AF37]/20 text-neutral-300 hover:text-white border border-neutral-800 flex items-center gap-1.5 transition-all">
                <span>Surah ${nextSurahNum} (${nextMeta ? nextMeta.nameEnglish : ''}) →</span>
              </button>
            ` : '<div></div>'}
          </div>

          <!-- Bismillah if applicable -->
          ${currentSurah.bismillah ? `
            <div class="text-center py-6 font-arabic quran-text text-3xl md:text-4xl gold-text select-none border-b border-neutral-900 mb-6 leading-[2.6]">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
          ` : ''}

          <!-- HIFDH TOOLBAR -->
          <div class="bg-[#101217] rounded-xl p-4 mb-6 border border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-[#F6E27A] flex items-center gap-1.5 uppercase tracking-wider">
                <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Hifdh Studio:
              </span>
              <button id="btnToggleWordMask" class="text-xs px-3 py-1.5 rounded-lg border ${this.state.hifdhWordMask ? 'bg-[#D4AF37] text-black font-bold border-[#FFE58F]' : 'bg-[#181a22] text-neutral-300 border-neutral-700 hover:border-[#D4AF37]'} transition-all">
                ${this.state.hifdhWordMask ? '✓ Mask Words Active' : 'Mask Arabic Words'}
              </button>
              <button id="btnToggleHideTrans" class="text-xs px-3 py-1.5 rounded-lg border ${this.state.hifdhHideTranslation ? 'bg-[#D4AF37] text-black font-bold border-[#FFE58F]' : 'bg-[#181a22] text-neutral-300 border-neutral-700 hover:border-[#D4AF37]'} transition-all">
                ${this.state.hifdhHideTranslation ? '✓ Translations Blurred' : 'Blur Translation'}
              </button>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-xs text-neutral-400">Loop Repetitions:</div>
              <div class="inline-flex rounded-lg bg-[#181a22] p-1 border border-neutral-800">
                ${[1, 3, 5, 10].map(cnt => `
                  <button class="px-2 py-0.5 text-xs rounded ${this.state.audioLoopMax === cnt ? 'bg-[#D4AF37] text-black font-bold' : 'text-neutral-400 hover:text-white'}" onclick="App.setLoopCount(${cnt})">
                    ${cnt}x
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- AYAHS LIST -->
          <div class="space-y-6">
            ${currentSurah.ayahs.map((ayah, aIdx) => {
              const isMemorized = this.state.memorizedAyahs.includes(`${currentSurah.id}-${ayah.numberInSurah}`);
              const isBookmarked = this.isBookmarked('ayah', `${currentSurah.id}-${ayah.numberInSurah}`);
              const wordsArr = ayah.words && ayah.words.length ? ayah.words : ayah.arabic.split(/\s+/).filter(Boolean);
              return `
                <div class="p-5 md:p-6 rounded-xl bg-[#0c0d12]/90 border ${isMemorized ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-[#D4AF37]/15'} hover:border-[#D4AF37]/40 transition-all" id="ayah-box-${currentSurah.id}-${ayah.numberInSurah}">
                  <div class="flex items-center justify-between gap-4 border-b border-neutral-800/80 pb-3 mb-4">
                    <div class="flex items-center gap-2">
                      <span class="w-7 h-7 rounded-full bg-[#181b22] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono flex items-center justify-center">
                        ${ayah.numberInSurah}
                      </span>
                      ${isMemorized ? '<span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Memorized ✓</span>' : ''}
                    </div>

                    <div class="flex items-center gap-2">
                      <button class="p-2 rounded-lg bg-[#161820] hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-all" title="Listen to Ayah" onclick="App.playAyah(${currentSurah.surahNumber}, ${aIdx})">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                      <button class="p-2 rounded-lg bg-[#161820] hover:bg-[#D4AF37]/20 ${isBookmarked ? 'text-[#D4AF37]' : 'text-neutral-400'} transition-all" title="Bookmark Ayah" onclick="App.toggleBookmark('ayah', '${currentSurah.id}-${ayah.numberInSurah}', '${currentSurah.nameEnglish} Ayah ${ayah.numberInSurah}', '${ayah.arabic.replace(/'/g, "\\'")}')">
                        <svg class="w-4 h-4" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                      </button>
                      <button class="p-2 rounded-lg bg-[#161820] hover:bg-emerald-500/20 ${isMemorized ? 'text-emerald-400' : 'text-neutral-400'} transition-all" title="Mark as Memorized" onclick="App.toggleMemorized('${currentSurah.id}-${ayah.numberInSurah}')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </button>
                      <button class="p-2 rounded-lg bg-[#161820] hover:bg-[#D4AF37]/20 text-neutral-400 hover:text-white transition-all" title="Copy Ayah" onclick="App.copyText('${ayah.arabic.replace(/'/g, "\\'")} - ${ayah.translation.replace(/'/g, "\\'")}')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      </button>
                    </div>
                  </div>

                  <!-- Arabic Ayah Text -->
                  <div class="quran-ayah-text font-arabic text-2xl md:text-3xl lg:text-[2.15rem] text-right text-[#F6E27A] mb-5 select-none leading-[2.8]">
                    ${this.state.hifdhWordMask 
                      ? wordsArr.map(w => `<span class="hifdh-masked-word hifdh-mask-active" onclick="this.classList.toggle('hifdh-mask-revealed'); this.classList.toggle('hifdh-mask-active')">${w}</span>`).join(' ')
                      : ayah.arabic}
                    <span class="ayah-number-badge inline-flex items-center justify-center align-middle mx-2 text-[#D4AF37] border border-[#D4AF37]/40 bg-[#D4AF37]/10 rounded-full px-2.5 py-0.5 text-xs font-bold select-none">
                      <span class="text-xs font-arabic text-[#F6E27A] ml-1">۝</span>${ayah.numberInSurah}
                    </span>
                  </div>

                  <!-- Transliteration if available -->
                  ${ayah.transliteration ? `
                    <div class="text-xs md:text-sm text-neutral-400 italic mb-2">
                      ${ayah.transliteration}
                    </div>
                  ` : ''}

                  <!-- Translation (Blur-capable for testing) -->
                  <div class="text-sm md:text-base text-neutral-200 ${this.state.hifdhHideTranslation ? 'blur-translation' : ''}" title="${this.state.hifdhHideTranslation ? 'Hover to reveal translation' : ''}">
                    ${ayah.translation}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Bottom Navigation (Prev / Next Surah) -->
          <div class="flex items-center justify-between text-xs pt-8 border-t border-neutral-800/80 mt-8 gap-2">
            ${prevSurahNum ? `
              <button onclick="App.selectSurah(${prevSurahNum})" class="btn-outline-gold text-xs py-2 px-3 flex items-center gap-1.5">
                <span>← Previous: ${prevMeta ? prevMeta.nameEnglish : ''}</span>
              </button>
            ` : '<div></div>'}

            <button onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" class="px-3 py-2 rounded-lg bg-[#141620] hover:bg-[#D4AF37]/20 text-neutral-400 hover:text-white border border-neutral-800 text-xs">
              ↑ Back to Top
            </button>

            ${nextSurahNum ? `
              <button onclick="App.selectSurah(${nextSurahNum})" class="btn-gold text-xs py-2 px-3 flex items-center gap-1.5">
                <span>Next: ${nextMeta ? nextMeta.nameEnglish : ''} →</span>
              </button>
            ` : '<div></div>'}
          </div>

        </div>
      `;

      // Attach event listeners for hifdh toolbar buttons
      document.getElementById('btnToggleWordMask')?.addEventListener('click', () => {
        this.state.hifdhWordMask = !this.state.hifdhWordMask;
        this.renderQuranSection();
      });

      document.getElementById('btnToggleHideTrans')?.addEventListener('click', () => {
        this.state.hifdhHideTranslation = !this.state.hifdhHideTranslation;
        this.renderQuranSection();
      });
    },

    setLoopCount(count) {
      this.state.audioLoopMax = count;
      this.state.audioLoopCount = 0;
      if (this.elements.audioLoopBtn) {
        this.elements.audioLoopBtn.innerText = `${count}x Loop`;
      }
      this.renderQuranSection();
    },

    cycleAudioLoop() {
      const loops = [1, 3, 5, 10];
      const curIdx = loops.indexOf(this.state.audioLoopMax);
      const nextIdx = (curIdx + 1) % loops.length;
      this.setLoopCount(loops[nextIdx]);
    },

    closeAudioPlayer() {
      this.audio.pause();
      this.setAudioPlayState(false);
      if (this.elements.audioBar) {
        this.elements.audioBar.classList.add('hidden');
      }
    },

    toggleMemorized(key) {
      const idx = this.state.memorizedAyahs.indexOf(key);
      if (idx > -1) {
        this.state.memorizedAyahs.splice(idx, 1);
      } else {
        this.state.memorizedAyahs.push(key);
      }
      localStorage.setItem('mirath_memorized', JSON.stringify(this.state.memorizedAyahs));
      this.renderQuranSection();
    },

    convertToArabicNumber(num) {
      const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
      return String(num).split('').map(d => arabicDigits[d] || d).join('');
    },

    // =========================================================================
    // AUDIO PLAYER
    // =========================================================================
    playAyah(surahNumOrIdx, ayahIdx) {
      let surah = null;
      let surahNum = 1;
      if (typeof surahNumOrIdx === 'number' && surahNumOrIdx >= 1 && surahNumOrIdx <= 114) {
        surahNum = surahNumOrIdx;
        surah = (this.loadedSurahs && this.loadedSurahs[surahNum]) || (window.MIRATH_DATA.quran && window.MIRATH_DATA.quran.find(s => s.surahNumber === surahNum));
      } else if (window.MIRATH_DATA.quran && window.MIRATH_DATA.quran[surahNumOrIdx]) {
        surah = window.MIRATH_DATA.quran[surahNumOrIdx];
        surahNum = surah.surahNumber;
      }
      if (!surah) {
        surah = (this.loadedSurahs && this.loadedSurahs[this.state.currentSurahNumber]) || (window.MIRATH_DATA.quran && window.MIRATH_DATA.quran[0]);
        if (surah) surahNum = surah.surahNumber;
      }

      this.state.currentSurahNumber = surahNum;
      this.state.currentAyahIndex = ayahIdx;

      if (!surah || !surah.ayahs || !surah.ayahs[ayahIdx]) return;
      const ayah = surah.ayahs[ayahIdx];

      this.audio.src = ayah.audio || `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.globalNumber}.mp3`;
      this.audio.play().then(() => {
        if (this.elements.audioBar) this.elements.audioBar.classList.remove('hidden');
        if (this.elements.audioSurahTitle) this.elements.audioSurahTitle.innerText = `${surah.nameEnglish} (${surah.nameArabic})`;
        if (this.elements.audioAyahInfo) this.elements.audioAyahInfo.innerText = `Ayah ${ayah.numberInSurah} of ${surah.totalVerses} • Reciter: Mishary Alafasy`;
        this.setAudioPlayState(true);
      }).catch(err => {
        console.warn('Audio play restricted or network issue:', err);
      });
    },

    toggleAudioPlayback() {
      if (this.audio.paused) {
        this.audio.play();
      } else {
        this.audio.pause();
      }
    },

    setAudioPlayState(isPlaying) {
      this.state.audioPlaying = isPlaying;
      if (this.elements.audioPlayBtn) {
        this.elements.audioPlayBtn.innerHTML = isPlaying
          ? `<svg class="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
          : `<svg class="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
      }
    },

    onAudioTimeUpdate() {
      if (!this.audio.duration) return;
      const pct = (this.audio.currentTime / this.audio.duration) * 100;
      if (this.elements.audioProgressBar) {
        this.elements.audioProgressBar.style.width = `${pct}%`;
      }
    },

    onAudioEnded() {
      this.state.audioLoopCount++;
      if (this.state.audioLoopCount < this.state.audioLoopMax) {
        this.audio.currentTime = 0;
        this.audio.play();
        return;
      }

      // Loop finished, proceed to next ayah if available
      this.state.audioLoopCount = 0;
      const surah = (this.loadedSurahs && this.loadedSurahs[this.state.currentSurahNumber]) || (window.MIRATH_DATA.quran && window.MIRATH_DATA.quran.find(s => s.surahNumber === this.state.currentSurahNumber));
      if (surah && surah.ayahs && this.state.currentAyahIndex + 1 < surah.ayahs.length) {
        this.playAyah(this.state.currentSurahNumber, this.state.currentAyahIndex + 1);
      } else {
        this.setAudioPlayState(false);
      }
    },

    playNextAyah() {
      const surah = (this.loadedSurahs && this.loadedSurahs[this.state.currentSurahNumber]) || (window.MIRATH_DATA.quran && window.MIRATH_DATA.quran.find(s => s.surahNumber === this.state.currentSurahNumber));
      if (surah && surah.ayahs && this.state.currentAyahIndex + 1 < surah.ayahs.length) {
        this.playAyah(this.state.currentSurahNumber, this.state.currentAyahIndex + 1);
      }
    },

    playPrevAyah() {
      if (this.state.currentAyahIndex > 0) {
        this.playAyah(this.state.currentSurahNumber, this.state.currentAyahIndex - 1);
      }
    },

    // =========================================================================
    // AUTHENTIC HADITH TREASURY
    // =========================================================================
    renderHadiths(filterCat = 'All') {
      const container = document.getElementById('hadithsGridContainer');
      const catContainer = document.getElementById('hadithCategoryFilter');
      if (!container || !window.MIRATH_DATA) return;

      const categories = ['All', ...new Set(window.MIRATH_DATA.hadiths.map(h => h.category))];
      
      if (catContainer && catContainer.children.length === 0) {
        catContainer.innerHTML = categories.map(cat => `
          <button class="px-3.5 py-1.5 rounded-full text-xs transition-all ${cat === 'All' ? 'bg-[#D4AF37] text-black font-semibold' : 'bg-[#151720] text-neutral-400 hover:text-white border border-neutral-800'}" onclick="App.filterHadiths('${cat}', this)">
            ${cat}
          </button>
        `).join('');
      }

      const filtered = filterCat === 'All'
        ? window.MIRATH_DATA.hadiths
        : window.MIRATH_DATA.hadiths.filter(h => h.category === filterCat);

      container.innerHTML = filtered.map(h => {
        const isBookmarked = this.isBookmarked('hadith', h.id);
        return `
          <div 
            class="glass-card interactive-card p-6 border border-[#D4AF37]/20 flex flex-col justify-between group"
            onclick="App.openCardDetail('hadith', '${h.id}')"
          >
            <div>
              <div class="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-4">
                <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30 font-medium">${h.category}</span>
                <span class="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">${h.grade}</span>
              </div>

              <!-- Arabic text -->
              <p class="font-arabic text-xl md:text-2xl text-right text-[#F6E27A] mb-4 leading-[2.5] group-hover:text-white transition-colors">
                ${h.arabic}
              </p>

              <!-- Translation -->
              <p class="text-neutral-200 text-sm md:text-base leading-relaxed mb-4">
                "${h.translation}"
              </p>

              <!-- Explanation insight -->
              <div class="bg-[#0b0c10] p-3 rounded-lg border border-neutral-800/80 text-xs text-neutral-400 mb-4">
                <span class="text-[#D4AF37] font-semibold">Scholarly Insight:</span> ${h.explanation}
              </div>
            </div>

            <div class="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <div class="truncate max-w-[140px] sm:max-w-[200px]">
                <p class="font-medium text-neutral-300 truncate">${h.narrator}</p>
                <p class="text-[11px] text-neutral-500 truncate">${h.source}</p>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[11px] text-[#D4AF37] opacity-80 group-hover:opacity-100 flex items-center gap-1 font-medium mr-1 card-click-hint">
                  Deep Dive →
                </span>
                <button class="p-2 rounded-lg bg-[#161822] hover:bg-[#D4AF37]/20 text-neutral-300 hover:text-white transition-all" title="Copy Hadith" onclick="event.stopPropagation(); App.copyText('${h.arabic.replace(/'/g, "\\'")} - ${h.translation.replace(/'/g, "\\'")}')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </button>
                <button class="p-2 rounded-lg bg-[#161822] hover:bg-[#D4AF37]/20 ${isBookmarked ? 'text-[#D4AF37]' : 'text-neutral-400'} transition-all" title="Bookmark Hadith" onclick="event.stopPropagation(); App.toggleBookmark('hadith', '${h.id}', '${h.category} (${h.source})', '${h.translation.replace(/'/g, "\\'")}')">
                  <svg class="w-4 h-4" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    filterHadiths(category, element) {
      document.querySelectorAll('#hadithCategoryFilter button').forEach(b => {
        b.className = 'px-3.5 py-1.5 rounded-full text-xs transition-all bg-[#151720] text-neutral-400 hover:text-white border border-neutral-800';
      });
      if (element) {
        element.className = 'px-3.5 py-1.5 rounded-full text-xs transition-all bg-[#D4AF37] text-black font-semibold';
      }
      this.renderHadiths(category);
    },

    // =========================================================================
    // DUAS & ADHKAR
    // =========================================================================
    renderDuas() {
      const container = document.getElementById('duasGridContainer');
      if (!container || !window.MIRATH_DATA) return;

      container.innerHTML = window.MIRATH_DATA.duas.map(d => {
        const isBookmarked = this.isBookmarked('dua', d.id);
        return `
          <div 
            class="glass-card interactive-card p-6 border border-[#D4AF37]/20 flex flex-col justify-between group"
            onclick="App.openCardDetail('dua', '${d.id}')"
          >
            <div>
              <div class="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-4">
                <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30 font-medium">${d.category}</span>
                <span class="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">Repeat: ${d.targetCount}x</span>
              </div>

              <h3 class="text-base font-bold text-white mb-3 group-hover:text-[#F6E27A] transition-colors">${d.title}</h3>

              <!-- Arabic -->
              <p class="font-arabic text-xl md:text-2xl text-right text-[#F6E27A] mb-3 leading-[2.5] group-hover:text-white transition-colors">
                ${d.arabic}
              </p>

              <!-- Transliteration -->
              <p class="text-xs text-neutral-400 italic mb-2">${d.transliteration}</p>

              <!-- Translation -->
              <p class="text-neutral-300 text-sm mb-4 leading-relaxed">${d.translation}</p>

              <!-- Virtue -->
              <div class="bg-[#0b0c10] p-3 rounded-lg border border-neutral-800 text-xs text-neutral-400 mb-4">
                <span class="text-[#D4AF37] font-semibold">Virtue & Reward:</span> ${d.virtue}
              </div>
            </div>

            <div class="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span class="truncate max-w-[130px] sm:max-w-[180px]">Source: ${d.source}</span>
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-[#D4AF37] opacity-80 group-hover:opacity-100 flex items-center gap-1 font-medium mr-1 card-click-hint">
                  Deep Dive →
                </span>
                <button class="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#F6E27A] border border-[#D4AF37]/30 flex items-center gap-1.5 transition-all" onclick="event.stopPropagation(); App.setTasbihDua('${d.arabic.replace(/'/g, "\\'")}', '${d.title.replace(/'/g, "\\'")}', ${d.targetCount})">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Counter
                </button>
                <button class="p-2 rounded-lg bg-[#161822] hover:bg-[#D4AF37]/20 ${isBookmarked ? 'text-[#D4AF37]' : 'text-neutral-400'} transition-all" title="Bookmark Dua" onclick="event.stopPropagation(); App.toggleBookmark('dua', '${d.id}', '${d.title}', '${d.translation.replace(/'/g, "\\'")}')">
                  <svg class="w-4 h-4" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    // =========================================================================
    // INTERACTIVE DIGITAL TASBIH
    // =========================================================================
    incrementTasbih() {
      this.state.tasbihCount++;
      this.playChime();
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }

      if (this.state.tasbihCount >= this.state.tasbihTarget) {
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      }

      this.updateTasbihUI();
    },

    resetTasbih() {
      this.state.tasbihCount = 0;
      this.updateTasbihUI();
    },

    setTasbihPreset(arabic, meaning, target) {
      this.state.tasbihDua = arabic;
      this.state.tasbihMeaning = meaning;
      this.state.tasbihTarget = target;
      this.state.tasbihCount = 0;
      this.updateTasbihUI();
    },

    setTasbihDua(arabic, title, target) {
      this.state.tasbihDua = arabic;
      this.state.tasbihMeaning = title;
      this.state.tasbihTarget = target || 33;
      this.state.tasbihCount = 0;
      this.switchTab('tasbih');
      this.updateTasbihUI();
      // Smooth scroll to tasbih widget
      setTimeout(() => {
        document.getElementById('tasbihWidgetSection')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },

    updateTasbihUI() {
      if (this.elements.tasbihNumberDisplay) {
        this.elements.tasbihNumberDisplay.innerText = this.state.tasbihCount;
      }
      if (this.elements.tasbihLabel) {
        this.elements.tasbihLabel.innerText = this.state.tasbihDua;
      }
      if (this.elements.tasbihMeaningLabel) {
        this.elements.tasbihMeaningLabel.innerText = `${this.state.tasbihMeaning} (Target: ${this.state.tasbihTarget})`;
      }

      // SVG Circle Progress (Circumference = 2 * PI * r = 2 * 3.14159 * 90 ≈ 565.48)
      if (this.elements.tasbihProgressCircle) {
        const circumference = 565.48;
        const fraction = Math.min(this.state.tasbihCount / this.state.tasbihTarget, 1);
        const offset = circumference - (fraction * circumference);
        this.elements.tasbihProgressCircle.style.strokeDashoffset = offset;
      }
    },

    playChime() {
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(1320, this.audioContext.currentTime + 0.08);

        gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.09);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
      } catch (e) {
        // Audio synthesis fallback
      }
    },

    // =========================================================================
    // INTERACTIVE GOLDEN QIBLA COMPASS
    // =========================================================================
    qiblaCities: {
      karachi: { name: 'Karachi, Pakistan', lat: 24.8607, lng: 67.0011 },
      lahore: { name: 'Lahore, Pakistan', lat: 31.5204, lng: 74.3587 },
      islamabad: { name: 'Islamabad, Pakistan', lat: 33.6844, lng: 73.0479 },
      makkah: { name: 'Makkah al-Mukarramah', lat: 21.4225, lng: 39.8262 },
      madinah: { name: 'Madinah al-Munawwarah', lat: 24.5247, lng: 39.5692 },
      jerusalem: { name: 'Jerusalem (Al-Quds)', lat: 31.7683, lng: 35.2137 },
      cairo: { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357 },
      istanbul: { name: 'Istanbul, Turkey', lat: 41.0082, lng: 28.9784 },
      dubai: { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
      riyadh: { name: 'Riyadh, Saudi Arabia', lat: 24.7136, lng: 46.6753 },
      london: { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
      paris: { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
      berlin: { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050 },
      newyork: { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
      toronto: { name: 'Toronto, Canada', lat: 43.6532, lng: -79.3832 },
      chicago: { name: 'Chicago, USA', lat: 41.8781, lng: -87.6298 },
      losangeles: { name: 'Los Angeles, USA', lat: 34.0522, lng: -118.2437 },
      houston: { name: 'Houston, USA', lat: 29.7604, lng: -95.3698 },
      jakarta: { name: 'Jakarta, Indonesia', lat: -6.2088, lng: 106.8456 },
      kualalumpur: { name: 'Kuala Lumpur, Malaysia', lat: 3.1390, lng: 101.6869 },
      dhaka: { name: 'Dhaka, Bangladesh', lat: 23.8103, lng: 90.4125 },
      mumbai: { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
      delhi: { name: 'Delhi, India', lat: 28.6139, lng: 77.2090 },
      sydney: { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
      melbourne: { name: 'Melbourne, Australia', lat: -37.8136, lng: 144.9631 },
      tokyo: { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
      johannesburg: { name: 'Johannesburg, South Africa', lat: -26.2041, lng: 28.0473 },
      casablanca: { name: 'Casablanca, Morocco', lat: 33.5731, lng: -7.5898 },
      tashkent: { name: 'Tashkent, Uzbekistan', lat: 41.2995, lng: 69.2401 }
    },

    calculateQiblaBearing(lat, lng) {
      const KAABA_LAT = 21.422487;
      const KAABA_LNG = 39.826206;
      const phi1 = (lat * Math.PI) / 180;
      const phi2 = (KAABA_LAT * Math.PI) / 180;
      const deltaLambda = ((KAABA_LNG - lng) * Math.PI) / 180;

      const y = Math.sin(deltaLambda) * Math.cos(phi2);
      const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
      let bearing = (Math.atan2(y, x) * 180) / Math.PI;
      bearing = (bearing + 360) % 360;

      // Haversine distance
      const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
      const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = 6371 * c;

      return { bearing, distKm };
    },

    getCardinalDirection(deg) {
      const directions = [
        'North (N)', 'North-Northeast (NNE)', 'Northeast (NE)', 'East-Northeast (ENE)',
        'East (E)', 'East-Southeast (ESE)', 'Southeast (SE)', 'South-Southeast (SSE)',
        'South (S)', 'South-Southwest (SSW)', 'Southwest (SW)', 'West-Southwest (WSW)',
        'West (W)', 'West-Northwest (WNW)', 'Northwest (NW)', 'North-Northwest (NNW)'
      ];
      const index = Math.round(deg / 22.5) % 16;
      return directions[index];
    },

    updateQiblaDisplay(bearing, distKm, locationName, lat, lng) {
      this.state.qiblaTrueBearing = bearing;
      const needle = document.getElementById('qiblaNeedle');
      if (needle) {
        needle.style.transform = `rotate(${bearing.toFixed(1)}deg)`;
      }

      const bearingVal = document.getElementById('qiblaBearingValue');
      if (bearingVal) bearingVal.innerText = `${bearing.toFixed(1)}°`;

      const cardinal = document.getElementById('qiblaCardinal');
      if (cardinal) cardinal.innerText = this.getCardinalDirection(bearing);

      const distKmEl = document.getElementById('qiblaDistanceKm');
      if (distKmEl) distKmEl.innerText = `${Math.round(distKm).toLocaleString()} km`;

      const distMiEl = document.getElementById('qiblaDistanceMi');
      if (distMiEl) distMiEl.innerText = `(${Math.round(distKm * 0.621371).toLocaleString()} miles)`;

      const locName = document.getElementById('qiblaLocationName');
      if (locName) {
        locName.innerHTML = `<span>${locationName}</span><span class="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">Active</span>`;
      }

      const coordsEl = document.getElementById('qiblaCoordinates');
      if (coordsEl) {
        const latStr = lat >= 0 ? `${lat.toFixed(4)}° N` : `${Math.abs(lat).toFixed(4)}° S`;
        const lngStr = lng >= 0 ? `${lng.toFixed(4)}° E` : `${Math.abs(lng).toFixed(4)}° W`;
        coordsEl.innerText = `${latStr}, ${lngStr}`;
      }
    },

    onQiblaCitySelected(cityKey) {
      const city = this.qiblaCities[cityKey];
      if (!city) return;
      const { bearing, distKm } = this.calculateQiblaBearing(city.lat, city.lng);
      this.updateQiblaDisplay(bearing, distKm, city.name, city.lat, city.lng);
    },

    geolocateQibla() {
      const btn = document.getElementById('btnQiblaGeolocate');
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser. Please select a nearby city from the dropdown.');
        return;
      }

      if (btn) {
        btn.innerHTML = `<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" class="opacity-75"></path></svg><span>Acquiring GPS...</span>`;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const { bearing, distKm } = this.calculateQiblaBearing(lat, lng);
          this.updateQiblaDisplay(bearing, distKm, 'My Live Location (GPS)', lat, lng);
          if (btn) {
            btn.innerHTML = `<svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>Location Updated ✓</span>`;
          }
        },
        (err) => {
          if (btn) {
            btn.innerHTML = `<svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span>Use My Live Location (GPS)</span>`;
          }
          alert('Could not retrieve your live location (' + err.message + '). Please select your city from the dropdown.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    },

    toggleDeviceCompass() {
      const btn = document.getElementById('btnQiblaSensor');
      if (this._deviceCompassActive) {
        window.removeEventListener('deviceorientation', this._deviceOrientationHandler);
        this._deviceCompassActive = false;
        if (btn) {
          btn.innerHTML = `<svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg><span>Enable Mobile Gyro / Compass Sensor</span>`;
        }
        const needle = document.getElementById('qiblaNeedle');
        if (needle && this.state.qiblaTrueBearing !== undefined) {
          needle.style.transform = `rotate(${this.state.qiblaTrueBearing.toFixed(1)}deg)`;
        }
        return;
      }

      const startListening = () => {
        this._deviceOrientationHandler = (e) => {
          let compassHeading = null;
          if (e.webkitCompassHeading !== undefined) {
            compassHeading = e.webkitCompassHeading;
          } else if (e.alpha !== null) {
            compassHeading = 360 - e.alpha;
          }

          if (compassHeading !== null) {
            const needle = document.getElementById('qiblaNeedle');
            const targetBearing = this.state.qiblaTrueBearing || 267.7;
            const needleAngle = (targetBearing - compassHeading + 360) % 360;
            if (needle) {
              needle.style.transform = `rotate(${needleAngle.toFixed(1)}deg)`;
            }
          }
        };

        window.addEventListener('deviceorientation', this._deviceOrientationHandler);
        this._deviceCompassActive = true;
        if (btn) {
          btn.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span><span class="text-emerald-300 font-bold">Gyro Active (Rotate Phone) • Click to Stop</span>`;
        }
      };

      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              startListening();
            } else {
              alert('Permission to access device orientation was denied.');
            }
          })
          .catch(console.error);
      } else if ('ondeviceorientation' in window) {
        startListening();
      } else {
        alert('Device orientation sensors are not supported on this device/browser.');
      }
    },

    // =========================================================================
    // SEERAH TIMELINE & STORIES
    // =========================================================================
    renderSeerah() {
      const container = document.getElementById('seerahTimelineContainer');
      if (!container || !window.MIRATH_DATA) return;

      container.innerHTML = window.MIRATH_DATA.seerahTimeline.map((item, idx) => `
        <div class="relative pl-8 pb-10 border-l-2 border-[#D4AF37]/30 last:border-l-0">
          <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#D4AF37] border-4 border-[#07080a] shadow-lg shadow-[#D4AF37]/40"></div>
          <div 
            class="glass-card interactive-card p-6 border border-[#D4AF37]/20 group cursor-pointer"
            onclick="App.openCardDetail('seerah', ${idx})"
          >
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span class="text-xs font-bold px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/30">${item.year}</span>
              <span class="text-xs text-neutral-400 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                ${item.location}
              </span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2 group-hover:text-[#F6E27A] transition-colors">${item.title}</h3>
            <p class="text-neutral-300 text-sm leading-relaxed mb-3">${item.description}</p>
            <div class="p-3 bg-[#0a0b10] rounded-lg border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between gap-2">
              <div><span class="text-[#D4AF37] font-semibold">Eternal Significance:</span> ${item.significance}</div>
              <span class="text-[#D4AF37] font-semibold shrink-0 group-hover:translate-x-1 transition-transform">Read More →</span>
            </div>
          </div>
        </div>
      `).join('');
    },

    renderProphets() {
      const container = document.getElementById('prophetsGridContainer');
      if (!container || !window.MIRATH_DATA) return;

      container.innerHTML = window.MIRATH_DATA.prophetStories.map(p => `
        <div 
          class="glass-card interactive-card p-6 border border-[#D4AF37]/20 flex flex-col justify-between group cursor-pointer"
          onclick="App.openCardDetail('prophet', '${p.name.replace(/'/g, "\\'")}')"
        >
          <div>
            <div class="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-3">
              <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30">${p.epithet}</span>
              <span class="text-xs text-[#D4AF37] font-medium">${p.keyTheme}</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-1 group-hover:text-[#F6E27A] transition-colors">${p.name}</h3>
            <p class="text-xs text-neutral-400 mb-3">${p.title}</p>
            <p class="text-neutral-300 text-sm leading-relaxed mb-4 line-clamp-4">${p.story}</p>
          </div>
          <div class="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span class="text-neutral-400 font-medium truncate max-w-[170px] sm:max-w-[210px]">Source: ${p.quranReference}</span>
            <span class="text-[#D4AF37] font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Explore Story →
            </span>
          </div>
        </div>
      `).join('');
    },

    renderSahabah() {
      const container = document.getElementById('sahabahGridContainer');
      if (!container || !window.MIRATH_DATA) return;

      container.innerHTML = window.MIRATH_DATA.sahabah.map(s => `
        <div 
          class="glass-card interactive-card p-6 border border-[#D4AF37]/20 flex flex-col justify-between group cursor-pointer"
          onclick="App.openCardDetail('sahabah', '${s.name.replace(/'/g, "\\'")}')"
        >
          <div>
            <div class="border-b border-neutral-800 pb-3 mb-3 flex items-center justify-between">
              <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30">${s.title}</span>
              <span class="text-[11px] text-[#D4AF37] font-serif">رضي الله عنه</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2 group-hover:text-[#F6E27A] transition-colors">${s.name}</h3>
            <p class="text-xs text-[#D4AF37] font-medium mb-3">${s.virtue}</p>
            <p class="text-neutral-300 text-sm leading-relaxed mb-4 line-clamp-4">${s.bio}</p>
          </div>
          <div>
            <div class="p-3 bg-[#0a0b10] rounded-lg border border-neutral-800 text-xs text-neutral-400 italic mb-3">
              "${s.quote}"
            </div>
            <div class="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
              <span class="text-neutral-400">Chronicle</span>
              <span class="text-[#D4AF37] font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                View Profile →
              </span>
            </div>
          </div>
        </div>
      `).join('');
    },

    // =========================================================================
    // AQEEDAH & FIQH (WITH ZAKAT CALCULATOR)
    // =========================================================================
    renderAqeedah() {
      const container = document.getElementById('aqeedahPillarsContainer');
      const fiqhContainer = document.getElementById('fiqhGuidesContainer');
      if (!container || !window.MIRATH_DATA) return;

      container.innerHTML = window.MIRATH_DATA.aqeedahPillars.map((a, idx) => `
        <div 
          class="glass-card interactive-card p-5 border border-[#D4AF37]/20 cursor-pointer group flex flex-col justify-between"
          onclick="App.openCardDetail('aqeedah', ${idx})"
        >
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="w-7 h-7 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F6E27A] font-bold text-xs flex items-center justify-center">
                ${idx + 1}
              </span>
              <span class="font-arabic text-lg text-[#F6E27A] group-hover:text-white transition-colors">${a.arabic}</span>
            </div>
            <h4 class="text-base font-bold text-white mb-2 group-hover:text-[#F6E27A] transition-colors">${a.pillar}</h4>
            <p class="text-neutral-300 text-xs md:text-sm leading-relaxed mb-3">${a.details}</p>
          </div>
          <div class="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-[#D4AF37]">
            <span class="text-neutral-500 text-[11px]">Pillar of Faith</span>
            <span class="group-hover:translate-x-1 transition-transform font-medium">Deep Dive →</span>
          </div>
        </div>
      `).join('');

      if (fiqhContainer) {
        fiqhContainer.innerHTML = window.MIRATH_DATA.fiqhGuides.map((g, idx) => `
          <div 
            class="glass-card interactive-card p-6 border border-[#D4AF37]/20 cursor-pointer group"
            onclick="App.openCardDetail('fiqh', ${idx})"
          >
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-bold text-[#F6E27A] flex items-center gap-2 group-hover:text-white transition-colors">
                <svg class="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ${g.title}
              </h4>
              <span class="text-xs text-[#D4AF37] font-semibold group-hover:translate-x-1 transition-transform">View Full Guide →</span>
            </div>
            <div class="space-y-2">
              ${g.steps.map(s => `
                <div class="text-xs md:text-sm text-neutral-300 p-2.5 rounded bg-[#0c0d12] border border-neutral-800/80">
                  ${s}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('');
      }
    },

    calculateZakat() {
      const cash = parseFloat(document.getElementById('zakatCash')?.value || 0);
      const gold = parseFloat(document.getElementById('zakatGold')?.value || 0);
      const silver = parseFloat(document.getElementById('zakatSilver')?.value || 0);
      const investments = parseFloat(document.getElementById('zakatInvestments')?.value || 0);
      const debts = parseFloat(document.getElementById('zakatDebts')?.value || 0);
      const nisab = parseFloat(document.getElementById('zakatNisabThreshold')?.value || 550);

      const grossAssets = cash + gold + silver + investments;
      const netAssets = Math.max(0, grossAssets - debts);

      const isEligible = netAssets >= nisab;
      const zakatPayable = isEligible ? netAssets * 0.025 : 0;

      const resultBox = document.getElementById('zakatResultBox');
      if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
          <div class="p-6 rounded-xl ${isEligible ? 'bg-gradient-to-br from-[#12161f] to-[#0c0e14] border-2 border-[#D4AF37]' : 'bg-[#101217] border border-neutral-700'}">
            <div class="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <span class="text-sm font-semibold text-neutral-300">Total Net Qualifying Wealth:</span>
              <span class="text-lg font-mono font-bold text-white">$${netAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3 text-xs text-neutral-400">
              <span>Nisab Threshold: $${nisab.toLocaleString()}</span>
              <span>Status: <strong class="${isEligible ? 'text-emerald-400' : 'text-amber-400'}">${isEligible ? 'Above Nisab (Zakat Due)' : 'Below Nisab (Exempt)'}</strong></span>
            </div>
            <div class="text-center pt-2">
              <span class="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">Total Zakat Payable (2.5%):</span>
              <div class="text-3xl md:text-4xl font-bold font-mono gold-text mt-1">
                $${zakatPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p class="text-[11px] text-neutral-400 mt-2">"Take from their wealth a charity by which you purify them and cause them increase." (Surah At-Tawbah 9:103)</p>
            </div>
          </div>
        `;
      }
    },

    // =========================================================================
    // SCHOLAR QUOTES
    // =========================================================================
    renderQuotes() {
      const container = document.getElementById('scholarQuotesContainer');
      if (!container || !window.MIRATH_DATA) return;

      container.innerHTML = window.MIRATH_DATA.scholarQuotes.map(q => {
        const isBookmarked = this.isBookmarked('quote', q.scholar);
        return `
          <div 
            class="glass-card interactive-card p-6 border border-[#D4AF37]/20 flex flex-col justify-between group cursor-pointer"
            onclick="App.openCardDetail('quote', '${q.scholar.replace(/'/g, "\\'")}')"
          >
            <div>
              <div class="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30">${q.category}</span>
                <span class="text-[11px] text-neutral-500 font-mono">${q.era}</span>
              </div>
              <blockquote class="text-base md:text-lg text-neutral-100 font-serif italic mb-6 leading-relaxed group-hover:text-[#F6E27A] transition-colors">
                "${q.quote}"
              </blockquote>
            </div>

            <div class="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <h5 class="text-sm font-bold text-[#F6E27A]">${q.scholar}</h5>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-[#D4AF37] opacity-80 group-hover:opacity-100 flex items-center gap-1 font-medium mr-1 card-click-hint">
                  Wisdom →
                </span>
                <button class="p-2 rounded-lg bg-[#161822] hover:bg-[#D4AF37]/20 text-neutral-300 hover:text-white transition-all" title="Copy Quote" onclick="event.stopPropagation(); App.copyText('${q.quote.replace(/'/g, "\\'")} — ${q.scholar.replace(/'/g, "\\'")}')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </button>
                <button class="p-2 rounded-lg bg-[#161822] hover:bg-[#D4AF37]/20 ${isBookmarked ? 'text-[#D4AF37]' : 'text-neutral-400'} transition-all" title="Bookmark Quote" onclick="event.stopPropagation(); App.toggleBookmark('quote', '${q.scholar}', '${q.scholar}', '${q.quote.replace(/'/g, "\\'")}')">
                  <svg class="w-4 h-4" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    // =========================================================================
    // INTERACTIVE ISLAMIC QUIZ
    // =========================================================================
    renderQuiz() {
      const container = document.getElementById('quizCardContainer');
      if (!container || !window.MIRATH_DATA) return;

      const questions = window.MIRATH_DATA.quiz;
      const curIdx = this.state.quizCurrentIndex;

      // Check if finished
      if (curIdx >= questions.length) {
        const pct = Math.round((this.state.quizScore / questions.length) * 100);
        container.innerHTML = `
          <div class="glass-card p-8 text-center border-2 border-[#D4AF37] max-w-xl mx-auto">
            <div class="w-20 h-20 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] text-[#F6E27A] flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ${pct}%
            </div>
            <h3 class="text-2xl font-bold font-cinzel text-white mb-2">Quiz Completed!</h3>
            <p class="text-neutral-300 text-sm mb-6">
              You scored <strong class="text-[#D4AF37]">${this.state.quizScore}</strong> out of <strong class="text-white">${questions.length}</strong> questions correctly.
            </p>
            <p class="text-xs text-neutral-400 mb-8 italic">
              "And say: My Lord, increase me in knowledge." (Surah Ta-Ha 20:114)
            </p>
            <button class="btn-gold" onclick="App.restartQuiz()">
              Restart Quiz
            </button>
          </div>
        `;
        return;
      }

      const q = questions[curIdx];
      container.innerHTML = `
        <div class="glass-card p-6 md:p-8 max-w-2xl mx-auto border border-[#D4AF37]/30">
          <div class="flex items-center justify-between gap-4 border-b border-neutral-800 pb-4 mb-6">
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30">
              Question ${curIdx + 1} of ${questions.length}
            </span>
            <span class="text-xs text-neutral-400">Score: <strong class="text-[#D4AF37]">${this.state.quizScore}</strong></span>
          </div>

          <h3 class="text-lg md:text-xl font-bold text-white mb-6 leading-relaxed">${q.question}</h3>

          <div class="space-y-3 mb-6" id="quizOptionsContainer">
            ${q.options.map((opt, optIdx) => `
              <button class="w-full text-left p-4 rounded-xl bg-[#0e1015] border border-neutral-800 hover:border-[#D4AF37]/50 text-neutral-200 text-sm transition-all flex items-center justify-between" onclick="App.submitQuizAnswer(${optIdx})">
                <span>${opt}</span>
                <span class="w-6 h-6 rounded-full border border-neutral-700 flex items-center justify-center text-xs text-neutral-400 font-mono">${String.fromCharCode(65 + optIdx)}</span>
              </button>
            `).join('')}
          </div>

          <div id="quizFeedbackArea" class="hidden p-4 rounded-xl mb-6"></div>

          <div id="quizNextAction" class="hidden text-right">
            <button class="btn-gold" onclick="App.nextQuizQuestion()">
              Next Question →
            </button>
          </div>
        </div>
      `;
    },

    submitQuizAnswer(selectedIndex) {
      if (this.state.quizAnswered) return;
      this.state.quizAnswered = true;

      const q = window.MIRATH_DATA.quiz[this.state.quizCurrentIndex];
      const isCorrect = selectedIndex === q.correct;
      if (isCorrect) this.state.quizScore++;

      const feedbackArea = document.getElementById('quizFeedbackArea');
      const nextBtnArea = document.getElementById('quizNextAction');
      const optionsContainer = document.getElementById('quizOptionsContainer');

      if (optionsContainer) {
        Array.from(optionsContainer.children).forEach((btn, idx) => {
          btn.disabled = true;
          if (idx === q.correct) {
            btn.className = 'w-full text-left p-4 rounded-xl bg-emerald-950/50 border-2 border-emerald-500 text-emerald-100 text-sm flex items-center justify-between';
          } else if (idx === selectedIndex) {
            btn.className = 'w-full text-left p-4 rounded-xl bg-red-950/50 border-2 border-red-500 text-red-100 text-sm flex items-center justify-between';
          } else {
            btn.className = 'w-full text-left p-4 rounded-xl bg-[#0e1015] opacity-50 border border-neutral-800 text-neutral-400 text-sm flex items-center justify-between';
          }
        });
      }

      if (feedbackArea) {
        feedbackArea.classList.remove('hidden');
        feedbackArea.className = isCorrect
          ? 'p-4 rounded-xl mb-6 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs md:text-sm'
          : 'p-4 rounded-xl mb-6 bg-red-950/40 border border-red-500/40 text-red-200 text-xs md:text-sm';

        feedbackArea.innerHTML = `
          <div class="font-bold mb-1">${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</div>
          <p class="text-neutral-300 mb-2">${q.explanation}</p>
          <p class="text-[11px] text-neutral-400">Reference: ${q.reference}</p>
        `;
      }

      if (nextBtnArea) {
        nextBtnArea.classList.remove('hidden');
      }
    },

    nextQuizQuestion() {
      this.state.quizAnswered = false;
      this.state.quizCurrentIndex++;
      this.renderQuiz();
    },

    restartQuiz() {
      this.state.quizAnswered = false;
      this.state.quizCurrentIndex = 0;
      this.state.quizScore = 0;
      this.renderQuiz();
    },

    // =========================================================================
    // BOOKMARKS SYSTEM
    // =========================================================================
    isBookmarked(type, id) {
      return this.state.bookmarks.some(b => b.type === type && b.id === id);
    },

    toggleBookmark(type, id, title, snippet) {
      const existingIdx = this.state.bookmarks.findIndex(b => b.type === type && b.id === id);
      if (existingIdx > -1) {
        this.state.bookmarks.splice(existingIdx, 1);
      } else {
        this.state.bookmarks.push({
          type,
          id,
          title,
          snippet: snippet.substring(0, 150),
          timestamp: new Date().toLocaleDateString()
        });
      }

      localStorage.setItem('mirath_bookmarks', JSON.stringify(this.state.bookmarks));
      this.updateBookmarkBadge();
      this.renderQuranSection();
      this.renderHadiths();
      this.renderDuas();
      this.renderQuotes();
    },

    updateBookmarkBadge() {
      if (this.elements.bookmarkBadge) {
        this.elements.bookmarkBadge.innerText = this.state.bookmarks.length;
      }
    },

    openBookmarksModal() {
      if (!this.elements.bookmarksModal || !this.elements.bookmarksList) return;
      this.elements.bookmarksModal.classList.remove('hidden');

      if (this.state.bookmarks.length === 0) {
        this.elements.bookmarksList.innerHTML = `
          <div class="text-center py-12 text-neutral-400">
            <svg class="w-12 h-12 mx-auto mb-3 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            <p class="text-sm">No bookmarks saved yet.</p>
            <p class="text-xs text-neutral-500 mt-1">Click the bookmark ribbon icon on any Ayah, Hadith, Dua, or Quote to save it here.</p>
          </div>
        `;
        return;
      }

      this.elements.bookmarksList.innerHTML = this.state.bookmarks.map(b => `
        <div 
          class="p-4 rounded-xl bg-[#0c0e14] border border-neutral-800 hover:border-[#D4AF37]/50 transition-all flex items-start justify-between gap-4 cursor-pointer group"
          onclick="App.onBookmarkClick('${b.type}', '${b.id}')"
        >
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/30">${b.type}</span>
              <h5 class="text-sm font-bold text-white group-hover:text-[#F6E27A] transition-colors">${b.title}</h5>
            </div>
            <p class="text-xs text-neutral-300 italic mb-1">"${b.snippet}..."</p>
            <span class="text-[10px] text-neutral-500">Saved: ${b.timestamp} • Click to read</span>
          </div>

          <button class="text-neutral-500 hover:text-red-400 p-1.5 transition-colors" title="Remove Bookmark" onclick="event.stopPropagation(); App.removeBookmark('${b.type}', '${b.id}')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      `).join('');
    },

    closeBookmarksModal() {
      if (this.elements.bookmarksModal) {
        this.elements.bookmarksModal.classList.add('hidden');
      }
    },

    removeBookmark(type, id) {
      this.toggleBookmark(type, id, '', '');
      this.openBookmarksModal();
    },

    onBookmarkClick(type, id) {
      this.closeBookmarksModal();
      if (type === 'quran') {
        this.switchTab('quran');
        const parts = String(id).split('-');
        if (parts.length >= 2) {
          setTimeout(() => {
            document.getElementById(`ayah-box-${parts[0]}-${parts[1]}`)?.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      } else {
        this.openCardDetail(type, id);
      }
    },

    // =========================================================================
    // UNIVERSAL CARD DETAIL MODAL (DEEP DIVE READER)
    // =========================================================================
    openCardDetail(type, id) {
      if (!window.MIRATH_DATA) return;

      let item = null;
      let itemsList = [];
      let currentIndex = -1;

      if (type === 'hadith') {
        itemsList = window.MIRATH_DATA.hadiths || [];
        currentIndex = itemsList.findIndex(h => String(h.id) === String(id));
        if (currentIndex === -1 && typeof id === 'number') currentIndex = id;
        if (currentIndex !== -1) item = itemsList[currentIndex];
      } else if (type === 'dua') {
        itemsList = window.MIRATH_DATA.duas || [];
        currentIndex = itemsList.findIndex(d => String(d.id) === String(id));
        if (currentIndex === -1 && typeof id === 'number') currentIndex = id;
        if (currentIndex !== -1) item = itemsList[currentIndex];
      } else if (type === 'prophet') {
        itemsList = window.MIRATH_DATA.prophetStories || [];
        currentIndex = itemsList.findIndex(p => p.name === id);
        if (currentIndex === -1 && typeof id === 'number') currentIndex = id;
        if (currentIndex !== -1) item = itemsList[currentIndex];
      } else if (type === 'sahabah') {
        itemsList = window.MIRATH_DATA.sahabah || [];
        currentIndex = itemsList.findIndex(s => s.name === id);
        if (currentIndex === -1 && typeof id === 'number') currentIndex = id;
        if (currentIndex !== -1) item = itemsList[currentIndex];
      } else if (type === 'quote') {
        itemsList = window.MIRATH_DATA.scholarQuotes || [];
        currentIndex = itemsList.findIndex(q => q.scholar === id);
        if (currentIndex === -1 && typeof id === 'number') currentIndex = id;
        if (currentIndex !== -1) item = itemsList[currentIndex];
      } else if (type === 'seerah') {
        itemsList = window.MIRATH_DATA.seerahTimeline || [];
        currentIndex = typeof id === 'number' ? id : itemsList.findIndex(st => st.year === id || st.title === id);
        if (currentIndex !== -1) item = itemsList[currentIndex];
      } else if (type === 'aqeedah') {
        itemsList = window.MIRATH_DATA.aqeedahPillars || [];
        currentIndex = typeof id === 'number' ? id : parseInt(id, 10);
        if (currentIndex >= 0 && currentIndex < itemsList.length) item = itemsList[currentIndex];
      } else if (type === 'fiqh') {
        itemsList = window.MIRATH_DATA.fiqhGuides || [];
        currentIndex = typeof id === 'number' ? id : parseInt(id, 10);
        if (currentIndex >= 0 && currentIndex < itemsList.length) item = itemsList[currentIndex];
      }

      if (!item) {
        this.showToast('Unable to open card detail.', 'error');
        return;
      }

      this.state.detailModalState = {
        isOpen: true,
        type,
        id,
        index: currentIndex,
        items: itemsList
      };

      this.renderDetailModal(type, item, currentIndex, itemsList.length);

      const modal = document.getElementById('cardDetailModal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }
    },

    closeCardDetailModal() {
      const modal = document.getElementById('cardDetailModal');
      if (modal) {
        modal.classList.add('hidden');
      }
      document.body.classList.remove('overflow-hidden');
      if (this.state.detailModalState) {
        this.state.detailModalState.isOpen = false;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    },

    navigateCardDetail(direction) {
      const s = this.state.detailModalState;
      if (!s || !s.isOpen || !s.items || s.items.length === 0) return;

      const nextIndex = s.index + direction;
      if (nextIndex < 0 || nextIndex >= s.items.length) return;

      const nextItem = s.items[nextIndex];
      let nextId = nextIndex;
      if (s.type === 'hadith' || s.type === 'dua') nextId = nextItem.id;
      else if (s.type === 'prophet' || s.type === 'sahabah') nextId = nextItem.name;
      else if (s.type === 'quote') nextId = nextItem.scholar;

      this.openCardDetail(s.type, nextId);
    },

    renderDetailModal(type, item, index, total) {
      const badgesEl = document.getElementById('cardDetailBadges');
      const contentEl = document.getElementById('cardDetailContent');
      const footerEl = document.getElementById('cardDetailFooter');
      const prevBtn = document.getElementById('cardDetailPrevBtn');
      const nextBtn = document.getElementById('cardDetailNextBtn');
      const bookmarkBtn = document.getElementById('cardDetailBookmarkBtn');

      if (!contentEl) return;

      // Update Nav Buttons
      if (prevBtn) {
        prevBtn.disabled = index <= 0;
        prevBtn.className = index <= 0
          ? 'p-2 rounded-xl bg-[#141722]/50 text-neutral-600 border border-neutral-800/50 cursor-not-allowed'
          : 'p-2 rounded-xl bg-[#141722] hover:bg-[#D4AF37]/20 text-neutral-400 hover:text-[#F6E27A] border border-neutral-800 hover:border-[#D4AF37]/40 transition-all';
      }
      if (nextBtn) {
        nextBtn.disabled = index >= total - 1;
        nextBtn.className = index >= total - 1
          ? 'p-2 rounded-xl bg-[#141722]/50 text-neutral-600 border border-neutral-800/50 cursor-not-allowed'
          : 'p-2 rounded-xl bg-[#141722] hover:bg-[#D4AF37]/20 text-neutral-400 hover:text-[#F6E27A] border border-neutral-800 hover:border-[#D4AF37]/40 transition-all';
      }

      // Check Bookmark state
      let bookmarkId = item.id;
      if (type === 'prophet' || type === 'sahabah') bookmarkId = item.name;
      else if (type === 'quote') bookmarkId = item.scholar;
      else if (type === 'seerah') bookmarkId = `seerah-${index}`;
      else if (type === 'aqeedah') bookmarkId = `aqeedah-${index}`;
      else if (type === 'fiqh') bookmarkId = `fiqh-${index}`;

      const bookmarked = this.isBookmarked(type, bookmarkId);
      if (bookmarkBtn) {
        bookmarkBtn.innerHTML = `
          <svg class="w-4 h-4 ${bookmarked ? 'text-[#D4AF37] fill-current' : 'text-neutral-400'}" fill="${bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
        `;
        bookmarkBtn.title = bookmarked ? 'Remove Bookmark' : 'Add to Bookmarks';
      }

      // Render based on type
      if (type === 'hadith') {
        if (badgesEl) {
          badgesEl.innerHTML = `
            <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/40 font-bold uppercase tracking-wider">Authentic Hadith</span>
            <span class="text-xs px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-semibold">${item.grade}</span>
            <span class="text-[11px] text-neutral-400 font-mono">${index + 1} of ${total}</span>
          `;
        }

        contentEl.innerHTML = `
          <div class="border-b border-neutral-800 pb-4">
            <h3 class="font-serif text-2xl font-bold text-white mb-1">${item.category}</h3>
            <p class="text-xs text-[#D4AF37] font-medium">${item.narrator}</p>
          </div>

          <!-- Arabic Box -->
          <div class="p-6 rounded-2xl bg-[#07080c] border border-[#D4AF37]/30 shadow-inner space-y-4">
            <p class="font-arabic text-2xl sm:text-3xl md:text-4xl text-right text-[#F6E27A] leading-[2.6] select-all font-medium">
              ${item.arabic}
            </p>
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800/80">
              <button class="text-xs px-3 py-1.5 rounded-lg bg-[#141722] hover:bg-[#D4AF37]/20 text-neutral-300 hover:text-white border border-neutral-800 flex items-center gap-1.5 transition-all" onclick="App.speakArabic('${item.arabic.replace(/'/g, "\\'")}')">
                <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                <span>Pronounce Arabic</span>
              </button>
            </div>
          </div>

          <!-- Translation -->
          <div class="space-y-2">
            <span class="text-xs uppercase font-bold tracking-wider text-neutral-400">English Translation</span>
            <blockquote class="text-base sm:text-lg text-neutral-100 font-sans leading-relaxed border-l-2 border-[#D4AF37]/40 pl-4 py-1">
              "${item.translation}"
            </blockquote>
          </div>

          <!-- Scholarly Commentary -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0c0d14] border border-[#D4AF37]/25 shadow-lg space-y-2">
            <div class="flex items-center gap-2 text-xs font-bold text-[#F6E27A] uppercase tracking-wider">
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span>Scholarly Tafsir & Jurisprudence (فقه الحديث)</span>
            </div>
            <p class="text-sm text-neutral-300 leading-relaxed">${item.explanation}</p>
          </div>

          <!-- Citation bar -->
          <div class="p-4 rounded-xl bg-[#0a0c10] border border-neutral-800 text-xs flex flex-wrap items-center justify-between gap-3 text-neutral-400">
            <div><span class="text-neutral-500">Source:</span> <strong class="text-neutral-200">${item.source}</strong></div>
            <div><span class="text-neutral-500">Authenticity:</span> <strong class="text-emerald-400">${item.grade}</strong></div>
          </div>
        `;

        if (footerEl) {
          footerEl.innerHTML = `
            <div class="flex items-center gap-2">
              <button class="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.copyText('${item.arabic.replace(/'/g, "\\'")} - ${item.translation.replace(/'/g, "\\'")} [${item.source}]')">
                <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span>Copy Hadith</span>
              </button>
              <button class="btn-outline-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.shareDetailItem()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span>Share</span>
              </button>
            </div>
            <button class="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all" onclick="App.closeCardDetailModal()">
              Close View
            </button>
          `;
        }
      } else if (type === 'dua') {
        if (badgesEl) {
          badgesEl.innerHTML = `
            <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/40 font-bold uppercase tracking-wider">${item.category}</span>
            <span class="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-mono">Target: ${item.targetCount}x</span>
            <span class="text-[11px] text-neutral-400 font-mono">${index + 1} of ${total}</span>
          `;
        }

        contentEl.innerHTML = `
          <div class="border-b border-neutral-800 pb-4">
            <h3 class="font-serif text-2xl font-bold text-white mb-1">${item.title}</h3>
            <p class="text-xs text-neutral-400">${item.category} • Hisn al-Muslim</p>
          </div>

          <!-- Arabic Box -->
          <div class="p-6 rounded-2xl bg-[#07080c] border border-[#D4AF37]/30 shadow-inner space-y-4">
            <p class="font-arabic text-2xl sm:text-3xl md:text-4xl text-right text-[#F6E27A] leading-[2.6] select-all font-medium">
              ${item.arabic}
            </p>
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800/80">
              <button class="text-xs px-3 py-1.5 rounded-lg bg-[#141722] hover:bg-[#D4AF37]/20 text-neutral-300 hover:text-white border border-neutral-800 flex items-center gap-1.5 transition-all" onclick="App.speakArabic('${item.arabic.replace(/'/g, "\\'")}')">
                <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                <span>Pronounce Arabic</span>
              </button>
            </div>
          </div>

          <!-- Transliteration -->
          <div class="space-y-1">
            <span class="text-xs uppercase font-bold tracking-wider text-neutral-400">Transliteration</span>
            <p class="text-xs sm:text-sm text-neutral-300 italic">${item.transliteration}</p>
          </div>

          <!-- Translation -->
          <div class="space-y-2">
            <span class="text-xs uppercase font-bold tracking-wider text-neutral-400">English Meaning</span>
            <blockquote class="text-base sm:text-lg text-neutral-100 font-sans leading-relaxed border-l-2 border-[#D4AF37]/40 pl-4 py-1">
              "${item.translation}"
            </blockquote>
          </div>

          <!-- Virtue & Reward Box -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0c0d14] border border-[#D4AF37]/25 shadow-lg space-y-2">
            <div class="flex items-center gap-2 text-xs font-bold text-[#F6E27A] uppercase tracking-wider">
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
              <span>Virtue & Divine Reward (فضل الذكر)</span>
            </div>
            <p class="text-sm text-neutral-300 leading-relaxed">${item.virtue}</p>
          </div>

          <!-- Citation bar -->
          <div class="p-4 rounded-xl bg-[#0a0c10] border border-neutral-800 text-xs flex flex-wrap items-center justify-between gap-3 text-neutral-400">
            <div><span class="text-neutral-500">Source:</span> <strong class="text-neutral-200">${item.source}</strong></div>
            <div><span class="text-neutral-500">Recommended Recitation:</span> <strong class="text-[#F6E27A]">${item.targetCount} times</strong></div>
          </div>
        `;

        if (footerEl) {
          footerEl.innerHTML = `
            <div class="flex flex-wrap items-center gap-2">
              <button class="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.setTasbihDua('${item.arabic.replace(/'/g, "\\'")}', '${item.title.replace(/'/g, "\\'")}', ${item.targetCount}); App.closeCardDetailModal(); App.switchTab('tasbih');">
                <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Send to Digital Tasbih</span>
              </button>
              <button class="btn-outline-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.copyText('${item.arabic.replace(/'/g, "\\'")} - ${item.translation.replace(/'/g, "\\'")} [${item.source}]')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span>Copy Dua</span>
              </button>
              <button class="btn-outline-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.shareDetailItem()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span>Share</span>
              </button>
            </div>
            <button class="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all" onclick="App.closeCardDetailModal()">
              Close View
            </button>
          `;
        }
      } else if (type === 'prophet') {
        if (badgesEl) {
          badgesEl.innerHTML = `
            <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/40 font-bold uppercase tracking-wider">Stories of the Prophets</span>
            <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30 font-medium">${item.epithet}</span>
            <span class="text-[11px] text-neutral-400 font-mono">${index + 1} of ${total}</span>
          `;
        }

        contentEl.innerHTML = `
          <div class="border-b border-neutral-800 pb-4">
            <h3 class="font-serif text-2xl font-bold text-white mb-1">Prophet ${item.name} <span class="text-[#D4AF37] font-arabic font-normal text-xl">(عليه السلام)</span></h3>
            <p class="text-xs text-neutral-400">${item.title}</p>
          </div>

          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <span>Key Prophetic Theme:</span>
            <strong class="text-white">${item.keyTheme}</strong>
          </div>

          <!-- Full Narrative -->
          <div class="space-y-3">
            <span class="text-xs uppercase font-bold tracking-wider text-neutral-400">Sacred Chronicle</span>
            <p class="text-base sm:text-lg text-neutral-200 leading-relaxed font-light">
              ${item.story}
            </p>
          </div>

          <!-- Qur'anic Citation & Evidences -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0c0d14] border border-[#D4AF37]/25 shadow-lg space-y-2">
            <div class="flex items-center gap-2 text-xs font-bold text-[#F6E27A] uppercase tracking-wider">
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span>Qur'anic Evidences & Reference</span>
            </div>
            <p class="text-sm text-neutral-300 leading-relaxed">Revealed in the Holy Qur'an: <strong class="text-white">${item.quranReference}</strong></p>
          </div>
        `;

        if (footerEl) {
          footerEl.innerHTML = `
            <div class="flex items-center gap-2">
              <button class="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.copyText('Prophet ${item.name} (${item.epithet}) - ${item.story} [Ref: ${item.quranReference}]')">
                <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span>Copy Story</span>
              </button>
              <button class="btn-outline-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.shareDetailItem()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span>Share</span>
              </button>
            </div>
            <button class="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all" onclick="App.closeCardDetailModal()">
              Close View
            </button>
          `;
        }
      } else if (type === 'sahabah') {
        if (badgesEl) {
          badgesEl.innerHTML = `
            <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/40 font-bold uppercase tracking-wider">The Noble Sahabah</span>
            <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30 font-medium">${item.title}</span>
            <span class="text-[11px] text-neutral-400 font-mono">${index + 1} of ${total}</span>
          `;
        }

        contentEl.innerHTML = `
          <div class="border-b border-neutral-800 pb-4">
            <h3 class="font-serif text-2xl font-bold text-white mb-1">${item.name} <span class="text-[#D4AF37] font-arabic font-normal text-xl">(رضي الله عنه)</span></h3>
            <p class="text-xs text-[#D4AF37] font-medium">${item.virtue}</p>
          </div>

          <!-- Biography -->
          <div class="space-y-2">
            <span class="text-xs uppercase font-bold tracking-wider text-neutral-400">Historic Profile & Legacy</span>
            <p class="text-base sm:text-lg text-neutral-200 leading-relaxed font-light">
              ${item.bio}
            </p>
          </div>

          <!-- Timeless Quote -->
          <div class="p-6 rounded-2xl bg-gradient-to-br from-[#141724] to-[#0c0d14] border border-[#D4AF37]/30 shadow-lg space-y-2">
            <div class="text-xs font-bold text-[#F6E27A] uppercase tracking-wider">Timeless Words of Wisdom</div>
            <blockquote class="text-base sm:text-lg text-neutral-100 font-serif italic leading-relaxed">
              "${item.quote}"
            </blockquote>
          </div>
        `;

        if (footerEl) {
          footerEl.innerHTML = `
            <div class="flex items-center gap-2">
              <button class="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.copyText('${item.name} (${item.title}): \\"${item.quote}\\" - ${item.bio}')">
                <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span>Copy Chronicle</span>
              </button>
              <button class="btn-outline-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.shareDetailItem()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span>Share</span>
              </button>
            </div>
            <button class="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all" onclick="App.closeCardDetailModal()">
              Close View
            </button>
          `;
        }
      } else if (type === 'quote') {
        if (badgesEl) {
          badgesEl.innerHTML = `
            <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/40 font-bold uppercase tracking-wider">${item.category}</span>
            <span class="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-mono">${item.era}</span>
            <span class="text-[11px] text-neutral-400 font-mono">${index + 1} of ${total}</span>
          `;
        }

        contentEl.innerHTML = `
          <div class="border-b border-neutral-800 pb-4">
            <h3 class="font-serif text-2xl font-bold text-white mb-1">${item.scholar} <span class="text-[#D4AF37] font-arabic font-normal text-xl">(رحمه الله)</span></h3>
            <p class="text-xs text-neutral-400">Classical Luminary • Era: ${item.era}</p>
          </div>

          <div class="p-8 rounded-2xl bg-gradient-to-br from-[#151824] to-[#0c0d14] border-2 border-[#D4AF37]/35 shadow-xl space-y-4">
            <span class="text-xs font-bold text-[#F6E27A] uppercase tracking-wider">Sacred Wisdom & Reflection</span>
            <blockquote class="text-xl sm:text-2xl text-neutral-100 font-serif italic leading-relaxed">
              "${item.quote}"
            </blockquote>
            <p class="text-xs text-[#D4AF37] font-mono text-right">— ${item.scholar}</p>
          </div>
        `;

        if (footerEl) {
          footerEl.innerHTML = `
            <div class="flex items-center gap-2">
              <button class="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.copyText('${item.quote.replace(/'/g, "\\'")} — ${item.scholar.replace(/'/g, "\\'")} (${item.era})')">
                <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span>Copy Quote</span>
              </button>
              <button class="btn-outline-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.shareDetailItem()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span>Share</span>
              </button>
            </div>
            <button class="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all" onclick="App.closeCardDetailModal()">
              Close View
            </button>
          `;
        }
      } else if (type === 'seerah') {
        if (badgesEl) {
          badgesEl.innerHTML = `
            <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/40 font-bold uppercase tracking-wider">Prophetic Seerah</span>
            <span class="text-xs px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold">${item.year}</span>
            <span class="text-[11px] text-neutral-400 font-mono">${index + 1} of ${total}</span>
          `;
        }

        contentEl.innerHTML = `
          <div class="border-b border-neutral-800 pb-4">
            <h3 class="font-serif text-2xl font-bold text-white mb-1">${item.title}</h3>
            <p class="text-xs text-neutral-400 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>${item.location} • Year ${item.year}</span>
            </p>
          </div>

          <div class="space-y-2">
            <span class="text-xs uppercase font-bold tracking-wider text-neutral-400">Historical Event</span>
            <p class="text-base sm:text-lg text-neutral-200 leading-relaxed font-light">
              ${item.description}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0c0d14] border border-[#D4AF37]/25 shadow-lg space-y-2">
            <div class="flex items-center gap-2 text-xs font-bold text-[#F6E27A] uppercase tracking-wider">
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>Eternal Significance for Believers</span>
            </div>
            <p class="text-sm text-neutral-300 leading-relaxed">${item.significance}</p>
          </div>
        `;

        if (footerEl) {
          footerEl.innerHTML = `
            <div class="flex items-center gap-2">
              <button class="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.copyText('${item.title} (${item.year}, ${item.location}) - ${item.description}')">
                <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span>Copy Milestone</span>
              </button>
              <button class="btn-outline-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.shareDetailItem()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span>Share</span>
              </button>
            </div>
            <button class="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all" onclick="App.closeCardDetailModal()">
              Close View
            </button>
          `;
        }
      } else if (type === 'aqeedah') {
        if (badgesEl) {
          badgesEl.innerHTML = `
            <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/40 font-bold uppercase tracking-wider">6 Pillars of Iman</span>
            <span class="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-mono">Pillar ${index + 1} of 6</span>
          `;
        }

        contentEl.innerHTML = `
          <div class="border-b border-neutral-800 pb-4 flex items-center justify-between">
            <div>
              <h3 class="font-serif text-2xl font-bold text-white mb-1">${item.pillar}</h3>
              <p class="text-xs text-[#D4AF37]">Foundational Creed of Ahlus Sunnah wal-Jama'ah</p>
            </div>
            <span class="font-arabic text-3xl gold-text font-bold">${item.arabic}</span>
          </div>

          <div class="p-6 rounded-2xl bg-[#090b10] border border-[#D4AF37]/30 shadow-inner space-y-4">
            <span class="text-xs font-bold text-[#F6E27A] uppercase tracking-wider">Theological Doctrine & Evidences</span>
            <p class="text-base sm:text-lg text-neutral-200 leading-relaxed font-light">
              ${item.details}
            </p>
          </div>
        `;

        if (footerEl) {
          footerEl.innerHTML = `
            <button class="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.copyText('${item.pillar} (${item.arabic}) - ${item.details}')">
              <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              <span>Copy Creed</span>
            </button>
            <button class="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all" onclick="App.closeCardDetailModal()">
              Close View
            </button>
          `;
        }
      } else if (type === 'fiqh') {
        if (badgesEl) {
          badgesEl.innerHTML = `
            <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/40 font-bold uppercase tracking-wider">Practical Fiqh Guide</span>
            <span class="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-mono">${item.steps.length} Steps</span>
          `;
        }

        contentEl.innerHTML = `
          <div class="border-b border-neutral-800 pb-4">
            <h3 class="font-serif text-2xl font-bold text-white mb-1">${item.title}</h3>
            <p class="text-xs text-[#D4AF37]">Authentic Sunnah Methodology & Requirements</p>
          </div>

          <div class="space-y-3">
            ${item.steps.map((st, i) => `
              <div class="p-4 rounded-xl bg-[#0c0e15] border border-neutral-800/90 flex items-start gap-3.5">
                <span class="w-6 h-6 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F6E27A] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ${i + 1}
                </span>
                <p class="text-sm sm:text-base text-neutral-200 leading-relaxed">${st}</p>
              </div>
            `).join('')}
          </div>
        `;

        if (footerEl) {
          footerEl.innerHTML = `
            <button class="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5" onclick="App.copyText('${item.title}:\\n${item.steps.join('\\n')}')">
              <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              <span>Copy Guide</span>
            </button>
            <button class="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all" onclick="App.closeCardDetailModal()">
              Close View
            </button>
          `;
        }
      }
    },

    // =========================================================================
    // GLOBAL SEARCH MODAL
    // =========================================================================
    openSearchModal() {
      if (this.elements.searchModal) {
        this.elements.searchModal.classList.remove('hidden');
        const input = document.getElementById('modalSearchInput');
        if (input) {
          input.value = '';
          input.focus();
        }
        this.executeSearch('');
      }
    },

    closeSearchModal() {
      if (this.elements.searchModal) {
        this.elements.searchModal.classList.add('hidden');
      }
    },

    executeSearch(query) {
      const q = query.trim().toLowerCase();
      const container = this.elements.searchResultsContainer;
      if (!container || !window.MIRATH_DATA) return;

      if (!q) {
        container.innerHTML = `
          <div class="text-center py-8 text-neutral-500 text-xs">
            Start typing to search across the Qur’an, Hadiths, Duas, Stories, and Scholar Quotes...
          </div>
        `;
        return;
      }

      const results = [];

      // Check for Admin / Studio command shortcut
      if (q.includes('admin') || q.includes('studio') || q.includes('curator') || q === '/admin') {
        results.push({
          category: 'Curator Studio',
          title: 'Curator Sanctuary & Content Editor',
          snippet: 'Access the restricted contributor studio to add, edit, or curate Hadiths, Duas, and quotes.',
          action: () => {
            this.closeSearchModal();
            this.switchTab('admin');
          }
        });
      }

      // 0. Search All 114 Qur'an Chapters
      if (window.MIRATH_SURAHS) {
        window.MIRATH_SURAHS.forEach(s => {
          const numStr = String(s.number);
          if (
            s.nameEnglish.toLowerCase().includes(q) ||
            s.nameArabic.includes(q) ||
            s.translation.toLowerCase().includes(q) ||
            q === numStr ||
            q === `surah ${numStr}` ||
            q === `surah ${s.nameEnglish.toLowerCase()}`
          ) {
            results.push({
              category: 'Qur’an Chapter',
              title: `Surah ${s.number}. ${s.nameEnglish} (${s.nameArabic})`,
              snippet: `${s.translation} • ${s.numberOfAyahs} Ayahs • ${s.revelationType}`,
              action: () => {
                this.closeSearchModal();
                this.selectSurah(s.number);
              }
            });
          }
        });
      }

      // 1. Search Quran (Ayahs)
      window.MIRATH_DATA.quran.forEach((surah, sIdx) => {
        surah.ayahs.forEach((ayah, aIdx) => {
          if (ayah.translation.toLowerCase().includes(q) || ayah.transliteration.toLowerCase().includes(q) || ayah.arabic.includes(q)) {
            results.push({
              category: 'Qur’an',
              title: `${surah.nameEnglish} (${ayah.numberInSurah})`,
              snippet: ayah.translation,
              action: () => {
                this.closeSearchModal();
                this.switchTab('quran');
                this.state.currentSurahIndex = sIdx;
                this.state.currentAyahIndex = aIdx;
                this.renderQuranSection();
                setTimeout(() => {
                  document.getElementById(`ayah-box-${surah.id}-${ayah.numberInSurah}`)?.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              }
            });
          }
        });
      });

      // 2. Search Hadiths
      window.MIRATH_DATA.hadiths.forEach(h => {
        if (h.translation.toLowerCase().includes(q) || h.category.toLowerCase().includes(q) || h.narrator.toLowerCase().includes(q) || h.arabic.includes(q)) {
          results.push({
            category: 'Hadith',
            title: `${h.category} - ${h.source}`,
            snippet: h.translation,
            action: () => {
              this.closeSearchModal();
              this.openCardDetail('hadith', h.id);
            }
          });
        }
      });

      // 3. Search Duas
      window.MIRATH_DATA.duas.forEach(d => {
        if (d.title.toLowerCase().includes(q) || d.translation.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || d.arabic.includes(q)) {
          results.push({
            category: 'Dua & Adhkar',
            title: d.title,
            snippet: d.translation,
            action: () => {
              this.closeSearchModal();
              this.openCardDetail('dua', d.id);
            }
          });
        }
      });

      // 4. Search Scholar Quotes
      window.MIRATH_DATA.scholarQuotes.forEach(sq => {
        if (sq.quote.toLowerCase().includes(q) || sq.scholar.toLowerCase().includes(q) || sq.category.toLowerCase().includes(q)) {
          results.push({
            category: 'Scholar Quote',
            title: sq.scholar,
            snippet: sq.quote,
            action: () => {
              this.closeSearchModal();
              this.openCardDetail('quote', sq.scholar);
            }
          });
        }
      });

      // 5. Search Prophets
      if (window.MIRATH_DATA.prophetStories) {
        window.MIRATH_DATA.prophetStories.forEach(p => {
          if (p.name.toLowerCase().includes(q) || p.story.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || (p.keyTheme && p.keyTheme.toLowerCase().includes(q))) {
            results.push({
              category: 'Prophets',
              title: p.name,
              snippet: p.story,
              action: () => {
                this.closeSearchModal();
                this.openCardDetail('prophet', p.name);
              }
            });
          }
        });
      }

      // 6. Search Sahabah
      if (window.MIRATH_DATA.sahabah) {
        window.MIRATH_DATA.sahabah.forEach(s => {
          if (s.name.toLowerCase().includes(q) || s.bio.toLowerCase().includes(q) || s.virtue.toLowerCase().includes(q) || s.quote.toLowerCase().includes(q)) {
            results.push({
              category: 'Sahabah',
              title: s.name,
              snippet: s.bio,
              action: () => {
                this.closeSearchModal();
                this.openCardDetail('sahabah', s.name);
              }
            });
          }
        });
      }

      // 7. Search Seerah
      if (window.MIRATH_DATA.seerahTimeline) {
        window.MIRATH_DATA.seerahTimeline.forEach((st, idx) => {
          if (st.title.toLowerCase().includes(q) || st.description.toLowerCase().includes(q) || st.significance.toLowerCase().includes(q) || st.year.toLowerCase().includes(q)) {
            results.push({
              category: 'Seerah',
              title: `${st.year} - ${st.title}`,
              snippet: st.description,
              action: () => {
                this.closeSearchModal();
                this.openCardDetail('seerah', idx);
              }
            });
          }
        });
      }

      // 8. Search Aqeedah & Fiqh
      if (window.MIRATH_DATA.aqeedahPillars) {
        window.MIRATH_DATA.aqeedahPillars.forEach((a, idx) => {
          if (a.pillar.toLowerCase().includes(q) || a.details.toLowerCase().includes(q) || a.arabic.includes(q)) {
            results.push({
              category: 'Aqeedah',
              title: a.pillar,
              snippet: a.details,
              action: () => {
                this.closeSearchModal();
                this.openCardDetail('aqeedah', idx);
              }
            });
          }
        });
      }

      if (results.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 text-neutral-400 text-xs">
            No matches found for "${query}". Try searching for words like "patience", "heart", "knowledge", or "mercy".
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="text-xs text-neutral-400 mb-2 px-1">Found ${results.length} result(s):</div>
        <div class="space-y-2">
          ${results.slice(0, 15).map((res, i) => `
            <div class="p-3 rounded-lg bg-[#0d0f15] hover:bg-[#161a24] border border-neutral-800 hover:border-[#D4AF37]/50 cursor-pointer transition-all" onclick="App.runSearchResultAction(${i})">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30">${res.category}</span>
                <span class="text-xs font-bold text-white">${res.title}</span>
              </div>
              <p class="text-xs text-neutral-300 line-clamp-2">${res.snippet}</p>
            </div>
          `).join('')}
        </div>
      `;

      this._currentSearchResults = results;
    },

    runSearchResultAction(index) {
      if (this._currentSearchResults && this._currentSearchResults[index]) {
        this._currentSearchResults[index].action();
      }
    },

    // =========================================================================
    // CONTRIBUTOR / ADMIN STUDIO & DATA MANAGEMENT
    // =========================================================================
    showToast(message, type = 'gold') {
      let toast = document.getElementById('mirathToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'mirathToast';
        document.body.appendChild(toast);
      }

      if (type === 'error') {
        toast.className = 'fixed bottom-24 right-6 z-[100] px-5 py-3.5 rounded-2xl backdrop-blur-xl border border-red-500/50 bg-red-950/90 text-red-200 flex items-center gap-3 shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 text-sm font-semibold';
        toast.innerHTML = `<svg class="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>${message}</span>`;
      } else {
        toast.className = 'fixed bottom-24 right-6 z-[100] px-5 py-3.5 rounded-2xl backdrop-blur-xl border border-[#D4AF37] bg-[#12141d]/95 text-[#F6E27A] flex items-center gap-3 shadow-2xl shadow-[#D4AF37]/20 transition-all duration-300 transform translate-y-0 opacity-100 text-sm font-semibold';
        toast.innerHTML = `<svg class="w-5 h-5 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>${message}</span>`;
      }

      clearTimeout(this._toastTimeout);
      this._toastTimeout = setTimeout(() => {
        toast.className = 'fixed bottom-24 right-6 z-[100] px-5 py-3.5 rounded-2xl backdrop-blur-xl border opacity-0 pointer-events-none transition-all duration-300 transform translate-y-10 text-sm font-semibold';
      }, 3500);
    },

    async loadCustomData() {
      try {
        const raw = localStorage.getItem('mirath_custom_data');
        if (raw) {
          const parsed = JSON.parse(raw);
          this.state.customData = {
            hadiths: Array.isArray(parsed.hadiths) ? parsed.hadiths : [],
            duas: Array.isArray(parsed.duas) ? parsed.duas : [],
            scholarQuotes: Array.isArray(parsed.scholarQuotes) ? parsed.scholarQuotes : [],
            prophetStories: Array.isArray(parsed.prophetStories) ? parsed.prophetStories : [],
            sahabah: Array.isArray(parsed.sahabah) ? parsed.sahabah : [],
            quiz: Array.isArray(parsed.quiz) ? parsed.quiz : []
          };
        }

        if (this.state.cloudSyncConfig && this.state.cloudSyncConfig.type === 'supabase' && this.state.cloudSyncConfig.url && this.state.cloudSyncConfig.key) {
          await this.syncFromSupabase();
        }

        this.mergeCustomDataIntoMirath();
      } catch (err) {
        console.warn('Failed to load custom data:', err);
      }
    },

    mergeCustomDataIntoMirath() {
      if (!window.MIRATH_DATA) return;
      const categories = ['hadiths', 'duas', 'scholarQuotes', 'prophetStories', 'sahabah', 'quiz'];
      categories.forEach(cat => {
        if (Array.isArray(window.MIRATH_DATA[cat])) {
          window.MIRATH_DATA[cat] = window.MIRATH_DATA[cat].filter(item => !item.isCustom);
          if (this.state.customData && Array.isArray(this.state.customData[cat])) {
            window.MIRATH_DATA[cat] = [...this.state.customData[cat], ...window.MIRATH_DATA[cat]];
          }
        }
      });
    },

    async saveCustomData() {
      localStorage.setItem('mirath_custom_data', JSON.stringify(this.state.customData));
      this.mergeCustomDataIntoMirath();
      this.renderAdminCustomList();

      if (this.state.cloudSyncConfig && this.state.cloudSyncConfig.type === 'supabase' && this.state.cloudSyncConfig.url && this.state.cloudSyncConfig.key) {
        await this.syncToSupabase();
      }
    },

    async syncFromSupabase() {
      try {
        const { url, key } = this.state.cloudSyncConfig;
        const cleanUrl = url.replace(/\/$/, '');
        const res = await fetch(`${cleanUrl}/rest/v1/mirath_store?key=eq.custom_data&select=*`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });
        if (res.ok) {
          const rows = await res.json();
          if (rows && rows.length > 0 && rows[0].data) {
            this.state.customData = rows[0].data;
            localStorage.setItem('mirath_custom_data', JSON.stringify(this.state.customData));
            console.log('Synced custom repository from Supabase.');
          }
        }
      } catch (err) {
        console.warn('Supabase pull error:', err);
      }
    },

    async syncToSupabase() {
      try {
        const { url, key } = this.state.cloudSyncConfig;
        const cleanUrl = url.replace(/\/$/, '');
        const res = await fetch(`${cleanUrl}/rest/v1/mirath_store`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            key: 'custom_data',
            data: this.state.customData,
            updated_at: new Date().toISOString()
          })
        });
        if (res.ok) {
          console.log('Successfully saved to Supabase cloud.');
        }
      } catch (err) {
        console.warn('Supabase push error:', err);
      }
    },

    updateAdminLockUI() {
      const lockScreen = document.getElementById('adminLockScreen');
      const studioContent = document.getElementById('adminStudioContent');
      const lockError = document.getElementById('adminLockError');
      const passInput = document.getElementById('adminPasscodeInput');
      const hideNavCheckbox = document.getElementById('hideStudioNavCheckbox');

      if (hideNavCheckbox) {
        hideNavCheckbox.checked = !!this.state.hideStudioFromNav;
      }

      if (this.state.adminUnlocked) {
        if (lockScreen) lockScreen.classList.add('hidden');
        if (studioContent) studioContent.classList.remove('hidden');
        if (lockError) lockError.classList.add('hidden');
      } else {
        if (lockScreen) lockScreen.classList.remove('hidden');
        if (studioContent) studioContent.classList.add('hidden');
        if (passInput) passInput.value = '';
      }
    },

    async hashPasscode(pin) {
      const salt = 'mirath_sacred_vault:';
      const text = salt + pin;
      if (window.crypto && window.crypto.subtle) {
        try {
          const msgBuffer = new TextEncoder().encode(text);
          const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (_) {}
      }
      return this._sha256Fallback(text);
    },

    _sha256Fallback(ascii) {
      function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
      }
      const mathPow = Math.pow;
      const maxWord = mathPow(2, 32);
      const lengthProperty = 'length';
      let i, j;
      let result = '';
      const words = [];
      const asciiBitLength = ascii[lengthProperty] * 8;
      const hash = [];
      const k = [];
      let primeCounter = 0;
      const isComposite = {};
      for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
          for (i = 0; i < 313; i += candidate) {
            isComposite[i] = candidate;
          }
          hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
          k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
      }
      ascii += '\x80';
      while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
      for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return '';
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
      }
      words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
      words[words[lengthProperty]] = asciiBitLength;
      for (j = 0; j < words[lengthProperty];) {
        const w = words.slice(j, j += 16);
        const oldHash = hash.slice(0);
        for (i = 0; i < 64; i++) {
          const w15 = w[i - 15], w2 = w[i - 2];
          const a = hash[0], e = hash[4];
          const temp1 = hash[7]
            + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
            + ((e & hash[5]) ^ ((~e) & hash[6]))
            + k[i]
            + (w[i] = (i < 16) ? w[i] : (
                w[i - 16]
                + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                + w[i - 7]
                + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
              ) | 0
            );
          const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
            + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
          hash = [(temp1 + temp2) | 0].concat(hash);
          hash[4] = (hash[4] + temp1) | 0;
        }
        for (i = 0; i < 8; i++) {
          hash[i] = (hash[i] + oldHash[i]) | 0;
        }
      }
      for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
          const b = (hash[i] >> (j * 8)) & 255;
          result += ((b < 16) ? 0 : '') + b.toString(16);
        }
      }
      return result;
    },

    async submitAdminUnlock(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('adminPasscodeInput');
      const errorMsg = document.getElementById('adminLockError');
      const entered = input ? input.value.trim() : '';
      if (!entered) return;

      const enteredHash = await this.hashPasscode(entered);
      if (enteredHash === this.state.adminPasscodeHash) {
        this.state.adminUnlocked = true;
        localStorage.setItem('mirath_admin_auth', 'true');
        if (errorMsg) errorMsg.classList.add('hidden');
        this.updateAdminLockUI();
        this.renderAdminCustomList();
        this.showToast('Curator Studio unlocked! Welcome back.');
      } else {
        if (errorMsg) {
          errorMsg.classList.remove('hidden');
          errorMsg.innerText = 'Incorrect curator passcode. Access is restricted.';
        }
        if (input) {
          input.value = '';
          input.focus();
        }
        this.showToast('Invalid passcode.', 'error');
      }
    },

    lockAdmin() {
      this.state.adminUnlocked = false;
      localStorage.removeItem('mirath_admin_auth');
      this.updateAdminLockUI();
      this.showToast('Curator Studio locked.');
    },

    async changeAdminPasscode(e) {
      if (e) e.preventDefault();
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required!', 'error');
        return;
      }

      const oldPass = document.getElementById('adminOldPasscode')?.value.trim();
      const newPass = document.getElementById('adminNewPasscode')?.value.trim();
      const confirmPass = document.getElementById('adminConfirmPasscode')?.value.trim();
      const errorContainer = document.getElementById('adminSecurityMsg');

      const oldHash = await this.hashPasscode(oldPass || '');
      if (oldHash !== this.state.adminPasscodeHash) {
        if (errorContainer) {
          errorContainer.innerHTML = '<span class="text-rose-400">Current passcode is incorrect.</span>';
        }
        this.showToast('Current passcode is incorrect.', 'error');
        return;
      }

      if (!newPass || newPass.length < 4) {
        if (errorContainer) {
          errorContainer.innerHTML = '<span class="text-rose-400">New passcode must be at least 4 characters.</span>';
        }
        this.showToast('Passcode must be at least 4 characters.', 'error');
        return;
      }

      if (newPass !== confirmPass) {
        if (errorContainer) {
          errorContainer.innerHTML = '<span class="text-rose-400">New passcodes do not match.</span>';
        }
        this.showToast('New passcodes do not match.', 'error');
        return;
      }

      const newHash = await this.hashPasscode(newPass);
      this.state.adminPasscodeHash = newHash;
      localStorage.setItem('mirath_admin_hash', newHash);
      localStorage.removeItem('mirath_admin_pin');

      if (document.getElementById('adminOldPasscode')) document.getElementById('adminOldPasscode').value = '';
      if (document.getElementById('adminNewPasscode')) document.getElementById('adminNewPasscode').value = '';
      if (document.getElementById('adminConfirmPasscode')) document.getElementById('adminConfirmPasscode').value = '';

      if (errorContainer) {
        errorContainer.innerHTML = '<span class="text-emerald-400">Passcode updated successfully! Remember to share it only with your fiancée.</span>';
      }
      this.showToast('Curator passcode updated!');
    },

    toggleStudioNavVisibility() {
      this.state.hideStudioFromNav = !this.state.hideStudioFromNav;
      localStorage.setItem('mirath_hide_studio_nav', this.state.hideStudioFromNav ? 'true' : 'false');
      this.applyNavVisibility();
      if (this.state.hideStudioFromNav) {
        this.showToast('Stealth Mode active: Studio hidden from public navigation.');
      } else {
        this.showToast('Studio button restored in navigation.');
      }
    },

    applyNavVisibility() {
      const headerBtn = document.getElementById('headerStudioBtn');
      const navBtn = document.getElementById('navStudioBtn');
      const hideNavCheckbox = document.getElementById('hideStudioNavCheckbox');

      if (hideNavCheckbox) {
        hideNavCheckbox.checked = !!this.state.hideStudioFromNav;
      }

      if (this.state.hideStudioFromNav) {
        if (headerBtn) headerBtn.classList.add('hidden');
        if (navBtn) navBtn.classList.add('hidden');
      } else {
        if (headerBtn) headerBtn.classList.remove('hidden');
        if (navBtn) navBtn.classList.remove('hidden');
      }
    },

    switchAdminSubTab(subTabId) {
      this.state.adminActiveSubTab = subTabId;
      document.querySelectorAll('.admin-subtab-btn').forEach(btn => {
        if (btn.getAttribute('data-admin-subtab') === subTabId) {
          btn.className = 'admin-subtab-btn px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 transition-all';
        } else {
          btn.className = 'admin-subtab-btn px-4 py-2 rounded-xl text-xs font-semibold bg-[#12141d] text-neutral-400 hover:text-white border border-neutral-800 transition-all';
        }
      });

      document.querySelectorAll('.admin-subtab-panel').forEach(panel => {
        if (panel.id === `admin-subtab-${subTabId}`) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });

      if (subTabId === 'manage') {
        this.renderAdminCustomList();
      }
    },

    filterAdminCustomList(category) {
      this.state.adminFilterCategory = category;
      document.querySelectorAll('.admin-filter-pill').forEach(btn => {
        if (btn.getAttribute('data-admin-filter') === category) {
          btn.className = 'admin-filter-pill px-3 py-1 rounded-lg text-xs font-bold bg-[#D4AF37] text-black transition-all';
        } else {
          btn.className = 'admin-filter-pill px-3 py-1 rounded-lg text-xs bg-[#151722] text-neutral-400 hover:text-white border border-neutral-800 transition-all';
        }
      });
      this.renderAdminCustomList();
    },

    addCustomHadith(e) {
      if (e) e.preventDefault();
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required!', 'error');
        return;
      }
      const arabic = document.getElementById('adminHadithArabic')?.value.trim();
      const translation = document.getElementById('adminHadithTrans')?.value.trim();
      const narrator = document.getElementById('adminHadithNarrator')?.value.trim() || 'Narrated by Companion';
      const source = document.getElementById('adminHadithSource')?.value.trim() || 'Authentic Sunnah';
      const grade = document.getElementById('adminHadithGrade')?.value.trim() || 'Sahih';
      const category = document.getElementById('adminHadithCategory')?.value.trim() || 'General Wisdom';
      const explanation = document.getElementById('adminHadithExplanation')?.value.trim() || 'Commentary and spiritual guidance.';

      if (!arabic || !translation) {
        this.showToast('Please provide both Arabic text and English translation.', 'error');
        return;
      }

      const item = {
        id: 'custom-hadith-' + Date.now(),
        arabic,
        translation,
        narrator,
        source,
        grade,
        category,
        explanation,
        isCustom: true,
        dateAdded: new Date().toLocaleDateString()
      };

      this.state.customData.hadiths.unshift(item);
      this.saveCustomData();
      this.renderHadiths();

      document.getElementById('adminHadithArabic').value = '';
      document.getElementById('adminHadithTrans').value = '';
      document.getElementById('adminHadithExplanation').value = '';

      this.showToast('Hadith successfully added to Treasury!');
      this.switchAdminSubTab('manage');
    },

    addCustomDua(e) {
      if (e) e.preventDefault();
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required!', 'error');
        return;
      }
      const title = document.getElementById('adminDuaTitle')?.value.trim();
      const arabic = document.getElementById('adminDuaArabic')?.value.trim();
      const transliteration = document.getElementById('adminDuaTranslit')?.value.trim() || '';
      const translation = document.getElementById('adminDuaTrans')?.value.trim();
      const category = document.getElementById('adminDuaCategory')?.value.trim() || 'Daily Adhkar';
      const virtue = document.getElementById('adminDuaVirtue')?.value.trim() || 'Great reward and protection.';
      const source = document.getElementById('adminDuaSource')?.value.trim() || 'Hisn al-Muslim';
      const targetCount = parseInt(document.getElementById('adminDuaTarget')?.value || '1', 10);

      if (!title || !arabic || !translation) {
        this.showToast('Please provide Title, Arabic text, and Translation.', 'error');
        return;
      }

      const item = {
        id: 'custom-dua-' + Date.now(),
        title,
        arabic,
        transliteration,
        translation,
        category,
        virtue,
        source,
        targetCount,
        isCustom: true,
        dateAdded: new Date().toLocaleDateString()
      };

      this.state.customData.duas.unshift(item);
      this.saveCustomData();
      this.renderDuas();

      document.getElementById('adminDuaTitle').value = '';
      document.getElementById('adminDuaArabic').value = '';
      document.getElementById('adminDuaTranslit').value = '';
      document.getElementById('adminDuaTrans').value = '';
      document.getElementById('adminDuaVirtue').value = '';

      this.showToast('Dua successfully added to Treasury!');
      this.switchAdminSubTab('manage');
    },

    addCustomQuote(e) {
      if (e) e.preventDefault();
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required!', 'error');
        return;
      }
      const scholar = document.getElementById('adminQuoteScholar')?.value.trim();
      const era = document.getElementById('adminQuoteEra')?.value.trim() || 'Classical Scholar';
      const category = document.getElementById('adminQuoteCategory')?.value.trim() || 'Heart & Wisdom';
      const quote = document.getElementById('adminQuoteText')?.value.trim();

      if (!scholar || !quote) {
        this.showToast('Please provide Scholar Name and Quote text.', 'error');
        return;
      }

      const item = {
        id: 'custom-quote-' + Date.now(),
        scholar,
        era,
        category,
        quote,
        isCustom: true,
        dateAdded: new Date().toLocaleDateString()
      };

      this.state.customData.scholarQuotes.unshift(item);
      this.saveCustomData();
      this.renderQuotes();

      document.getElementById('adminQuoteScholar').value = '';
      document.getElementById('adminQuoteText').value = '';

      this.showToast('Scholar Quote successfully added!');
      this.switchAdminSubTab('manage');
    },

    addCustomProphet(e) {
      if (e) e.preventDefault();
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required!', 'error');
        return;
      }
      const name = document.getElementById('adminProphetName')?.value.trim();
      const title = document.getElementById('adminProphetTitle')?.value.trim() || name;
      const epithet = document.getElementById('adminProphetEpithet')?.value.trim() || 'Prophet of Allah';
      const keyTheme = document.getElementById('adminProphetTheme')?.value.trim() || 'Patience & Faith';
      const quranReference = document.getElementById('adminProphetRef')?.value.trim() || 'The Holy Qur’an';
      const story = document.getElementById('adminProphetStory')?.value.trim();

      if (!name || !story) {
        this.showToast('Please provide Prophet Name and Story Narrative.', 'error');
        return;
      }

      const item = {
        id: 'custom-prophet-' + Date.now(),
        name,
        title,
        epithet,
        keyTheme,
        quranReference,
        story,
        isCustom: true,
        dateAdded: new Date().toLocaleDateString()
      };

      this.state.customData.prophetStories.unshift(item);
      this.saveCustomData();
      this.renderProphets();

      document.getElementById('adminProphetName').value = '';
      document.getElementById('adminProphetStory').value = '';

      this.showToast('Prophet story added to Treasury!');
      this.switchAdminSubTab('manage');
    },

    addCustomSahabah(e) {
      if (e) e.preventDefault();
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required!', 'error');
        return;
      }
      const name = document.getElementById('adminSahabahName')?.value.trim();
      const title = document.getElementById('adminSahabahTitle')?.value.trim() || 'Noble Companion';
      const virtue = document.getElementById('adminSahabahVirtue')?.value.trim() || 'Devotion & Bravery';
      const bio = document.getElementById('adminSahabahBio')?.value.trim();
      const quote = document.getElementById('adminSahabahQuote')?.value.trim() || 'Devoted to the path of Allah.';

      if (!name || !bio) {
        this.showToast('Please provide Companion Name and Biography.', 'error');
        return;
      }

      const item = {
        id: 'custom-sahabah-' + Date.now(),
        name,
        title,
        virtue,
        bio,
        quote,
        isCustom: true,
        dateAdded: new Date().toLocaleDateString()
      };

      this.state.customData.sahabah.unshift(item);
      this.saveCustomData();
      this.renderSahabah();

      document.getElementById('adminSahabahName').value = '';
      document.getElementById('adminSahabahBio').value = '';
      document.getElementById('adminSahabahQuote').value = '';

      this.showToast('Sahabah chronicle added to Treasury!');
      this.switchAdminSubTab('manage');
    },

    addCustomQuiz(e) {
      if (e) e.preventDefault();
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required!', 'error');
        return;
      }
      const question = document.getElementById('adminQuizQuestion')?.value.trim();
      const optA = document.getElementById('adminQuizOptA')?.value.trim();
      const optB = document.getElementById('adminQuizOptB')?.value.trim();
      const optC = document.getElementById('adminQuizOptC')?.value.trim();
      const optD = document.getElementById('adminQuizOptD')?.value.trim();
      const correct = parseInt(document.getElementById('adminQuizCorrect')?.value || '0', 10);
      const explanation = document.getElementById('adminQuizExplanation')?.value.trim() || 'Authentic knowledge explanation.';
      const reference = document.getElementById('adminQuizReference')?.value.trim() || 'Islamic Tradition';

      if (!question || !optA || !optB || !optC || !optD) {
        this.showToast('Please provide the Question and all 4 Options.', 'error');
        return;
      }

      const item = {
        id: 'custom-quiz-' + Date.now(),
        question,
        options: [optA, optB, optC, optD],
        correct,
        explanation,
        reference,
        isCustom: true,
        dateAdded: new Date().toLocaleDateString()
      };

      this.state.customData.quiz.unshift(item);
      this.saveCustomData();
      this.renderQuiz();

      document.getElementById('adminQuizQuestion').value = '';
      document.getElementById('adminQuizOptA').value = '';
      document.getElementById('adminQuizOptB').value = '';
      document.getElementById('adminQuizOptC').value = '';
      document.getElementById('adminQuizOptD').value = '';
      document.getElementById('adminQuizExplanation').value = '';

      this.showToast('Quiz question added to Library!');
      this.switchAdminSubTab('manage');
    },

    deleteCustomItem(category, itemId) {
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required!', 'error');
        return;
      }
      if (!confirm('Are you sure you want to delete this custom entry?')) return;

      if (this.state.customData[category]) {
        this.state.customData[category] = this.state.customData[category].filter(i => i.id !== itemId);
      }

      this.saveCustomData();

      if (category === 'hadiths') this.renderHadiths();
      if (category === 'duas') this.renderDuas();
      if (category === 'scholarQuotes') this.renderQuotes();
      if (category === 'prophetStories') this.renderProphets();
      if (category === 'sahabah') this.renderSahabah();
      if (category === 'quiz') this.renderQuiz();

      this.showToast('Entry deleted successfully.');
    },

    renderAdminCustomList() {
      const container = document.getElementById('adminCustomEntriesList');
      const statsBadge = document.getElementById('adminTotalStatsBadge');
      if (!container) return;

      const filter = this.state.adminFilterCategory || 'all';
      const cd = this.state.customData || {};

      let items = [];
      if (filter === 'all' || filter === 'hadiths') {
        (cd.hadiths || []).forEach(h => items.push({ category: 'Hadith', catKey: 'hadiths', id: h.id, title: `${h.category} (${h.source})`, text: h.translation, date: h.dateAdded }));
      }
      if (filter === 'all' || filter === 'duas') {
        (cd.duas || []).forEach(d => items.push({ category: 'Dua', catKey: 'duas', id: d.id, title: d.title, text: d.translation, date: d.dateAdded }));
      }
      if (filter === 'all' || filter === 'scholarQuotes') {
        (cd.scholarQuotes || []).forEach(q => items.push({ category: 'Quote', catKey: 'scholarQuotes', id: q.id, title: q.scholar, text: q.quote, date: q.dateAdded }));
      }
      if (filter === 'all' || filter === 'prophetStories') {
        (cd.prophetStories || []).forEach(p => items.push({ category: 'Prophet', catKey: 'prophetStories', id: p.id, title: p.name, text: p.story, date: p.dateAdded }));
      }
      if (filter === 'all' || filter === 'sahabah') {
        (cd.sahabah || []).forEach(s => items.push({ category: 'Sahabah', catKey: 'sahabah', id: s.id, title: s.name, text: s.bio, date: s.dateAdded }));
      }
      if (filter === 'all' || filter === 'quiz') {
        (cd.quiz || []).forEach(q => items.push({ category: 'Quiz', catKey: 'quiz', id: q.id, title: q.question, text: `Correct: ${q.options[q.correct]}`, date: q.dateAdded }));
      }

      const totalCount = (cd.hadiths?.length || 0) + (cd.duas?.length || 0) + (cd.scholarQuotes?.length || 0) + (cd.prophetStories?.length || 0) + (cd.sahabah?.length || 0) + (cd.quiz?.length || 0);

      if (statsBadge) {
        statsBadge.innerText = `${totalCount} Custom Items Curated`;
      }

      document.getElementById('statCustomHadiths') && (document.getElementById('statCustomHadiths').innerText = cd.hadiths?.length || 0);
      document.getElementById('statCustomDuas') && (document.getElementById('statCustomDuas').innerText = cd.duas?.length || 0);
      document.getElementById('statCustomQuotes') && (document.getElementById('statCustomQuotes').innerText = cd.scholarQuotes?.length || 0);
      document.getElementById('statCustomProphets') && (document.getElementById('statCustomProphets').innerText = cd.prophetStories?.length || 0);
      document.getElementById('statCustomSahabah') && (document.getElementById('statCustomSahabah').innerText = cd.sahabah?.length || 0);
      document.getElementById('statCustomQuiz') && (document.getElementById('statCustomQuiz').innerText = cd.quiz?.length || 0);

      if (items.length === 0) {
        container.innerHTML = `
          <div class="glass-card p-8 text-center border border-neutral-800">
            <svg class="w-12 h-12 mx-auto mb-3 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <p class="text-sm text-neutral-300 font-semibold">No custom items added yet.</p>
            <p class="text-xs text-neutral-500 mt-1">Use the tabs above (Add Hadith, Add Dua, Add Quote, etc.) to contribute content to your repository.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="space-y-3">
          ${items.map(item => `
            <div class="glass-card p-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 flex items-start justify-between gap-4 transition-all">
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/30">${item.category}</span>
                  <h4 class="text-sm font-bold text-white truncate">${item.title}</h4>
                  ${item.date ? `<span class="text-[10px] text-neutral-500">Added: ${item.date}</span>` : ''}
                </div>
                <p class="text-xs text-neutral-300 line-clamp-2">${item.text}</p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button class="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-white transition-all flex items-center gap-1 text-xs" title="Delete Entry" onclick="App.deleteCustomItem('${item.catKey}', '${item.id}')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  <span class="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    exportUpdatedDataJs() {
      if (!window.MIRATH_DATA) return;
      const jsonText = JSON.stringify(window.MIRATH_DATA, null, 2);
      const fileContent = `/**
 * MIRATH (ميراث) - Authentic Islamic Knowledge Repository
 * Updated from Contributor Studio: ${new Date().toISOString()}
 */

const MIRATH_DATA = ${jsonText};

// Expose globally for browser usage
if (typeof window !== 'undefined') {
  window.MIRATH_DATA = MIRATH_DATA;
}
`;
      const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('Downloaded updated data.js!');
    },

    exportJsonBackup() {
      const dataStr = JSON.stringify(this.state.customData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mirath_custom_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('Backup JSON exported successfully!');
    },

    importJsonBackup(input) {
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required to import backups!', 'error');
        if (input) input.value = '';
        return;
      }
      if (!input.files || !input.files[0]) return;
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (typeof parsed === 'object') {
            this.state.customData = {
              hadiths: Array.isArray(parsed.hadiths) ? parsed.hadiths : [],
              duas: Array.isArray(parsed.duas) ? parsed.duas : [],
              scholarQuotes: Array.isArray(parsed.scholarQuotes) ? parsed.scholarQuotes : [],
              prophetStories: Array.isArray(parsed.prophetStories) ? parsed.prophetStories : [],
              sahabah: Array.isArray(parsed.sahabah) ? parsed.sahabah : [],
              quiz: Array.isArray(parsed.quiz) ? parsed.quiz : []
            };
            this.saveCustomData();
            this.renderAll();
            this.showToast('Backup successfully imported!');
          } else {
            throw new Error('Invalid format');
          }
        } catch (err) {
          this.showToast('Invalid JSON file format.', 'error');
        }
      };
      reader.readAsText(file);
      input.value = '';
    },

    resetCustomData() {
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required!', 'error');
        return;
      }
      if (!confirm('Warning: This will delete ALL custom entries you and your fiancée added locally. Ensure you have exported a backup first! Proceed?')) return;
      this.state.customData = { hadiths: [], duas: [], scholarQuotes: [], prophetStories: [], sahabah: [], quiz: [] };
      this.saveCustomData();
      this.renderAll();
      this.showToast('All custom entries reset.');
    },

    saveCloudConfig(e) {
      if (e) e.preventDefault();
      if (!this.state.adminUnlocked) {
        this.showToast('Curator access required!', 'error');
        return;
      }
      const url = document.getElementById('supabaseProjectUrl')?.value.trim();
      const key = document.getElementById('supabaseAnonKey')?.value.trim();

      if (!url || !key) {
        this.state.cloudSyncConfig = { type: 'none', url: '', key: '' };
        localStorage.removeItem('mirath_cloud_config');
        this.showToast('Cloud sync disabled. Using LocalStorage.');
        return;
      }

      this.state.cloudSyncConfig = { type: 'supabase', url, key };
      localStorage.setItem('mirath_cloud_config', JSON.stringify(this.state.cloudSyncConfig));
      this.syncToSupabase();
      this.showToast('Supabase cloud credentials saved and synced!');
    },

    copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast('Copied to clipboard successfully!');
        }).catch(() => {
          this.fallbackCopyText(text);
        });
      } else {
        this.fallbackCopyText(text);
      }
    },

    fallbackCopyText(text) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showToast('Copied to clipboard!');
      } catch (err) {
        this.showToast('Unable to copy text.', 'error');
      }
    }
  };

  // Attach App to window for inline onclick handlers
  window.App = App;
  App.init();
});
