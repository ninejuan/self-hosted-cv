import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/_index.tsx"),
    route("login", "routes/login.tsx"),
    route("admin", "routes/admin.tsx", [
        index("routes/admin._index.tsx"),
    ]),
] satisfies RouteConfig;
