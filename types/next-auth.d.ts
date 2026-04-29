import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    year?: number;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      year?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    year?: number;
  }
}
