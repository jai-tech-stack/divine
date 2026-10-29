const { withGradleProperties, withAppBuildGradle } = require('expo/config-plugins');

function applyAbiSplits(contents) {
  const block = `// divine-life-abi-splits:start
android {
    androidResources {
        localeFilters += ['ta', 'en']
    }
    defaultConfig {
        externalNativeBuild {
            cmake {
                // Keep generated object paths below Windows' legacy MAX_PATH limit.
                arguments "-DCMAKE_OBJECT_PATH_MAX=220"
            }
        }
    }
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk false
        }
    }
}
// Metro copies assets without removing files left by earlier bundles.
// Clear only generated JS assets; keep native compilation caches intact.
tasks.matching { it.name == 'createBundleReleaseJsAndAssets' }.configureEach {
    doFirst {
        delete layout.buildDirectory.dir('generated/res/react/release')
        delete layout.buildDirectory.dir('generated/assets/react/release')
    }
}
// divine-life-abi-splits:end`;
  const existing = /\/\/ divine-life-abi-splits:start[\s\S]*?\/\/ divine-life-abi-splits:end/;
  return existing.test(contents) ? contents.replace(existing, block) : contents + '\n' + block + '\n';
}

/** Compress the APK download; Android extracts native libraries at installation. */
module.exports = function withSmallAndroid(config) {
  config = withGradleProperties(config, config => {
    for (const [key, value] of Object.entries({
      'expo.useLegacyPackaging': 'true',
      'android.enableBundleCompression': 'true',
    })) {
      config.modResults = config.modResults.filter(item => item.type !== 'property' || item.key !== key);
      config.modResults.push({ type: 'property', key, value });
    }
    return config;
  });
  return withAppBuildGradle(config, config => {
    config.modResults.contents = applyAbiSplits(config.modResults.contents);
    return config;
  });
};
module.exports.applyAbiSplits = applyAbiSplits;
