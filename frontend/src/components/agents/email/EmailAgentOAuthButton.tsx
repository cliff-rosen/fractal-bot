import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function EmailAgentOAuthButton() {
    const { isAuthenticated } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGmailConnected, setIsGmailConnected] = useState(false);

    useEffect(() => {
        const checkGmailConnection = async () => {
            if (!isAuthenticated) return;

            try {
                const response = await api.get('/api/email/labels');
                setIsGmailConnected(response.data.success);
            } catch (error) {
                setIsGmailConnected(false);
            }
        };

        checkGmailConnection();
    }, [isAuthenticated]);

    const handleGoogleAuth = async () => {
        try {
            setIsConnecting(true);
            setError(null);

            const response = await api.get('/api/email/auth/init');

            if (!response.data.url) {
                throw new Error('No authorization URL received from server');
            }

            const popup = window.open(
                response.data.url,
                'Google OAuth',
                'width=600,height=700,menubar=no,toolbar=no,location=no,status=no'
            );

            const checkPopup = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkPopup);
                    window.location.reload();
                }
            }, 1000);

        } catch (error: any) {
            console.error('Error initiating Google OAuth:', error);
            setError(error.response?.data?.detail || error.message || 'Failed to connect to Google');
            setIsConnecting(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    if (isGmailConnected) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Connected</span>
            </div>
        );
    }

    return (
        <Button
            onClick={handleGoogleAuth}
            disabled={isConnecting}
            variant="secondary"
            size="sm"
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
            </svg>
            <span className="text-sm">
                {isConnecting ? 'Connecting...' : 'Connect Gmail'}
            </span>
        </Button>
    );
} 