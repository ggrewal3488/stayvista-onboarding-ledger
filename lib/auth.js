import GoogleProvider from "next-auth/providers/google";
import { isAdminEmail, isAllowedDomain } from "./access";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    // Reject anyone outside the two StayVista Google domains at sign-in time.
    async signIn({ profile }) {
      return isAllowedDomain(profile?.email);
    },
    async jwt({ token }) {
      if (token?.email) {
        token.role = isAdminEmail(token.email) ? "admin" : "editor";
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role || "editor";
      }
      return session;
    },
  },
};
