import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text as RNText,
  type PressableProps,
  View,
} from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import { AppColors } from '@/constants/colors';

const buttonVariants = tv({
  base: 'flex-row items-center justify-center rounded-[4px] px-4',
  variants: {
    action: {
      primary: 'bg-[#0067B8] active:bg-[#005A9E]',
      secondary: 'bg-[#F3F2F1] border border-[#D2D0CE] active:bg-[#EDEBE9]',
      outline: 'bg-white border border-[#8A8886] active:bg-[#F3F2F1]',
      success: 'bg-[#0067B8] active:bg-[#005A9E]',
      danger: 'bg-[#A4262C] active:bg-[#8E1F24]',
      dangerOutline: 'bg-white border border-[#D13438] active:bg-[#FDE7E9]',
      ghost: 'bg-transparent active:bg-[#F3F2F1]',
    },
    size: {
      sm: 'min-h-[34px] px-3 py-1.5',
      md: 'min-h-[42px] px-4 py-2.5',
      lg: 'min-h-[44px] px-5 py-2.5',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
    disabled: {
      true: 'opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    action: 'primary',
    size: 'md',
    fullWidth: false,
    disabled: false,
  },
});

const buttonTextVariants = tv({
  base: 'font-semibold text-center',
  variants: {
    action: {
      primary: 'text-white',
      secondary: 'text-[#1B1A19]',
      outline: 'text-[#1B1A19]',
      success: 'text-white',
      danger: 'text-white',
      dangerOutline: 'text-[#A4262C]',
      ghost: 'text-[#0067B8]',
    },
    size: {
      sm: 'text-xs',
      md: 'text-[14px]',
      lg: 'text-[15px]',
    },
  },
  defaultVariants: {
    action: 'primary',
    size: 'md',
  },
});

export interface ButtonProps
  extends Omit<PressableProps, 'disabled'>,
    VariantProps<typeof buttonVariants> {
  label?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function Button({
  action = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  label,
  leftIcon,
  rightIcon,
  className,
  textClassName,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || isLoading);
  const spinnerColor =
    action === 'primary' || action === 'success' || action === 'danger'
      ? '#FFFFFF'
      : action === 'dangerOutline'
        ? AppColors.error
        : AppColors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={buttonVariants({
        action,
        size,
        fullWidth,
        disabled: isDisabled,
        className,
      })}
      {...props}>
      {isLoading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {leftIcon}
          {label ? (
            <RNText
              className={buttonTextVariants({
                action,
                size,
                className: textClassName,
              })}>
              {label}
            </RNText>
          ) : (
            children
          )}
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}
