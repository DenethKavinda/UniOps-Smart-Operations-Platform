// @ts-check
const { test, expect } = require('@playwright/test');

function apiSuccess(data, message = 'OK') {
  return { success: true, message, data };
}

function setUserStorage(page, user) {
  return page.addInitScript((u) => {
    window.localStorage.setItem('uniops_user', JSON.stringify(u));
  }, user);
}

function makeDashboardFromAssets(assets) {
  return {
    totalUsers: 0,
    adminUsers: 0,
    studentUsers: 0,
    blockedUsers: 0,
    totalLogins: 0,

    bookingCount: 0,
    maintenanceCount: 0,
    assetCount: assets.length,

    users: [],
    roleStats: [],
    loginChart: [],
  };
}

/**
 * Mocks the backend API used by AdminDashboard asset management.
 * Keeps an in-memory list so create/edit/delete can be asserted in the UI.
 */
async function mockAdminAssetApi(page) {
  /** @type {any[]} */
  let assets = [
    {
      id: 1,
      name: 'Lecture Hall A',
      type: 'LECTURE_HALL',
      capacity: 120,
      location: 'Block A',
      status: 'ACTIVE',
      availableNow: true,
      createdAt: '2026-01-01T10:00:00',
      availabilityWindows: [],
    },
  ];

  const respondDashboard = async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(apiSuccess(makeDashboardFromAssets(assets), 'Dashboard loaded successfully.')),
    });
  };

  await page.route('**://localhost:8081/api/admin/dashboard', respondDashboard);

  await page.route('**://localhost:8081/api/admin/assets**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());

    if (req.method() === 'GET') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const filtered = q
        ? assets.filter((a) => String(a.name || '').toLowerCase().includes(q))
        : assets;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiSuccess(filtered, 'Assets loaded successfully.')),
      });
      return;
    }

    if (req.method() === 'POST') {
      const body = req.postDataJSON();
      const nextId = Math.max(0, ...assets.map((a) => a.id)) + 1;
      const createdAt = new Date().toISOString().slice(0, 19);
      const newAsset = {
        id: nextId,
        name: body.name,
        type: body.type,
        capacity: body.capacity,
        location: body.location,
        status: body.status,
        availableNow: body.status === 'ACTIVE',
        createdAt,
        availabilityWindows: body.availabilityWindows || [],
      };
      assets = [newAsset, ...assets];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiSuccess(newAsset, 'Asset created successfully.')),
      });
      return;
    }

    if (req.method() === 'PUT') {
      const id = Number(url.pathname.split('/').pop());
      const body = req.postDataJSON();
      assets = assets.map((a) =>
        a.id === id
          ? {
              ...a,
              name: body.name,
              type: body.type,
              capacity: body.capacity,
              location: body.location,
              status: body.status,
              availableNow: body.status === 'ACTIVE',
              availabilityWindows: body.availabilityWindows || [],
            }
          : a
      );

      const updated = assets.find((a) => a.id === id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiSuccess(updated, 'Asset updated successfully.')),
      });
      return;
    }

    if (req.method() === 'DELETE') {
      const id = Number(url.pathname.split('/').pop());
      assets = assets.filter((a) => a.id !== id);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiSuccess(null, 'Asset deleted successfully.')),
      });
      return;
    }

    await route.fulfill({ status: 405, body: 'Method Not Allowed' });
  });

  return {
    /** useful for debugging */
    getAssets: () => assets,
  };
}

test.describe('Resource management (Admin Assets)', () => {
  test('admin can create, edit, and delete a resource', async ({ page }) => {
    await setUserStorage(page, { name: 'Admin', email: 'admin@example.com', role: 'ADMIN' });
    await mockAdminAssetApi(page);

    await page.goto('/');

    // open Assets section
    await page.getByRole('button', { name: /Assets/ }).click();
    await expect(page.getByText('Resource catalogue management')).toBeVisible();

    const assetsTable = page.locator('table').filter({ hasText: 'Actions' });

    // create
    await page.getByPlaceholder('Lecture Hall A').fill('Physics Lab 2');
    await page.getByPlaceholder('LECTURE_HALL / LAB / …').fill('LAB');
    await page.getByPlaceholder('0').fill('28');
    await page.getByPlaceholder('Block A – Level 1').fill('Block D');
    await page.getByRole('button', { name: 'Add resource' }).click();

    await expect(assetsTable.locator('tr', { hasText: 'Physics Lab 2' })).toBeVisible();

    // edit
    await page
      .locator('tr', { hasText: 'Physics Lab 2' })
      .getByRole('button', { name: 'Edit' })
      .click();

    await expect(page.getByText('Editing resource')).toBeVisible();
    await page.getByPlaceholder('Lecture Hall A').fill('Physics Lab 2 (Renovated)');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(assetsTable.locator('tr', { hasText: 'Physics Lab 2 (Renovated)' })).toBeVisible();

    // delete
    await page
      .locator('tr', { hasText: 'Physics Lab 2 (Renovated)' })
      .getByRole('button', { name: 'Delete' })
      .click();

    await expect(assetsTable.locator('tr', { hasText: 'Physics Lab 2 (Renovated)' })).toHaveCount(0);
  });
});
