import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import stylesheet from '../../app/globals.css?url';
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content',
      },
      { title: 'KYBER — Your saber. Your story.' },
      {
        name: 'description',
        content:
          'An elegant weapon. An entirely personal one. Design, ignite, and share your own lightsaber in the KYBER atelier.',
      },
      { name: 'theme-color', content: '#090b10' },
    ],
    links: [
      { rel: 'stylesheet', href: stylesheet },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  component: () => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
  notFoundComponent: () => (
    <main className="not-found">
      <h1>A little off course.</h1>
      <a href="/">Return to the atelier →</a>
    </main>
  ),
});
