import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (!token) return false;
      if (path.startsWith("/dashboard/settings")) return true;
      // Allow teachers/admins to land on /dashboard so client can redirect them to their area
      if (path === "/dashboard" || path === "/dashboard/") return true;
      if (path.startsWith("/dashboard/admin")) return token.role === "admin";
      if (path.startsWith("/dashboard/teacher")) return token.role === "teacher";
      return token.role === "student";
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
