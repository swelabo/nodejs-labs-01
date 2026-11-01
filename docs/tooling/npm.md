# npm, manifests, and lockfiles

`package.json` describes a package's scripts, runtime constraints, and direct
dependencies. `package-lock.json` records the resolved dependency graph so two
developers do not silently test different transitive versions. A script is a
named project operation, not a shell alias: the application Makefiles delegate
to these scripts so the command remains discoverable from both interfaces.

The repository pins teaching dependencies and commits lockfiles. `npm install`
updates the lockfile when the manifest changes; `npm ci` is the reproducible CI
operation when a lockfile is authoritative. `npm audit --omit=dev` addresses
runtime dependency exposure but is not a substitute for reviewing advisories,
usage, or the threat model.

## Exercise

Change one direct dependency in a disposable branch, inspect the lockfile diff,
run the application matrix, and explain which transitive packages changed.
