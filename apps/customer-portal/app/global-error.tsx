'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
          <h1>Something went wrong</h1>
          <p>The application failed to render. Please try again.</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
