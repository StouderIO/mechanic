import { defineConfig } from 'orval'

export default defineConfig({
  garage: {
    input: {
      target: './openapi/garage-admin-v2.json',
    },
    output: {
      mode: 'tags-split',
      client: 'react-query',
      target: './src/generated/orval/garage/endpoints.ts',
      baseUrl: '/proxy',
      override: {
        mutator: {
          path: './src/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
  mechanic: {
    input: {
      target: './openapi/mechanic.json',
    },
    output: {
      mode: 'tags-split',
      client: 'react-query',
      target: './src/generated/orval/mechanic/endpoints.ts',
      override: {
        mutator: {
          path: './src/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
})
