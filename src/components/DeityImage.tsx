import React, { useState } from 'react';
import { Image, type ImageProps, View } from 'react-native';

/** Keep the face near the upper part of a portrait visible in short cards. */
export function DeityImage({ style, source, resizeMode: _resizeMode, ...props }: ImageProps) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const asset = source ? Image.resolveAssetSource(source) : undefined;
  const sourceWidth = asset?.width || 2;
  const sourceHeight = asset?.height || 3;
  const scale = box.width && box.height
    ? Math.max(box.width / sourceWidth, box.height / sourceHeight) : 0;
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return (
    <View style={[style, { overflow: 'hidden' }]} onLayout={({ nativeEvent: { layout } }) => {
      setBox(previous => previous.width === layout.width && previous.height === layout.height
        ? previous : { width: layout.width, height: layout.height });
    }}>
      {scale > 0 && <Image {...props} source={source} resizeMode="stretch" style={{
        position: 'absolute', width, height, left: (box.width - width) / 2,
        top: Math.min(0, Math.max(box.height - height, box.height * 0.3 - height * 0.2)),
      }} />}
    </View>
  );
}
