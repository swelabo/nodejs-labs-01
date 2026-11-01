export interface TransactionBoundary {
  run<T>(work: () => Promise<T>): Promise<T>
}

// This boundary makes the unit of work explicit without implying reliable
// external delivery. A database transaction commits state; event publication
// still needs an outbox or another durable mechanism in production.
export function createTransactionBoundary(database: { $transaction<T>(work: () => Promise<T>): Promise<T> }): TransactionBoundary {
  return { run: (work) => database.$transaction(work) }
}
