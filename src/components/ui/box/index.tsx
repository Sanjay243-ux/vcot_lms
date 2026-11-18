import React from 'react';
import { View, type ViewProps } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const stackVariants = tv({
  base: 'flex',
  variants: {
    direction: {
      column: 'flex-col',
      row: 'flex-row',
    },
    space: {
      none: 'gap-0',
      xs: 'gap-1.5',
      sm: 'gap-2.5',
      md: 'gap-3.5',
      lg: 'gap-5',
      xl: 'gap-6',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
  },
  defaultVariants: {
    direction: 'column',
    space: 'none',
  },
});

export function Box({ className = '', ...props }: ViewProps & { className?: string }) {
  return <View className={className} {...props} />;
}

export interface StackProps
  extends ViewProps,
    Omit<VariantProps<typeof stackVariants>, 'direction'> {
  className?: string;
}

export function VStack({ space = 'md', align, justify, className, ...props }: StackProps) {
  return (
    <View
      className={stackVariants({ direction: 'column', space, align, justify, className })}
      {...props}
    />
  );
}

export function HStack({ space = 'sm', align = 'center', justify, className, ...props }: StackProps) {
  return (
    <View
      className={stackVariants({ direction: 'row', space, align, justify, className })}
      {...props}
    />
  );
}

export function Divider({
  inset = false,
  className = '',
}: {
  inset?: boolean;
  className?: string;
}) {
  return (
    <View className={`${inset ? 'pl-[68px]' : ''} bg-white ${className}`}>
      <View className="h-[1px] w-full bg-[#EDEBE9]" />
    </View>
  );
}
