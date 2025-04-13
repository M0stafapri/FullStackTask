import { Route } from "wouter";

// Temporary version of ProtectedRoute that doesn't use authentication while we debug
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // For now, just render the component without protection
  return <Route path={path} component={Component} />;
}
