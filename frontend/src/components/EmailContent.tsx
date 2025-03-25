import React from 'react';
import DOMPurify from 'dompurify';
import styled from 'styled-components';

const EmailContainer = styled.div`
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const EmailHeader = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const Subject = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const MetaInfo = styled.div`
  font-size: 0.875rem;
  color: #666;
  display: grid;
  gap: 0.25rem;
`;

const EmailBody = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  a {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

interface EmailContentProps {
    email: {
        subject: string;
        from: string;
        to: string;
        date: string;
        body: {
            html?: string;
            plain?: string;
        };
    };
}

export const EmailContent: React.FC<EmailContentProps> = ({ email }) => {
    const formatDate = (timestamp: string) => {
        return new Date(parseInt(timestamp)).toLocaleString();
    };

    const renderBody = () => {
        if (email.body.html) {
            // Sanitize HTML content before rendering
            const sanitizedHtml = DOMPurify.sanitize(email.body.html);
            return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
        }

        // Fallback to plain text with preserved newlines
        return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{email.body.plain}</pre>;
    };

    return (
        <EmailContainer>
            <EmailHeader>
                <Subject>{email.subject}</Subject>
                <MetaInfo>
                    <div>From: {email.from}</div>
                    <div>To: {email.to}</div>
                    <div>Date: {formatDate(email.date)}</div>
                </MetaInfo>
            </EmailHeader>
            <EmailBody>
                {renderBody()}
            </EmailBody>
        </EmailContainer>
    );
}; 