import type { NextRequest } from "next/server";

const IPINFO_TOKEN = process.env.NEXT_IP_INFO_TOKEN;

const getIp = (request: NextRequest): string | null => {
  const headers = request.headers;

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  const trueClientIp = headers.get("true-client-ip");
  if (trueClientIp) return trueClientIp;

  const fastlyIp = headers.get("fastly-client-ip");
  if (fastlyIp) return fastlyIp;

  const forwarded = headers.get("forwarded");
  if (forwarded) {
    const match = forwarded.match(/for="?([^;"]+)"?/);
    if (match) return match[1];
  }

  return null;
};

export async function getGeoFromIP(request: NextRequest) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 700);
    const ip = getIp(request);

    if (!ip) return null;

    const res = await fetch(
      `https://api.ipinfo.io/lite/${ip}?token=${IPINFO_TOKEN}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    return data as {
      ip: string;
      asn: string;
      as_name: string;
      as_domain: string;
      country_code: string;
      country: string;
      continent_code: string;
      continent: string;
    };
  } catch {
    return null;
  }
}
