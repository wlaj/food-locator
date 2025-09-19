import { test, expect } from '@playwright/test';

test.describe('Restaurant Search & Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display home page with restaurant gallery', async ({ page }) => {
    await expect(page).toHaveTitle(/Food Locator/);
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if restaurant gallery is displayed by looking for the heading
    await expect(page.getByRole('heading', { name: 'Restaurants', exact: true })).toBeVisible();
  });

  test('should navigate to search page and display search results', async ({ page }) => {
    // Look for search input on homepage
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="restaurant" i]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('pizza');
      await searchInput.press('Enter');
    } else {
      // Navigate directly to search page with query
      await page.goto('/search?q=pizza');
    }

    // Wait for navigation and check URL
    await page.waitForURL('**/search**');
    expect(page.url()).toContain('search');
    
    // Verify search results page elements
    await expect(page.locator('h1')).toBeVisible();
    // Look for the specific search results text format
    await expect(page.getByText('Showing results for "pizza"', { exact: false })).toBeVisible();
  });

  test('should perform location-based search', async ({ page }) => {
    await page.goto('/search?q=*&location=New York');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('New York', { exact: false })).toBeVisible();
    
    // Check if map container is displayed (it could be loading state, no data, or actual map)
    // The map component renders different content based on state
    const mapContainerLoading = page.getByText('Loading map...');
    const mapContainerNoData = page.getByText('No restaurant locations available');
    const leafletContainer = page.locator('.leaflet-container');
    
    // At least one of these should be visible
    const hasMap = await leafletContainer.count() > 0;
    const hasLoading = await mapContainerLoading.count() > 0;
    const hasNoData = await mapContainerNoData.count() > 0;
    
    expect(hasMap || hasLoading || hasNoData).toBeTruthy();
  });

  test('should filter restaurants by dietary tags', async ({ page }) => {
    await page.goto('/search?q=*&tags=vegetarian');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('vegetarian', { exact: false })).toBeVisible();
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    await page.goto('/search?q=nonexistentrestaurant12345');
    
    await expect(page.locator('h1')).toBeVisible();
    // Should show "0" results in the heading
    const resultHeading = page.getByRole('heading', { name: 'Found 0 restaurants' });
    await expect(resultHeading).toBeVisible();
  });

  test('should display restaurant cards with essential information', async ({ page }) => {
    await page.goto('/search?q=*');
    
    // Wait for the search results to load by checking for the heading
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
    
    // Look for restaurant cards (they are Link elements with specific href pattern)
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    
    if (await restaurantLinks.count() > 0) {
      await expect(restaurantLinks.first()).toBeVisible();
      
      // Check for essential restaurant information in cards
      const cardText = await restaurantLinks.first().textContent();
      expect(cardText).toBeTruthy();
    } else {
      // If no restaurants, check for "0 results" or similar message
      const noResults = page.getByText(/0|no.*result/i);
      await expect(noResults).toBeVisible();
    }
  });

  test('should maintain search parameters in URL', async ({ page }) => {
    const searchParams = {
      q: 'italian',
      location: 'Brooklyn',
      tags: 'vegetarian,gluten-free'
    };
    
    const searchUrl = `/search?q=${searchParams.q}&location=${searchParams.location}&tags=${searchParams.tags}`;
    await page.goto(searchUrl);
    
    expect(page.url()).toContain('q=italian');
    expect(page.url()).toContain('location=Brooklyn');
    expect(page.url()).toContain('tags=vegetarian');
  });

  test('should handle search with special characters', async ({ page }) => {
    await page.goto('/search?q=caf%C3%A9'); // café encoded
    
    await expect(page.locator('h1')).toBeVisible();
    // Should not crash and should handle the search gracefully
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/search?q=pizza');
    
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if mobile header/navigation works
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });
});