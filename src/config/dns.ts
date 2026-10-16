import dns from "node:dns";

const PUBLIC_DNS = ["1.1.1.1", "8.8.8.8"];

function srvNameOf(uri: string): string | null {
  const match = uri.match(/^mongodb\+srv:\/\/[^@/]*@?([^/:?#]+)/);
  return match ? `_mongodb._tcp.${match[1]}` : null;
}

function resolvable(srvName: string, servers: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const resolver = new dns.Resolver({ timeout: 3000, tries: 1 });
    try {
      resolver.setServers(servers);
      resolver.resolveSrv(srvName, (err) => resolve(!err));
    } catch {
      resolve(false);
    }
  });
}

export async function ensureSrvDnsWorks(): Promise<void> {
  const srvName = srvNameOf(process.env.MONGODB_URI ?? "");
  if (!srvName) return;

  const envServers = (process.env.DNS_SERVERS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const candidates = [
    ...(envServers.length ? [envServers] : []),
    dns.getServers(),
    PUBLIC_DNS,
  ];

  for (const servers of candidates) {
    if (servers.length === 0) continue;
    if (!(await resolvable(srvName, servers))) continue;

    const current = dns.getServers();
    const differs =
      current.length !== servers.length ||
      current.some((s, i) => s !== servers[i]);
    if (differs) dns.setServers(servers);
    return;
  }
}