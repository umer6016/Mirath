/**
 * Complete Directory of All 114 Surahs of the Holy Qur'an
 */
const MIRATH_SURAHS = [
  {
    "number": 1,
    "nameArabic": "ٱلْفَاتِحَةِ",
    "nameFullArabic": "سُورَةُ ٱلْفَاتِحَةِ",
    "nameEnglish": "Al-Faatiha",
    "translation": "The Opening",
    "numberOfAyahs": 7,
    "revelationType": "Meccan"
  },
  {
    "number": 2,
    "nameArabic": "البَقَرَةِ",
    "nameFullArabic": "سُورَةُ البَقَرَةِ",
    "nameEnglish": "Al-Baqara",
    "translation": "The Cow",
    "numberOfAyahs": 286,
    "revelationType": "Medinan"
  },
  {
    "number": 3,
    "nameArabic": "آلِ عِمۡرَانَ",
    "nameFullArabic": "سُورَةُ آلِ عِمۡرَانَ",
    "nameEnglish": "Aal-i-Imraan",
    "translation": "The Family of Imraan",
    "numberOfAyahs": 200,
    "revelationType": "Medinan"
  },
  {
    "number": 4,
    "nameArabic": "النِّسَاءِ",
    "nameFullArabic": "سُورَةُ النِّسَاءِ",
    "nameEnglish": "An-Nisaa",
    "translation": "The Women",
    "numberOfAyahs": 176,
    "revelationType": "Medinan"
  },
  {
    "number": 5,
    "nameArabic": "المَائـِدَةِ",
    "nameFullArabic": "سُورَةُ المَائـِدَةِ",
    "nameEnglish": "Al-Maaida",
    "translation": "The Table",
    "numberOfAyahs": 120,
    "revelationType": "Medinan"
  },
  {
    "number": 6,
    "nameArabic": "الأَنۡعَامِ",
    "nameFullArabic": "سُورَةُ الأَنۡعَامِ",
    "nameEnglish": "Al-An'aam",
    "translation": "The Cattle",
    "numberOfAyahs": 165,
    "revelationType": "Meccan"
  },
  {
    "number": 7,
    "nameArabic": "الأَعۡرَافِ",
    "nameFullArabic": "سُورَةُ الأَعۡرَافِ",
    "nameEnglish": "Al-A'raaf",
    "translation": "The Heights",
    "numberOfAyahs": 206,
    "revelationType": "Meccan"
  },
  {
    "number": 8,
    "nameArabic": "الأَنفَالِ",
    "nameFullArabic": "سُورَةُ الأَنفَالِ",
    "nameEnglish": "Al-Anfaal",
    "translation": "The Spoils of War",
    "numberOfAyahs": 75,
    "revelationType": "Medinan"
  },
  {
    "number": 9,
    "nameArabic": "التَّوۡبَةِ",
    "nameFullArabic": "سُورَةُ التَّوۡبَةِ",
    "nameEnglish": "At-Tawba",
    "translation": "The Repentance",
    "numberOfAyahs": 129,
    "revelationType": "Medinan"
  },
  {
    "number": 10,
    "nameArabic": "يُونُسَ",
    "nameFullArabic": "سُورَةُ يُونُسَ",
    "nameEnglish": "Yunus",
    "translation": "Jonas",
    "numberOfAyahs": 109,
    "revelationType": "Meccan"
  },
  {
    "number": 11,
    "nameArabic": "هُودٍ",
    "nameFullArabic": "سُورَةُ هُودٍ",
    "nameEnglish": "Hud",
    "translation": "Hud",
    "numberOfAyahs": 123,
    "revelationType": "Meccan"
  },
  {
    "number": 12,
    "nameArabic": "يُوسُفَ",
    "nameFullArabic": "سُورَةُ يُوسُفَ",
    "nameEnglish": "Yusuf",
    "translation": "Joseph",
    "numberOfAyahs": 111,
    "revelationType": "Meccan"
  },
  {
    "number": 13,
    "nameArabic": "الرَّعۡدِ",
    "nameFullArabic": "سُورَةُ الرَّعۡدِ",
    "nameEnglish": "Ar-Ra'd",
    "translation": "The Thunder",
    "numberOfAyahs": 43,
    "revelationType": "Medinan"
  },
  {
    "number": 14,
    "nameArabic": "إِبۡرَاهِيمَ",
    "nameFullArabic": "سُورَةُ إِبۡرَاهِيمَ",
    "nameEnglish": "Ibrahim",
    "translation": "Abraham",
    "numberOfAyahs": 52,
    "revelationType": "Meccan"
  },
  {
    "number": 15,
    "nameArabic": "الحِجۡرِ",
    "nameFullArabic": "سُورَةُ الحِجۡرِ",
    "nameEnglish": "Al-Hijr",
    "translation": "The Rock",
    "numberOfAyahs": 99,
    "revelationType": "Meccan"
  },
  {
    "number": 16,
    "nameArabic": "النَّحۡلِ",
    "nameFullArabic": "سُورَةُ النَّحۡلِ",
    "nameEnglish": "An-Nahl",
    "translation": "The Bee",
    "numberOfAyahs": 128,
    "revelationType": "Meccan"
  },
  {
    "number": 17,
    "nameArabic": "الإِسۡرَاءِ",
    "nameFullArabic": "سُورَةُ الإِسۡرَاءِ",
    "nameEnglish": "Al-Israa",
    "translation": "The Night Journey",
    "numberOfAyahs": 111,
    "revelationType": "Meccan"
  },
  {
    "number": 18,
    "nameArabic": "الكَهۡفِ",
    "nameFullArabic": "سُورَةُ الكَهۡفِ",
    "nameEnglish": "Al-Kahf",
    "translation": "The Cave",
    "numberOfAyahs": 110,
    "revelationType": "Meccan"
  },
  {
    "number": 19,
    "nameArabic": "مَرۡيَمَ",
    "nameFullArabic": "سُورَةُ مَرۡيَمَ",
    "nameEnglish": "Maryam",
    "translation": "Mary",
    "numberOfAyahs": 98,
    "revelationType": "Meccan"
  },
  {
    "number": 20,
    "nameArabic": "طه",
    "nameFullArabic": "سُورَةُ طه",
    "nameEnglish": "Taa-Haa",
    "translation": "Taa-Haa",
    "numberOfAyahs": 135,
    "revelationType": "Meccan"
  },
  {
    "number": 21,
    "nameArabic": "الأَنبِيَاءِ",
    "nameFullArabic": "سُورَةُ الأَنبِيَاءِ",
    "nameEnglish": "Al-Anbiyaa",
    "translation": "The Prophets",
    "numberOfAyahs": 112,
    "revelationType": "Meccan"
  },
  {
    "number": 22,
    "nameArabic": "الحَجِّ",
    "nameFullArabic": "سُورَةُ الحَجِّ",
    "nameEnglish": "Al-Hajj",
    "translation": "The Pilgrimage",
    "numberOfAyahs": 78,
    "revelationType": "Medinan"
  },
  {
    "number": 23,
    "nameArabic": "المُؤۡمِنُونَ",
    "nameFullArabic": "سُورَةُ المُؤۡمِنُونَ",
    "nameEnglish": "Al-Muminoon",
    "translation": "The Believers",
    "numberOfAyahs": 118,
    "revelationType": "Meccan"
  },
  {
    "number": 24,
    "nameArabic": "النُّورِ",
    "nameFullArabic": "سُورَةُ النُّورِ",
    "nameEnglish": "An-Noor",
    "translation": "The Light",
    "numberOfAyahs": 64,
    "revelationType": "Medinan"
  },
  {
    "number": 25,
    "nameArabic": "الفُرۡقَانِ",
    "nameFullArabic": "سُورَةُ الفُرۡقَانِ",
    "nameEnglish": "Al-Furqaan",
    "translation": "The Criterion",
    "numberOfAyahs": 77,
    "revelationType": "Meccan"
  },
  {
    "number": 26,
    "nameArabic": "الشُّعَرَاءِ",
    "nameFullArabic": "سُورَةُ الشُّعَرَاءِ",
    "nameEnglish": "Ash-Shu'araa",
    "translation": "The Poets",
    "numberOfAyahs": 227,
    "revelationType": "Meccan"
  },
  {
    "number": 27,
    "nameArabic": "النَّمۡلِ",
    "nameFullArabic": "سُورَةُ النَّمۡلِ",
    "nameEnglish": "An-Naml",
    "translation": "The Ant",
    "numberOfAyahs": 93,
    "revelationType": "Meccan"
  },
  {
    "number": 28,
    "nameArabic": "القَصَصِ",
    "nameFullArabic": "سُورَةُ القَصَصِ",
    "nameEnglish": "Al-Qasas",
    "translation": "The Stories",
    "numberOfAyahs": 88,
    "revelationType": "Meccan"
  },
  {
    "number": 29,
    "nameArabic": "العَنكَبُوتِ",
    "nameFullArabic": "سُورَةُ العَنكَبُوتِ",
    "nameEnglish": "Al-Ankaboot",
    "translation": "The Spider",
    "numberOfAyahs": 69,
    "revelationType": "Meccan"
  },
  {
    "number": 30,
    "nameArabic": "الرُّومِ",
    "nameFullArabic": "سُورَةُ الرُّومِ",
    "nameEnglish": "Ar-Room",
    "translation": "The Romans",
    "numberOfAyahs": 60,
    "revelationType": "Meccan"
  },
  {
    "number": 31,
    "nameArabic": "لُقۡمَانَ",
    "nameFullArabic": "سُورَةُ لُقۡمَانَ",
    "nameEnglish": "Luqman",
    "translation": "Luqman",
    "numberOfAyahs": 34,
    "revelationType": "Meccan"
  },
  {
    "number": 32,
    "nameArabic": "السَّجۡدَةِ",
    "nameFullArabic": "سُورَةُ السَّجۡدَةِ",
    "nameEnglish": "As-Sajda",
    "translation": "The Prostration",
    "numberOfAyahs": 30,
    "revelationType": "Meccan"
  },
  {
    "number": 33,
    "nameArabic": "الأَحۡزَابِ",
    "nameFullArabic": "سُورَةُ الأَحۡزَابِ",
    "nameEnglish": "Al-Ahzaab",
    "translation": "The Clans",
    "numberOfAyahs": 73,
    "revelationType": "Medinan"
  },
  {
    "number": 34,
    "nameArabic": "سَبَإٍ",
    "nameFullArabic": "سُورَةُ سَبَإٍ",
    "nameEnglish": "Saba",
    "translation": "Sheba",
    "numberOfAyahs": 54,
    "revelationType": "Meccan"
  },
  {
    "number": 35,
    "nameArabic": "فَاطِرٍ",
    "nameFullArabic": "سُورَةُ فَاطِرٍ",
    "nameEnglish": "Faatir",
    "translation": "The Originator",
    "numberOfAyahs": 45,
    "revelationType": "Meccan"
  },
  {
    "number": 36,
    "nameArabic": "يسٓ",
    "nameFullArabic": "سُورَةُ يسٓ",
    "nameEnglish": "Yaseen",
    "translation": "Yaseen",
    "numberOfAyahs": 83,
    "revelationType": "Meccan"
  },
  {
    "number": 37,
    "nameArabic": "الصَّافَّاتِ",
    "nameFullArabic": "سُورَةُ الصَّافَّاتِ",
    "nameEnglish": "As-Saaffaat",
    "translation": "Those drawn up in Ranks",
    "numberOfAyahs": 182,
    "revelationType": "Meccan"
  },
  {
    "number": 38,
    "nameArabic": "صٓ",
    "nameFullArabic": "سُورَةُ صٓ",
    "nameEnglish": "Saad",
    "translation": "The letter Saad",
    "numberOfAyahs": 88,
    "revelationType": "Meccan"
  },
  {
    "number": 39,
    "nameArabic": "الزُّمَرِ",
    "nameFullArabic": "سُورَةُ الزُّمَرِ",
    "nameEnglish": "Az-Zumar",
    "translation": "The Groups",
    "numberOfAyahs": 75,
    "revelationType": "Meccan"
  },
  {
    "number": 40,
    "nameArabic": "غَافِرٍ",
    "nameFullArabic": "سُورَةُ غَافِرٍ",
    "nameEnglish": "Ghafir",
    "translation": "The Forgiver",
    "numberOfAyahs": 85,
    "revelationType": "Meccan"
  },
  {
    "number": 41,
    "nameArabic": "فُصِّلَتۡ",
    "nameFullArabic": "سُورَةُ فُصِّلَتۡ",
    "nameEnglish": "Fussilat",
    "translation": "Explained in detail",
    "numberOfAyahs": 54,
    "revelationType": "Meccan"
  },
  {
    "number": 42,
    "nameArabic": "الشُّورَىٰ",
    "nameFullArabic": "سُورَةُ الشُّورَىٰ",
    "nameEnglish": "Ash-Shura",
    "translation": "Consultation",
    "numberOfAyahs": 53,
    "revelationType": "Meccan"
  },
  {
    "number": 43,
    "nameArabic": "الزُّخۡرُفِ",
    "nameFullArabic": "سُورَةُ الزُّخۡرُفِ",
    "nameEnglish": "Az-Zukhruf",
    "translation": "Ornaments of gold",
    "numberOfAyahs": 89,
    "revelationType": "Meccan"
  },
  {
    "number": 44,
    "nameArabic": "الدُّخَانِ",
    "nameFullArabic": "سُورَةُ الدُّخَانِ",
    "nameEnglish": "Ad-Dukhaan",
    "translation": "The Smoke",
    "numberOfAyahs": 59,
    "revelationType": "Meccan"
  },
  {
    "number": 45,
    "nameArabic": "الجَاثِيَةِ",
    "nameFullArabic": "سُورَةُ الجَاثِيَةِ",
    "nameEnglish": "Al-Jaathiya",
    "translation": "Crouching",
    "numberOfAyahs": 37,
    "revelationType": "Meccan"
  },
  {
    "number": 46,
    "nameArabic": "الأَحۡقَافِ",
    "nameFullArabic": "سُورَةُ الأَحۡقَافِ",
    "nameEnglish": "Al-Ahqaf",
    "translation": "The Dunes",
    "numberOfAyahs": 35,
    "revelationType": "Meccan"
  },
  {
    "number": 47,
    "nameArabic": "مُحَمَّدٍ",
    "nameFullArabic": "سُورَةُ مُحَمَّدٍ",
    "nameEnglish": "Muhammad",
    "translation": "Muhammad",
    "numberOfAyahs": 38,
    "revelationType": "Medinan"
  },
  {
    "number": 48,
    "nameArabic": "الفَتۡحِ",
    "nameFullArabic": "سُورَةُ الفَتۡحِ",
    "nameEnglish": "Al-Fath",
    "translation": "The Victory",
    "numberOfAyahs": 29,
    "revelationType": "Medinan"
  },
  {
    "number": 49,
    "nameArabic": "الحُجُرَاتِ",
    "nameFullArabic": "سُورَةُ الحُجُرَاتِ",
    "nameEnglish": "Al-Hujuraat",
    "translation": "The Inner Apartments",
    "numberOfAyahs": 18,
    "revelationType": "Medinan"
  },
  {
    "number": 50,
    "nameArabic": "قٓ",
    "nameFullArabic": "سُورَةُ قٓ",
    "nameEnglish": "Qaaf",
    "translation": "The letter Qaaf",
    "numberOfAyahs": 45,
    "revelationType": "Meccan"
  },
  {
    "number": 51,
    "nameArabic": "الذَّارِيَاتِ",
    "nameFullArabic": "سُورَةُ الذَّارِيَاتِ",
    "nameEnglish": "Adh-Dhaariyat",
    "translation": "The Winnowing Winds",
    "numberOfAyahs": 60,
    "revelationType": "Meccan"
  },
  {
    "number": 52,
    "nameArabic": "الطُّورِ",
    "nameFullArabic": "سُورَةُ الطُّورِ",
    "nameEnglish": "At-Tur",
    "translation": "The Mount",
    "numberOfAyahs": 49,
    "revelationType": "Meccan"
  },
  {
    "number": 53,
    "nameArabic": "النَّجۡمِ",
    "nameFullArabic": "سُورَةُ النَّجۡمِ",
    "nameEnglish": "An-Najm",
    "translation": "The Star",
    "numberOfAyahs": 62,
    "revelationType": "Meccan"
  },
  {
    "number": 54,
    "nameArabic": "القَمَرِ",
    "nameFullArabic": "سُورَةُ القَمَرِ",
    "nameEnglish": "Al-Qamar",
    "translation": "The Moon",
    "numberOfAyahs": 55,
    "revelationType": "Meccan"
  },
  {
    "number": 55,
    "nameArabic": "الرَّحۡمَٰن",
    "nameFullArabic": "سُورَةُ الرَّحۡمَٰن",
    "nameEnglish": "Ar-Rahmaan",
    "translation": "The Beneficent",
    "numberOfAyahs": 78,
    "revelationType": "Medinan"
  },
  {
    "number": 56,
    "nameArabic": "الوَاقِعَةِ",
    "nameFullArabic": "سُورَةُ الوَاقِعَةِ",
    "nameEnglish": "Al-Waaqia",
    "translation": "The Inevitable",
    "numberOfAyahs": 96,
    "revelationType": "Meccan"
  },
  {
    "number": 57,
    "nameArabic": "الحَدِيدِ",
    "nameFullArabic": "سُورَةُ الحَدِيدِ",
    "nameEnglish": "Al-Hadid",
    "translation": "The Iron",
    "numberOfAyahs": 29,
    "revelationType": "Medinan"
  },
  {
    "number": 58,
    "nameArabic": "المُجَادلَةِ",
    "nameFullArabic": "سُورَةُ المُجَادلَةِ",
    "nameEnglish": "Al-Mujaadila",
    "translation": "The Pleading Woman",
    "numberOfAyahs": 22,
    "revelationType": "Medinan"
  },
  {
    "number": 59,
    "nameArabic": "الحَشۡرِ",
    "nameFullArabic": "سُورَةُ الحَشۡرِ",
    "nameEnglish": "Al-Hashr",
    "translation": "The Exile",
    "numberOfAyahs": 24,
    "revelationType": "Medinan"
  },
  {
    "number": 60,
    "nameArabic": "المُمۡتَحنَةِ",
    "nameFullArabic": "سُورَةُ المُمۡتَحنَةِ",
    "nameEnglish": "Al-Mumtahana",
    "translation": "She that is to be examined",
    "numberOfAyahs": 13,
    "revelationType": "Medinan"
  },
  {
    "number": 61,
    "nameArabic": "الصَّفِّ",
    "nameFullArabic": "سُورَةُ الصَّفِّ",
    "nameEnglish": "As-Saff",
    "translation": "The Ranks",
    "numberOfAyahs": 14,
    "revelationType": "Medinan"
  },
  {
    "number": 62,
    "nameArabic": "الجُمُعَةِ",
    "nameFullArabic": "سُورَةُ الجُمُعَةِ",
    "nameEnglish": "Al-Jumu'a",
    "translation": "Friday",
    "numberOfAyahs": 11,
    "revelationType": "Medinan"
  },
  {
    "number": 63,
    "nameArabic": "المُنَافِقُونَ",
    "nameFullArabic": "سُورَةُ المُنَافِقُونَ",
    "nameEnglish": "Al-Munaafiqoon",
    "translation": "The Hypocrites",
    "numberOfAyahs": 11,
    "revelationType": "Medinan"
  },
  {
    "number": 64,
    "nameArabic": "التَّغَابُنِ",
    "nameFullArabic": "سُورَةُ التَّغَابُنِ",
    "nameEnglish": "At-Taghaabun",
    "translation": "Mutual Disillusion",
    "numberOfAyahs": 18,
    "revelationType": "Medinan"
  },
  {
    "number": 65,
    "nameArabic": "الطَّلَاقِ",
    "nameFullArabic": "سُورَةُ الطَّلَاقِ",
    "nameEnglish": "At-Talaaq",
    "translation": "Divorce",
    "numberOfAyahs": 12,
    "revelationType": "Medinan"
  },
  {
    "number": 66,
    "nameArabic": "التَّحۡرِيمِ",
    "nameFullArabic": "سُورَةُ التَّحۡرِيمِ",
    "nameEnglish": "At-Tahrim",
    "translation": "The Prohibition",
    "numberOfAyahs": 12,
    "revelationType": "Medinan"
  },
  {
    "number": 67,
    "nameArabic": "المُلۡكِ",
    "nameFullArabic": "سُورَةُ المُلۡكِ",
    "nameEnglish": "Al-Mulk",
    "translation": "The Sovereignty",
    "numberOfAyahs": 30,
    "revelationType": "Meccan"
  },
  {
    "number": 68,
    "nameArabic": "القَلَمِ",
    "nameFullArabic": "سُورَةُ القَلَمِ",
    "nameEnglish": "Al-Qalam",
    "translation": "The Pen",
    "numberOfAyahs": 52,
    "revelationType": "Meccan"
  },
  {
    "number": 69,
    "nameArabic": "الحَاقَّةِ",
    "nameFullArabic": "سُورَةُ الحَاقَّةِ",
    "nameEnglish": "Al-Haaqqa",
    "translation": "The Reality",
    "numberOfAyahs": 52,
    "revelationType": "Meccan"
  },
  {
    "number": 70,
    "nameArabic": "المَعَارِجِ",
    "nameFullArabic": "سُورَةُ المَعَارِجِ",
    "nameEnglish": "Al-Ma'aarij",
    "translation": "The Ascending Stairways",
    "numberOfAyahs": 44,
    "revelationType": "Meccan"
  },
  {
    "number": 71,
    "nameArabic": "نُوحٍ",
    "nameFullArabic": "سُورَةُ نُوحٍ",
    "nameEnglish": "Nooh",
    "translation": "Noah",
    "numberOfAyahs": 28,
    "revelationType": "Meccan"
  },
  {
    "number": 72,
    "nameArabic": "الجِنِّ",
    "nameFullArabic": "سُورَةُ الجِنِّ",
    "nameEnglish": "Al-Jinn",
    "translation": "The Jinn",
    "numberOfAyahs": 28,
    "revelationType": "Meccan"
  },
  {
    "number": 73,
    "nameArabic": "المُزَّمِّلِ",
    "nameFullArabic": "سُورَةُ المُزَّمِّلِ",
    "nameEnglish": "Al-Muzzammil",
    "translation": "The Enshrouded One",
    "numberOfAyahs": 20,
    "revelationType": "Meccan"
  },
  {
    "number": 74,
    "nameArabic": "المُدَّثِّرِ",
    "nameFullArabic": "سُورَةُ المُدَّثِّرِ",
    "nameEnglish": "Al-Muddaththir",
    "translation": "The Cloaked One",
    "numberOfAyahs": 56,
    "revelationType": "Meccan"
  },
  {
    "number": 75,
    "nameArabic": "القِيَامَةِ",
    "nameFullArabic": "سُورَةُ القِيَامَةِ",
    "nameEnglish": "Al-Qiyaama",
    "translation": "The Resurrection",
    "numberOfAyahs": 40,
    "revelationType": "Meccan"
  },
  {
    "number": 76,
    "nameArabic": "الإِنسَانِ",
    "nameFullArabic": "سُورَةُ الإِنسَانِ",
    "nameEnglish": "Al-Insaan",
    "translation": "Man",
    "numberOfAyahs": 31,
    "revelationType": "Medinan"
  },
  {
    "number": 77,
    "nameArabic": "المُرۡسَلَاتِ",
    "nameFullArabic": "سُورَةُ المُرۡسَلَاتِ",
    "nameEnglish": "Al-Mursalaat",
    "translation": "The Emissaries",
    "numberOfAyahs": 50,
    "revelationType": "Meccan"
  },
  {
    "number": 78,
    "nameArabic": "النَّبَإِ",
    "nameFullArabic": "سُورَةُ النَّبَإِ",
    "nameEnglish": "An-Naba",
    "translation": "The Announcement",
    "numberOfAyahs": 40,
    "revelationType": "Meccan"
  },
  {
    "number": 79,
    "nameArabic": "النَّازِعَاتِ",
    "nameFullArabic": "سُورَةُ النَّازِعَاتِ",
    "nameEnglish": "An-Naazi'aat",
    "translation": "Those who drag forth",
    "numberOfAyahs": 46,
    "revelationType": "Meccan"
  },
  {
    "number": 80,
    "nameArabic": "عَبَسَ",
    "nameFullArabic": "سُورَةُ عَبَسَ",
    "nameEnglish": "Abasa",
    "translation": "He frowned",
    "numberOfAyahs": 42,
    "revelationType": "Meccan"
  },
  {
    "number": 81,
    "nameArabic": "التَّكۡوِيرِ",
    "nameFullArabic": "سُورَةُ التَّكۡوِيرِ",
    "nameEnglish": "At-Takwir",
    "translation": "The Overthrowing",
    "numberOfAyahs": 29,
    "revelationType": "Meccan"
  },
  {
    "number": 82,
    "nameArabic": "الانفِطَارِ",
    "nameFullArabic": "سُورَةُ الانفِطَارِ",
    "nameEnglish": "Al-Infitaar",
    "translation": "The Cleaving",
    "numberOfAyahs": 19,
    "revelationType": "Meccan"
  },
  {
    "number": 83,
    "nameArabic": "المُطَفِّفِينَ",
    "nameFullArabic": "سُورَةُ المُطَفِّفِينَ",
    "nameEnglish": "Al-Mutaffifin",
    "translation": "Defrauding",
    "numberOfAyahs": 36,
    "revelationType": "Meccan"
  },
  {
    "number": 84,
    "nameArabic": "الانشِقَاقِ",
    "nameFullArabic": "سُورَةُ الانشِقَاقِ",
    "nameEnglish": "Al-Inshiqaaq",
    "translation": "The Splitting Open",
    "numberOfAyahs": 25,
    "revelationType": "Meccan"
  },
  {
    "number": 85,
    "nameArabic": "البُرُوجِ",
    "nameFullArabic": "سُورَةُ البُرُوجِ",
    "nameEnglish": "Al-Burooj",
    "translation": "The Constellations",
    "numberOfAyahs": 22,
    "revelationType": "Meccan"
  },
  {
    "number": 86,
    "nameArabic": "الطَّارِقِ",
    "nameFullArabic": "سُورَةُ الطَّارِقِ",
    "nameEnglish": "At-Taariq",
    "translation": "The Morning Star",
    "numberOfAyahs": 17,
    "revelationType": "Meccan"
  },
  {
    "number": 87,
    "nameArabic": "الأَعۡلَىٰ",
    "nameFullArabic": "سُورَةُ الأَعۡلَىٰ",
    "nameEnglish": "Al-A'laa",
    "translation": "The Most High",
    "numberOfAyahs": 19,
    "revelationType": "Meccan"
  },
  {
    "number": 88,
    "nameArabic": "الغَاشِيَةِ",
    "nameFullArabic": "سُورَةُ الغَاشِيَةِ",
    "nameEnglish": "Al-Ghaashiya",
    "translation": "The Overwhelming",
    "numberOfAyahs": 26,
    "revelationType": "Meccan"
  },
  {
    "number": 89,
    "nameArabic": "الفَجۡرِ",
    "nameFullArabic": "سُورَةُ الفَجۡرِ",
    "nameEnglish": "Al-Fajr",
    "translation": "The Dawn",
    "numberOfAyahs": 30,
    "revelationType": "Meccan"
  },
  {
    "number": 90,
    "nameArabic": "البَلَدِ",
    "nameFullArabic": "سُورَةُ البَلَدِ",
    "nameEnglish": "Al-Balad",
    "translation": "The City",
    "numberOfAyahs": 20,
    "revelationType": "Meccan"
  },
  {
    "number": 91,
    "nameArabic": "الشَّمۡسِ",
    "nameFullArabic": "سُورَةُ الشَّمۡسِ",
    "nameEnglish": "Ash-Shams",
    "translation": "The Sun",
    "numberOfAyahs": 15,
    "revelationType": "Meccan"
  },
  {
    "number": 92,
    "nameArabic": "اللَّيۡلِ",
    "nameFullArabic": "سُورَةُ اللَّيۡلِ",
    "nameEnglish": "Al-Lail",
    "translation": "The Night",
    "numberOfAyahs": 21,
    "revelationType": "Meccan"
  },
  {
    "number": 93,
    "nameArabic": "الضُّحَىٰ",
    "nameFullArabic": "سُورَةُ الضُّحَىٰ",
    "nameEnglish": "Ad-Dhuhaa",
    "translation": "The Morning Hours",
    "numberOfAyahs": 11,
    "revelationType": "Meccan"
  },
  {
    "number": 94,
    "nameArabic": "الشَّرۡحِ",
    "nameFullArabic": "سُورَةُ الشَّرۡحِ",
    "nameEnglish": "Ash-Sharh",
    "translation": "The Consolation",
    "numberOfAyahs": 8,
    "revelationType": "Meccan"
  },
  {
    "number": 95,
    "nameArabic": "التِّينِ",
    "nameFullArabic": "سُورَةُ التِّينِ",
    "nameEnglish": "At-Tin",
    "translation": "The Fig",
    "numberOfAyahs": 8,
    "revelationType": "Meccan"
  },
  {
    "number": 96,
    "nameArabic": "العَلَقِ",
    "nameFullArabic": "سُورَةُ العَلَقِ",
    "nameEnglish": "Al-Alaq",
    "translation": "The Clot",
    "numberOfAyahs": 19,
    "revelationType": "Meccan"
  },
  {
    "number": 97,
    "nameArabic": "القَدۡرِ",
    "nameFullArabic": "سُورَةُ القَدۡرِ",
    "nameEnglish": "Al-Qadr",
    "translation": "The Power, Fate",
    "numberOfAyahs": 5,
    "revelationType": "Meccan"
  },
  {
    "number": 98,
    "nameArabic": "البَيِّنَةِ",
    "nameFullArabic": "سُورَةُ البَيِّنَةِ",
    "nameEnglish": "Al-Bayyina",
    "translation": "The Evidence",
    "numberOfAyahs": 8,
    "revelationType": "Medinan"
  },
  {
    "number": 99,
    "nameArabic": "الزَّلۡزَلَةِ",
    "nameFullArabic": "سُورَةُ الزَّلۡزَلَةِ",
    "nameEnglish": "Az-Zalzala",
    "translation": "The Earthquake",
    "numberOfAyahs": 8,
    "revelationType": "Medinan"
  },
  {
    "number": 100,
    "nameArabic": "العَادِيَاتِ",
    "nameFullArabic": "سُورَةُ العَادِيَاتِ",
    "nameEnglish": "Al-Aadiyaat",
    "translation": "The Chargers",
    "numberOfAyahs": 11,
    "revelationType": "Meccan"
  },
  {
    "number": 101,
    "nameArabic": "القَارِعَةِ",
    "nameFullArabic": "سُورَةُ القَارِعَةِ",
    "nameEnglish": "Al-Qaari'a",
    "translation": "The Calamity",
    "numberOfAyahs": 11,
    "revelationType": "Meccan"
  },
  {
    "number": 102,
    "nameArabic": "التَّكَاثُرِ",
    "nameFullArabic": "سُورَةُ التَّكَاثُرِ",
    "nameEnglish": "At-Takaathur",
    "translation": "Competition",
    "numberOfAyahs": 8,
    "revelationType": "Meccan"
  },
  {
    "number": 103,
    "nameArabic": "العَصۡرِ",
    "nameFullArabic": "سُورَةُ العَصۡرِ",
    "nameEnglish": "Al-Asr",
    "translation": "The Declining Day, Epoch",
    "numberOfAyahs": 3,
    "revelationType": "Meccan"
  },
  {
    "number": 104,
    "nameArabic": "الهُمَزَةِ",
    "nameFullArabic": "سُورَةُ الهُمَزَةِ",
    "nameEnglish": "Al-Humaza",
    "translation": "The Traducer",
    "numberOfAyahs": 9,
    "revelationType": "Meccan"
  },
  {
    "number": 105,
    "nameArabic": "الفِيلِ",
    "nameFullArabic": "سُورَةُ الفِيلِ",
    "nameEnglish": "Al-Fil",
    "translation": "The Elephant",
    "numberOfAyahs": 5,
    "revelationType": "Meccan"
  },
  {
    "number": 106,
    "nameArabic": "قُرَيۡشٍ",
    "nameFullArabic": "سُورَةُ قُرَيۡشٍ",
    "nameEnglish": "Quraish",
    "translation": "Quraysh",
    "numberOfAyahs": 4,
    "revelationType": "Meccan"
  },
  {
    "number": 107,
    "nameArabic": "المَاعُونِ",
    "nameFullArabic": "سُورَةُ المَاعُونِ",
    "nameEnglish": "Al-Maa'un",
    "translation": "Almsgiving",
    "numberOfAyahs": 7,
    "revelationType": "Meccan"
  },
  {
    "number": 108,
    "nameArabic": "الكَوۡثَرِ",
    "nameFullArabic": "سُورَةُ الكَوۡثَرِ",
    "nameEnglish": "Al-Kawthar",
    "translation": "Abundance",
    "numberOfAyahs": 3,
    "revelationType": "Meccan"
  },
  {
    "number": 109,
    "nameArabic": "الكَافِرُونَ",
    "nameFullArabic": "سُورَةُ الكَافِرُونَ",
    "nameEnglish": "Al-Kaafiroon",
    "translation": "The Disbelievers",
    "numberOfAyahs": 6,
    "revelationType": "Meccan"
  },
  {
    "number": 110,
    "nameArabic": "النَّصۡرِ",
    "nameFullArabic": "سُورَةُ النَّصۡرِ",
    "nameEnglish": "An-Nasr",
    "translation": "Divine Support",
    "numberOfAyahs": 3,
    "revelationType": "Medinan"
  },
  {
    "number": 111,
    "nameArabic": "المَسَدِ",
    "nameFullArabic": "سُورَةُ المَسَدِ",
    "nameEnglish": "Al-Masad",
    "translation": "The Palm Fibre",
    "numberOfAyahs": 5,
    "revelationType": "Meccan"
  },
  {
    "number": 112,
    "nameArabic": "الإِخۡلَاصِ",
    "nameFullArabic": "سُورَةُ الإِخۡلَاصِ",
    "nameEnglish": "Al-Ikhlaas",
    "translation": "Sincerity",
    "numberOfAyahs": 4,
    "revelationType": "Meccan"
  },
  {
    "number": 113,
    "nameArabic": "الفَلَقِ",
    "nameFullArabic": "سُورَةُ الفَلَقِ",
    "nameEnglish": "Al-Falaq",
    "translation": "The Dawn",
    "numberOfAyahs": 5,
    "revelationType": "Meccan"
  },
  {
    "number": 114,
    "nameArabic": "النَّاسِ",
    "nameFullArabic": "سُورَةُ النَّاسِ",
    "nameEnglish": "An-Naas",
    "translation": "Mankind",
    "numberOfAyahs": 6,
    "revelationType": "Meccan"
  }
];

if (typeof window !== "undefined") {
  window.MIRATH_SURAHS = MIRATH_SURAHS;
}
