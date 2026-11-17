export const metadata = { title: { absolute: "Page not found | LeanLight Solar" }, robots: { index: false } };

export default function NotFound() {
  return (
    <main className="page" data-route="not-found" data-tone="night">
      <section className="hero">
        <div className="wrap" style={{ paddingBottom: "120px" }}>
          <h1>This page has moved or never existed.</h1>
          <p className="lede" style={{ marginTop: 20 }}>Try the homepage, or go straight to the savings calculator.</p>
          <div className="cta-row">
            <a className="btn" href="/">Go to the homepage</a>
            <a className="btn line" href="/solar-savings-calculator/">Open the calculator</a>
          </div>
        </div>
      </section>
    </main>
  );
}
