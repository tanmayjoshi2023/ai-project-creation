/**
 * Input sanitization for prompt injection defense (Engineering Bible Vol 15)
 */
export function sanitizeCompanyInput(input: string): string {
  return input
    .replace(/ignore (previous|above|all) instructions/gi, '')
    .replace(/you are now|pretend to be|act as/gi, '')
    .replace(/system prompt|jailbreak/gi, '')
    .trim()
    .slice(0, 100)
}

export function sanitizeTicker(input: string): string {
  return sanitizeCompanyInput(input)
    .toUpperCase()
    .replace(/[^A-Z0-9.-]/g, '')
    .slice(0, 10)
}
