import React from 'react';
import styled from 'styled-components';
import { EmailContent } from './EmailContent';
import { EmailListAsset } from '@/types/email';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const EmailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface EmailListViewProps {
    asset: EmailListAsset;
}

export const EmailListView: React.FC<EmailListViewProps> = ({ asset }) => {
    return (
        <Container>
            <Header>
                <Title>{asset.name}</Title>
                <Description>{asset.description}</Description>
            </Header>
            <EmailList>
                {asset.content.map((email) => (
                    <EmailContent key={email.id} email={email} />
                ))}
            </EmailList>
        </Container>
    );
}; 