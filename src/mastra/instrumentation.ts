// Mastra instrumentation shim
// When running Mastra outside the mastra server environment, Mastra emits a
// warning if an instrumentation file wasn't loaded. To acknowledge that we
// intentionally aren't wiring a full tracing provider here, set the global
// variable the Mastra runtime checks.

// Note: leave this file minimal. If you later want to hook tracing, replace
// the body with proper instrumentation init code.

(globalThis as any).___MASTRA_TELEMETRY___ = true;
