import "./globals.css";
import Script from "next/script";
import siteConfig from "@/siteConfig";
import { headerHtml, footerHtml } from "@/lib/layoutHtml";

export const metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: siteConfig.defaultTitle, template: "%s" },
  description: siteConfig.defaultDescription,
  applicationName: siteConfig.siteName,
  formatDetection: { telephone: false },
  verification: {
    ...(siteConfig.verification.google ? { google: siteConfig.verification.google } : {}),
    ...(siteConfig.verification.bing ? { other: { "msvalidate.01": siteConfig.verification.bing } } : {}),
  },
};

export const viewport = { themeColor: siteConfig.themeColor, width: "device-width", initialScale: 1 };

const THREE = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

export default function RootLayout({ children }) {
  const { ga4Id, gtmId } = siteConfig.analytics;
  return (
    <html lang={siteConfig.language}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Instrument+Sans:wght@400;500;600&display=swap" />
        <link rel="alternate" type="application/rss+xml" title={`${siteConfig.siteName} blog`} href="/blog/rss.xml" />
      </head>
      <body>
        <canvas id="gl" aria-hidden="true" />
        <div dangerouslySetInnerHTML={{ __html: headerHtml() }} />
        {children}
        <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
        <script src={THREE} defer />
        <script src="/assets/engine.js" defer />
        <script src="/assets/site.js" defer />
        {ga4Id && !gtmId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`}</Script>
          </>
        ) : null}
        {gtmId ? (
          <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</Script>
        ) : null}
      </body>
    </html>
  );
}
