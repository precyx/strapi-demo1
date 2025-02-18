import { Context } from "@strapi/types";

declare module "@strapi/types" {
  interface StrapiContext extends Context {
    params: { id?: string };
    query: Record<string, string | string[]>;
    state: { user?: { id: number; email: string } };
  }
}
