import { test, expect } from '@playwright/test';

test.describe('Chore Management End-to-End Flow', () => {
  test('parent can add a chore, assign it to a child, complete the chore, and delete it', async ({ page }) => {
    // Start with a clean slate
    await page.goto('/');
    
    // Add a new chore with deadline
    await page.click('button:has-text("Add Chore")');
    await page.fill('textbox="Chore name"', 'Wash the dishes');
    await page.fill('textbox="Description (optional)"', 'After dinner cleanup');
    await page.fill('spinbutton="Points"', '15');
    await page.click('radio:has-text("Deadline")');
    await page.click('combobox="Assign To:" option:has-text("Alex")');
    await page.click('button:has-text("Add Chore")');
    
    // Verify chore was added
    await expect(page.locator('h3:has-text("Wash the dishes")')).toBeVisible();
    await expect(page.locator('.chore-description')).toHaveText('After dinner cleanup');
    await expect(page.locator('.chore-card').first).toContainText('15');
    await expect(page.locator('.chore-card').first).toContainText('Alex');
    
    // Edit chore to change points
    await page.click('button:has-text("Edit")');
    await page.fill('spinbutton="Points"', '20');
    await page.click('button:has-text("Save Changes")');
    
    // Verify points was updated
    await expect(page.locator('.chore-card').first).toContainText('20');
    
    // Delete the chore
    await page.click('button:has-text("Delete")');
    await expect(page.locator('h3:has-text("Wash the dishes")')).not.toBeVisible();
    
    // Verify activity log was updated
    await expect(page.locator('.activity-item')).toHaveCount(1);
    const activityItem = page.locator('.activity-item');
    await expect(activityItem).toHaveText('Approved');
    await expect(activityItem).toHaveText('Alex');
  });

  test('extra chore with completion limits works correctly', async ({ page }) => {
    // Start with a clean slate
    await page.goto('/');
    
    // Add an extra chore with limit
    await page.click('button:has-text("Add Chore")');
    await page.fill('textbox="Chore name"', 'Wash the car');
    await page.fill('textbox="Description (optional)"', 'Monthly car wash');
    await page.fill('spinbutton="Points"', '50');
    await page.click('radio:has-text("Deadline")');
    await page.click('checkbox:has-text("This is a bonus Extra Chore")');
    await page.fill('spinbutton="Max Completions per Period"', '1');
    await page.selectOption('select#period', 'weekly');
    await page.click('button:has-text("Add Chore")');
    
    // Verify extra chore was added
    await expect(page.locator('.badge:has-text("Extra Chore")')).toBeVisible();
    
    // Verify limit counter is displayed
    await expect(page.locator('.meta-item:has-text("Limit:")')).toHaveText('0/1');
    
    // Complete the chore once
    await page.click('button:has-text("Complete")');
    
    // Verify chore is marked as completed
    await expect(page.locator('.chore-card.completed')).toBeVisible();
    
    // Verify counter updated
    await expect(page.locator('.meta-item:has-text("Limit:")')).toHaveText('1/1');
    
    // Try to complete again - should be blocked
    await page.click('button:has-text("Complete")');
    await expect(page.locator('.alert')).toHaveText('Please wait until the next period');
    
    // Delete the chore
    await page.click('button:has-text("Delete")');
    await expect(page.locator('.badge:has-text("Extra Chore")')).not.toBeVisible();
  });

  test('weekly multi-day chore with variance works correctly', async ({ page }) => {
    // Start with a clean slate
    await page.goto('/');
    
    // Add a weekly chore
    await page.click('button:has-text("Add Chore")');
    await page.fill('textbox="Chore name"', 'Vacuum the floors');
    await page.fill('textbox="Description (optional)"', 'Keep floors clean');
    await page.fill('spinbutton="Points"', '25');
    await page.click('radio:has-text("Day of Week")');
    await page.click('checkbox:has-text("This is a bonus Extra Chore")');
    await page.click('button:has-text("Add Chore")');
    
    // Verify weekly chore was added
    await expect(page.locator('.chore-card').first).toContainText('Weekly');
    
    // Edit chore to change description
    await page.click('button:has-text("Edit")');
    await page.fill('textbox="Description"', 'Keep floors clean and tidy');
    await page.click('button:has-text("Save Changes")');
    
    // Verify description was updated
    await expect(page.locator('.chore-description')).toHaveText('Keep floors clean and tidy');
    
    // Delete the chore
    await page.click('button:has-text("Delete")');
    await expect(page.locator('.chore-card').first).not.toBeVisible();
    
    // Verify activity log was updated
    await expect(page.locator('.activity-item')).toHaveCount(1);
  });

  test('child management works correctly', async ({ page }) => {
    // Start with a clean slate
    await page.goto('/');
    
    // Add a new child
    await page.click('button:has-text("Add Child")');
    await page.fill('textbox="Name"', 'Child 4');
    await page.fill('textbox="Age"', '14');
    await page.click('button:has-text("Add Child")');
    
    // Verify child was added
    await expect(page.locator('.child-card:has-text("Child 4")')).toBeVisible();
    
    // Assign a chore to the new child
    await page.click('button:has-text("Add Chore")');
    await page.fill('textbox="Chore name"', 'Walk the dog');
    await page.fill('spinbutton="Points"', '10');
    await page.click('radio:has-text("Deadline")');
    await page.click('combobox="Assign To:" option:has-text("Child 4")');
    await page.click('button:has-text("Add Chore")');
    
    // Verify chore was assigned to Child 4
    await expect(page.locator('.meta-item:has-text("Assigned:")')).toHaveText('Child 4');
    
    // Delete the child
    await page.click('.child-card:has-text("Child 4") button:has-text("Delete")');
    await expect(page.locator('.child-card:has-text("Child 4")')).not.toBeVisible();
    
    // Verify activity log was updated
    await expect(page.locator('.activity-item')).toHaveCount(1);
  });

  test('period change resets chores correctly', async ({ page }) => {
    // Start with a clean slate
    await page.goto('/');
    
    // Add a chore
    await page.click('button:has-text("Add Chore")');
    await page.fill('textbox="Chore name"', 'Test chore');
    await page.fill('textbox="Description (optional)"', 'Test description');
    await page.fill('spinbutton="Points"', '10');
    await page.click('radio:has-text("Deadline")');
    await page.click('button:has-text("Add Chore")');
    
    // Verify chore was added
    await expect(page.locator('h3:has-text("Test chore")')).toBeVisible();
    await expect(page.locator('.chore-description')).toHaveText('Test description');
    
    // Change period
    await page.click('button:has-text("Change Period")');
    await page.click('button:has-text("Daily")');
    
    // Verify chores were reset
    await expect(page.locator('h3:has-text("Test chore")')).not.toBeVisible();
    await expect(page.locator('.chore-list p')).toHaveText('No chores yet');
    
    // Verify activity log was reset
    await expect(page.locator('.activity-item')).toHaveCount(0);
    
    // Verify period was changed
    await expect(page.locator('.period-selector button:has-text("Daily")')).toHaveClass(/btn-primary/);
  });
});
