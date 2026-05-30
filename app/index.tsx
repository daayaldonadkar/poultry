import { Redirect } from 'expo-router';

/**
 * Root index route.
 * Redirects immediately to the Create Bill tab.
 */
export default function Index() {
  return <Redirect href="/create-bill" />;
}
