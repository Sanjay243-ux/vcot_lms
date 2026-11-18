import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  Text as RNText,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { AppColors } from '@/constants/colors';

export interface FormInputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  containerClassName?: string;
}

export function FormInput({
  label,
  helperText,
  error,
  leftIcon,
  isPassword = false,
  containerClassName = '',
  editable = true,
  ...props
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderClass = error
    ? 'border-[#A4262C] border-b-2'
    : isFocused
      ? 'border-[#0067B8] border-b-2'
      : 'border-[#8A8886]';

  const bgClass = editable ? 'bg-white' : 'bg-[#F3F2F1]';

  return (
    <View className={`w-full ${containerClassName}`}>
      {label ? (
        <RNText className="mb-1.5 text-[13px] font-medium text-[#1B1A19]">
          {label}
        </RNText>
      ) : null}

      <View
        className={`min-h-[42px] flex-row items-center rounded-[4px] border px-3 ${bgClass} ${borderClass}`}>
        {leftIcon ? <View className="mr-2.5">{leftIcon}</View> : null}

        <TextInput
          editable={editable}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={AppColors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className="flex-1 py-2.5 font-sans text-[15px] text-[#1B1A19]"
          style={{ outlineStyle: 'none' } as never}
          {...props}
        />

        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={10}
            className="ml-2 p-1">
            {showPassword ? (
              <EyeOff size={18} color={AppColors.textSecondary} />
            ) : (
              <Eye size={18} color={AppColors.textSecondary} />
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <RNText className="mt-1 text-xs font-medium text-[#A4262C]">{error}</RNText>
      ) : helperText ? (
        <RNText className="mt-1 text-xs text-[#605E5C]">{helperText}</RNText>
      ) : null}
    </View>
  );
}
