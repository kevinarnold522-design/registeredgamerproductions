import { base44 } from "@/api/base44Client";

/**
 * Admin entity writes via the Cloudflare Worker.
 * The worker authenticates from the session cookie, so writes go directly
 * through the entity REST layer.
 */
export function adminUpdateEntity(entity, id, data) {
  return base44.entities[entity].update(id, data);
}

export function adminCreateEntity(entity, data) {
  return base44.entities[entity].create(data);
}