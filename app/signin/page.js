"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function SignInInner() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="signin-wrap">
      <div className="signin-card">
        <p className="eyebrow">StayVista Operations</p>
        <h1 className="title" style={{ marginBottom: 4 }}>Onboarding Tracker</h1>
        <p className="sub" style={{ marginBottom: 24 }}>
          Sign in with your StayVista Google account to view or edit onboarding records.
        </p>

        {error === "AccessDenied" && (
          <div className="signin-error">
            That Google account isn&apos;t on an approved StayVista domain. Sign in with an
            @stayvista.com or @stayvista.co.in account.
          </div>
        )}

        <button
          className="primary"
          type="button"
          style={{ width: "100%" }}
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Sign in with Google
        </button>

        <p className="signin-note">Restricted to @stayvista.com and @stayvista.co.in accounts.</p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}
