# Divine Life

தமிழில் ஆன்மிக வாசிப்பு, பாராயணம் மற்றும் தினசரி பயிற்சிக்கான Expo / React Native செயலி.

## 1.0.3

- பகவத் கீதை: தேர்ந்தெடுத்த சம்ஸ்கிருதப் பதிப்பில் 18 அத்தியாயங்கள், 701 சுலோகங்கள். பதிப்புகளுக்கு இடையே மொத்த எண்ணிக்கையும் 13ஆம் அத்தியாய எண்ணிடலும் மாறலாம்; இந்தச் செயலியில் தொடக்கக் கேள்வி 13.0 எனக் காட்டப்படுகிறது.
- 96 மந்திர / பாராயணப் பதிவுகள்; தேர்ந்தெடுத்த விநாயகர், சிவன், முருகன், திருமால், தேவியர், ஆழ்வார் படைப்புகள்; மூல இணைப்புகள் மற்றும் தனித்த தமிழ் விளக்கங்கள். இது அனைத்து சமய நூல்களின் முழுத் தொகுப்பு அல்ல.
- தமிழ் உரையாடல்: கடவுளிடம் கேளுங்கள். அருள்நூல் சார்ந்த அன்பான வழிகாட்டுதல்; உருவாக்கப்பட்ட பதில்கள் இறைவனின் நேரடி வாக்கு அல்ல.
- ஞான நூல்கள்: வழங்கப்பட்ட 10 நூல்களின் தேடக்கூடிய, நகலெடுக்கக்கூடிய உரை. எழுத்துணர்வுப் பிழைகள் இருக்கலாம்; பக்கங்களில் மெய்ப்புத் திருத்த நிலை காட்டப்படும்.
- புராணச் சரிதங்கள்: ஒரு காட்சிச் சரிதம் மற்றும் வழங்கப்பட்ட சுருக்க நூலின் 17 புராணப் பகுதிகளுக்கான இணைப்புகள். 750 பக்க மூலப் பிரதியில் பிரம்மாண்ட புராணப் பகுதி இல்லை.
- முகப்பில் கீதை, சரிதக் காட்சி, நூல் பக்கம் ஆகியவற்றைத் தொடரலாம். முன்னேற்றமும் ஜபப் பதிவுகளும் சாதனத்தில் சேமிக்கப்படும்; கணக்கு / cloud sync இன்னும் இல்லை.
- கைபேசி அளவுகளுக்கேற்ற தமிழ் அமைப்பு, முழு தெய்வக் கட்டங்கள், தேர்வுக்கேற்ற முகப்புப் படம்.

## இயக்குதல்

Node.js மற்றும் npm தேவை. Expo SDK 58 பயன்படுத்தப்படுகிறது.

```sh
npm ci
npx expo start
npx expo lint
npx tsc --noEmit
```

குரல் அடையாளம் காணுதல் போன்ற native modules காரணமாக முழு வசதிகளுக்குச் சொந்த development / release build தேவை. Expo Go மட்டும் அனைத்தையும் ஆதரிக்காது. தமிழ்க் குரல் இல்லாவிட்டால் உரை காட்டப்படும்.

## சோதனைகள்

```sh
node tools/check-progress.mjs
node tools/check-companion.mjs
node tools/check-devotional.mjs
node tools/check-ganesha.mjs
node tools/check-shiva.mjs
node tools/check-murugan.mjs
node tools/check-gita.mjs
node tools/check-books.mjs
```

மூல ஒப்பீடு, பதிப்பு வேறுபாடுகள், உரை எண்ணிக்கைகள் மற்றும் நிலுவைப் பணிகள் `tools/*-content.md` மற்றும் `tools/content-requests.md` கோப்புகளில் உள்ளன.

## Android APK

`app.json` பதிப்பு 1.0.1, Android versionCode 2, package `com.anonymous.divinelife`.

பரிந்துரைக்கப்பட்ட cloud build:

```sh
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

ஏற்கெனவே நிறுவிய செயலியை update செய்ய அதே package மற்றும் signing key தேவை. தற்போதைய சோதனை APK பழைய APK-க்கு இணையான debug signing key-ஐப் பயன்படுத்துகிறது; இது Play Store production signing அல்ல. Key-கள் repository-ல் சேர்க்கப்படுவதில்லை. Cloud build-க்கு மாறும்போது பழைய signing credentials-ஐப் பாதுகாக்க வேண்டும்.

இந்த வெளியீட்டுக்கு உள்ளூர் build முயற்சி செய்யப்பட்டுள்ளது. Android SDK / JDK உடன்:

```sh
npx expo prebuild --platform android --no-install
cd android
./gradlew :app:assembleRelease
```

APK-களும் generated Android / iOS கோப்புகளும் Git-ல் சேர்க்கப்படுவதில்லை; APK வெளியீட்டு asset ஆக வழங்கப்படும்.

### Windows native build

நீண்ட கோப்புப் பாதையால் பழைய Ninja கருவி தோல்வியடைந்தால், [அதிகாரப்பூர்வ Ninja 1.13.2](https://github.com/ninja-build/ninja/releases/tag/v1.13.2) Windows binary-ஐப் பயன்படுத்தலாம். SDK கருவிகளை மாற்றாமல், தனியாகப் பிரித்தெடுத்த `ninja.exe` பாதையை அமைக்கவும். `JAVA_HOME`, `ANDROID_HOME` அமைந்திருக்க வேண்டும். Project root-லிருந்து:

```powershell
$env:DIVINE_NINJA_EXE = (Resolve-Path .expo/ninja-runtime/ninja.exe).Path
.\android\gradlew.bat -p android :app:assembleRelease --init-script ../tools/windows-cmake.gradle --console=plain --max-workers=2
```

Init script தற்காலிக native object பாதைகளைக் குறைத்து, compiler concurrency-ஐ வரையறுக்கும்; செயலியின் signing அல்லது package பெயரை மாற்றாது.

## உரையாடல் சேவை

`.env.example`-ஐ அடிப்படையாகக் கொண்டு `EXPO_PUBLIC_WISDOM_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` அமைக்கவும். Provider ரகசியங்கள் செயலியில் சேர்க்கப்படாது. `supabase/functions/wisdom` சேவையைத் தனியாக deploy செய்ய வேண்டும்; APK உருவாக்குவது அதை deploy செய்யாது. சேவை இல்லாதபோது சாதனத்தில் உள்ள தமிழ் வழிகாட்டுதல் பயன்படுத்தப்படும்.

## உள்ளடக்க ஆதாரங்கள்

பண்டைய பாடல்களின் மூல இணைப்புகள் ஒவ்வொரு பதிவிலும் உள்ளன; தமிழ் பொருள்கள் செயலிக்கான எளிய விளக்கங்கள். ஆசிரியர் attribution மரபுவழியான இடங்களில் அவ்வாறே குறிப்பிடப்பட்டுள்ளது. பயனர் வழங்கிய நூல்களின் ஆசிரியர் மற்றும் பதிப்புரிமைகள் அந்தந்த உரிமையாளர்களுக்கே உரியவை; repository-ன் software license அவற்றுக்கு உரிமம் வழங்குவதில்லை. மருத்துவ அல்லது அதிசய பலன்கள் உறுதியாகக் கூறப்படுவதில்லை.
