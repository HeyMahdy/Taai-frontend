import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/assignments")({
  component: AssignmentsLayout,
});

function AssignmentsLayout() {
  return <Outlet />;
}
