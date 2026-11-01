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
        { text: 'JavaScript', items: [{ text: 'Execution model', link: '/javascript/execution-model' }] },
      ],
      '/nodejs/': [
        { text: 'Node.js', items: [{ text: 'Runtime fundamentals', link: '/nodejs/fundamentals' }] },
      ],
      '/architecture/': [
        { text: 'Architecture', items: [{ text: 'Progression', link: '/architecture/progression' }] },
      ],
      '/applications/': [
        { text: 'Applications', items: [{ text: 'Simple URL shortener', link: '/applications/simple-url-shortener' }, { text: 'Simple Pastebin', link: '/applications/simple-pastebin' }, { text: 'Simple blog', link: '/applications/simple-blog' }] },
      ],
      '/research/': [
        { text: 'Research', items: [{ text: 'Technology decisions', link: '/research/technology-decisions' }] },
      ],
    },
    socialLinks: [],
    search: { provider: 'local' },
  },
})

