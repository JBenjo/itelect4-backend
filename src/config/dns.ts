import dns from "node:dns";

const PUBLIC_DNS = ["1.1.1.1", "8.8.8.8"];

function srvNameOf(uri: string): string | null {
  const match = uri.match(/^mongodb\+srv:\/\/[^@/]*@?([^/:?#]+)/);
  return match ? `_mongodb._tcp.${match[1]}` : null;
}

function resolvable(srvName: string, servers: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const resolver = new dns.Resolver({ timeout: 800, tries: 1 });
    try {
      resolver.setServers(servers);
      resolver.resolveSrv(srvName, (err) => resolve(!err));
    } catch {
      resolve(false);
    }
  });
}

export async function ensureSrvDnsWorks(): Promise<void> {
  // On Vercel the runtime resolves Atlas SRV records on its own, so this
  // probe has nothing to fix. Worse, its resolver timeout would sit on
  // the critical path of every cold start. Skip it there.
  if (process.env.VERCEL) return;

  const srvName = srvNameOf(process.env.MONGODB_URI ?? "");
  if (!srvName) return;

  const envServers = (process.env.DNS_SERVERS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Public DNS first: it is the resolver that actually answers for Atlas
  // everywhere, so the working answer is reached without paying a timeout
  // on a local resolver that may never reply.
  const candidates = [
    ...(envServers.length ? [envServers] : []),
    PUBLIC_DNS,
    dns.getServers(),
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