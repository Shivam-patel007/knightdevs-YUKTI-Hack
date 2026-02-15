/** Client-side API helpers for Job Portal (include token in requests) */

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("job_portal_token") : null;

export async function jobsFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(path, { ...options, headers });
}

export function setJobPortalToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem("job_portal_token", token);
}

export function clearJobPortalToken() {
  if (typeof window !== "undefined") localStorage.removeItem("job_portal_token");
}

export function getJobPortalToken() {
  return getToken();
}
