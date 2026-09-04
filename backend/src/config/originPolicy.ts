export type OriginPolicy = {
  allowedOrigins: readonly string[];
  frontendPort: number;
  nodeEnv: string;
};

function isPrivateIpv4(hostname: string): boolean {
  const octets = hostname.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  return octets[0] === 10
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168);
}

export function isOriginAllowed(origin: string | undefined, policy: OriginPolicy): boolean {
  if (!origin || policy.allowedOrigins.includes(origin)) return true;
  if (policy.nodeEnv === 'production') return false;

  try {
    const parsed = new URL(origin);
    const effectivePort = Number(parsed.port || (parsed.protocol === 'https:' ? 443 : 80));

    return (parsed.protocol === 'http:' || parsed.protocol === 'https:')
      && effectivePort === policy.frontendPort
      && isPrivateIpv4(parsed.hostname);
  } catch {
    return false;
  }
}
