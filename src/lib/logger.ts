type LogContext = Record<string, unknown>;

function normalizeErrorValue(
  value: unknown,
  seen = new WeakSet<object>(),
): unknown {
  if (value instanceof Error) {
    const normalized: Record<string, unknown> = {
      name: value.name,
      message: value.message,
    };

    const cause = (value as { cause?: unknown }).cause;
    if (cause !== undefined) {
      normalized.cause =
        cause instanceof Error ? normalizeErrorValue(cause, seen) : cause;
    }

    if (value.stack) {
      normalized.stack = value.stack;
    }

    return normalized;
  }

  if (value !== null && typeof value === "object") {
    if (seen.has(value as object)) {
      return "[Circular]";
    }
    seen.add(value as object);

    // Capture ALL own properties (including non-enumerable, e.g. tRPC
    // error `message`/`data`) so nothing is silently dropped.
    const names = Object.getOwnPropertyNames(value as object);
    if (names.length === 0) {
      return String(value);
    }

    return Object.fromEntries(
      names.map((key) => [
        key,
        normalizeErrorValue(
          (value as Record<string, unknown>)[key],
          seen,
        ),
      ]),
    );
  }

  return value;
}

function normalizeError(error: unknown) {
  if (error === undefined) return "[undefined]";
  if (error === null) return "[null]";
  return normalizeErrorValue(error);
}

function write(
  level: "error" | "warn" | "info",
  message: string,
  context?: LogContext,
) {
  const payload = context
    ? Object.fromEntries(
        Object.entries(context).map(([key, value]) => [
          key,
          key === "error" ? normalizeError(value) : value,
        ]),
      )
    : undefined;

  console[level](message, payload);
}

export const logger = {
  error(message: string, error?: unknown, context?: LogContext) {
    const payload = {
      ...context,
      ...(error !== undefined ? { error } : {}),
    };
    write("error", message, payload);
    // Emit a flat, readable line so the real reason is visible even in the
    // Next.js error overlay (which collapses nested objects to `{}`).
    const detail =
      error === undefined
        ? "[no error value / rejected with undefined]"
        : error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error);
    console.error(`${message}: ${detail}`);
    if (error !== undefined) {
      // Keep the raw error so the browser DevTools console shows the truth.
      console.error(message, error);
    }
  },
  warn(message: string, context?: LogContext) {
    write("warn", message, context);
  },
  info(message: string, context?: LogContext) {
    write("info", message, context);
  },
};
