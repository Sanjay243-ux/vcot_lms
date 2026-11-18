import React from 'react';
import { Text as RNText, View, type ViewProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const badgeVariants = tv({
  base: 'flex-row items-center gap-1 rounded-[4px] px-2 py-0.5 border self-start',
  variants: {
    variant: {
      brand: 'bg-[#EBF3FC] border-[#CFE4FA]',
      success: 'bg-[#DFF6DD] border-[#9FD89F]',
      warning: 'bg-[#FFF4CE] border-[#F2D272]',
      error: 'bg-[#FDE7E9] border-[#F1BBBC]',
      neutral: 'bg-[#F3F2F1] border-[#EDEBE9]',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

const badgeTextVariants = tv({
  base: 'text-[11px] font-semibold',
  variants: {
    variant: {
      brand: 'text-[#0067B8]',
      success: 'text-[#107C10]',
      warning: 'text-[#986F0B]',
      error: 'text-[#A4262C]',
      neutral: 'text-[#605E5C]',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

export interface BadgeProps extends ViewProps, VariantProps<typeof badgeVariants> {
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', label, icon, className, ...props }: BadgeProps) {
  return (
    <View className={badgeVariants({ variant, className })} {...props}>
      {icon}
      <RNText className={badgeTextVariants({ variant })} numberOfLines={1}>
        {label}
      </RNText>
    </View>
  );
}
