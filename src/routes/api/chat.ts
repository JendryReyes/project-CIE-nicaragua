import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from "@/lib/ai-gateway.server";
import { agentTools } from "@/lib/agent-tools";



function systemPrompt() {
  return `Eres un asistente especializado del CIE (Centro de Intervención Eduterapéutica). Responde en español, de forma clara, breve y profesional.

Puedes consultar datos del sistema usando las herramientas disponibles. Solo usa información de las herramientas; no inventes datos. Si no sabes algo, di que no tienes la información.

Herramientas disponibles:
- listarSedes: sedes del CIE.
- listarNinos: niños atendidos, filtrables por sede o pagador INSS.
- resumenFacturacion: resumen de facturación INSS por sede o niño.
- reportePuntualidad: puntualidad y asistencia del día por sede.
- resumenPlanificacion: planificación de horas y gaps.
- catalogoServicios: servicios clínicos con cupos INSS.

Cuando el usuario salude o pregunte de forma general, ofrécele ayuda con estas áreas: matrícula, planificación, clínico, ejecución/asistencia, facturación INSS y catálogo de servicios.`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(key, initialRunId);
        const model = gateway("google/gemini-3.7-flash");

        const result = streamText({
          model,
          system: systemPrompt(),
          messages: await convertToModelMessages(messages as UIMessage[]),
          stopWhen: stepCountIs(50),
          tools: {
            listarSedes: tool({
              description: agentTools.listarSedes.description,
              inputSchema: agentTools.listarSedes.parameters,
              execute: agentTools.listarSedes.execute,
            }),
            listarNinos: tool({
              description: agentTools.listarNinos.description,
              inputSchema: agentTools.listarNinos.parameters,
              execute: agentTools.listarNinos.execute,
            }),
            resumenFacturacion: tool({
              description: agentTools.resumenFacturacion.description,
              inputSchema: agentTools.resumenFacturacion.parameters,
              execute: agentTools.resumenFacturacion.execute,
            }),
            reportePuntualidad: tool({
              description: agentTools.reportePuntualidad.description,
              inputSchema: agentTools.reportePuntualidad.parameters,
              execute: agentTools.reportePuntualidad.execute,
            }),
            resumenPlanificacion: tool({
              description: agentTools.resumenPlanificacion.description,
              inputSchema: agentTools.resumenPlanificacion.parameters,
              execute: agentTools.resumenPlanificacion.execute,
            }),
            catalogoServicios: tool({
              description: agentTools.catalogoServicios.description,
              inputSchema: agentTools.catalogoServicios.parameters,
              execute: agentTools.catalogoServicios.execute,
            }),
          },
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          headers: {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          },
        });

        return withLovableAiGatewayRunIdHeader(response, gateway);
      },
    },
  },
});
