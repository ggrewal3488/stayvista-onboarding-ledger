import { withAuth } from "next-auth/middleware";

// Requires a signed-in session to load the app at all. API routes are
// checked independently (see each route handler) so a stray fetch without
// a session gets a clean 401 instead of a redirect.
export default withAuth({
  pages: {
    signIn: "/signin",
  },
});

export const config = {
  matcher: ["/"],
};
