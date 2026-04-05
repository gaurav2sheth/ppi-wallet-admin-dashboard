import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatPaise(paiseStr: string | number | null | undefined): string {
  if (paiseStr === null || paiseStr === undefined) return '\u20B90.00';
  const paise = BigInt(paiseStr);
  const sign = paise < 0n ? '-' : '';
  const abs = paise < 0n ? -paise : paise;
  const rupees = abs / 100n;
  const remainder = abs % 100n;
  const rupeesFormatted = Number(rupees).toLocaleString('en-IN');
  return `${sign}\u20B9${rupeesFormatted}.${remainder.toString().padStart(2, '0')}`;
}

export function formatPaiseCompact(paiseStr: string | number | null | undefined): string {
  if (paiseStr === null || paiseStr === undefined) return '\u20B90';
  const rupees = Number(BigInt(paiseStr)) / 100;
  if (rupees >= 10000000) return `\u20B9${(rupees / 10000000).toFixed(1)}Cr`;
  if (rupees >= 100000) return `\u20B9${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `\u20B9${(rupees / 1000).toFixed(1)}K`;
  return `\u20B9${rupees.toFixed(0)}`;
}

export function rupeesToPaise(rupeeStr: string): number {
  const val = parseFloat(rupeeStr);
  if (isNaN(val) || val < 0) return 0;
  return Math.round(val * 100);
}

export function formatDate(iso: string): string {
  return dayjs(iso).format('DD MMM YYYY, hh:mm A');
}

export function formatDateShort(iso: string): string {
  return dayjs(iso).format('DD MMM YYYY');
}

export function formatRelative(iso: string): string {
  return dayjs(iso).fromNow();
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatCompactNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('en-IN');
}

export function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export function truncateId(id: string, len = 8): string {
  if (id.length <= len) return id;
  return id.slice(0, len) + '...';
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return phone.slice(0, 2) + '****' + phone.slice(-2);
}

export function maskName(name: string): string {
  return name.split(' ').map(w => w[0] + '***').join(' ');
}
