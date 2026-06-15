import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/facturacion")({
  component: () => <Outlet />,
});
