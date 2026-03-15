import type { NextAuthConfig } from "next-auth";

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

      if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
};
