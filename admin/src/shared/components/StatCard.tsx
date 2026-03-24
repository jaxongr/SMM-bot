import type { ReactNode } from 'react';
import { Card, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  change?: number;
  loading?: boolean;
}

const StyledCard = styled(Card)`
  border-radius: 12px;
  height: 100%;

  .ant-card-body {
    padding: 20px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => $color || '#f0f0ff'};
  font-size: 22px;
  color: ${({ $color }) => ($color ? '#fff' : '#722ED1')};
`;

const ChangeIndicator = styled.span<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $positive }) => ($positive ? '#16A34A' : '#EF4444')};
`;

const ValueText = styled.div`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: #1a1a2e;
  margin-bottom: 4px;
`;

export function StatCard({ icon, title, value, change, loading }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <StyledCard loading={loading}>
      <CardHeader>
        <IconWrapper>{icon}</IconWrapper>
        {change !== undefined && (
          <ChangeIndicator $positive={isPositive}>
            {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(change)}%
          </ChangeIndicator>
        )}
      </CardHeader>
      <ValueText>{value}</ValueText>
      <Text type="secondary">{title}</Text>
    </StyledCard>
  );
}
