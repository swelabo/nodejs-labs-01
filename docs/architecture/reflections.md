# Reflection checklist

After each variant, answer the same questions in the application README or
comparison chapter: which boundary became clearer, which layer became harder to
navigate, which tests run without a database, which queries or round trips are
observable, and which security assumptions remain local-only? Treat performance
statements as hypotheses unless a benchmark or query inspection supports them.

The progression is valuable because the same questions are asked against the
same domains. A port can improve test isolation while adding ceremony; a domain
aggregate can protect an invariant while requiring mapping code. Recording both
effects prevents architecture from becoming a vocabulary for post-hoc praise.
