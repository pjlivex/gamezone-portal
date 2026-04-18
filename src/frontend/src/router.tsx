import { Skeleton } from "@/components/ui/skeleton";
import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const HomePage = lazy(() => import("./pages/HomePage"));
const GamesPage = lazy(() => import("./pages/GamesPage"));
const PlayPage = lazy(() => import("./pages/PlayPage"));

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((k) => (
          <Skeleton key={k} className="h-52 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

const rootRoute = createRootRoute();

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageSkeleton />}>
      <HomePage />
    </Suspense>
  ),
});

const gamesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games",
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: () => (
    <Suspense fallback={<PageSkeleton />}>
      <GamesPage />
    </Suspense>
  ),
});

const playRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/play/$gameId",
  component: () => (
    <Suspense fallback={<PageSkeleton />}>
      <PlayPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([homeRoute, gamesRoute, playRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
