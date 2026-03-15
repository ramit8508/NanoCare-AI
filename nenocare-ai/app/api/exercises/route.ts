import { NextResponse } from "next/server";

const DEFAULT_BASE = "https://exercisedb.p.rapidapi.com";
const DEFAULT_LIMIT = 24;

const getApiConfig = () => {
  const apiValue = process.env.EXERCISEDB_API || "";

  if (apiValue.startsWith("http")) {
    return { baseUrl: apiValue, apiKey: "" };
  }

  return { baseUrl: DEFAULT_BASE, apiKey: apiValue };
};

export async function GET(request: Request) {
  const { baseUrl, apiKey } = getApiConfig();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const limit = Number(searchParams.get("limit") || DEFAULT_LIMIT);

  const endpoint = search
    ? `${baseUrl}/exercises/name/${encodeURIComponent(search)}`
    : `${baseUrl}/exercises`;

  const headers: Record<string, string> = {};

  if (apiKey) {
    headers["X-RapidAPI-Key"] = apiKey;
    headers["X-RapidAPI-Host"] = "exercisedb.p.rapidapi.com";
  }

  const response = await fetch(endpoint, {
    headers,
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: response.status }
    );
  }

  const data = (await response.json()) as Array<Record<string, unknown>>;
  const sliced = search ? data.slice(0, limit) : data.slice(0, limit);

  return NextResponse.json({ items: sliced });
}
