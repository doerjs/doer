#!/usr/bin/env zx

'use strict'

// await $`pwd`

// cd('./packages/utils')
// await $`npm link`

// cd('../eslint-config')
// await $`npm link`

// cd('../prettier-config')
// await $`npm link`

// cd('../cli')
// await `npm link @traveler/utils`
// await `npm link @traveler/eslint-config`
// await `npm link @traveler/prettier-config`
// await $`npm link`

// cd('../../example')
// await `npm link @traveler/utils`
// await `npm link @traveler/eslint-config`
// await `npm link @traveler/prettier-config`
// await `npm link @traveler/cli`

cd('example')

await $`npm install`
await $`npm run mock`