import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/tasks") ||
        nextUrl.pathname.startsWith("/monthly") ||
        nextUrl.pathname.startsWith("/settings");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      // Don't redirect to dashboard if there's an error param (e.g. deleted account)
      const hasError = nextUrl.searchParams.has("error");
      if (isLoggedIn && !hasError && (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
};
