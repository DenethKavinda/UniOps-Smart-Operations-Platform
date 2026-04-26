// @ts-check
const { test, expect } = require('@playwright/test');

function apiSuccess(data, message = 'OK') {
  return { success: true, message, data };
}

function mockAssetsRoute(page, assetsByQuery) {
  return page.route('**://localhost:8081/api/assets**', async (route) => {
    const url = new URL(route.request().url());
    const q = (url.searchParams.get('q') || '').toLowerCase();

    const assets = typeof assetsByQuery === 'function'
      ? assetsByQuery(q)
      : (assetsByQuery[q] ?? assetsByQuery[''] ?? []);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(apiSuccess(assets, 'Assets loaded successfully.')),
    });
  });
}

function setUserStorage(page, user) {
  return page.addInitScript((u) => {
    window.localStorage.setItem('uniops_user', JSON.stringify(u));
  }, user);
}

test.describe('Facilities catalogue (Resources)', () => {
  test('shows resources list from API', async ({ page }) => {
    await setUserStorage(page, { name: 'Alice', email: 'alice@example.com', role: 'STUDENT' });

    await mockAssetsRoute(page, {
      '': [
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
        {
          id: 2,
          name: 'Computer Lab 1',
          type: 'LAB',
          capacity: 40,
          location: 'Block B',
          status: 'OUT_OF_SERVICE',
          availableNow: false,
          createdAt: '2026-01-02T10:00:00',
          availabilityWindows: [],
        },
      ],
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Resources' }).click();

    await expect(page.getByText('Facilities &')).toBeVisible();
    await expect(page.getByText('Lecture Hall A')).toBeVisible();
    await expect(page.getByText('Computer Lab 1')).toBeVisible();
  });

  test('filters resources by name', async ({ page }) => {
    await setUserStorage(page, { name: 'Alice', email: 'alice@example.com', role: 'STUDENT' });

    const allAssets = [
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
      {
        id: 2,
        name: 'Computer Lab 1',
        type: 'LAB',
        capacity: 40,
        location: 'Block B',
        status: 'ACTIVE',
        availableNow: true,
        createdAt: '2026-01-02T10:00:00',
        availabilityWindows: [],
      },
    ];

    await mockAssetsRoute(page, (q) => {
      if (!q) return allAssets;
      return allAssets.filter((a) => a.name.toLowerCase().includes(q));
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Resources' }).click();

    await page.getByPlaceholder('Search by name…').fill('Lab');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('Computer Lab 1')).toBeVisible();
    await expect(page.getByText('Lecture Hall A')).toHaveCount(0);
  });

  test('opens a resource detail panel', async ({ page }) => {
    await setUserStorage(page, { name: 'Alice', email: 'alice@example.com', role: 'STUDENT' });

    await mockAssetsRoute(page, {
      '': [
        {
          id: 10,
          name: 'Seminar Room 2',
          type: 'SEMINAR',
          capacity: 35,
          location: 'Block C',
          status: 'ACTIVE',
          availableNow: true,
          createdAt: '2026-01-03T10:00:00',
          availabilityWindows: [
            { id: 101, startAt: '2026-04-26T08:00:00', endAt: '2026-04-26T18:00:00' },
          ],
        },
      ],
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Resources' }).click();

    await page.getByText('Seminar Room 2').click();
    await expect(page.getByText('Availability windows', { exact: true })).toBeVisible();
    await expect(page.getByText('🕐')).toBeVisible();

    await page.getByRole('button', { name: '×' }).click();
    await expect(page.getByText('Availability windows', { exact: true })).toHaveCount(0);
  });
});
