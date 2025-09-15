/// <reference types="astro/client" />

import type { SessionUser } from './types/auth';

declare global {
  namespace App {
    interface Locals {
      user?: SessionUser;
      isAuthenticated: boolean;
    }
    
    interface SessionData {
      user?: SessionUser;
    }
  }
}