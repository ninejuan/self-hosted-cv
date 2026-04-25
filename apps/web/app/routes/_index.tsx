import { useLoaderData } from "react-router";
import type { Route } from "./+types/_index";
import { fetchCV } from "@/lib/api";
import type { CVData } from "@/types/cv";
import { Header } from "@/components/cv/header";
import { About } from "@/components/cv/about";
import { ExperienceSection } from "@/components/cv/experience-section";
import { WritingSection } from "@/components/cv/writing-section";
import { SpeakingSection } from "@/components/cv/speaking-section";
import { ProjectsSection } from "@/components/cv/projects-section";
import { EducationSection } from "@/components/cv/education-section";
import { ContactSection } from "@/components/cv/contact-section";
import { ThemeToggle } from "@/components/cv/theme-toggle";
import { PrintButton } from "@/components/cv/print-button";

export async function loader() {
    const cv = await fetchCV();
    return { cv };
}

export function meta({ loaderData }: Route.MetaArgs) {
    const cv = (loaderData as { cv: CVData } | undefined)?.cv;
    if (!cv) {
        return [{ title: "Self-Hosted CV" }];
    }

    const { profile } = cv;
    const title = `${profile.name} — ${profile.profession}`;
    const description = profile.bio?.length > 160
        ? profile.bio.slice(0, 157) + "..."
        : profile.bio;

    return [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        ...(profile.avatarUrl
            ? [{ property: "og:image", content: profile.avatarUrl }]
            : []),
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
    ];
}

function JsonLd({ cv }: { cv: CVData }) {
    const { profile } = cv;
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: profile.name,
        jobTitle: profile.profession,
        ...(profile.location && { address: { "@type": "PostalAddress", addressLocality: profile.location } }),
        ...(profile.bio && { description: profile.bio }),
        ...(profile.avatarUrl && { image: profile.avatarUrl }),
        ...(profile.websiteUrl && { url: profile.websiteUrl }),
        sameAs: profile.socialLinks?.map((l) => l.url) ?? [],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export default function Index() {
    const { cv } = useLoaderData<typeof loader>();

    return (
        <>
            <JsonLd cv={cv} />
            <main className="cv-page">
                <div className="cv-toolbar">
                    <ThemeToggle />
                    <PrintButton />
                </div>

                <Header profile={cv.profile} />
                <About bio={cv.profile.bio} />
                <ExperienceSection items={cv.experience} />
                <WritingSection items={cv.writing} />
                <SpeakingSection items={cv.speaking} />
                <ProjectsSection items={cv.projects} />
                <EducationSection items={cv.education} />
                <ContactSection links={cv.profile.socialLinks} />
            </main>
        </>
    );
}
