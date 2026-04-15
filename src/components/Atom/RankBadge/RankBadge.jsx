import React from 'react';
import { Badge } from '@/nexus/atoms';

export default function RankBadge({ rank }) {
  return (
    <Badge variant="default" size="lg">
      #{rank}
    </Badge>
  );
}
