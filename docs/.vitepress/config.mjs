import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Node.js Architecture Labs',
  description: 'An executable architecture curriculum for Python and Go developers learning Node.js.',
  lang: 'en-US',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Curriculum', link: '/introduction/curriculum' },
      { text: 'JavaScript', link: '/javascript/execution-model' },
      { text: 'Node.js', link: '/nodejs/fundamentals' },
      { text: 'Architecture', link: '/architecture/progression' },
    ],
    sidebar: {
      '/introduction/': [
        { text: 'Introduction', items: [{ text: 'Curriculum', link: '/introduction/curriculum' }, { text: 'Development environment', link: '/introduction/development-environment' }] },
      ],
      '/javascript/': [
        { text: 'JavaScript', items: [{ text: 'Execution model', link: '/javascript/execution-model' }, { text: 'Foundations', link: '/javascript/foundations' }, { text: 'Modules', link: '/javascript/modules' }, { text: 'Async programming', link: '/javascript/async' }] },
      ],
      '/nodejs/': [
        { text: 'Node.js', items: [{ text: 'Runtime fundamentals', link: '/nodejs/fundamentals' }, { text: 'Platform and operations', link: '/nodejs/platform' }, { text: 'Testing', link: '/nodejs/testing' }, { text: 'Concurrency', link: '/nodejs/concurrency' }] },
      ],
      '/express/': [
        { text: 'Express', items: [{ text: 'Fundamentals', link: '/express/fundamentals' }, { text: 'Web development', link: '/express/web-development' }, { text: 'Security', link: '/express/security' }] },
      ],
      '/sqlite/': [
        { text: 'SQLite', items: [{ text: 'Persistence', link: '/sqlite/persistence' }] },
      ],
      '/typescript/': [
        { text: 'TypeScript', items: [{ text: 'Contracts', link: '/typescript/contracts' }] },
      ],
      '/frontend/': [
        { text: 'Frontend', items: [{ text: 'Server-driven UI', link: '/frontend/server-driven' }, { text: 'Accessibility', link: '/frontend/accessibility' }] },
      ],
      '/testing/': [
        { text: 'Testing', items: [{ text: 'Verification', link: '/testing/verification' }] },
      ],
      '/operations/': [
        { text: 'Operations', items: [{ text: 'Local runbook', link: '/operations/runbook' }, { text: 'Production boundaries', link: '/operations/production' }] },
      ],
      '/tooling/': [
        { text: 'Tooling', items: [{ text: 'npm', link: '/tooling/npm' }] },
      ],
      '/glossary/': [
        { text: 'Glossary', items: [{ text: 'Terms', link: '/glossary/' }] },
      ],
      '/references/': [
        { text: 'References', items: [{ text: 'Official references', link: '/references/' }] },
      ],
      '/legal/': [
        { text: 'Legal', items: [{ text: 'Licensing', link: '/legal/licensing' }] },
      ],
      '/prisma/': [
        { text: 'Prisma', items: [{ text: 'Guide', link: '/prisma/guide' }] },
      ],
      '/comparisons/': [
        { text: 'Comparisons', items: [{ text: 'All variants', link: '/comparisons/all-variants' }] },
      ],
      '/architecture/': [
        { text: 'Architecture', items: [{ text: 'Progression', link: '/architecture/progression' }, { text: 'Prisma comparison', link: '/architecture/prisma-comparison' }, { text: 'Use-case comparison', link: '/architecture/usecases-comparison' }, { text: 'Hexagonal comparison', link: '/architecture/hexagonal-comparison' }, { text: 'TypeScript comparison', link: '/architecture/typescript-comparison' }, { text: 'DDD comparison', link: '/architecture/ddd-comparison' }, { text: 'DDD and Clean Architecture', link: '/architecture/ddd-clean-architecture' }, { text: 'Variant matrix', link: '/architecture/variant-matrix' }, { text: 'Reflection matrix', link: '/architecture/reflection-matrix' }] },
      ],
      '/applications/': [
        { text: 'Applications', items: [{ text: 'Simple URL shortener', link: '/applications/simple-url-shortener' }, { text: 'Simple Pastebin', link: '/applications/simple-pastebin' }, { text: 'Simple blog', link: '/applications/simple-blog' }, { text: 'Variant matrix', link: '/applications/variant-matrix' }] },
      ],
      '/security/': [
        { text: 'Security', items: [{ text: 'Baseline', link: '/security/baseline' }] },
      ],
      '/research/': [
        { text: 'Research', items: [{ text: 'Technology decisions', link: '/research/technology-decisions' }] },
      ],
    },
    socialLinks: [],
    search: { provider: 'local' },
  },
})

