import type { Attributes } from "@opentelemetry/api";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";

const safeSpanAttributeNames = new Set([
  "http.method",
  "http.request.method",
  "http.route",
  "http.status_code",
  "http.response.status_code",
]);

export class SafeSpanExporter implements SpanExporter {
  constructor(private readonly delegate: SpanExporter) {}

  export(
    spans: ReadableSpan[],
    resultCallback: Parameters<SpanExporter["export"]>[1],
  ): void {
    this.delegate.export(
      spans.map((span) => ({
        ...span,
        attributes: filterSpanAttributes(span.attributes),
      })),
      resultCallback,
    );
  }

  shutdown(): Promise<void> {
    return this.delegate.shutdown();
  }

  forceFlush(): Promise<void> {
    return this.delegate.forceFlush?.() ?? Promise.resolve();
  }
}

export function filterSpanAttributes(attributes: Attributes): Attributes {
  const safeAttributes: Attributes = {};

  for (const [name, value] of Object.entries(attributes)) {
    if (safeSpanAttributeNames.has(name)) {
      safeAttributes[name] = value;
    }
  }

  return safeAttributes;
}
