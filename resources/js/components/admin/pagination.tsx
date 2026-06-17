import { Link } from '@inertiajs/react';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkItem[];
}

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) return null; // Don't show if there's only 1 page (prev, 1, next)

    return (
        <div className="flex flex-wrap justify-center gap-1 mt-4 mb-2">
            {links.map((link, key) => {
                return link.url === null ? (
                    <div
                        key={key}
                        className="px-3 py-1.5 text-xs border rounded-md select-none text-muted-foreground/60 bg-muted/20 cursor-not-allowed"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        className={`px-3 py-1.5 text-xs border rounded-md transition-colors ${
                            link.active
                                ? 'bg-primary text-primary-foreground font-medium border-primary'
                                : 'bg-background hover:bg-muted text-foreground'
                        }`}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}
