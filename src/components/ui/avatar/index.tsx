import { Image } from 'expo-image';
import React from 'react';
import { Text as RNText, View } from 'react-native';

import { getInitials } from '@/utils/date';

interface StudentAvatarProps {
  fullName: string;
  imageUrl?: string | null;
  size?: number;
  inverted?: boolean;
}

export function StudentAvatar({
  fullName,
  imageUrl,
  size = 44,
  inverted = false,
}: StudentAvatarProps) {
  const fontSize = Math.max(13, Math.round(size * 0.36));

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: inverted ? 'rgba(255,255,255,0.65)' : '#CFE4FA',
          backgroundColor: '#EBF3FC',
        }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      className={
        inverted
          ? 'items-center justify-center border border-white/40 bg-white/20'
          : 'items-center justify-center border border-[#CFE4FA] bg-[#EBF3FC]'
      }>
      <RNText
        style={{ fontSize }}
        className={
          inverted ? 'font-semibold text-white' : 'font-semibold text-[#0067B8]'
        }>
        {getInitials(fullName)}
      </RNText>
    </View>
  );
}
