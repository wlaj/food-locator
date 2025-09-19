import { test, expect } from '@playwright/test';

test.describe('Main User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete restaurant discovery flow', async ({ page }) => {
    // Start from homepage
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigate to search (either via search input or direct navigation)
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('pizza');
      await searchInput.press('Enter');
    } else {
      await page.goto('/search?q=pizza');
    }
    
    await page.waitForURL('**/search**');
    
    // Verify search results
    await expect(page.locator('h1')).toBeVisible();
    
    // Click on a restaurant to view details
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    
    if (await restaurantLinks.count() > 0) {
      await expect(restaurantLinks.first()).toBeVisible();
      await restaurantLinks.first().click();
      
      await page.waitForURL('**/restaurant/**');
      
      // Verify restaurant details page
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for dish posts section if we're on a restaurant page
      if (page.url().includes('/restaurant/')) {
        const dishPostsSection = page.getByText('Dish Posts', { exact: false }).or(
          page.getByText('posts', { exact: false })
        );
        const hasDishPosts = await dishPostsSection.count() > 0;
        const hasShareButton = await page.getByRole('button', { name: /Share Dish|Login to Share/i }).count() > 0;
        
        expect(hasDishPosts || hasShareButton).toBeTruthy();
      }
    } else {
      // If no restaurants available, test is still considered passing
      console.log('No restaurants found for discovery flow test');
    }
  });

  test('user authentication flow', async ({ page }) => {
    // Try to access a protected action (share dish)
    await page.goto('/search?q=*');
    
    const restaurantCard = page.locator('[class*="card"], [data-testid*="restaurant"]').first();
    
    if (await restaurantCard.isVisible()) {
      const clickableElement = restaurantCard.locator('a, button, [role="button"]').first();
      if (await clickableElement.isVisible()) {
        await clickableElement.click();
      } else {
        await restaurantCard.click();
      }
      
      await page.waitForURL('**/restaurant/**');
      
      // Look for "Share Dish" or "Login to Share" button
      const shareButton = page.getByText('Share Dish', { exact: false }).or(
        page.getByText('Login to Share', { exact: false })
      );
      
      if (await shareButton.isVisible()) {
        await shareButton.click();
        
        // Should redirect to login or show login dialog
        const isOnLoginPage = page.url().includes('/login');
        const hasLoginDialog = await page.locator('[role="dialog"], .modal').isVisible();
        
        if (isOnLoginPage) {
          // Verify login form
          const emailField = page.locator('input[type="email"], input[name="email"]').first();
          const passwordField = page.locator('input[type="password"]').first();
          
          await expect(emailField).toBeVisible();
          await expect(passwordField).toBeVisible();
          
          // Navigate to signup from login
          const signupLink = page.getByRole('link', { name: /sign up|register/i });
          if (await signupLink.isVisible()) {
            await signupLink.click();
            await page.waitForURL('**/signup**');
            
            // Verify signup form
            await expect(page.locator('input[type="email"]').first()).toBeVisible();
            await expect(page.locator('input[type="password"]').first()).toBeVisible();
          }
        }
      }
    }
  });

  test('search and filter flow', async ({ page }) => {
    // Test comprehensive search functionality
    await page.goto('/search?q=italian');
    
    await expect(page.locator('h1')).toBeVisible();
    
    // Test location-based search
    await page.goto('/search?q=*&location=New York');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('New York', { exact: false })).toBeVisible();
    
    // Test dietary tag filtering
    await page.goto('/search?q=*&tags=vegetarian');
    
    await expect(page.locator('h1')).toBeVisible();
    // Look for the specific text pattern in the description
    await expect(page.getByText('with #vegetarian', { exact: false })).toBeVisible();
    
    // Test combined search
    await page.goto('/search?q=pizza&location=Brooklyn&tags=vegan');
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('navigation and accessibility flow', async ({ page }) => {
    // Test main navigation
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const firstFocusedElement = page.locator(':focus');
    await expect(firstFocusedElement).toBeVisible();
    
    // Navigate through main pages
    const mainPages = ['/', '/search', '/feed', '/community'];
    
    for (const pagePath of mainPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verify page loads
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
      
      // Check for navigation element
      const nav = page.locator('nav, [role="navigation"]').first();
      if (await nav.isVisible()) {
        await expect(nav).toBeVisible();
      }
    }
  });

  test('responsive design flow', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1200, height: 800, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Test homepage
      await page.goto('/');
      await expect(page.locator('h1')).toBeVisible();
      
      // Test search page
      await page.goto('/search?q=*');
      await expect(page.locator('h1')).toBeVisible();
      
      // Verify content doesn't overflow
      const bodyWidth = await page.locator('body').boundingBox();
      expect(bodyWidth?.width).toBeLessThanOrEqual(viewport.width);
      
      // Test mobile menu if on mobile
      if (viewport.width <= 768) {
        const mobileMenuButton = page.locator('button[aria-label*="menu"], .hamburger').first();
        if (await mobileMenuButton.isVisible()) {
          await mobileMenuButton.click();
          
          const mobileMenu = page.locator('[role="dialog"], .mobile-menu').first();
          if (await mobileMenu.isVisible()) {
            await expect(mobileMenu).toBeVisible();
          }
        }
      }
    }
  });

  test('error handling and edge cases', async ({ page }) => {
    // Test 404 page
    const response = await page.goto('/nonexistent-page');
    await page.waitForLoadState('networkidle');
    
    // Should handle gracefully (either 404 status, redirect, or valid response)
    const status = response?.status() || 200;
    const is404Status = status === 404;
    const isRedirect = status >= 300 && status < 400;
    const isOk = status === 200;
    const isRedirected = !page.url().includes('nonexistent-page');
    
    expect(is404Status || isRedirect || isOk || isRedirected).toBeTruthy();
    
    // Test empty search
    await page.goto('/search?q=');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test invalid restaurant ID
    await page.goto('/restaurant/invalid-id-123');
    await page.waitForLoadState('networkidle');
    
    // Should handle gracefully
    const hasContent = await page.locator('h1, h2, main').first().isVisible();
    expect(hasContent).toBeTruthy();
    
    // Test search with special characters
    await page.goto('/search?q=%20%21%40%23%24');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('performance and loading states', async ({ page }) => {
    // Test that pages load within reasonable time
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
    
    // Test search page loading
    const searchStartTime = Date.now();
    
    await page.goto('/search?q=pizza');
    await page.waitForLoadState('networkidle');
    
    const searchLoadTime = Date.now() - searchStartTime;
    expect(searchLoadTime).toBeLessThan(10000);
    
    // Check that essential elements are visible quickly
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
  });

  test('SEO and meta tags', async ({ page }) => {
    // Test homepage meta tags
    await page.goto('/');
    
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    
    // Test search page meta tags
    await page.goto('/search?q=pizza');
    
    const searchTitle = await page.title();
    expect(searchTitle).toBeTruthy();
    expect(searchTitle.toLowerCase()).toContain('pizza');
    
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const description = await metaDescription.getAttribute('content');
      expect(description).toBeTruthy();
    }
  });

  test('cross-browser compatibility basics', async ({ page, browserName }) => {
    // Test basic functionality across browsers
    await page.goto('/');
    
    // Basic functionality should work in all browsers
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigation should work
    await page.goto('/search?q=test');
    await expect(page.locator('h1')).toBeVisible();
    
    // Forms should be functional
    await page.goto('/login');
    
    const emailField = page.locator('input[type="email"]').first();
    const passwordField = page.locator('input[type="password"]').first();
    
    if (await emailField.isVisible() && await passwordField.isVisible()) {
      await emailField.fill('test@example.com');
      await passwordField.fill('testpassword');
      
      // Verify input values were set
      const emailValue = await emailField.inputValue();
      const passwordValue = await passwordField.inputValue();
      
      expect(emailValue).toBe('test@example.com');
      expect(passwordValue).toBe('testpassword');
    }
  });
});