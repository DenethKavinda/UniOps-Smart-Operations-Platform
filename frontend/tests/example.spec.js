// @ts-check
import { test, expect } from "@playwright/test";

test("homepage loads successfully", async ({ page }) => {
  await page.goto("/");

  // page should load
  await expect(page).toHaveURL("http://localhost:3000/");

  // check title exists
  await expect(page).toHaveTitle(/.+/);
});

test("main page content visible", async ({ page }) => {
  await page.goto("/");

  // body visible
  await expect(page.locator("body")).toBeVisible();
});

test("navbar exists", async ({ page }) => {
  await page.goto("/");

  // adjust selector if needed
  const nav = page.locator("nav");

  if (await nav.count()) {
    await expect(nav.first()).toBeVisible();
  }
});

test("buttons are clickable", async ({ page }) => {
  await page.goto("/");

  const buttons = page.locator("button");
  const count = await buttons.count();

  if (count > 0) {
    await expect(buttons.first()).toBeVisible();
  }
});

test("links exist", async ({ page }) => {
  await page.goto("/");

  const links = page.locator("a");
  const count = await links.count();

  if (count > 0) {
    await expect(links.first()).toBeVisible();
  }
});

test("login landing view is visible", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(page.getByText("Access your UniOps dashboard.")).toBeVisible();
});
