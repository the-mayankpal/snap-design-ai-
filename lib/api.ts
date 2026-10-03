import "server-only";

/** Thrown when env vars are missing, so routes answer 503 with the fix, not a stack trace. */
export class NotConfiguredError extends Error {}

/** An error whose message is safe to show the caller. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Runs a route's work and turns the result into a response: JSON for a value,
 * 204 for `undefined`, and a `{ error }` body for failures. Unexpected errors
 * are logged and answered generically so internals never reach the browser.
 */
export async function respond(work: () => Promise<unknown>, status = 200) {
  try {
    const data = await work();
    return data === undefined
      ? new Response(null, { status: 204 })
      : Response.json(data, { status });
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof NotConfiguredError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    console.error(error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Expected a JSON body.");
  }
}

/**
 * Reads a JSON object body and rejects any key not in `allowed`, so a client
 * cannot slip extra fields past validation.
 */
export async function readStrictJson<K extends string>(
  request: Request,
  allowed: readonly K[],
): Promise<Partial<Record<K, unknown>>> {
  const body = await readJson(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Expected a JSON object.");
  }
  const unknown = Object.keys(body).filter((key) => !allowed.includes(key as K));
  if (unknown.length) {
    throw new HttpError(400, `Unknown field: ${unknown[0].slice(0, 40)}.`);
  }
  return body as Partial<Record<K, unknown>>;
}
