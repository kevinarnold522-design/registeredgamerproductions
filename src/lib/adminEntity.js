import { invokeAdminFn } from "@/lib/invokeAdminFn";

/**
 * Admin entity writes via the backend admin function so the current Supabase
 * access token is always forwarded for authorization.
 */
export function adminUpdateEntity(entity, id, data) {
  return invokeAdminFn("adminUpdateEntity", { entity, action: "update", id, data });
}

export function adminCreateEntity(entity, data) {
  return invokeAdminFn("adminUpdateEntity", { entity, action: "create", data });
}