// tests/realtime.spec.ts
// tests/realtime.spec.ts

import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:5174';

test('Realtime shopping list sync', async ({ browser }) => {
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    // Debug: Log console output from browsers
    pageA.on('console', msg => console.log('PAGE A:', msg.text()));
    pageB.on('console', msg => console.log('PAGE B:', msg.text()));

    // Create a new list via API
    const createResponse = await pageA.request.post(`${baseUrl}/api/list`, {});
    expect(createResponse.ok()).toBeTruthy();
    const { listId } = await createResponse.json();
    expect(listId).toBeTruthy();

    // Open the list page in both contexts
    await pageA.goto(`${baseUrl}/list/${listId}`);
    await pageB.goto(`${baseUrl}/list/${listId}`);

    // Add an item via API from context A
    const addResponse = await pageA.request.post(`${baseUrl}/api/list/${listId}/items`, {
        data: { text: 'Milk' }
    });
    expect(addResponse.ok()).toBeTruthy();
    const addedItem = await addResponse.json();
    expect(addedItem.text).toBe('Milk');

    // Wait for the item to appear in context B UI
    const itemLocator = pageB.locator(`text=${addedItem.text}`).first();
    await itemLocator.waitFor({ state: 'visible', timeout: 10000 });
    await expect(itemLocator).toBeVisible();

    // Toggle the item via API from context B
    const toggleResponse = await pageB.request.patch(`${baseUrl}/api/list/${listId}/items?itemId=${addedItem.id}`);
    expect(toggleResponse.ok()).toBeTruthy();
    const toggledItem = await toggleResponse.json();
    expect(toggledItem.completed).toBe(true);

    // Verify the item is marked completed in context A UI
    const checkbox = pageA.locator(`input[data-item-id="${addedItem.id}"]`).first();
    await expect(checkbox).toBeChecked({ timeout: 10000 });
});
