/**
 * MIRATH (ميراث) - Main Application Controller
 * Handles Navigation, Audio Player, Hifdh Mode, Interactive Tasbih, Zakat Calculator, Quiz, Bookmarks & Search.
 */

document.addEventListener('DOMContentLoaded', () => {
  const App = {
    state: {
      activeTab: 'home',
      currentSurahIndex: 0,
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
      cloudSyncConfig: JSON.parse(localStorage.getItem('mirath_cloud_config') || '{"type":"none","url":"","key":""}'),
      customData: {
        hadiths: [],
        duas: [],
        scholarQuotes: [],
        prophetStories: [],
        sahabah: [],
        quiz: []
      }
    },

    elements: {},
    audio: new Audio(),
    audioContext: null,

    async init() {
      this.cacheElements();
      await this.loadCustomData();
      this.bindEvents();
      this.renderAll();
      this.calculateZakat();
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
        } else if (e.key === 'Escape') {
          this.closeSearchModal();
          this.closeBookmarksModal();
        }
      });
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
      if (tabId === 'admin') this.renderAdminCustomList();
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
    // QUR'AN & HIFDH MEMORISATION TOOL
    // =========================================================================
    renderQuranSection() {
      const container = document.getElementById('quranSurahContainer');
      const selector = document.getElementById('surahSelectDropdown');
      if (!container || !window.MIRATH_DATA) return;

      const currentSurah = window.MIRATH_DATA.quran[this.state.currentSurahIndex];

      // Render selector options once if empty
      if (selector && selector.children.length <= 1) {
        selector.innerHTML = window.MIRATH_DATA.quran.map((s, idx) => `
          <option value="${idx}" ${idx === this.state.currentSurahIndex ? 'selected' : ''}>
            ${s.surahNumber}. ${s.nameEnglish} (${s.nameArabic}) - ${s.translation}
          </option>
        `).join('');

        selector.addEventListener('change', (e) => {
          this.state.currentSurahIndex = parseInt(e.target.value, 10);
          this.state.currentAyahIndex = 0;
          this.renderQuranSection();
        });
      }
      if (selector) {
        selector.value = this.state.currentSurahIndex;
      }

      // Render Ayahs
      container.innerHTML = `
        <div class="glass-card p-6 md:p-8 mb-8 border border-[#D4AF37]/30">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-6 mb-6">
            <div>
              <div class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-sm">
                  ${currentSurah.surahNumber}
                </span>
                <h2 class="text-2xl md:text-3xl font-bold font-cinzel text-white">${currentSurah.nameEnglish}</h2>
                <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30">${currentSurah.revelationType}</span>
              </div>
              <p class="text-neutral-400 text-sm mt-1">${currentSurah.translation} • ${currentSurah.totalVerses} Verses</p>
            </div>
            
            <div class="text-right">
              <span class="font-arabic text-3xl md:text-4xl gold-text font-bold">${currentSurah.nameArabic}</span>
            </div>
          </div>

          <!-- Bismillah if applicable -->
          ${currentSurah.bismillah ? `
            <div class="text-center py-6 font-arabic text-2xl md:text-3xl gold-text select-none">
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
                      <button class="p-2 rounded-lg bg-[#161820] hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-all" title="Listen to Ayah" onclick="App.playAyah(${this.state.currentSurahIndex}, ${aIdx})">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                      <button class="p-2 rounded-lg bg-[#161820] hover:bg-[#D4AF37]/20 ${isBookmarked ? 'text-[#D4AF37]' : 'text-neutral-400'} transition-all" title="Bookmark Ayah" onclick="App.toggleBookmark('ayah', '${currentSurah.id}-${ayah.numberInSurah}', '${currentSurah.nameEnglish} Ayah ${ayah.numberInSurah}', '${ayah.arabic.replace(/'/g, "\\'")}')">
                        <svg class="w-4 h-4" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                      </button>
                      <button class="p-2 rounded-lg bg-[#161820] hover:bg-emerald-500/20 ${isMemorized ? 'text-emerald-400' : 'text-neutral-400'} transition-all" title="Mark as Memorized" onclick="App.toggleMemorized('${currentSurah.id}-${ayah.numberInSurah}')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </button>
                    </div>
                  </div>

                  <!-- Arabic Ayah Text -->
                  <div class="font-arabic text-2xl md:text-3xl text-right text-[#F6E27A] mb-4 leading-loose tracking-wide select-none">
                    ${this.state.hifdhWordMask 
                      ? ayah.words.map(w => `<span class="hifdh-masked-word hifdh-mask-active" onclick="this.classList.toggle('hifdh-mask-revealed'); this.classList.toggle('hifdh-mask-active')">${w}</span>`).join(' ')
                      : ayah.arabic}
                    <span class="inline-block text-[#D4AF37] font-serif text-lg mx-2">۝${this.convertToArabicNumber(ayah.numberInSurah)}</span>
                  </div>

                  <!-- Transliteration -->
                  <div class="text-xs md:text-sm text-neutral-400 italic mb-2">
                    ${ayah.transliteration}
                  </div>

                  <!-- Translation (Blur-capable for testing) -->
                  <div class="text-sm md:text-base text-neutral-200 ${this.state.hifdhHideTranslation ? 'blur-translation' : ''}" title="${this.state.hifdhHideTranslation ? 'Hover to reveal translation' : ''}">
                    ${ayah.translation}
                  </div>
                </div>
              `;
            }).join('')}
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
    playAyah(surahIdx, ayahIdx) {
      this.state.currentSurahIndex = surahIdx;
      this.state.currentAyahIndex = ayahIdx;
      const surah = window.MIRATH_DATA.quran[surahIdx];
      const ayah = surah.ayahs[ayahIdx];

      this.audio.src = ayah.audio;
      this.audio.play().then(() => {
        this.elements.audioBar.classList.remove('hidden');
        this.elements.audioSurahTitle.innerText = `${surah.nameEnglish} (${surah.nameArabic})`;
        this.elements.audioAyahInfo.innerText = `Ayah ${ayah.numberInSurah} of ${surah.totalVerses} • Reciter: Mishary Alafasy`;
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
      const surah = window.MIRATH_DATA.quran[this.state.currentSurahIndex];
      if (this.state.currentAyahIndex + 1 < surah.ayahs.length) {
        this.playAyah(this.state.currentSurahIndex, this.state.currentAyahIndex + 1);
      } else {
        this.setAudioPlayState(false);
      }
    },

    playNextAyah() {
      const surah = window.MIRATH_DATA.quran[this.state.currentSurahIndex];
      if (this.state.currentAyahIndex + 1 < surah.ayahs.length) {
        this.playAyah(this.state.currentSurahIndex, this.state.currentAyahIndex + 1);
      }
    },

    playPrevAyah() {
      if (this.state.currentAyahIndex > 0) {
        this.playAyah(this.state.currentSurahIndex, this.state.currentAyahIndex - 1);
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
          <div class="glass-card p-6 border border-[#D4AF37]/20 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-4">
                <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30 font-medium">${h.category}</span>
                <span class="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">${h.grade}</span>
              </div>

              <!-- Arabic text -->
              <p class="font-arabic text-xl md:text-2xl text-right text-[#F6E27A] mb-4 leading-loose">
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
              <div>
                <p class="font-medium text-neutral-300">${h.narrator}</p>
                <p class="text-[11px] text-neutral-500">${h.source}</p>
              </div>

              <div class="flex items-center gap-2">
                <button class="p-2 rounded-lg bg-[#161822] hover:bg-[#D4AF37]/20 text-neutral-300 hover:text-white transition-all" title="Copy Hadith" onclick="App.copyText('${h.arabic.replace(/'/g, "\\'")} - ${h.translation.replace(/'/g, "\\'")}')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </button>
                <button class="p-2 rounded-lg bg-[#161822] hover:bg-[#D4AF37]/20 ${isBookmarked ? 'text-[#D4AF37]' : 'text-neutral-400'} transition-all" title="Bookmark Hadith" onclick="App.toggleBookmark('hadith', '${h.id}', '${h.category} (${h.source})', '${h.translation.replace(/'/g, "\\'")}')">
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
          <div class="glass-card p-6 border border-[#D4AF37]/20 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-4">
                <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30 font-medium">${d.category}</span>
                <span class="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">Repeat: ${d.targetCount}x</span>
              </div>

              <h3 class="text-base font-bold text-white mb-3">${d.title}</h3>

              <!-- Arabic -->
              <p class="font-arabic text-xl md:text-2xl text-right text-[#F6E27A] mb-3 leading-loose">
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
              <span>Source: ${d.source}</span>
              <div class="flex items-center gap-2">
                <button class="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#F6E27A] border border-[#D4AF37]/30 flex items-center gap-1.5" onclick="App.setTasbihDua('${d.arabic.replace(/'/g, "\\'")}', '${d.title.replace(/'/g, "\\'")}', ${d.targetCount})">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Counter
                </button>
                <button class="p-2 rounded-lg bg-[#161822] hover:bg-[#D4AF37]/20 ${isBookmarked ? 'text-[#D4AF37]' : 'text-neutral-400'} transition-all" title="Bookmark Dua" onclick="App.toggleBookmark('dua', '${d.id}', '${d.title}', '${d.translation.replace(/'/g, "\\'")}')">
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
    // SEERAH TIMELINE & STORIES
    // =========================================================================
    renderSeerah() {
      const container = document.getElementById('seerahTimelineContainer');
      if (!container || !window.MIRATH_DATA) return;

      container.innerHTML = window.MIRATH_DATA.seerahTimeline.map((item, idx) => `
        <div class="relative pl-8 pb-10 border-l-2 border-[#D4AF37]/30 last:border-l-0">
          <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#D4AF37] border-4 border-[#07080a] shadow-lg shadow-[#D4AF37]/40"></div>
          <div class="glass-card p-6 border border-[#D4AF37]/20">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span class="text-xs font-bold px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/30">${item.year}</span>
              <span class="text-xs text-neutral-400 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                ${item.location}
              </span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">${item.title}</h3>
            <p class="text-neutral-300 text-sm leading-relaxed mb-3">${item.description}</p>
            <div class="p-3 bg-[#0a0b10] rounded-lg border border-neutral-800 text-xs text-neutral-400">
              <span class="text-[#D4AF37] font-semibold">Eternal Significance:</span> ${item.significance}
            </div>
          </div>
        </div>
      `).join('');
    },

    renderProphets() {
      const container = document.getElementById('prophetsGridContainer');
      if (!container || !window.MIRATH_DATA) return;

      container.innerHTML = window.MIRATH_DATA.prophetStories.map(p => `
        <div class="glass-card p-6 border border-[#D4AF37]/20 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-3">
              <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30">${p.epithet}</span>
              <span class="text-xs text-[#D4AF37] font-medium">${p.keyTheme}</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-1">${p.name}</h3>
            <p class="text-xs text-neutral-400 mb-3">${p.title}</p>
            <p class="text-neutral-300 text-sm leading-relaxed mb-4">${p.story}</p>
          </div>
          <div class="pt-3 border-t border-neutral-800 text-xs text-neutral-500">
            <span class="text-neutral-400 font-medium">Qur'anic Source:</span> ${p.quranReference}
          </div>
        </div>
      `).join('');
    },

    renderSahabah() {
      const container = document.getElementById('sahabahGridContainer');
      if (!container || !window.MIRATH_DATA) return;

      container.innerHTML = window.MIRATH_DATA.sahabah.map(s => `
        <div class="glass-card p-6 border border-[#D4AF37]/20 flex flex-col justify-between">
          <div>
            <div class="border-b border-neutral-800 pb-3 mb-3">
              <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30">${s.title}</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">${s.name}</h3>
            <p class="text-xs text-[#D4AF37] font-medium mb-3">${s.virtue}</p>
            <p class="text-neutral-300 text-sm leading-relaxed mb-4">${s.bio}</p>
          </div>
          <div class="p-3 bg-[#0a0b10] rounded-lg border border-neutral-800 text-xs text-neutral-400 italic">
            "${s.quote}"
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
        <div class="glass-card p-5 border border-[#D4AF37]/20">
          <div class="flex items-center justify-between mb-3">
            <span class="w-7 h-7 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F6E27A] font-bold text-xs flex items-center justify-center">
              ${idx + 1}
            </span>
            <span class="font-arabic text-lg text-[#F6E27A]">${a.arabic}</span>
          </div>
          <h4 class="text-base font-bold text-white mb-2">${a.pillar}</h4>
          <p class="text-neutral-300 text-xs md:text-sm leading-relaxed">${a.details}</p>
        </div>
      `).join('');

      if (fiqhContainer) {
        fiqhContainer.innerHTML = window.MIRATH_DATA.fiqhGuides.map(g => `
          <div class="glass-card p-6 border border-[#D4AF37]/20">
            <h4 class="text-lg font-bold text-[#F6E27A] mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              ${g.title}
            </h4>
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
          <div class="glass-card p-6 border border-[#D4AF37]/20 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                <span class="text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#F6E27A] border border-[#D4AF37]/30">${q.category}</span>
                <span class="text-[11px] text-neutral-500 font-mono">${q.era}</span>
              </div>
              <blockquote class="text-base md:text-lg text-neutral-100 font-serif italic mb-6 leading-relaxed">
                "${q.quote}"
              </blockquote>
            </div>

            <div class="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <h5 class="text-sm font-bold text-[#F6E27A]">${q.scholar}</h5>
              </div>
              <div class="flex items-center gap-2">
                <button class="p-2 rounded-lg bg-[#161822] hover:bg-[#D4AF37]/20 text-neutral-300 hover:text-white transition-all" title="Copy Quote" onclick="App.copyText('${q.quote.replace(/'/g, "\\'")} — ${q.scholar.replace(/'/g, "\\'")}')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </button>
                <button class="p-2 rounded-lg bg-[#161822] hover:bg-[#D4AF37]/20 ${isBookmarked ? 'text-[#D4AF37]' : 'text-neutral-400'} transition-all" title="Bookmark Quote" onclick="App.toggleBookmark('quote', '${q.scholar}', '${q.scholar}', '${q.quote.replace(/'/g, "\\'")}')">
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
        <div class="p-4 rounded-xl bg-[#0c0e14] border border-neutral-800 hover:border-[#D4AF37]/40 transition-all flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F6E27A] border border-[#D4AF37]/30">${b.type}</span>
              <h5 class="text-sm font-bold text-white">${b.title}</h5>
            </div>
            <p class="text-xs text-neutral-300 italic mb-1">"${b.snippet}..."</p>
            <span class="text-[10px] text-neutral-500">Saved: ${b.timestamp}</span>
          </div>

          <button class="text-neutral-500 hover:text-red-400 p-1.5 transition-colors" title="Remove Bookmark" onclick="App.removeBookmark('${b.type}', '${b.id}')">
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

      // 1. Search Quran
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
              this.switchTab('hadith');
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
              this.switchTab('duas');
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
              this.switchTab('quotes');
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
                this.switchTab('prophets');
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
                this.switchTab('sahabah');
              }
            });
          }
        });
      }

      // 7. Search Seerah
      if (window.MIRATH_DATA.seerahTimeline) {
        window.MIRATH_DATA.seerahTimeline.forEach(st => {
          if (st.title.toLowerCase().includes(q) || st.description.toLowerCase().includes(q) || st.significance.toLowerCase().includes(q) || st.year.toLowerCase().includes(q)) {
            results.push({
              category: 'Seerah',
              title: `${st.year} - ${st.title}`,
              snippet: st.description,
              action: () => {
                this.closeSearchModal();
                this.switchTab('seerah');
              }
            });
          }
        });
      }

      // 8. Search Aqeedah & Fiqh
      if (window.MIRATH_DATA.aqeedahPillars) {
        window.MIRATH_DATA.aqeedahPillars.forEach(a => {
          if (a.pillar.toLowerCase().includes(q) || a.details.toLowerCase().includes(q) || a.arabic.includes(q)) {
            results.push({
              category: 'Aqeedah',
              title: a.pillar,
              snippet: a.details,
              action: () => {
                this.closeSearchModal();
                this.switchTab('aqeedah');
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
      if (!confirm('Warning: This will delete ALL custom entries you and your fiancée added locally. Ensure you have exported a backup first! Proceed?')) return;
      this.state.customData = { hadiths: [], duas: [], scholarQuotes: [], prophetStories: [], sahabah: [], quiz: [] };
      this.saveCustomData();
      this.renderAll();
      this.showToast('All custom entries reset.');
    },

    saveCloudConfig(e) {
      if (e) e.preventDefault();
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
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard successfully!');
      }).catch(() => {
        alert('Copied!');
      });
    }
  };

  // Attach App to window for inline onclick handlers
  window.App = App;
  App.init();
});
