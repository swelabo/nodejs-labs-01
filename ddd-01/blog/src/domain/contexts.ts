export type PublishingAuthor = { id: string; displayName: string }
export type IdentityUser = { subject: string; label: string }

// Identity and Publishing use different names. This anti-corruption mapping
// keeps an identity-provider subject from leaking into publication language.
export function toPublishingAuthor(user: IdentityUser): PublishingAuthor {
  return { id: user.subject, displayName: user.label }
}
