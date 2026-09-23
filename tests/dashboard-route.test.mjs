import assert from "node:assert/strict";
import test from "node:test";
import { dashboardRouteForRole } from "../lib/auth/dashboard-route.ts";

test("signed-in public nav directs each role to the permitted dashboard", () => {
  assert.equal(dashboardRouteForRole("USER"), "/dashboard");
  assert.equal(dashboardRouteForRole("OWNER"), "/owner");
  assert.equal(dashboardRouteForRole("ADMIN"), "/admin");
  assert.equal(dashboardRouteForRole("FINANCE"), "/admin");
  assert.equal(dashboardRouteForRole("DESIGNER"), "/designer");
  assert.equal(dashboardRouteForRole("EDITOR"), "/designer");
  assert.equal(dashboardRouteForRole(null), "/dashboard");
});
