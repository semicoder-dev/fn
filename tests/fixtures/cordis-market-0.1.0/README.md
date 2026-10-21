# Official Cordis market regression fixture

Snapshot of `semicoder-dev/fn-plugins` at `8ef3022b548b8c787d436c1ba2b3669e91ed89d4` (2026-10-21).
`index.json` is the public `marketplace-cordis.json`. The three archives are the unchanged public
`cordis-*-v0.1.0` GitHub Release assets; their SHA-256 values and original URLs are in the index.
They use public SDK 0.4.0, Cordis 4.0.5 and React/React DOM 19.2.7.

The test uses the actual seed builder, packaged seed materialization, market refresh/resolve,
archive digest validation, generation installation, idle activation and restart. Network market
fetch is replaced by this immutable response; no adjacent checkout or live registry market is needed.
Do not generate the index's core requirements from the seed under test: that would hide missing
host version metadata again. Keep this snapshot tied to its original release when adding future fixtures.
