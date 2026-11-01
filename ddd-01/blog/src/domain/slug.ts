import { InvalidSlugError } from './errors.js'

const pattern = /^[a-z0-9-]{1,128}$/

export class Slug {
  readonly value: string

  private constructor(value: string) {
    this.value = value
    Object.freeze(this)
  }

  static from(value: unknown): Slug {
    if (typeof value !== 'string' || !pattern.test(value)) {
      throw new InvalidSlugError('slug must contain only lowercase letters, numbers, and hyphens')
    }
    return new Slug(value)
  }
}
