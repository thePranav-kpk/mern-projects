import "express-session";

// Allows to add custom properties to req.session
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
