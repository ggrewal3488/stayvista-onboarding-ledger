export const metadata = {
  title: "Privacy Policy — Onboarding Tracker — StayVista",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="wrap legal">
      <p className="eyebrow">StayVista Operations</p>
      <h1 className="title">Privacy Policy</h1>
      <p className="sub">Onboarding Tracker — internal property onboarding tool</p>
      <p className="legal-updated">Last updated: 17 September 2026</p>

      <div className="legal-body">
        <p>
          This Privacy Policy explains what information the Onboarding Tracker (&ldquo;the
          Tool&rdquo;) collects and how it is used. The Tool is an internal application built for
          StayVista employees to track properties from acquisition through onboarding and launch.
          It is not available to the public and is not used by StayVista&apos;s guests or property
          owners.
        </p>

        <h2>Who can use this Tool</h2>
        <p>
          Access is restricted to StayVista employees signing in with a Google account on the
          <code> @stayvista.com</code> or <code> @stayvista.co.in</code> domain. Anyone outside
          those two domains is denied sign-in.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>From Google Sign-In:</strong> your name, email address, and profile picture, as
            provided by Google when you sign in. We do not receive your Google password, and we do
            not access your Gmail, Drive, or any other Google data beyond basic sign-in profile
            information.
          </li>
          <li>
            <strong>Property data you enter:</strong> the onboarding details you or your colleagues
            record for each property (acquisition details, staffing and inventory audit statuses,
            account manager assignments, launch dates, AGM notes, and similar operational fields).
          </li>
          <li>
            <strong>Activity/audit records:</strong> for accountability, every time a property
            record is created, edited, or deleted, we store who did it (your name and email), what
            changed, and when.
          </li>
        </ul>

        <h2>How this information is used</h2>
        <ul>
          <li>To let you sign in and identify whether you have Admin or Editor access.</li>
          <li>To display and let you edit property onboarding records within the Tool.</li>
          <li>To enforce edit permissions, including the 24-hour edit lock on each onboarding section.</li>
          <li>To maintain an audit trail of who made which changes, for internal accountability.</li>
          <li>
            To automatically keep a StayVista-internal Google Sheet in sync with the property
            records in this Tool, so the same data is available in spreadsheet form for reporting.
          </li>
        </ul>

        <h2>Where this information is stored</h2>
        <p>
          Property records and the audit trail are stored in a Postgres database operated for
          StayVista on Vercel&apos;s infrastructure. The synced Google Sheet is stored in Google
          Sheets under StayVista&apos;s own Google account. We do not sell, rent, or share this
          information with any third party outside StayVista.
        </p>

        <h2>Data retention and deletion</h2>
        <p>
          Records are retained for as long as they are operationally useful to StayVista. If you
          have a question about a specific record or would like something reviewed or removed,
          contact the Tool administrator (see below).
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy or your data in the Tool can be directed to Gursimran Grewal
          (<a href="mailto:gursimran.grewal@stayvista.com">gursimran.grewal@stayvista.com</a>).
        </p>
      </div>
    </div>
  );
}
