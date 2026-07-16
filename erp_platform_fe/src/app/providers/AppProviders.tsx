import { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';

/**
 * AppProviders — Composes all providers in correct order
 *
 * Order matters:
 * 1. BrowserRouter (routing context)
 * 2. QueryProvider (server state)
 * 3. ThemeProvider (UI theming)
 * 4. AuthProvider (auth session)
 */
interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
