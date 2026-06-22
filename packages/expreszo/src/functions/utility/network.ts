/**
 * Network helper functions. Currently a single IPv4 CIDR-membership test.
 * Implemented with native 32-bit integer math — no external IP library and no
 * BigInt — keeping the core dependency-free. IPv6 is not supported.
 */
import { getTypeName } from '../../types/values.js';

/**
 * Parses a dotted-quad IPv4 string into an unsigned 32-bit integer. Throws on
 * anything that is not exactly four octets in the 0–255 range.
 */
function parseIPv4(fn: string, ip: string): number {
  const parts = ip.split('.');
  if (parts.length !== 4) {
    throw new Error(`${fn}(): invalid IPv4 address '${ip}'`);
  }
  let result = 0;
  for (const part of parts) {
    // Reject empty, signs, whitespace, and non-numeric octets; require a plain
    // decimal integer 0–255 with no leading-zero ambiguity beyond "0".
    if (!/^\d{1,3}$/.test(part)) {
      throw new Error(`${fn}(): invalid IPv4 address '${ip}'`);
    }
    const octet = Number(part);
    if (octet > 255) {
      throw new Error(`${fn}(): invalid IPv4 address '${ip}'`);
    }
    result = (result << 8) | octet;
  }
  return result >>> 0;
}

/**
 * Returns true if the IPv4 address falls within the given CIDR block
 * (e.g. ipInRange("10.1.2.3", "10.0.0.0/8")). IPv4 only.
 */
export function ipInRange(ip: string | undefined, cidr: string | undefined): boolean | undefined {
  if (ip === undefined || cidr === undefined) {
    return undefined;
  }
  if (typeof ip !== 'string') {
    throw new Error(`ipInRange() expects a string as first argument, got ${getTypeName(ip)}`);
  }
  if (typeof cidr !== 'string') {
    throw new Error(`ipInRange() expects a string as second argument, got ${getTypeName(cidr)}`);
  }

  const slash = cidr.indexOf('/');
  if (slash === -1) {
    throw new Error(`ipInRange(): invalid CIDR '${cidr}', expected form 'a.b.c.d/prefix'`);
  }
  const network = cidr.slice(0, slash);
  const prefixStr = cidr.slice(slash + 1);
  if (!/^\d{1,2}$/.test(prefixStr)) {
    throw new Error(`ipInRange(): invalid CIDR prefix in '${cidr}'`);
  }
  const prefix = Number(prefixStr);
  if (prefix > 32) {
    throw new Error(`ipInRange(): invalid CIDR prefix in '${cidr}', must be 0-32`);
  }

  const ipInt = parseIPv4('ipInRange', ip);
  const netInt = parseIPv4('ipInRange', network);
  // A /0 prefix matches everything; (-1 << 32) is undefined in JS, so handle it.
  const mask = prefix === 0 ? 0 : (-1 << (32 - prefix)) >>> 0;
  return ((ipInt & mask) >>> 0) === ((netInt & mask) >>> 0);
}
