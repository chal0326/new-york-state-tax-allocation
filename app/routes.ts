import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/tax-allocation.tsx"),
  route("/api/save-calculation", "routes/api.save-calculation.tsx")
] satisfies RouteConfig;
