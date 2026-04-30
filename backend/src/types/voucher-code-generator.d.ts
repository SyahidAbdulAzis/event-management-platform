declare module "voucher-code-generator" {
  interface GeneratorOptions {
    length?: number
    count?: number
    prefix?: string
    postfix?: string
    pattern?: string
    charset?: string
  }

  export function generate(options?: GeneratorOptions): string[]
}
