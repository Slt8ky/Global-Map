"use client";

import { supabase } from '@/util/supabase';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';

export default function AppUrlListener() {
    useEffect(() => {
        async function handleLogin(code: string) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) return;
        }

        async function processUrl(urlString: string) {
            try {
                const url = new URL(urlString);
                const code = url.searchParams.get('code');

                if (code) {
                    await handleLogin(code);
                    
                    if (Capacitor.getPlatform() === 'web') {
                        window.location.href = '/';
                    } else {
                        window.location.href = 'https://localhost/';
                    }
                }
            } catch {
                // Silently handle parse errors
            }
        }

        if (Capacitor.getPlatform() === 'web') {
            processUrl(window.location.href);
            return;
        }

        App.getLaunchUrl().then((launchUrl) => {
            if (launchUrl?.url) {
                processUrl(launchUrl.url);
            }
        });

        const listener = App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
            processUrl(event.url);
        });

        return () => {
            listener.then(l => l.remove());
        };
    }, []);

    return null;
}