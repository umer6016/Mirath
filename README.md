# MIRATH (ميراث) — The Sacred Islamic Knowledge Treasury & Sanctuary

> **بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ**  
> *"The scholars are the heirs of the Prophets, and the Prophets did not leave behind dinars or dirhams, but they left behind knowledge; whoever takes it has taken an abundant share."* (Sunan Abi Dawud #3641)

An authentic, all-in-one Islamic library crafted with a luxury **Gold & Obsidian** aesthetic, featuring the Holy Qur’an with recitations and memorisation tools, verified Hadith, Duas & Adhkar, Seerah timeline, Prophetic stories, Sahabah chronicles, Aqeedah, Fiqh, Zakat calculator, interactive quizzes, and an integrated **Contributor Studio**.

---

## 🌟 Key Features

1. **🏛️ Overview Hub**: Daily Ayah & Hadith spotlight, quick stats, and direct links to all 10 repositories.
2. **📖 Complete 114 Qur’an Chapters & Hifdh Studio**: Full Uthmani Arabic script for all 114 Surahs, Saheeh International English translations, Mishary Rashid Alafasy audio recitations, interactive **Word Masking**, **Translation Blurring**, and **Loop Repetitions** (1x, 3x, 5x, 10x).
3. **🏛️ 114 Surahs Directory & Search**: Comprehensive directory grid with search by name/number, revelation filters (Meccan/Medinan), and 1-click reader launch.
4. **📜 Hadith Treasury**: Sahih al-Bukhari and Sahih Muslim traditions with authenticity grades, narrator chains, scholarly insights, one-click copy, and bookmarking.
5. **🤲 Duas & Daily Adhkar**: Fortress of the Muslim (*Hisn al-Muslim*) supplications with target repetition counters, virtues, and direct **"Counter"** button to load into the Tasbih.
6. **📿 Tactile Digital Tasbih**: Interactive Dhikr ring with circular gold SVG progress bar, Web Audio harmonic chime on each bead, haptic vibration support, and 8 authentic Dhikr presets.
7. **🌙 Seerah Timeline**: Chronological historical milestones of Prophet Muhammad ﷺ from 570 CE to 632 CE.
8. **✨ Stories of the Prophets**: Detailed chronicles of Adam, Ibrahim, Yusuf, Musa, and Isa (عليهم السلام) with Qur’anic citations.
9. **⚔️ The Noble Sahabah**: Biographies, sacrifices, and inspiring sayings of the Rightly Guided Caliphs and Companions (رضي الله عنهم).
10. **🕋 Aqeedah & Practical Fiqh**: The 6 Pillars of Iman and illustrated step-by-step guides for Wudu and Salah.
11. **⚖️ Zakat & Nisab Calculator**: Real-time 2.5% calculation on cash, gold, silver, shares, and liabilities with live Nisab threshold comparison.
12. **💎 Scholar Wisdom**: Reflections from classical luminaries (Imam ash-Shafi'i, Hasan al-Basri, Ibn al-Qayyim, Imam Ahmad).
13. **🏆 Interactive Islamic Quiz**: Multi-choice knowledge challenges with instant explanations, references, score tracking, and replay.
14. **✍️ Contributor Studio & Editor**: Dedicated in-app dashboard to add, manage, and delete custom entries across all categories, with 1-click `data.js` and `.json` export/import, plus optional Supabase cloud sync!
15. **🔍 Universal Search**: Instant global modal accessible via `Ctrl + K` or `/` searching across all 114 Surahs, Hadiths, Duas, Stories, and Quotes.
16. **🔖 Bookmarks System**: Save any Ayah, Hadith, Dua, or Quote to local storage.
17. **🎧 Floating Audio Player**: Persistent bar with time tracker, previous/next controls, and repeat looping.

---

## 🎓 GitHub Student Pack Deployment Guide

With your **GitHub Student Developer Pack**, you get free access to GitHub Pro, unlimited GitHub Pages with automated GitHub Actions, and free custom domains from Namecheap or .TECH!

### Step 1: Create the GitHub Repository & Push

Run the automated helper script in your terminal:
```bash
./deploy.sh
```

Or run via GitHub CLI (`gh`):
```bash
gh auth login
gh repo create Mirath --public --source=. --remote=origin --push
```

### Step 2: Automatic GitHub Pages Deployment (Free SSL)

The repository already includes `.github/workflows/deploy.yml` and `.nojekyll`.
1. On GitHub, navigate to: `https://github.com/umer6016/Mirath/settings/pages`
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Every push to `main` automatically deploys the website to:
   `https://umer6016.github.io/Mirath/`

### Step 3: Claim Your Free Custom Domain (GitHub Student Pack Perk)
1. Go to the [GitHub Student Developer Pack benefits](https://education.github.com/pack).
2. Claim your free 1-year domain name from **Namecheap** (`.me`) or **.TECH** (e.g., `mirath-library.me`).
3. In `https://github.com/umer6016/Mirath/settings/pages`, type your custom domain under **Custom domain** and check **Enforce HTTPS**.
4. GitHub will automatically provision free HTTPS certificates!

### Alternative Deployments:
- **Vercel**: Import `umer6016/Mirath` at [vercel.com/new](https://vercel.com/new) for instant global edge deployment.
- **Netlify**: Connect repository at [app.netlify.com](https://app.netlify.com) for automated deployment on push.

---

## ✍️ How You & Your Fiancée Can Add / Delete Content (Curator Sanctuary)

We built a dedicated **Contributor Studio & Curator Sanctuary** right inside the website with **Passcode Security Gate & Stealth Mode** so that friends can view the site freely while only you and your fiancée can make changes:

### 🔒 Curator Security Gate & Permissions:
- **Protected Access**: Only curators who know the passcode can access the editing studio, add content, or delete entries. Unauthenticated friends and visitors only see the lock screen.
- **Default Curator Passcode**: `mirath786`
- **Changing the Passcode**: Inside Studio, click **Curator Security**, enter your current passcode and choose a new private passcode.
- **Persistent Login**: Once unlocked on your and your fiancée's devices (phone or laptop), `localStorage` remembers the session so you don't need to retype the passcode every visit.
- **Stealth Mode (Optional)**: In Studio → **Curator Security**, enable *"Hide Studio button from public navigation"*. The button will vanish from the header and navigation bar for all public visitors! You and your fiancée can still access it anytime via:
  1. Pressing <kbd>Ctrl + Shift + A</kbd> (or <kbd>Cmd + Shift + A</kbd> on Mac).
  2. Triple-clicking the **MIRATH** logo in the top-left corner.
  3. Typing `/admin` or `studio` in Universal Search (<kbd>Ctrl + K</kbd>).

### How to Add or Delete Items:
1. Access the Studio and unlock with your passcode.
2. Choose what you want to add:
   - **📜 Add Hadith**
   - **🤲 Add Dua**
   - **💎 Add Quote**
   - **✨ Add Prophet Story**
   - **⚔️ Add Sahabah Chronicle**
   - **🏆 Add Quiz Question**
3. Fill out the simple form and click **Save**.
4. The entry is immediately added to the live website, searchable, and stored!
5. To **delete** an entry anytime:
   - Click the **`📋 Manage & Delete`** sub-tab in the Studio.
   - You will see a list of all custom entries with category tags and dates.
   - Click the red **Delete (🗑️)** button on any entry to remove it instantly.

### Sharing and Syncing Between Devices:
- **Download Updated `data.js`**: Click this button in the Studio to download the updated repository file with all additions. Replace `js/data.js` and commit/redeploy to make all additions permanent across the whole world.
- **Export / Import Backup (.json)**: She can export a backup `.json` file from her phone or laptop, send it to you, and you can click **Import Backup** to sync everything in one second.
- **Live Supabase Cloud Database (Optional & Free)**:
  If you want whatever she adds from her phone to automatically appear on your laptop without sending files:
  1. Create a free project at [supabase.com](https://supabase.com).
  2. In the Supabase SQL Editor, run:
     ```sql
     CREATE TABLE mirath_store (
       key text PRIMARY KEY,
       data jsonb,
       updated_at timestamptz DEFAULT now()
     );
     ALTER TABLE mirath_store ENABLE ROW LEVEL SECURITY;
     CREATE POLICY "Public Read and Write" ON mirath_store FOR ALL USING (true) WITH CHECK (true);
     ```
  3. In the Mirath Studio, click **Cloud Database Sync**, paste your **Supabase Project URL** and **Anon API Key**, and click **Save & Connect Cloud**.
  4. Now, any addition or deletion made on any device syncs in real time!

---

## 💻 Local Development / Preview

To run the site locally:
```bash
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.

---

## 📄 License & Dedication
Dedicated as a *Sadaqah Jariyah* (perpetual charity) for the Ummah.
All sacred Qur’anic verses and authentic Prophetic Hadiths are verified against orthodox classical sources.
