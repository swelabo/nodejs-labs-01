import { Post } from './post.js'

// A factory gives callers one named place to construct a valid aggregate. This
// keeps transport-shaped objects out of the domain constructor and makes the
// creation vocabulary explicit as the model grows.
export class PostFactory {
  static create(input: Record<string, unknown>): Post {
    return Post.draft(input)
  }
}
