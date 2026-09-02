import type { AppProps } from 'next/app';
import Head from 'next/head';
import AppLayout from '@/components/layout/AppLayout';
import { useEffect } from 'react';
import { initErrorReporter } from '@/lib/errorReporter';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => { initErrorReporter(); }, []);

  return (
    <>
      <Head>
        <title>Orbitra CRM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </>
  );
}