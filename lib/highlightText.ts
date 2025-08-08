export function highlightText(content: string, searchTerm: string) {
    if (!searchTerm.trim()) return content;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return content.replace(regex, '<span class="bg-primary text-black">$1</span>');
}
