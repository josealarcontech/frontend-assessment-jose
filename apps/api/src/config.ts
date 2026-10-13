export const PORT = Number(process.env.PORT) || 4000

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

export const PROCESSOR_WEBHOOK_SECRET = requireEnv("PROCESSOR_WEBHOOK_SECRET")
