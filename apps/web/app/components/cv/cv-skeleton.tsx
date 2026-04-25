import { Skeleton } from "@/components/ui/skeleton";

export function CvPageSkeleton() {
    const sectionKeys = ["experience", "writing", "speaking", "projects", "education"];
    const itemKeys = ["primary", "secondary"];

    return (
        <main className="cv-page" aria-label="Loading CV">
            <div className="cv-toolbar">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
            </div>
            <Skeleton className="h-9 w-56" />
            <Skeleton className="mt-3 h-5 w-72 max-w-full" />
            <Skeleton className="mt-6 h-20 w-full" />
            {sectionKeys.map((sectionKey) => (
                <section key={sectionKey} className="cv-section">
                    <Skeleton className="mb-5 h-3 w-24" />
                    <div className="cv-section-items">
                        {itemKeys.map((itemKey) => (
                            <div key={`${sectionKey}-${itemKey}`} className="cv-item-row">
                                <div className="cv-date-column">
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <div className="cv-content-column space-y-2">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </main>
    );
}
