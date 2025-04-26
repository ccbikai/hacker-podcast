import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  react: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  ignores: [
    'components/ui/**/*',
    'components/magicui/**/*',
    'components/animata/**/*',
    'components/cute/**/*',
    'components/eldora/**/*',
    'cloudflare-env.d.ts',
  ],
  rules: {
    'no-console': ['error', { allow: ['info', 'table', 'warn', 'error'] }],
  },
})
