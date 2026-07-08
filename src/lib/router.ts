import { useCallback, useEffect, useState } from "react";

export const TAB_ROUTES = [
  "uebersicht",
  "gruppen",
  "spiele",
  "ko",
  "torschuetzen",
  "statistik",
  "tipps",
  "historie",
] as const;

export type TabRoute = (typeof TAB_ROUTES)[number];

export type Route =
  | { kind: "tab"; tab: TabRoute }
  | { kind: "team"; team: string };

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, "");
  const teamMatch = /^team\/(.+)$/.exec(raw);
  if (teamMatch) {
    return { kind: "team", team: decodeURIComponent(teamMatch[1]) };
  }
  if ((TAB_ROUTES as readonly string[]).includes(raw)) {
    return { kind: "tab", tab: raw as TabRoute };
  }
  return { kind: "tab", tab: "uebersicht" };
}

export function teamHash(team: string): string {
  return `#team/${encodeURIComponent(team)}`;
}

/** Mini-Hash-Router: Route aus location.hash, navigierbar über den Hash selbst. */
export function useRoute(): [Route, (hash: string) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((hash: string) => {
    location.hash = hash;
  }, []);

  return [route, navigate];
}
