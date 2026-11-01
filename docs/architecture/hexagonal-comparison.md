# Hexagonal architecture comparison

`hexagonal-01/url-shortener` makes dependency direction explicit. The
application workflow depends on a link port, the Prisma repository implements
that port, and the composition root wires the adapter to the use-cases and HTTP
adapter.

The port creates a seam for memory, SQLite, Prisma, or remote implementations.
The cost is another contract and a composition step. A port that only mirrors
one ORM method without protecting a meaningful application boundary adds noise;
the memory-port test demonstrates why this port is useful here.

