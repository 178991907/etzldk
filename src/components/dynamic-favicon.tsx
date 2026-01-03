'use client';

import { useEffect, useState } from 'react';
import { getClientUser } from '@/lib/client-data';
import { User } from '@/lib/data-types';

export default function DynamicFavicon() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const updateFavicon = (logoUrl: string) => {
            const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
                const newLink = document.createElement('link');
                newLink.rel = 'icon';
                newLink.href = logoUrl;
                document.head.appendChild(newLink);
            } else {
                link.href = logoUrl;
            }
        };

        const handleUserUpdate = async () => {
            const userData = await getClientUser();
            setUser(userData);
            if (userData && userData.appLogo) {
                updateFavicon(userData.appLogo);
            }
        };

        // Listen for updates
        window.addEventListener('userProfileUpdated', handleUserUpdate);

        // Initial load
        handleUserUpdate();

        return () => {
            window.removeEventListener('userProfileUpdated', handleUserUpdate);
        };
    }, []);

    return null;
}
