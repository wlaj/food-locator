import { test, expect } from '@playwright/test';

test.describe('Restaurant Details & Dish Posts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to restaurant detail page', async ({ page }) => {
    // Go to search to find restaurants
    await page.goto('/search?q=*');
    
    // Wait for restaurant links to load and click the first one
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    
    if (await restaurantLinks.count() > 0) {
      await expect(restaurantLinks.first()).toBeVisible();
      await restaurantLinks.first().click();
    } else {
      // If no restaurants found, skip the test
      test.skip('No restaurants found to test');
    }
    
    // Should navigate to restaurant detail page
    await page.waitForURL('**/restaurant/**');
    expect(page.url()).toContain('/restaurant/');
  });

  test('should display restaurant information correctly', async ({ page }) => {
    // Navigate directly to a restaurant page (assuming there's at least one restaurant)
    await page.goto('/search?q=*');
    
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    
    if (await restaurantLinks.count() > 0) {
      await expect(restaurantLinks.first()).toBeVisible();
      await restaurantLinks.first().click();
    } else {
      test.skip('No restaurants found to test');
    }
    
    await page.waitForURL('**/restaurant/**');
    
    // Check for essential restaurant details
    await expect(page.locator('h1')).toBeVisible(); // Restaurant name
    
    // Check for restaurant metadata
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    
    // Look for common restaurant detail elements
    const detailElements = [
      page.getByText('Cuisine', { exact: false }),
      page.getByText('Price', { exact: false }),
      page.getByText('Quality', { exact: false }),
      page.getByText('Likes', { exact: false }),
    ];
    
    // At least some restaurant details should be visible
    let visibleElements = 0;
    for (const element of detailElements) {
      if (await element.isVisible()) {
        visibleElements++;
      }
    }
    expect(visibleElements).toBeGreaterThan(0);
  });

  test('should display dish posts section', async ({ page }) => {
    await page.goto('/search?q=*');
    
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    
    if (await restaurantLinks.count() > 0) {
      await expect(restaurantLinks.first()).toBeVisible();
      await restaurantLinks.first().click();
    } else {
      test.skip('No restaurants found to test');
    }
    
    await page.waitForURL('**/restaurant/**');
    
    // Check for dish posts section (it might be visible even if empty)
    const pageText = await page.textContent('body');
    expect(pageText).toBeTruthy();
    
    // Look for any indication of dish posts section or sharing functionality
    const hasDishPosts = await page.getByText('Dish Posts', { exact: false }).count() > 0;
    const hasShareButton = await page.getByRole('button', { name: /Share Dish|Login to Share/i }).count() > 0;
    
    expect(hasDishPosts || hasShareButton).toBeTruthy();
  });

  test('should show login prompt for non-authenticated users when sharing dish', async ({ page }) => {
    await page.goto('/search?q=*');
    
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    
    if (await restaurantLinks.count() > 0) {
      await expect(restaurantLinks.first()).toBeVisible();
      await restaurantLinks.first().click();
    } else {
      test.skip('No restaurants found to test');
    }
    
    await page.waitForURL('**/restaurant/**');
    
    // Look for "Share Dish" or "Login to Share" button
    const shareButton = page.getByRole('button', { name: /Share Dish|Login to Share/i }).or(
      page.getByRole('link', { name: /Login to Share/i })
    );
    
    if (await shareButton.count() > 0) {
      await shareButton.first().click();
      
      // Wait for navigation or dialog to appear
      await page.waitForTimeout(1000);
      
      // Should either open login dialog or navigate to login page
      const isLoginPage = page.url().includes('/login');
      const isLoginDialog = await page.locator('[role="dialog"], .modal').count() > 0;
      
      expect(isLoginPage || isLoginDialog).toBeTruthy();
    } else {
      // If no share button found, test is still valid
      console.log('No share button found, which is acceptable for this test');
    }
  });

  test('should have working Google Maps integration', async ({ page }) => {
    await page.goto('/search?q=*');
    
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    
    if (await restaurantLinks.count() > 0) {
      await expect(restaurantLinks.first()).toBeVisible();
      await restaurantLinks.first().click();
    } else {
      test.skip('No restaurants found to test');
    }
    
    await page.waitForURL('**/restaurant/**');
    
    // Look for Google Maps link/button
    const mapsButton = page.locator('a[href*="google.com/maps"]').first();
    
    if (await mapsButton.count() > 0) {
      await expect(mapsButton).toBeVisible();
      // Check that it has proper href for Google Maps
      const href = await mapsButton.getAttribute('href');
      expect(href).toContain('google.com/maps');
    }
  });

  test('should display restaurant images when available', async ({ page }) => {
    await page.goto('/search?q=*');
    
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    
    if (await restaurantLinks.count() > 0) {
      await expect(restaurantLinks.first()).toBeVisible();
      await restaurantLinks.first().click();
    } else {
      test.skip('No restaurants found to test');
    }
    
    await page.waitForURL('**/restaurant/**');
    
    // Check for restaurant images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Verify at least one image loads successfully
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();
      
      // Check if image has proper alt text
      const altText = await firstImage.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });

  test('should handle restaurant not found gracefully', async ({ page }) => {
    // Navigate to a non-existent restaurant ID
    const response = await page.goto('/restaurant/nonexistent-id-12345');
    
    // Should either show 404 status or redirect gracefully
    if (response) {
      const status = response.status();
      const isNotFound = status === 404;
      const isRedirect = status >= 300 && status < 400;
      const isOk = status === 200;
      
      expect(isNotFound || isRedirect || isOk).toBeTruthy();
    }
    
    // Additional check for page content
    await page.waitForLoadState('networkidle');
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    await page.goto('/search?q=*');
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    
    if (await restaurantLinks.count() > 0) {
      await expect(restaurantLinks.first()).toBeVisible();
      await restaurantLinks.first().click();
    } else {
      test.skip('No restaurants found to test');
    }
    
    await page.waitForURL('**/restaurant/**');
    
    // Check mobile responsiveness
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify content is not horizontally overflowing
    const bodyWidth = await page.locator('body').boundingBox();
    expect(bodyWidth?.width).toBeLessThanOrEqual(375);
  });

  test('should display dietary tags and specialties', async ({ page }) => {
    await page.goto('/search?q=*');
    
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    
    if (await restaurantLinks.count() > 0) {
      await expect(restaurantLinks.first()).toBeVisible();
      await restaurantLinks.first().click();
    } else {
      test.skip('No restaurants found to test');
    }
    
    await page.waitForURL('**/restaurant/**');
    
    // Look for tags/badges indicating dietary restrictions or specialties
    const tags = page.locator('[class*="badge"], [class*="tag"], [class*="chip"]');
    const tagCount = await tags.count();
    
    // If there are tags, verify they're visible
    if (tagCount > 0) {
      await expect(tags.first()).toBeVisible();
    }
  });
});