import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router/AppRouter';

/**
 * App — Root component
 *
 * Composes all providers and renders the router.
 */
export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
