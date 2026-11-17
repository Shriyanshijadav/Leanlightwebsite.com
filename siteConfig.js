/**
 * ============================================================================
 *  siteConfig.js — SITE-WIDE SETTINGS FOR LEANLIGHT SOLAR
 * ============================================================================
 *  This is the one file for settings that apply to every page.
 *
 *  HOW TO EDIT SAFELY (in GitHub, click the pencil icon on this file):
 *   - Only change the text BETWEEN the quote marks "like this".
 *   - Keep every comma at the end of a line. A missing comma breaks the build.
 *   - true / false are written without quotes.
 *   - To leave something empty, use two quote marks: ""
 *   - After you click "Commit changes", Vercel rebuilds the site in 1-2 minutes.
 *     If the build fails, Vercel keeps the old version live, so nothing breaks
 *     for visitors. Undo your last edit and commit again.
 *
 *  Per-page titles and descriptions are NOT here. They live in content/pages/.
 *  Blog posts live in content/blogs/.
 * ============================================================================
 */

const siteConfig = {
  // ---- Basics ---------------------------------------------------------------
  siteName: "LeanLight Solar",
  // Your live domain, with https:// and WITHOUT a slash at the end.
  siteUrl: "https://www.leanlightsolar.com",
  language: "en-IN",
  locale: "en_IN",
  themeColor: "#090D20",

  // ---- Default SEO (used when a page does not set its own) ------------------
  defaultTitle: "LeanLight Solar | Rooftop Solar for Homes & Housing Societies in India",
  defaultDescription:
    "LeanLight Solar, a Xiom Energy brand, designs, installs and maintains rooftop solar for homes and housing societies across India.",
  // Image shown when a page is shared on WhatsApp, LinkedIn etc. 1200 x 630 px, in /public/images/
  defaultOgImage: "/images/og-default.jpg",

  // ---- Search engine verification -------------------------------------------
  // Paste ONLY the code from the content="..." part of the verification tag.
  verification: {
    google: "", // Google Search Console
    bing: "", // Bing Webmaster Tools
  },

  // ---- Analytics (leave empty to switch off) --------------------------------
  analytics: {
    ga4Id: "", // e.g. "G-XXXXXXXXXX"
    gtmId: "", // e.g. "GTM-XXXXXXX". Use GA4 OR GTM, not both.
  },

  // ---- Organization schema (homepage) ---------------------------------------
  // Every fact here must match the About page and your Google Business Profile.
  organization: {
    name: "LeanLight Solar",
    legalName: "", // registered company name
    description:
      "Rooftop solar EPC company and a brand of Xiom Energy, serving homes and housing societies across India.",
    logo: "/images/logo.png",
    foundingDate: "", // e.g. "2026"
    email: "",
    telephone: "", // with country code, e.g. "+91 98xxxxxxxx"
    address: {
      streetAddress: "",
      addressLocality: "", // city
      addressRegion: "", // state
      postalCode: "",
      addressCountry: "IN",
    },
    areaServed: "India",
    parentOrganization: { name: "Xiom Energy", url: "https://www.xiomenergy.com/" },
  },

  // ---- Social profiles (also used as "sameAs" in schema) --------------------
  social: {
    linkedin: "",
    instagram: "",
    facebook: "",
    youtube: "",
    x: "",
    twitterHandle: "", // e.g. "@leanlightsolar"
  },

  // ---- Blog -----------------------------------------------------------------
  blog: {
    title: "Solar, explained without the sales pitch",
    intro:
      "Guides on rooftop solar cost, subsidy, equipment and approvals in India, written by the people who design and install the systems.",
    defaultAuthor: "LeanLight Solar Team",
    relatedPosts: 3, // how many related posts to show under each post
  },

  // ---- robots.txt -----------------------------------------------------------
  robots: {
    // Paths search engines should not crawl, e.g. ["/thank-you/"]
    disallow: [],
    // AI search and answer engines allowed to read the site. Remove a line to block one.
    aiCrawlers: [
      "GPTBot",
      "OAI-SearchBot",
      "ChatGPT-User",
      "ClaudeBot",
      "Claude-SearchBot",
      "PerplexityBot",
      "Google-Extended",
      "Bingbot",
    ],
  },

  // ---- Redirects (301) ------------------------------------------------------
  // When you rename or delete a page, send its old address to the new one.
  // Write both addresses starting and ending with "/".
  redirects: [
    { from: "/solar-subsidy-in-india/", to: "/pm-surya-ghar-subsidy/" },
  ],

  // ---- Main menu ------------------------------------------------------------
  // "Home" is shown automatically on every page except the homepage.
  navigation: {
    solutions: [
      {
        label: "For homes",
        title: "Residential Rooftop Solar",
        href: "/residential-rooftop-solar/",
        description: "Sized to your bill, with subsidy and net metering handled.",
        children: [
          { title: "On-Grid Solar System", href: "/residential-rooftop-solar/on-grid-solar-system/" },
          { title: "Off-Grid Solar System", href: "/residential-rooftop-solar/off-grid-solar-system/" },
          { title: "Hybrid Solar System", href: "/residential-rooftop-solar/hybrid-solar-system/" },
          { title: "Solar with Battery Storage", href: "/residential-rooftop-solar/solar-battery-storage/" },
        ],
      },
      {
        label: "For apartment societies",
        title: "Housing Society Solar",
        href: "/housing-society-solar/",
        description: "Common-area solar, net metering options and the committee paperwork.",
        children: [
          { title: "Common Area Solar", href: "/housing-society-solar/common-area-solar/" },
          { title: "Group & Virtual Net Metering", href: "/housing-society-solar/group-virtual-net-metering/" },
        ],
      },
      {
        label: "Also",
        title: "Services and guides",
        href: "",
        description: "For systems already built, and projects still on paper.",
        children: [
          { title: "Solar O&M", href: "/solar-om/" },
          { title: "System Design & Consulting", href: "/solar-system-design-consulting/" },
          { title: "Solar System Sizes", href: "/solar-system-sizes/" },
        ],
      },
    ],
    resources: [
      { title: "Solar Savings Calculator", href: "/solar-savings-calculator/", description: "Size, saving and payback from your bill" },
      { title: "PM Surya Ghar Subsidy", href: "/pm-surya-ghar-subsidy/", description: "Amounts, eligibility and how to apply" },
      { title: "Blog", href: "/blog/", description: "Guides on cost, subsidy and approvals" },
    ],
    // Plain links, in order: [Solar Solutions menu] Projects, Subsidy, [Resources menu], About
    projects: { title: "Projects", href: "/projects/" },
    subsidy: { title: "Subsidy", href: "/pm-surya-ghar-subsidy/" },
    about: { title: "About", href: "/about/" },
    contact: { title: "Contact", href: "/contact/" },
    quoteButton: "Get a Quote",
  },

  // ---- Footer ---------------------------------------------------------------
  footer: {
    tagline: "Rooftop solar EPC for homes and housing societies across India. A Xiom Energy brand.",
    columns: [
      {
        heading: "Residential",
        links: [
          { title: "Residential Rooftop Solar", href: "/residential-rooftop-solar/" },
          { title: "On-Grid Solar System", href: "/residential-rooftop-solar/on-grid-solar-system/" },
          { title: "Off-Grid Solar System", href: "/residential-rooftop-solar/off-grid-solar-system/" },
          { title: "Hybrid Solar System", href: "/residential-rooftop-solar/hybrid-solar-system/" },
          { title: "Solar with Battery Storage", href: "/residential-rooftop-solar/solar-battery-storage/" },
        ],
      },
      {
        heading: "Housing societies",
        links: [
          { title: "Housing Society Solar", href: "/housing-society-solar/" },
          { title: "Common Area Solar", href: "/housing-society-solar/common-area-solar/" },
          { title: "Group & Virtual Net Metering", href: "/housing-society-solar/group-virtual-net-metering/" },
          { title: "Solar O&M", href: "/solar-om/" },
          { title: "System Design & Consulting", href: "/solar-system-design-consulting/" },
        ],
      },
      {
        heading: "Company and resources",
        links: [
          { title: "About", href: "/about/" },
          { title: "Projects", href: "/projects/" },
          { title: "Solar System Sizes", href: "/solar-system-sizes/" },
          { title: "Savings Calculator", href: "/solar-savings-calculator/" },
          { title: "PM Surya Ghar Subsidy", href: "/pm-surya-ghar-subsidy/" },
          { title: "Blog", href: "/blog/" },
          { title: "Contact", href: "/contact/" },
        ],
      },
    ],
    legalLine: "LeanLight Solar, a brand of Xiom Energy.",
    credit: "Website by Digifinity",
  },
};

export default siteConfig;
