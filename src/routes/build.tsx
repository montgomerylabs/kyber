import { createFileRoute } from '@tanstack/react-router';
import { Atelier } from '../components/atelier';
export const Route = createFileRoute('/build')({
  head: () => ({ meta: [{ title: 'The Atelier — KYBER' }] }),
  component: Atelier,
});
