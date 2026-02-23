/**
 * Sanity Studio Layout
 *
 * Minimal full-screen wrapper for the embedded Sanity Studio. Positions the
 * studio as a fixed overlay so it takes over the entire viewport, bypassing
 * the site's main Header and Footer.
 *
 * @module app/studio/layout
 */
export const metadata = {
  title: "AIC Content Studio",
  description: "Content management for Australian Islamic Centre",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );
}
