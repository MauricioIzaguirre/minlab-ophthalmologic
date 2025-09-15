/// <reference path="../.astro/types.d.ts" />

import type { SessionUser } from './types/auth';

declare namespace App {
  interface Locals {
    user?: SessionUser;
    isAuthenticated: boolean;
  }
  
  interface SessionData {
    user?: SessionUser;
  }
}