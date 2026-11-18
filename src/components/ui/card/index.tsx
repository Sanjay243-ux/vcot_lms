import React from 'react';
import { View, type ViewProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const cardVariants = tv({
  base: 'bg-white border border-[#EDEBE9] rounded-[6px]',
  variants: {
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

export interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {
  className?: string;
}

export function Card({ padding, className, ...props }: CardProps) {
  return <View className={cardVariants({ padding, className })} {...props} />;
}
