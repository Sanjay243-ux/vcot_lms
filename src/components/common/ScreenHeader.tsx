import { ArrowLeft, Search, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text as RNText, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderIconButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

export function HeaderIconButton({ icon, label, onPress }: HeaderIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      className="h-9 w-9 items-center justify-center rounded-full active:bg-white/20">
      {icon}
    </Pressable>
  );
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  rightSlot?: React.ReactNode;
  isSearchOpen?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onCloseSearch?: () => void;
}

export function ScreenHeader({
  title,
  subtitle,
  leftIcon,
  onBack,
  backLabel,
  rightSlot,
  isSearchOpen = false,
  searchValue = '',
  searchPlaceholder = 'Search assignments...',
  onSearchChange,
  onCloseSearch,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 8) }}
      className="bg-[#0067B8]">
      <View className="mx-auto min-h-[54px] w-full max-w-2xl flex-row items-center justify-between px-4 py-2">
        {isSearchOpen ? (
          <View className="flex-1 flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close search"
              onPress={onCloseSearch}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-white/20">
              <ArrowLeft size={21} color="#FFFFFF" />
            </Pressable>

            <View className="h-9 flex-1 flex-row items-center rounded-[4px] bg-white/15 px-3">
              <Search size={16} color="rgba(255,255,255,0.85)" />
              <TextInput
                autoFocus
                value={searchValue}
                onChangeText={onSearchChange}
                placeholder={searchPlaceholder}
                placeholderTextColor="rgba(255,255,255,0.75)"
                className="ml-2 flex-1 py-1 font-sans text-[15px] text-white"
                style={{ outlineStyle: 'none' } as never}
              />
              {searchValue.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search text"
                  onPress={() => onSearchChange?.('')}
                  hitSlop={8}>
                  <X size={16} color="#FFFFFF" />
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : (
          <>
            <View className="flex-1 flex-row items-center gap-3 pr-2">
              {onBack ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={backLabel ?? 'Go back'}
                  onPress={onBack}
                  hitSlop={8}
                  className="-ml-1.5 flex-row items-center gap-1.5 rounded-full p-1.5 active:bg-white/20">
                  <ArrowLeft size={21} color="#FFFFFF" />
                  {backLabel ? (
                    <RNText className="font-medium text-[15px] text-white">
                      {backLabel}
                    </RNText>
                  ) : null}
                </Pressable>
              ) : leftIcon ? (
                <View className="items-center justify-center">{leftIcon}</View>
              ) : null}

              {!backLabel ? (
                <View className="flex-1">
                  <RNText
                    numberOfLines={1}
                    className="font-semibold text-[19px] tracking-tight text-white">
                    {title}
                  </RNText>
                  {subtitle ? (
                    <RNText
                      numberOfLines={1}
                      className="text-[12px] text-white/80">
                      {subtitle}
                    </RNText>
                  ) : null}
                </View>
              ) : null}
            </View>

            {rightSlot ? (
              <View className="flex-row items-center gap-1">{rightSlot}</View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}
