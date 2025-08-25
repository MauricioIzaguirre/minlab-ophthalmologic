declare namespace App {
  interface Locals {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: {
        id: string;
        name: string;
        permissions: string[];
      };
    };
    isAuthenticated: boolean;
  }

  interface SessionData {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    loginTime?: Date;
  }
}