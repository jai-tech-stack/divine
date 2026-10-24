import type { Story } from '../types';

/**
 * Retold in our own words from:
 * அ.ச. ஞானசம்பந்தன், ஞா. மீரா — "பதினெண் புராணங்கள்" (கங்கை புத்தக நிலையம்),
 * 1. பிரம்ம புராணம், பக்கம் 10–13 (Tamil Virtual Academy e-library scan, PDF pp. 38–41).
 * The book is cited as the reference; no passage is copied verbatim.
 */
export const prithu: Story = {
  id: 'prithu',
  title: 'பிருதுவும் பூமித்தாயும்',
  subtitle: 'சினம் செயலாக மாறிய கதை',
  purana: 'பிரம்ம புராணம்',
  source:
    'மூலம்: அ.ச. ஞானசம்பந்தன், ஞா. மீரா, "பதினெண் புராணங்கள்", கங்கை புத்தக நிலையம் — பிரம்ம புராணம், பக். 10–13. இங்கு உள்ளது சுருக்கமான மறுகூறல்.',
  minutes: 4,
  scenes: [
    {
      id: 'naimisha',
      title: 'நைமிசாரண்யம்',
      backdrop: 'forest-dawn',
      image: require('@/assets/story/naimisha.jpg'),
      imageAspect: 1.5,
      focus: [0.55, 0.2],
      particles: 'dust',
      camera: { zoom: [1.12, 1.0], panX: [-18, 10] },
      effect: 'bloom',
      lines: [
        'நைமிசாரண்யம் — பூத்துக் குலுங்கும் மரங்களும், சலசலக்கும் ஓடைகளும் நிறைந்த தவவனம்.',
        'அங்கு கூடியிருந்த முனிவர்களுக்கு, உரோமஹர்ஷணர் பிரம்ம புராணக் கதைகளைச் சொல்லத் தொடங்கினார்.',
        'இது, பூமிக்கே தன் பெயரைத் தந்த ஒரு மன்னனின் கதை.',
      ],
      imagePrompt:
        'Cinematic devotional painting, ancient Indian forest hermitage Naimisharanya at dawn, golden god-rays through banyan trees, sages seated in a circle around a storyteller, mist over a stream, warm amber and teal palette, painterly, 9:16 vertical',
    },
    {
      id: 'vena',
      title: 'வேனனின் அகங்காரம்',
      backdrop: 'palace-storm',
      image: require('@/assets/story/vena.jpg'),
      imageAspect: 1.5,
      focus: [0.3, 0.5],
      particles: 'embers',
      camera: { zoom: [1.0, 1.14], panX: [0, 0], panY: [0, -12] },
      effect: 'lightning',
      lines: [
        'துருவனின் பரம்பரையில் வந்த நல்லரசன் அங்கனுக்கு, வேனன் என்ற மகன் பிறந்தான்.',
        'அவனோ தந்தையைப் போல் இல்லை. "இந்த அண்டங்களுக்கெல்லாம் நானே தலைவன்" என்று அகங்காரத்துடன் திரிந்தான்.',
        'முனிவர்கள் வந்து எவ்வளவோ எடுத்துச் சொல்லியும், அவன் செவிசாய்க்கவில்லை.',
      ],
      imagePrompt:
        'Dark cinematic painting, arrogant ancient Indian king on a towering black-stone throne, storm clouds and red lightning behind palace spires, sages standing below pleading, deep crimson and charcoal palette, dramatic low angle, 9:16 vertical',
    },
    {
      id: 'birth',
      title: 'ஒளியில் பிறந்த பிருது',
      backdrop: 'divine-birth',
      image: require('@/assets/story/birth.jpg'),
      imageAspect: 1.5,
      focus: [0.45, 0.55],
      particles: 'sparks',
      camera: { zoom: [1.2, 1.02], panX: [0, 0] },
      effect: 'bloom',
      lines: [
        'முனிவர்கள் வேனனின் கையைப் பிசைந்தபோது, அவனுள் இருந்த நன்மைகள் எல்லாம் ஒன்றாகத் திரண்டன.',
        'ஒளி வடிவுடன், சிறந்த கவசம் பூண்டு, பிருது வெளிப்பட்டான்.',
      ],
      imagePrompt:
        'Divine radiant young warrior-king emerging from a column of golden light, ornate armour, sages shielding their eyes, swirling sparks, celestial background, epic devotional art, warm gold and white, 9:16 vertical',
    },
    {
      id: 'crown',
      title: 'முடிசூட்டு',
      backdrop: 'coronation',
      image: require('@/assets/story/crown.jpg'),
      imageAspect: 1.0,
      focus: [0.5, 0.5],
      particles: 'petals',
      camera: { zoom: [1.0, 1.1], panX: [12, -12] },
      lines: [
        'பிரம்மாவே பிருதுவுக்கு முடி சூட்டி, பூமியின் அரசனாக்கினார்.',
        'கடலுக்கு வருணன், செல்வத்துக்குக் குபேரன், மலைகளுக்கு இமவான் — ஒவ்வொன்றுக்கும் ஒரு தலைவர் நியமிக்கப்பட்டார்.',
        'பாடகர்கள் கேட்டனர்: "இன்னும் எதுவும் செய்யாத இளம் அரசனை எதற்காகப் புகழ்வது?"',
        'முனிவர்கள் அவர்களுக்கு எதிர்காலத்தைக் காட்டினர். அதன் பின்னரே புகழ்ப் பாடல் எட்டுத் திசையும் பரவியது.',
      ],
      imagePrompt:
        'Coronation of a young Indian king by four-faced Brahma seated on a lotus, flower petals falling, celestial guardians in the clouds, golden temple light, devotional cinematic painting, 9:16 vertical',
    },
    {
      id: 'famine',
      title: 'பசியின் குரல்',
      backdrop: 'famine',
      image: require('@/assets/story/famine.jpg'),
      imageAspect: 1.5,
      focus: [0.1, 0.6],
      particles: 'dust',
      camera: { zoom: [1.06, 1.0], panX: [20, -20] },
      lines: [
        'ஒருநாள், பூமியின் ஒரு மூலையிலிருந்து மக்கள் வந்து அரசனின் முன் நின்றனர்.',
        '"அரசே! நிலத்தில் எதுவும் விளையவில்லை. பசுக்கள் பால் தரவில்லை. நாங்கள் என்ன செய்வோம்?"',
      ],
      imagePrompt:
        'Barren cracked earth under a pale hot sky, thin villagers and weak cows walking toward a distant palace, dust in the air, muted ochre and grey palette, emotional cinematic painting, 9:16 vertical',
    },
    {
      id: 'wrath',
      title: 'சினம்',
      backdrop: 'wrath',
      image: require('@/assets/story/wrath.jpg'),
      imageAspect: 1.5,
      focus: [0.2, 0.0],
      particles: 'embers',
      camera: { zoom: [1.0, 1.22], panX: [0, 0], panY: [0, 8] },
      effect: 'tremor',
      lines: [
        'மக்களின் துயரம் கேட்ட பிருதுவின் உள்ளத்தில் கடும் சினம் எழுந்தது.',
        '"விளைச்சலைத் தர மறுக்கும் இந்தப் பூமியைப் பிளப்பேன்!" என்று வில்லை எடுத்துப் புறப்பட்டான்.',
      ],
      imagePrompt:
        'Furious young king drawing a great bow toward the earth, blood-red sky, ground trembling and cracking, embers flying, heroic silhouette against a burning horizon, cinematic devotional art, 9:16 vertical',
    },
    {
      id: 'chase',
      title: 'ஓடும் பூமி',
      backdrop: 'cosmic-chase',
      image: require('@/assets/story/chase.jpg'),
      imageAspect: 1.5,
      focus: [0.75, 0.35],
      particles: 'stars',
      camera: { zoom: [1.0, 1.08], panX: [40, -40] },
      lines: [
        'அஞ்சிய பூமி, ஒரு பசுவின் வடிவெடுத்து ஓடத் தொடங்கியது.',
        'மேலுலகம் சென்றது; கீழுலகம் சென்றது — எங்கும் அதற்குப் புகலிடம் கிடைக்கவில்லை.',
        'இறுதியில், பிருதுவின் முன்னேயே திரும்பி வந்து நின்றது.',
      ],
      imagePrompt:
        'Luminous white cow, the goddess Earth, running across a cosmic sky of stars and planets, pursued by a distant archer king on a chariot, sense of motion, deep indigo and gold, cinematic devotional painting, 9:16 vertical',
    },
    {
      id: 'speaks',
      title: 'பூமியின் வேண்டுகோள்',
      backdrop: 'earth-speaks',
      image: require('@/assets/story/speaks.jpg'),
      imageAspect: 1.5,
      focus: [0.25, 0.7],
      particles: 'dust',
      camera: { zoom: [1.1, 1.0], panX: [0, 0] },
      lines: [
        '"அரசே! என்னைக் கொல்வதால் உனக்கு ஒரு பயனும் இல்லை."',
        '"அதற்கு பதிலாக, பூமியைச் சமன் செய். மலைகளை ஒருபுறம் ஒதுக்கு."',
        '"சமதரையில் உழுது பயிரிட்டால், உனக்கும் உன் மக்களுக்கும் தேவையான வளம் கிடைக்கும்."',
      ],
      imagePrompt:
        'Gentle sacred cow glowing softly, standing calmly before a kneeling king who lowers his bow, quiet dusk light, compassion and stillness, soft violet and gold palette, cinematic devotional painting, 9:16 vertical',
    },
    {
      id: 'level',
      title: 'சினம் செயலாகிறது',
      backdrop: 'levelling',
      image: require('@/assets/story/level.jpg'),
      imageAspect: 1.5,
      focus: [0.9, 0.2],
      particles: 'dust',
      camera: { zoom: [1.0, 1.1], panX: [-24, 24] },
      lines: ['பிருது வில்லைத் தாழ்த்தினான். கேட்டான். சிந்தித்தான்.', 'மலைகளை ஒருபுறம் ஒதுக்கி, நிலத்தைச் சமன் செய்தான். உழவு தொடங்கியது.'],
      imagePrompt:
        'King and villagers levelling land together, mountains pushed to the horizon, first ploughed furrows, bullocks and plough, morning light, hopeful mood, cinematic devotional painting, 9:16 vertical',
    },
    {
      id: 'prithvi',
      title: 'பிருத்வி',
      backdrop: 'harvest',
      particles: 'petals',
      camera: { zoom: [1.15, 1.0], panX: [0, 0], panY: [10, 0] },
      effect: 'bloom',
      lines: [
        'வயல்கள் பசுமையாயின; பசுக்கள் பால் பொழிந்தன; பசி நீங்கியது.',
        'உயிர்கள் வாழத் தகுந்ததாகப் பூமியைச் சீர்செய்த மன்னன் பிருதுவின் பெயராலேயே, பூமி "பிருத்வி" என்று அழைக்கப்படுகிறது.',
      ],
      imagePrompt:
        'Abundant green paddy fields and rivers under a golden sunrise, cows with calves, happy villagers, a benevolent king watching from a hill, Mother Earth faintly visible in the clouds, cinematic devotional painting, 9:16 vertical',
    },
  ],
  verse: {
    ref: 'பகவத் கீதை 2.63',
    devanagari: 'क्रोधाद्भवति सम्मोहः सम्मोहात्स्मृतिविभ्रमः।\nस्मृतिभ्रंशाद्बुद्धिनाशो बुद्धिनाशात्प्रणश्यति॥',
    tamilScript: 'க்ரோதாத் பவதி ஸம்மோஹ: ஸம்மோஹாத் ஸ்ம்ருதி விப்ரம: |\nஸ்ம்ருதி ப்ரம்சாத் புத்தி நாசோ புத்தி நாசாத் ப்ரணச்யதி ||',
    words: [
      { w: 'க்ரோதாத்', m: 'சினத்திலிருந்து' },
      { w: 'பவதி ஸம்மோஹ:', m: 'மயக்கம் (குழப்பம்) உண்டாகிறது' },
      { w: 'ஸ்ம்ருதி விப்ரம:', m: 'நினைவு தடுமாறுகிறது' },
      { w: 'ஸ்ம்ருதி ப்ரம்சாத்', m: 'நினைவு தவறுவதால்' },
      { w: 'புத்தி நாச:', m: 'பகுத்தறிவு அழிகிறது' },
      { w: 'ப்ரணச்யதி', m: 'மனிதன் வீழ்ச்சி அடைகிறான்' },
    ],
    meaning:
      'சினத்திலிருந்து மயக்கம் பிறக்கிறது; மயக்கத்தால் நினைவு தடுமாறுகிறது; நினைவு தவறினால் பகுத்தறிவு அழிகிறது; பகுத்தறிவு அழிந்தால் மனிதன் தன்னையே இழக்கிறான்.',
    note: 'இந்தச் சுலோகம் பிரம்ம புராணத்தில் உள்ளதல்ல. கதையின் கருத்தோடு தொடர்புடைய பகவத் கீதைச் சுலோகமாக இங்கு இணைக்கப்பட்டுள்ளது.',
  },
  wisdom: [
    {
      heading: 'சினம் ஒரு சமிக்ஞை; தீர்ப்பு அல்ல',
      body: 'பிருதுவின் சினம் சுயநலத்தால் எழவில்லை — மக்களின் பசியைக் கண்டு எழுந்தது. ஆனாலும் சினத்தின் முதல் எண்ணம் "அழி" என்பதாகவே இருந்தது. அது பசியைத் தீர்த்திருக்காது.',
    },
    {
      heading: 'கேட்கும் ஒரு கணம்',
      body: 'பூமி பேசியபோது அவன் நின்று கேட்டான். சினத்துக்கும் செயலுக்கும் இடையிலான அந்த இடைவெளியில்தான் பகுத்தறிவு திரும்புகிறது — கீதை 2.63 எச்சரிப்பதும் இதையே.',
    },
    {
      heading: 'அழிப்பதைவிட சீர்செய்வது',
      body: 'பிரச்சினையை உடைக்காமல், அதன் நிலையை மாற்றி — மலைகளை ஒதுக்கி, நிலத்தைச் சமன் செய்து — உழைப்பால் தீர்த்தான். பலனைத் தேடும் கோபத்திலிருந்து, பொறுப்பான செயலுக்கு மாறுவதே கர்ம யோகம்.',
    },
    {
      heading: 'புகழுக்குப் பின் பொறுப்பு',
      body: '"இன்னும் எதுவும் செய்யாதவனை எப்படிப் புகழ்வது?" என்று பாடகர்கள் கேட்டது ஒரு நினைவூட்டல்: பெயர் முன்னே வரலாம்; அதைத் தகுதியாக்குவது செயல்தான்.',
    },
  ],
  reflection: {
    question: 'சமீபத்தில் உங்களுக்குச் சினம் வந்த ஒரு தருணத்தை நினைத்துப் பாருங்கள். அப்போது முதலில் தோன்றியது எது?',
    options: ['உடனே கடுமையாகப் பேசினேன்', 'விலகிச் சென்றேன்', 'நின்று கேட்டேன்', 'இன்னும் தெரியவில்லை'],
  },
  practice: {
    label: '5 நிமிட மூச்சுப் பயிற்சி',
    detail: 'அடுத்த கடினமான உரையாடலுக்கு முன், "பூமி பேசும்" அந்த இடைவெளியை உருவாக்கப் பழகுங்கள்.',
    route: '/practice/dhyanam',
    minutes: 5,
  },
  askSuggestions: [
    'வேலை அழுத்தத்தில் வீட்டில் கோபப்பட்டேன் — முதலில் என்ன செய்யலாம்?',
    'பிருதுவின் சினம் சரியா, தவறா?',
    'கீதை 2.63-ஐ இன்னும் எளிமையாக விளக்குங்கள்',
  ],
};
