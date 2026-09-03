import { headers } from "next/headers";

export async function authenticatedUserId() {
  const value = (await headers()).get("oai-authenticated-user-id");
  // Sites injects this header. The stable local identity keeps local preview usable.
  return value?.trim() || "local-demo-user";
}
