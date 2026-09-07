import { createFileRoute } from '@tanstack/react-router';
import { parseConfig } from '../lib/config';
import { Atelier } from '../components/atelier';
export const Route = createFileRoute('/build')({
  validateSearch: (search: Record<string, unknown>) =>
    parseConfig(
      new URLSearchParams(
        Object.entries(search)
          .filter(([, v]) => typeof v === 'string')
          .map(([k, v]) => [k, String(v)]),
      ).toString(),
    ),
  head: () => ({ meta: [{ title: 'The Atelier — KYBER' }] }),
  component: Atelier,
});
