/**
 * MIRATH (ميراث) - Authentic Islamic Knowledge Repository
 * Curated from reliable, authentic sources (Qur'an, Sahih Bukhari, Sahih Muslim, Hisn al-Muslim, etc.)
 */

const MIRATH_DATA = {
  // =========================================================================
  // QUR'AN DATA WITH HIFDH SUPPORT & RECITATIONS
  // =========================================================================
  quran: [
    {
      id: "fatihah",
      surahNumber: 1,
      nameArabic: "الفاتحة",
      nameEnglish: "Al-Fatihah",
      translation: "The Opening",
      revelationType: "Meccan",
      totalVerses: 7,
      bismillah: false,
      ayahs: [
        {
          numberInSurah: 1,
          globalNumber: 1,
          arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
          transliteration: "Bismillāhir-Raḥmānir-Raḥīm",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
          words: ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ"]
        },
        {
          numberInSurah: 2,
          globalNumber: 2,
          arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
          transliteration: "Al-ḥamdu lillāhi Rabbil-'ālamīn",
          translation: "[All] praise is [due] to Allah, Lord of the worlds -",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3",
          words: ["ٱلْحَمْدُ", "لِلَّهِ", "رَبِّ", "ٱلْعَٰلَمِينَ"]
        },
        {
          numberInSurah: 3,
          globalNumber: 3,
          arabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
          transliteration: "Ar-Raḥmānir-Raḥīm",
          translation: "The Entirely Merciful, the Especially Merciful,",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3",
          words: ["ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ"]
        },
        {
          numberInSurah: 4,
          globalNumber: 4,
          arabic: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
          transliteration: "Māliki Yawmid-Dīn",
          translation: "Sovereign of the Day of Recompense.",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3",
          words: ["مَٰلِكِ", "يَوْمِ", "ٱلدِّينِ"]
        },
        {
          numberInSurah: 5,
          globalNumber: 5,
          arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
          transliteration: "Iyyāka na'budu wa iyyāka nasta'īn",
          translation: "It is You we worship and You we ask for help.",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3",
          words: ["إِيَّاكَ", "نَعْبُدُ", "وَإِيَّاكَ", "نَسْتَعِينُ"]
        },
        {
          numberInSurah: 6,
          globalNumber: 6,
          arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
          transliteration: "Ihdināṣ-ṣirāṭal-mustaqīm",
          translation: "Guide us to the straight path -",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3",
          words: ["ٱهْدِنَا", "ٱلصِّرَٰطَ", "ٱلْمُسْتَقِيمَ"]
        },
        {
          numberInSurah: 7,
          globalNumber: 7,
          arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
          transliteration: "Ṣirāṭal-ladhīna an'amta 'alayhim ghayril-maghḍūbi 'alayhim walāḍ-ḍāllīn",
          translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3",
          words: ["صِرَٰطَ", "ٱلَّذِينَ", "أَنْعَمْتَ", "عَلَيْهِمْ", "غَيْرِ", "ٱلْمَغْضُوبِ", "عَلَيْهِمْ", "وَلَا", "ٱلضَّآلِّينَ"]
        }
      ]
    },
    {
      id: "ikhlas",
      surahNumber: 112,
      nameArabic: "الإخلاص",
      nameEnglish: "Al-Ikhlas",
      translation: "Sincerity / Absolute Purity",
      revelationType: "Meccan",
      totalVerses: 4,
      bismillah: true,
      ayahs: [
        {
          numberInSurah: 1,
          globalNumber: 6222,
          arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
          transliteration: "Qul Huwal-lāhu Aḥad",
          translation: "Say, 'He is Allah, [who is] One,",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3",
          words: ["قُلْ", "هُوَ", "ٱللَّهُ", "أَحَدٌ"]
        },
        {
          numberInSurah: 2,
          globalNumber: 6223,
          arabic: "ٱللَّهُ ٱلصَّمَدُ",
          transliteration: "Allāhuṣ-Ṣamad",
          translation: "Allah, the Eternal Refuge.",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6223.mp3",
          words: ["ٱللَّهُ", "ٱلصَّمَدُ"]
        },
        {
          numberInSurah: 3,
          globalNumber: 6224,
          arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
          transliteration: "Lam yalid walam yūlad",
          translation: "He neither begets nor is born,",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6224.mp3",
          words: ["لَمْ", "يَلِدْ", "وَلَمْ", "يُولَدْ"]
        },
        {
          numberInSurah: 4,
          globalNumber: 6225,
          arabic: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
          transliteration: "Walam yakul-lahū kufuwan aḥad",
          translation: "Nor is there to Him any equivalent.'",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6225.mp3",
          words: ["وَلَمْ", "يَكُن", "لَّهُۥ", "كُفُوًا", "أَحَدٌۢ"]
        }
      ]
    },
    {
      id: "falaq",
      surahNumber: 113,
      nameArabic: "الفلق",
      nameEnglish: "Al-Falaq",
      translation: "The Daybreak",
      revelationType: "Meccan",
      totalVerses: 5,
      bismillah: true,
      ayahs: [
        {
          numberInSurah: 1,
          globalNumber: 6226,
          arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
          transliteration: "Qul a'ūdhu birabbil-falaq",
          translation: "Say, 'I seek refuge in the Lord of daybreak",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3",
          words: ["قُلْ", "أَعُوذُ", "بِرَبِّ", "ٱلْفَلَقِ"]
        },
        {
          numberInSurah: 2,
          globalNumber: 6227,
          arabic: "مِن شَرِّ مَا خَلَقَ",
          transliteration: "Min sharri mā khalaq",
          translation: "From the evil of that which He created",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6227.mp3",
          words: ["مِن", "شَرِّ", "مَا", "خَلَقَ"]
        },
        {
          numberInSurah: 3,
          globalNumber: 6228,
          arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
          transliteration: "Wa min sharri ghāsiqin idhā waqab",
          translation: "And from the evil of darkness when it settles",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6228.mp3",
          words: ["وَمِن", "شَرِّ", "غَاسِقٍ", "إِذَا", "وَقَبَ"]
        },
        {
          numberInSurah: 4,
          globalNumber: 6229,
          arabic: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ",
          transliteration: "Wa min sharrin-naffāthāti fil-'uqad",
          translation: "And from the evil of the blowers in knots",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6229.mp3",
          words: ["وَمِن", "شَرِّ", "ٱلنَّفَّٰثَٰتِ", "فِى", "ٱلْعُقَدِ"]
        },
        {
          numberInSurah: 5,
          globalNumber: 6230,
          arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
          transliteration: "Wa min sharri ḥāsidin idhā ḥasad",
          translation: "And from the evil of an envier when he envies.'",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6230.mp3",
          words: ["وَمِن", "شَرِّ", "حَاسِدٍ", "إِذَا", "حَسَدَ"]
        }
      ]
    },
    {
      id: "nas",
      surahNumber: 114,
      nameArabic: "الناس",
      nameEnglish: "An-Nas",
      translation: "Mankind",
      revelationType: "Meccan",
      totalVerses: 6,
      bismillah: true,
      ayahs: [
        {
          numberInSurah: 1,
          globalNumber: 6231,
          arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
          transliteration: "Qul a'ūdhu birabbin-nās",
          translation: "Say, 'I seek refuge in the Lord of mankind,",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6231.mp3",
          words: ["قُلْ", "أَعُوذُ", "بِرَبِّ", "ٱلنَّاسِ"]
        },
        {
          numberInSurah: 2,
          globalNumber: 6232,
          arabic: "مَلِكِ ٱلنَّاسِ",
          transliteration: "Malikin-nās",
          translation: "The Sovereign of mankind,",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6232.mp3",
          words: ["مَلِكِ", "ٱلنَّاسِ"]
        },
        {
          numberInSurah: 3,
          globalNumber: 6233,
          arabic: "إِلَٰهِ ٱلنَّاسِ",
          transliteration: "Ilāhin-nās",
          translation: "The God of mankind,",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6233.mp3",
          words: ["إِلَٰهِ", "ٱلنَّاسِ"]
        },
        {
          numberInSurah: 4,
          globalNumber: 6234,
          arabic: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
          transliteration: "Min sharril-waswāsil-khannās",
          translation: "From the evil of the retreating whisperer -",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6234.mp3",
          words: ["مِن", "شَرِّ", "ٱلْوَسْوَاسِ", "ٱلْخَنَّاسِ"]
        },
        {
          numberInSurah: 5,
          globalNumber: 6235,
          arabic: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
          transliteration: "Al-ladhī yuwaswisu fī ṣudūrin-nās",
          translation: "Who whispers into the breasts of mankind -",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6235.mp3",
          words: ["ٱلَّذِى", "يُوَسْوِسُ", "فِى", "صُدُورِ", "ٱلنَّاسِ"]
        },
        {
          numberInSurah: 6,
          globalNumber: 6236,
          arabic: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
          transliteration: "Minal-jinnati wan-nās",
          translation: "From among the jinn and mankind.'",
          audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3",
          words: ["مِنَ", "ٱلْجِنَّةِ", "وَٱلنَّاسِ"]
        }
      ]
    }
  ],

  // =========================================================================
  // AUTHENTIC HADITH TREASURY
  // =========================================================================
  hadiths: [
    {
      id: "hadith-1",
      arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.",
      translation: "Actions are but by intention, and every man shall have only that which he intended. Thus he whose migration was for Allah and His Messenger, his migration is for Allah and His Messenger; and he whose migration was for worldly benefit or for a woman to marry, his migration is for that for which he migrated.",
      narrator: "Narrated by Umar ibn al-Khattab (رضي الله عنه)",
      source: "Sahih al-Bukhari #1, Sahih Muslim #1907",
      grade: "Muttafaqun 'Alayh (Agreed Upon)",
      category: "Intentions & Sincerity",
      explanation: "A foundational cornerstone of Islam, regarded by Imam ash-Shafi'i and Imam Ahmad as encompassing one-third of all Islamic knowledge."
    },
    {
      id: "hadith-2",
      arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.",
      translation: "None of you truly believes until he loves for his brother that which he loves for himself.",
      narrator: "Narrated by Anas ibn Malik (رضي الله عنه)",
      source: "Sahih al-Bukhari #13, Sahih Muslim #45",
      grade: "Sahih (Agreed Upon)",
      category: "Brotherhood & Akhlaq",
      explanation: "True faith purifies the heart from envy and inspires genuine care for the spiritual and worldly welfare of fellow human beings."
    },
    {
      id: "hadith-3",
      arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.",
      translation: "Whoever travels a path in search of knowledge, Allah will make easy for him by it a path to Paradise.",
      narrator: "Narrated by Abu Hurairah (رضي الله عنه)",
      source: "Sahih Muslim #2699",
      grade: "Sahih (Authentic)",
      category: "Seeking Knowledge",
      explanation: "Emphasizes the profound virtue and heavenly reward reserved for those dedicated to seeking authentic sacred and beneficial knowledge."
    },
    {
      id: "hadith-4",
      arabic: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ، إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ.",
      translation: "Wondrous is the affair of the believer, for his affairs are all good, and that is for no one except the believer. If ease touches him, he gives thanks, and that is good for him. And if hardship touches him, he perseveres with patience, and that is good for him.",
      narrator: "Narrated by Suhayb ar-Rumi (رضي الله عنه)",
      source: "Sahih Muslim #2999",
      grade: "Sahih (Authentic)",
      category: "Patience & Gratitude",
      explanation: "A masterclass in spiritual resilience: the believer's life oscillates peacefully between sincere Shukr (gratitude) and noble Sabr (patience)."
    },
    {
      id: "hadith-5",
      arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ.",
      translation: "The strong man is not the one who can wrestle his opponent to the ground. The truly strong man is the one who controls himself in a fit of rage.",
      narrator: "Narrated by Abu Hurairah (رضي الله عنه)",
      source: "Sahih al-Bukhari #6114, Sahih Muslim #2609",
      grade: "Sahih (Agreed Upon)",
      category: "Self-Control & Character",
      explanation: "True strength in Islam is mastership over one's own ego (nafs) rather than physical dominion over others."
    },
    {
      id: "hadith-6",
      arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.",
      translation: "Be mindful of Allah wherever you may be; follow up a bad deed with a good deed and it will wipe it out; and behave towards people with noble character.",
      narrator: "Narrated by Abu Dharr & Mu'adh ibn Jabal (رضي الله عنهما)",
      source: "Jami` at-Tirmidhi #1987",
      grade: "Hasan Sahih (Sound & Authentic)",
      category: "Taqwa & Akhlaq",
      explanation: "The Prophet ﷺ condensed the duties toward Allah (Taqwa), toward one's own soul (Tawbah), and toward creation (Husn al-Khuluq) in three profound clauses."
    }
  ],

  // =========================================================================
  // DUAS & ADHKAR (FORTRESS OF THE MUSLIM - HISN AL-MUSLIM)
  // =========================================================================
  duas: [
    {
      id: "dua-sayyid-istighfar",
      title: "Sayyid al-Istighfar (The Master Supplication for Forgiveness)",
      arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.",
      transliteration: "Allāhumma Anta Rabbī lā ilāha illā Anta, khalaqtanī wa anā 'abduka, wa anā 'alā 'ahdika wa wa'dika ma-staṭa'tu, a'ūdhu bika min sharri mā ṣana'tu, abū'u laka bini'matika 'alayya, wa abū'u bidhanbī faghfir lī fa'innahū lā yaghfirudh-dhunūba illā Anta.",
      translation: "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.",
      category: "Morning & Evening",
      targetCount: 1,
      source: "Sahih al-Bukhari #6306",
      virtue: "The Prophet ﷺ said whoever recites this with firm faith in the morning and dies before evening will be among the people of Paradise."
    },
    {
      id: "dua-yunus",
      title: "Dua of Prophet Yunus (For Distress & Hardship)",
      arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
      transliteration: "Lā ilāha illā Anta subḥānaka innī kuntu minaẓ-ẓālimīn",
      translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
      category: "Distress & Relief",
      targetCount: 3,
      source: "Surah Al-Anbiya 21:87 / Jami` at-Tirmidhi #3505",
      virtue: "The Prophet ﷺ said: 'No Muslim supplication with this in any matter except that Allah answers him.'"
    },
    {
      id: "dua-protection",
      title: "Protection Against All Harm (Morning & Evening)",
      arabic: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      transliteration: "Bismillāhil-ladhī lā yaḍurru ma'asmihī shay'un fil-arḍi wa lā fis-samā'i wa Huwas-Samī'ul-'Alīm",
      translation: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
      category: "Protection",
      targetCount: 3,
      source: "Sunan Abi Dawud #5088, Jami` at-Tirmidhi #3388",
      virtue: "Whoever recites it three times morning and evening, nothing will harm them."
    },
    {
      id: "dua-parents",
      title: "Supplication for Parents",
      arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
      transliteration: "Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā",
      translation: "My Lord, have mercy upon them as they brought me up [when I was] small.",
      category: "Family & Loved Ones",
      targetCount: 1,
      source: "Surah Al-Isra 17:24",
      virtue: "The timeless Quranic invocation for perpetual filial piety and divine mercy upon our mother and father."
    },
    {
      id: "dua-knowledge",
      title: "Supplication for Beneficial Knowledge",
      arabic: "رَّبِّ زِدْنِي عِلْمًا",
      transliteration: "Rabbi zidnī 'ilmā",
      translation: "My Lord, increase me in knowledge.",
      category: "Knowledge & Wisdom",
      targetCount: 1,
      source: "Surah Ta-Ha 20:114",
      virtue: "The sole blessing for which Allah Almighty commanded His Noble Messenger ﷺ to explicitly pray for an increase."
    },
    {
      id: "dua-anxiety",
      title: "Relief from Anxiety, Sorrow & Debt",
      arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
      transliteration: "Allāhumma innī a'ūdhu bika minal-hammi wal-ḥazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa ḍala'id-dayni wa ghalabatir-rijāl",
      translation: "O Allah, I seek refuge in You from anxiety and grief, helplessness and laziness, stinginess and cowardice, the burden of debt, and the subjugation of men.",
      category: "Mental Peace & Heart",
      targetCount: 1,
      source: "Sahih al-Bukhari #2893",
      virtue: "Anas ibn Malik noted that the Prophet ﷺ would supplicate with this very frequently."
    }
  ],

  // =========================================================================
  // SEERAH & PROPHETS & SAHABAH STORIES
  // =========================================================================
  seerahTimeline: [
    {
      year: "570 CE",
      title: "The Blessed Birth & The Year of the Elephant",
      location: "Makkah al-Mukarramah",
      description: "Prophet Muhammad ﷺ was born an orphan into the noble Qurayshi clan of Banu Hashim. His father Abdullah passed away before his birth, and he was named Muhammad ('The Praised One') by his grandfather Abdul Muttalib.",
      significance: "The beginning of the era of final revelation to mankind, fulfilling the ancestral prayer of Prophet Ibrahim (عليه السلام)."
    },
    {
      year: "610 CE",
      title: "The First Revelation in Cave Hira",
      location: "Mount An-Nur, Makkah",
      description: "While in spiritual contemplation in the secluded mountain cave of Hira, Angel Jibril (Gabriel) appeared to him with the first command of the Holy Qur'an: 'Iqra!' ('Read! In the name of your Lord who created...').",
      significance: "Marks the commencement of Prophethood at age 40 and the inception of the 23-year revelation of the Qur'an."
    },
    {
      year: "620 CE",
      title: "Al-Isra wal-Mi'raj (The Night Journey & Heavenly Ascension)",
      location: "Makkah to Al-Quds to The Heavens",
      description: "Following the 'Year of Sorrow' (the loss of Khadijah and Abu Talib), the Prophet ﷺ was miraculously transported from the Sacred Mosque in Makkah to Al-Aqsa in Jerusalem, then elevated through the seven heavens into the Divine presence.",
      significance: "The gift of the 5 Daily Prayers (Salah) was directly established during this transcendent journey."
    },
    {
      year: "622 CE",
      title: "The Great Hijrah to Madinah al-Munawwarah",
      location: "Makkah to Yathrib (Madinah)",
      description: "After facing intense persecution and plots of assassination in Makkah, the Prophet ﷺ and Abu Bakr (رضي الله عنه) undertook the historic journey to Madinah, establishing the fraternal bond (Mu'akhah) between Muhajirun and Ansar.",
      significance: "The pivotal turning point in Islamic history, chosen as the starting epoch (Year 1 AH) of the Islamic lunar calendar."
    },
    {
      year: "630 CE (8 AH)",
      title: "Fath Makkah (The Peaceful Conquest of Makkah)",
      location: "Makkah al-Mukarramah",
      description: "The Prophet ﷺ marched into Makkah at the head of 10,000 believers without bloodshed, cleansing the Holy Ka'bah of 360 idols while reciting: 'Truth has come and falsehood has vanished.' He offered blanket forgiveness to his former persecutors.",
      significance: "An unparalleled historical monument of mercy, magnanimity, and ultimate triumph of monotheism."
    },
    {
      year: "632 CE (10 AH)",
      title: "The Farewell Pilgrimage (Hajjat al-Wida')",
      location: "Mount Arafat",
      description: "The Prophet ﷺ delivered his monumental Farewell Khutbah before over 100,000 pilgrims, declaring the inviolability of human life, dignity, property, racial equality, and women's rights.",
      significance: "The universal charter of human equality: 'No Arab has superiority over a non-Arab, nor a non-Arab over an Arab, except by Taqwa (piety).'"
    }
  ],

  prophetStories: [
    {
      name: "Prophet Adam (عليه السلام)",
      title: "The Father of Humanity & The First Prophet",
      epithet: "Safi-Allah (The Chosen of Allah)",
      keyTheme: "Tawbah (Repentance) & Free Will",
      story: "Allah created Adam from clay with His own hands and taught him the names of all things, elevating him above the angels. When Adam and Hawwa were tested and erred through Iblis's deception, Adam immediately turned back to Allah with sincere repentance: 'Our Lord, we have wronged ourselves...'. Allah accepted their tawbah and dispatched them as vicegerents to populate the Earth.",
      quranReference: "Surah Al-Baqarah (2:30-39), Surah Al-A'raf (7:11-25)"
    },
    {
      name: "Prophet Ibrahim (عليه السلام)",
      title: "The Father of the Prophets & Pure Monotheist",
      epithet: "Khalil-Allah (The Intimate Friend of Allah)",
      keyTheme: "Unshakable Tawheed & Supreme Sacrifice",
      story: "Living in an empire of idol-worship and tyrannical ruler Nimrod, Ibrahim questioned idolatry with pristine reason and smashed the idols. Cast into a roaring furnace, the fire was commanded: 'O fire, be coolness and safety for Ibrahim.' He built the Ka'bah with his son Ismail and willingly submitted to Allah's command, establishing the timeless rites of Hajj and sacrifice.",
      quranReference: "Surah Al-Anbiya (21:51-71), Surah Ibrahim (14:35-41)"
    },
    {
      name: "Prophet Yusuf (عليه السلام)",
      title: "The Master of Patience, Chastity & Forgiveness",
      epithet: "As-Siddiq (The Truthful)",
      keyTheme: "Sabr, Divine Providence & Forgiveness",
      story: "Betrayed by jealous brothers and cast into a deep well, sold as a slave in Egypt, falsely imprisoned for maintaining purity, Yusuf remained steadfastly devoted to Allah. Blessed with the divine gift of dream interpretation, he rose to become the chief minister of Egypt, saving the region from famine and unconditionally pardoning his repentant brothers.",
      quranReference: "Surah Yusuf (Chapter 12, 'The Best of Stories')"
    },
    {
      name: "Prophet Musa (عليه السلام)",
      title: "The Interlocutor who Spoke to the Creator",
      epithet: "Kalim-Allah (The One who Spoke directly with Allah)",
      keyTheme: "Confronting Tyranny & Steadfast Leadership",
      story: "Placed as an infant in the Nile by divine inspiration, Musa was raised inside Pharaoh's own palace. Commissioned with Prophethood at Mount Sinai (Tuwa), he confronted the mightiest tyrant of antiquity with clear miracles. When trapped between Pharaoh's army and the Red Sea, he declared with absolute conviction: 'Nay, indeed! My Lord is with me; He will guide me!'",
      quranReference: "Surah Ta-Ha (20:9-98), Surah Al-Qasas (28:3-44)"
    },
    {
      name: "Prophet Isa (عليه السلام)",
      title: "The Pure Spirit & Word from Allah",
      epithet: "Ruh-Allah & Al-Masih (The Messiah)",
      keyTheme: "Miracles of Compassion & Pure Tawheed",
      story: "Born miraculously to the Virgin Maryam without a father, Isa spoke in the cradle to defend his mother's honor. Endowed with wondrous miracles by Allah's permission—healing the leper, raising the dead, curing the blind—he called the Children of Israel back to sincere love and worship of Allah alone. He was not crucified but raised bodily to heaven.",
      quranReference: "Surah Maryam (19:16-36), Surah Ali 'Imran (3:45-59)"
    }
  ],

  sahabah: [
    {
      name: "Abu Bakr as-Siddiq (رضي الله عنه)",
      title: "The First Caliph & The Truthful",
      virtue: "The most beloved man to the Prophet ﷺ and the first adult male to accept Islam without a moment's hesitation.",
      bio: "Companion in the Cave of Thawr during the Hijrah, he spent his entire fortune to emancipate oppressed slaves like Bilal and fund the early Muslim community. After the Prophet's ﷺ demise, his resolve steadied the entire Ummah, and he commissioned the initial compilation of the Qur'an into a unified codex.",
      quote: "If I do well, help me; and if I do wrong, set me right."
    },
    {
      name: "Umar ibn al-Khattab (رضي الله عنه)",
      title: "Al-Farooq (The Distinguisher between Truth and Falsehood)",
      virtue: "Renowned for uncompromising justice, humility, and organizational brilliance.",
      bio: "Second Caliph whose conversion gave early Muslims the courage to pray openly at the Ka'bah. During his decade of leadership, the Islamic realm expanded across Persia and the Levant, yet he slept on simple palm-leaf mats and patrolled the streets of Madinah at night carrying flour for impoverished orphans.",
      quote: "We were the most humiliated of people, and Allah honored us with Islam. If we seek honor through anything else, Allah will humiliate us again."
    },
    {
      name: "Uthman ibn Affan (رضي الله عنه)",
      title: "Dhun-Nurayn (The Possessor of the Two Lights)",
      virtue: "Celebrated for extraordinary modesty (Haya') and boundless financial generosity.",
      bio: "Married two daughters of the Prophet ﷺ (Ruqayyah then Umm Kulthum). He purchased the Well of Rumah for public use in Madinah and financed the expedition to Tabuk. As the Third Caliph, he unified the Muslim world around the standardized Uthmanic codex of the Holy Qur'an.",
      quote: "If our hearts were truly pure, they would never tire of the words of Allah."
    },
    {
      name: "Ali ibn Abi Talib (رضي الله عنه)",
      title: "Asadullah (The Lion of Allah) & Fourth Caliph",
      virtue: "Unrivaled courage, profound judicial acumen, and spiritual eloquence.",
      bio: "Cousin and son-in-law of the Prophet ﷺ (married to Fatima az-Zahra). The first youth to embrace Islam at age 10, he risked his life sleeping in the Prophet's bed on the night of Hijrah to divert the assassins. The Prophet ﷺ said: 'I am the city of knowledge and Ali is its gate.'",
      quote: "The richness of the soul is superior to the richness of worldly possessions."
    },
    {
      name: "Aisha bint Abi Bakr (رضي الله عنها)",
      title: "Umm al-Mu'minin (Mother of the Believers)",
      virtue: "One of the greatest scholars, jurists, and transmitters of Hadith in Islamic history.",
      bio: "Brilliant intellect who narrated over 2,210 hadiths, providing intimate insight into the domestic sunnah, character, and prayers of the Prophet ﷺ. Senior Sahabah routinely consulted her on intricate inheritance law, poetry, and medicine.",
      quote: "The most beloved deed to Allah is that which is done consistently, even if it is small."
    },
    {
      name: "Khalid ibn al-Walid (رضي الله عنه)",
      title: "Sayf-Allah al-Maslool (The Drawn Sword of Allah)",
      virtue: "Undefeated military commander in over 50 engagements.",
      bio: "A strategic mastermind whose tactical brilliance turned battles. When Caliph Umar relieved him of supreme command to remind the army that victory comes from Allah alone and not a mortal general, Khalid served gracefully as a humble rank-and-file soldier with complete sincerity.",
      quote: "I fought in so many battles that there is not the space of a hand span on my body without a scar, yet here I die in bed like a camel."
    }
  ],

  // =========================================================================
  // AQEEDAH & FIQH ESSENTIALS
  // =========================================================================
  aqeedahPillars: [
    {
      pillar: "Belief in Allah (Tawheed)",
      arabic: "الإِيمَانُ بِاللَّهِ",
      details: "Affirming that Allah alone is the Sole Creator and Lord of all existence (Ruboobiyyah), the Only One deserving of all worship (Uloohiyyah), possessing perfect Names and Attributes without likeness, alteration, or nullification (Asma' wa Sifat)."
    },
    {
      pillar: "Belief in the Angels (Mala'ikah)",
      arabic: "الإِيمَانُ بِالْمَلائِكَةِ",
      details: "Created from divine light, pure spiritual beings who never disobey Allah and execute His decrees—including Jibril (revelation), Mika'il (provision/rain), Israfil (the Trumpet), and the Angel of Death."
    },
    {
      pillar: "Belief in the Divine Books (Kutub)",
      arabic: "الإِيمَانُ بِالْكُتُبِ",
      details: "Believing in the original scriptures sent to the Messengers: the Tawrat of Musa, the Zabur of Dawud, the Injeel of Isa, the Scrolls of Ibrahim, culminating in the Holy Qur'an preserved forever from corruption."
    },
    {
      pillar: "Belief in the Messengers (Rusul)",
      arabic: "الإِيمَانُ بِالرُّسُلِ",
      details: "Affirming all prophets sent to humanity from Adam to Muhammad ﷺ, who is the Seal of the Prophets (Khatam an-Nabiyyin). No prophet will emerge after him."
    },
    {
      pillar: "Belief in the Day of Judgment (Al-Yawm al-Akhir)",
      arabic: "الإِيمَانُ بِالْيَوْمِ الآخِرِ",
      details: "Belief in bodily resurrection, the Scale of deeds (Mizan), the Bridge (Sirat), the Intercession (Shafa'ah), and the eternal residences of Jannah (Paradise) and Jahannam (Hellfire)."
    },
    {
      pillar: "Belief in Divine Decree (Al-Qadar)",
      arabic: "الإِيمَانُ بِالْقَدَرِ",
      details: "Acknowledging Allah's eternal Knowledge, His Writing in the Preserved Tablet (Al-Lawh al-Mahfooz), His Universal Will (Mashee'ah), and His active Creation (Khalq) of all that comes to pass."
    }
  ],

  fiqhGuides: [
    {
      title: "Taharah: The Steps of Wudu (Ablution)",
      steps: [
        "1. Make sincere Niyyah (intention) in the heart and say 'Bismillah'.",
        "2. Wash both hands up to the wrists three times thoroughly.",
        "3. Rinse mouth (Madmadah) and sniff water into nostrils (Istinshaq) 3 times.",
        "4. Wash the entire face from hairline to below chin and ear to ear 3 times.",
        "5. Wash arms up to and including the elbows 3 times, right arm first.",
        "6. Wipe the head from front to back with moist hands and wipe both ears once.",
        "7. Wash both feet up to the ankles 3 times, right foot first."
      ]
    },
    {
      title: "Salah: The Pillars of Daily Prayer",
      steps: [
        "Takbirat al-Ihram: Raise hands to ears/shoulders saying 'Allahu Akbar'.",
        "Qiyam: Stand upright with hands folded over chest; recite Al-Fatihah + a Surah.",
        "Ruku': Bow with flat back, hands on knees, saying 'Subhana Rabbiyal-'Azeem' 3x.",
        "I'tidal: Stand upright saying 'Sami'Allahu liman hamidah; Rabbana wa lakal-hamd'.",
        "Sujud: Prostrate on 7 bones saying 'Subhana Rabbiyal-A'la' 3x.",
        "Jalsah: Sit calmly between the two prostrations saying 'Rabbighfir li'.",
        "Tashahhud: Recite the testimony of faith and send Salawat upon the Prophet ﷺ."
      ]
    }
  ],

  // =========================================================================
  // SCHOLAR QUOTES (PEARLS OF WISDOM)
  // =========================================================================
  scholarQuotes: [
    {
      scholar: "Imam ash-Shafi'i (رحمه الله)",
      era: "150 - 204 AH",
      quote: "Time is like a sword: if you do not cut it, it will cut you; and your soul: if you do not keep it busy with the truth, it will keep you busy with falsehood.",
      category: "Time & Discipline"
    },
    {
      scholar: "Hasan al-Basri (رحمه الله)",
      era: "21 - 110 AH",
      quote: "O son of Adam! You are nothing but a bundle of days. Whenever a day passes, a part of you passes away with it.",
      category: "Mortality & Soul"
    },
    {
      scholar: "Ibn al-Qayyim al-Jawziyyah (رحمه الله)",
      era: "691 - 751 AH",
      quote: "The heart was created to love Allah. Whenever it is attached to other than Him, it tastes the bitterness of disappointment.",
      category: "Heart & Love of Allah"
    },
    {
      scholar: "Imam Ahmad ibn Hanbal (رحمه الله)",
      era: "164 - 241 AH",
      quote: "Seek knowledge from the cradle to the grave. If you know what is right, then stand firm upon it even if you stand alone.",
      category: "Knowledge & Steadfastness"
    },
    {
      scholar: "Ibn Taymiyyah (رحمه الله)",
      era: "661 - 728 AH",
      quote: "What can my enemies do to me? My garden and my paradise are in my breast. If I am imprisoned, it is seclusion with my Lord; if I am exiled, it is a journey of reflection; if I am killed, it is martyrdom.",
      category: "Spiritual Freedom"
    },
    {
      scholar: "Imam an-Nawawi (رحمه الله)",
      era: "631 - 676 AH",
      quote: "True sincerity is when you are pleased with Allah's awareness of your deeds, without needing the praise or recognition of creation.",
      category: "Sincerity (Ikhlas)"
    }
  ],

  // =========================================================================
  // INTERACTIVE ISLAMIC QUIZ
  // =========================================================================
  quiz: [
    {
      id: 1,
      question: "Which Surah in the Holy Qur'an is known as the 'Mother of the Book' (Umm al-Kitab)?",
      options: ["Surah Al-Baqarah", "Surah Al-Fatihah", "Surah Ya-Sin", "Surah Al-Ikhlas"],
      correct: 1,
      explanation: "Surah Al-Fatihah is designated Umm al-Kitab because it encapsulates the fundamental themes of the entire Qur'an: Tawheed, worship, guidance, and the Day of Judgment.",
      reference: "Sahih al-Bukhari #4704"
    },
    {
      id: 2,
      question: "In what year of the Christian calendar did the historic Hijrah (migration) to Madinah occur?",
      options: ["570 CE", "610 CE", "622 CE", "632 CE"],
      correct: 2,
      explanation: "The Hijrah took place in 622 CE, later chosen under Caliph Umar ibn al-Khattab as the commencement of the Islamic Hijri calendar (1 AH).",
      reference: "Al-Bidayah wan-Nihayah"
    },
    {
      id: 3,
      question: "Which Prophet was commanded by Allah to build the Ark to survive the Great Deluge?",
      options: ["Prophet Ibrahim (عليه السلام)", "Prophet Nuh (عليه السلام)", "Prophet Hud (عليه السلام)", "Prophet Salih (عليه السلام)"],
      correct: 1,
      explanation: "Prophet Nuh (Noah) preached patiently to his people for 950 years before constructing the Ark upon divine command.",
      reference: "Surah Hud 11:36-40"
    },
    {
      id: 4,
      question: "Who was honored with the title 'Dhun-Nurayn' (Possessor of the Two Lights)?",
      options: ["Ali ibn Abi Talib", "Umar ibn al-Khattab", "Uthman ibn Affan", "Abu Bakr as-Siddiq"],
      correct: 2,
      explanation: "Uthman ibn Affan (رضي الله عنه) earned this title because he had the unique honor of marrying two daughters of the Prophet ﷺ (Ruqayyah and Umm Kulthum).",
      reference: "Siyar A'lam an-Nubala"
    },
    {
      id: 5,
      question: "What is the primary Nisab threshold rate for obligatory annual Zakat on wealth and liquid savings?",
      options: ["1.0%", "2.5% (1/40th)", "5.0%", "10.0%"],
      correct: 1,
      explanation: "Zakat is precisely 2.5% on qualifying wealth that has remained above the nisab threshold for one full lunar year.",
      reference: "Fiqh us-Sunnah / Sahih al-Bukhari"
    },
    {
      id: 6,
      question: "Which verse in the Holy Qur'an is described by the Prophet ﷺ as the greatest verse in the Book of Allah?",
      options: ["Ayat al-Dayn (2:282)", "Ayat al-Kursi (2:255)", "Surah Al-Ikhlas (112:1)", "Ayat an-Nur (24:35)"],
      correct: 1,
      explanation: "Ubayy ibn Ka'b was asked by the Prophet ﷺ which verse is the greatest, and he answered 'Allahu la ilaha illa Huwal-Hayyul-Qayyum' (Ayat al-Kursi), to which the Prophet ﷺ confirmed.",
      reference: "Sahih Muslim #810"
    }
  ]
};

// Expose globally for browser usage
if (typeof window !== 'undefined') {
  window.MIRATH_DATA = MIRATH_DATA;
}
