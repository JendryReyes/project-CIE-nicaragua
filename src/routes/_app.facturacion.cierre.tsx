import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/facturacion/cierre")({
  loader: () => {
    throw redirect({ to: "/facturacion" });
  },
});
