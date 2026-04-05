// Seeded PRNG for reproducible mock data
let _seed = 42;
export function seededRandom(): number {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed - 1) / 2147483646;
}

export function resetSeed(s = 42): void { _seed = s; }

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)];
}

export function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = seededRandom() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function randomInt(min: number, max: number): number {
  return min + Math.floor(seededRandom() * (max - min + 1));
}

export function randomBigIntPaise(minRupees: number, maxRupees: number): string {
  const rupees = minRupees + Math.floor(seededRandom() * (maxRupees - minRupees));
  return String(rupees * 100 + randomInt(0, 99));
}

export function generateUUID(): string {
  const hex = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) { s += '-'; }
    else if (i === 14) { s += '4'; }
    else if (i === 19) { s += hex[8 + Math.floor(seededRandom() * 4)]; }
    else { s += hex[Math.floor(seededRandom() * 16)]; }
  }
  return s;
}

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Aditya', 'Akash', 'Amit', 'Ananya', 'Anjali', 'Arjun',
  'Bhavya', 'Chetan', 'Deepak', 'Diya', 'Gaurav', 'Harsh', 'Ishaan', 'Isha',
  'Jayesh', 'Kajal', 'Karan', 'Kavya', 'Kriti', 'Lakshmi', 'Manish', 'Meera',
  'Mohit', 'Neha', 'Nikhil', 'Nisha', 'Pallavi', 'Pooja', 'Priya', 'Rahul',
  'Rajesh', 'Ravi', 'Ritika', 'Rohit', 'Sakshi', 'Sandeep', 'Sanjay', 'Shreya',
  'Simran', 'Sneha', 'Srishti', 'Sunil', 'Tanvi', 'Varun', 'Vidya', 'Vikram',
  'Vivek', 'Yash',
];

const LAST_NAMES = [
  'Agarwal', 'Bansal', 'Choudhary', 'Desai', 'Dubey', 'Gupta', 'Iyer', 'Jain',
  'Joshi', 'Kapoor', 'Khan', 'Kumar', 'Malhotra', 'Mehta', 'Mishra', 'Nair',
  'Pandey', 'Patel', 'Rao', 'Reddy', 'Saxena', 'Shah', 'Sharma', 'Singh',
  'Sinha', 'Srivastava', 'Thakur', 'Tiwari', 'Verma', 'Yadav',
];

const PHONE_PREFIXES = ['98', '97', '96', '95', '94', '93', '91', '90', '88', '87', '86', '85', '70', '76', '77', '78', '79'];

export function generateName(): string {
  return `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;
}

export function generatePhone(): string {
  const prefix = pickRandom(PHONE_PREFIXES);
  let rest = '';
  for (let i = 0; i < 8; i++) rest += String(randomInt(0, 9));
  return prefix + rest;
}

export function generateEmail(name: string): string {
  const domains = ['gmail.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com', 'rediffmail.com'];
  const slug = name.toLowerCase().replace(/\s+/g, '.') + randomInt(1, 999);
  return `${slug}@${pickRandom(domains)}`;
}

export function generatePastDate(daysAgo: number): string {
  const now = Date.now();
  const offset = randomInt(0, daysAgo) * 86400000 + randomInt(0, 86400000);
  return new Date(now - offset).toISOString();
}

export function generateRecentDate(daysAgo: number): string {
  const now = Date.now();
  const offset = randomInt(0, daysAgo) * 86400000 + randomInt(0, 86400000);
  return new Date(now - offset).toISOString();
}

const MERCHANT_NAMES = [
  'Swiggy', 'Zomato', 'Uber', 'Ola', 'BigBasket', 'Blinkit', 'Amazon', 'Flipkart',
  'Myntra', 'D-Mart', 'Reliance Fresh', 'PVR Cinemas', 'BookMyShow', 'MakeMyTrip',
  'Rapido', 'PharmEasy', '1mg', 'Udemy', 'BESCOM', 'Jio', 'Airtel', 'Vi',
  'Tata Play', 'Netflix', 'Hotstar', 'HP Petrol', 'IOCL', 'Shell', 'Bajaj Finserv',
  'HDFC Life', 'ICICI Lombard', 'Star Health',
];

export function generateMerchantName(): string {
  return pickRandom(MERCHANT_NAMES);
}
