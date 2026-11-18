import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const textVariants = tv({
  base: 'font-sans text-[#1B1A19]',
  variants: {
    size: {
      xs: 'text-xs leading-4',
      sm: 'text-[13px] leading-[18px]',
      md: 'text-[15px] leading-[21px]',
      lg: 'text-base leading-[22px]',
      xl: 'text-lg leading-6',
    },
    tone: {
      primary: 'text-[#1B1A19]',
      secondary: 'text-[#605E5C]',
      muted: 'text-[#8A8886]',
      brand: 'text-[#0067B8]',
      success: 'text-[#107C10]',
      warning: 'text-[#986F0B]',
      error: 'text-[#A4262C]',
      inverse: 'text-white',
    },
    weight: {
      regular: 'font-sans',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'primary',
    weight: 'regular',
  },
});

const headingVariants = tv({
  base: 'font-semibold text-[#1B1A19] tracking-tight',
  variants: {
    size: {
      sm: 'text-[15px] leading-5',
      md: 'text-[17px] leading-6',
      lg: 'text-[19px] leading-6',
      xl: 'text-[22px] leading-7',
      '2xl': 'text-[24px] leading-8',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

export interface AppTextProps extends RNTextProps, VariantProps<typeof textVariants> {
  className?: string;
}

export function Text({ size, tone, weight, className, ...props }: AppTextProps) {
  return (
    <RNText className={textVariants({ size, tone, weight, className })} {...props} />
  );
}

export interface HeadingProps extends RNTextProps, VariantProps<typeof headingVariants> {
  className?: string;
}

export function Heading({ size, className, ...props }: HeadingProps) {
  return <RNText className={headingVariants({ size, className })} {...props} />;
}

export function SectionTitle({
  title,
  rightAction,
  className = '',
}: {
  title: string;
  rightAction?: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 pb-2 pt-5 ${className}`}>
      <RNText className="font-semibold text-[13px] text-[#0067B8]">{title}</RNText>
      {rightAction}
    </View>
  );
}
