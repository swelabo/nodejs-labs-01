import type { PublicationStatus } from './post.js'

// This policy is a domain service because publication visibility depends on
// status, time, and a clock supplied by the caller rather than one entity field.
export function isPubliclyAvailable(status: PublicationStatus | string, publishAt: Date | null, now = new Date()): boolean {
  return status === 'published' && (!publishAt || publishAt <= now)
}
