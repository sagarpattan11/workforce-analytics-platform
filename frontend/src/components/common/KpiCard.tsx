import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { LucideIcon } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = '#1D4ED8',
  trend,
  loading = false,
}) => {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          {Icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} color={iconColor} />
            </Box>
          )}
        </Box>

        {loading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography variant="h4" component="div" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
            {value ?? '--'}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {trend && !loading && (
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{
                color: trend.isPositive ? 'success.main' : 'error.main',
              }}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
