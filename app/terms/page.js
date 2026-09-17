export const metadata = {
  title: "Terms of Service — Onboarding Tracker — StayVista",
};

export default function TermsPage() {
  return (
    <div className="wrap legal">
      <p className="eyebrow">StayVista Operations</p>
      <h1 className="title">Terms of Service</h1>
      <p className="sub">Onboarding Tracker — internal property onboarding tool</p>
      <p className="legal-updated">Last updated: 17 September 2026</p>

      <div className="legal-body">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern use of the Onboarding Tracker
          (&ldquo;the Tool&rdquo;), an internal application built for StayVista to track
          properties from acquisition through onboarding and launch. The Tool is provided solely
          for StayVista&apos;s internal business operations. It is not offered to the public, and
          use by anyone other than authorized StayVista personnel is not permitted.
        </p>

        <h2>Who may use the Tool</h2>
        <p>
          Access is restricted to individuals signing in with a Google account on the
          <code> @stayvista.com</code> or <code> @stayvista.co.in</code> domain, and is intended
          only for StayVista employees and contractors acting within the scope of their work.
          StayVista may add, remove, or change who has Admin access at any time.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Use the Tool only to record and manage genuine StayVista property onboarding data.</li>
          <li>Do not enter data you know to be false, or use the Tool to store information unrelated to property onboarding.</li>
          <li>Do not attempt to bypass sign-in, access controls, or the edit-lock restrictions described below.</li>
          <li>Do not share your Google sign-in credentials or session with anyone else.</li>
        </ul>

        <h2>Roles and edit locks</h2>
        <p>
          The Tool assigns each signed-in user a role — Admin or Editor — and enforces
          section-level edit locks: once a section of a property record has been saved, Editors
          (but not Admins) lose the ability to change that section after 24 hours. AGM notes can
          always be added by any signed-in user. These rules are enforced by the Tool itself and
          are part of how StayVista expects the Tool to be used; they are not a guarantee against
          misuse and do not substitute for StayVista&apos;s own internal policies or judgment.
        </p>

        <h2>Audit trail</h2>
        <p>
          Every create, edit, note, and delete action is logged with the acting user&apos;s name,
          email, role, and timestamp, as described in the Privacy Policy. By using the Tool, you
          acknowledge that your actions within it are recorded for accountability purposes.
        </p>

        <h2>No warranty</h2>
        <p>
          The Tool is provided &ldquo;as is,&rdquo; for internal operational convenience, without
          warranty of any kind, express or implied, including as to availability, accuracy, or
          fitness for a particular purpose. StayVista does not guarantee the Tool will be
          available at all times or free of errors.
        </p>

        <h2>Changes</h2>
        <p>
          StayVista may modify these Terms, the Tool&apos;s features, or access rules at any time.
          Continued use of the Tool after a change constitutes acceptance of the updated Terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these Terms can be directed to Gursimran Grewal
          (<a href="mailto:gursimran.grewal@stayvista.com">gursimran.grewal@stayvista.com</a>).
        </p>
      </div>
    </div>
  );
}
