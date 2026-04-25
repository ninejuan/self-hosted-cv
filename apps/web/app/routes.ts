import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/_index.tsx"),
    route("login", "routes/login.tsx"),
    route("admin", "routes/admin.tsx", [
        index("routes/admin._index.tsx"),
        route("profile", "routes/admin.profile.tsx"),
        route("sections", "routes/admin.sections.tsx"),
        route("experience", "routes/admin.experience.tsx"),
        route("writing", "routes/admin.writing.tsx"),
        route("speaking", "routes/admin.speaking.tsx"),
        route("projects", "routes/admin.projects.tsx"),
        route("education", "routes/admin.education.tsx"),
        route("contacts", "routes/admin.contacts.tsx"),
        route("linkedin", "routes/admin.linkedin.tsx"),
        route("settings", "routes/admin.settings.tsx"),
        route("audit-logs", "routes/admin.audit-logs.tsx"),
    ]),
] satisfies RouteConfig;
