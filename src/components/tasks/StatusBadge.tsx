import { CheckCircle2, Clock } from 'lucide-react-native';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { AppColors } from '@/constants/colors';
import type { TaskStatus } from '@/types/database';

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'completed') {
    return (
      <Badge
        variant="success"
        label="Verified · Done"
        icon={<CheckCircle2 size={12} color={AppColors.success} />}
      />
    );
  }

  return (
    <Badge
      variant="warning"
      label="Pending"
      icon={<Clock size={12} color={AppColors.warning} />}
    />
  );
}
