import { mkdir, copyFile } from 'node:fs/promises'
import { join } from 'node:path'

const publicDirectory = join(process.cwd(), 'src', 'public')
await mkdir(join(publicDirectory, 'vendor'), { recursive: true })
await copyFile(join(process.cwd(), 'node_modules/htmx.org/dist/htmx.min.js'), join(publicDirectory, 'vendor/htmx.min.js'))
await copyFile(join(process.cwd(), 'node_modules/alpinejs/dist/cdn.min.js'), join(publicDirectory, 'vendor/alpine.min.js'))
