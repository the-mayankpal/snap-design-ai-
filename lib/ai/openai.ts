import "server-only";

import OpenAI from "openai";

import { NotConfiguredError } from "@/lib/api";

let client: OpenAI | null = null;

/** The OpenAI client. The key is read from env on the server and never logged. */
export function openai() {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new NotConfiguredError("OpenAI isn't configured. Set OPENAI_API_KEY in .env.local.");
  client = new OpenAI({ apiKey });
  return client;
}

/** Model ids come from env only, so switching models is a config change, not a deploy. */
export function models() {
  const text = process.env.OPENAI_TEXT_MODEL;
  const image = process.env.OPENAI_IMAGE_MODEL;
  if (!text || !image) {
    throw new NotConfiguredError(
      "OpenAI models aren't configured. Set OPENAI_TEXT_MODEL and OPENAI_IMAGE_MODEL in .env.local.",
    );
  }
  return { text, image };
}
