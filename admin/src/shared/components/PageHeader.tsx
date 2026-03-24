import type { ReactNode } from 'react';
import { Typography } from 'antd';
import styled from 'styled-components';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

const HeaderWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeaderExtra = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  return (
    <HeaderWrapper>
      <HeaderInfo>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle && (
          <Text type="secondary">{subtitle}</Text>
        )}
      </HeaderInfo>
      {extra && <HeaderExtra>{extra}</HeaderExtra>}
    </HeaderWrapper>
  );
}
