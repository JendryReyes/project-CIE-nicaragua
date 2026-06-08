import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/facturacion/cartas")({
  beforeLoad: () => {
    throw redirect({ to: "/facturacion" });
  },
});
