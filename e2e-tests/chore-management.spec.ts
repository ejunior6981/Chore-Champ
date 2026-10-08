import { test, expect } from '@playwright/test';

test.describe('Chore Management End-to-End Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2:has-text("Required Chores")')).toBeVisible();
  });

  test('parent can add a chore and verify it appears in the list', async ({ page }) => {
    // Open the Add Chore modal (footer button)
    await page.locator('footer').getByRole('button', { name: 'Add Chore' }).click();
    
    // Fill in the chore form with unique values
    await page.getByPlaceholder('Chore name').fill('Wash the dishes');
    await page.getByPlaceholder('Description (optional)').fill('After dinner cleanup');
    await page.getByPlaceholder('Points').fill('35');
    
    // Assign to Alex (the first child)
    await page.locator('#assignTo').selectOption({ label: 'Alex' });
    
    // Set recurrence to Daily
    await page.locator('#recurrence').selectOption({ label: 'Daily' });
    
    // Submit the form (modal button)
    await page.getByRole('button', { name: 'Add Chore' }).last().click();
    
    // Verify the chore heading was added to the list
    await expect(page.getByRole('heading', { name: 'Wash the dishes' })).toBeVisible();
    
    // Verify unique points value is displayed
    await expect(page.getByText('35 Points')).toBeVisible();
  });

  test('parent can complete a chore and verify status change', async ({ page }) => {
    // "Help with dinner" is unassigned, so parent sees "Mark as Done" button
    const choreCard = page.locator('div.rounded-xl:has(> div h3:text("Help with dinner"))').first();
    await expect(choreCard).toBeVisible();
    
    // Click "Mark as Done" button within that chore card
    await choreCard.getByRole('button', { name: 'Mark as Done' }).click();
    
    // Since this chore does NOT require approval, it should be completed directly
    await expect(choreCard.getByText('Done!')).toBeVisible();
  });

  test('parent can add a family member', async ({ page }) => {
    // Navigate to Family view
    await page.getByRole('button', { name: 'Family' }).click();
    
    // Wait for Family view to load
    await expect(page.locator('h2:has-text("Manage Family")')).toBeVisible();
    
    // Click Add Member button
    await page.getByRole('button', { name: 'Add Member' }).click();
    
    // Fill in the user form
    await page.getByPlaceholder('Name').fill('Child 4');
    
    // Select child role (should be default)
    await page.locator('#userRole').selectOption({ value: 'child' });
    
    // Enter a PIN
    await page.locator('#userPIN').fill('4321');
    
    // Submit the form
    await page.getByRole('button', { name: 'Add Member', exact: true }).last().click();
    
    // Verify the new member was added
    await expect(page.getByText('Child 4')).toBeVisible();
  });

  test('parent can view activity log', async ({ page }) => {
    // Navigate to Activity Log view
    await page.getByRole('button', { name: 'Activity Log' }).click();
    
    // Wait for Activity Log view to load (shows filter buttons)
    await expect(page.getByRole('button', { name: 'All Children' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'All Events' })).toBeVisible();
  });

  test('parent can add a bonus extra chore', async ({ page }) => {
    // Open the Add Chore modal (footer button)
    await page.locator('footer').getByRole('button', { name: 'Add Chore' }).click();
    
    // Fill in the chore form
    await page.getByPlaceholder('Chore name').fill('Wash the car');
    await page.getByPlaceholder('Points').fill('50');
    
    // Check the Extra Chore checkbox
    await page.locator('#isExtraChore').check();
    
    // Submit the form (modal button)
    await page.getByRole('button', { name: 'Add Chore' }).last().click();
    
    // Verify the chore heading appears in the Extra Chores section
    await expect(page.getByRole('heading', { name: 'Wash the car' })).toBeVisible();
    
    // Verify the Extra Chore badge is visible
    await expect(page.getByText('Extra Chore', { exact: true })).toBeVisible();
  });
});
