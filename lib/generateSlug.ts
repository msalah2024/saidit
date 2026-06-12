import { nanoid } from 'nanoid'
export async function generateSlug(title: string) {
    const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 80)
    const id = nanoid(7)
    return `${id}-${slug}`
}