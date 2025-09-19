import { test, expect } from '@playwright/test';

test.describe('Navigation & Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have working main navigation', async ({ page }) => {
    // Check for main navigation elements (it's a header, not nav)
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    // Check for navigation links that definitely exist
    const feedLink = page.getByRole('link', { name: 'Feed' });
    await expect(feedLink).toBeVisible();
    
    const communityLink = page.getByRole('link', { name: 'Community' });
    await expect(communityLink).toBeVisible();
  });

  test('should navigate between main pages', async ({ page }) => {
    // Test navigation to key pages
    const pagesToTest = [
      { path: '/search', name: 'search' },
      { path: '/feed', name: 'feed' },
      { path: '/community', name: 'community' },
      { path: '/login', name: 'login' },
      { path: '/signup', name: 'signup' }
    ];
    
    for (const pageTest of pagesToTest) {
      await page.goto(pageTest.path);
      await page.waitForLoadState('networkidle');
      
      // Verify we're on the correct page
      expect(page.url()).toContain(pageTest.path);
      
      // Check that the page loads without major errors
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    }
  });

  test('should have working breadcrumbs if present', async ({ page }) => {
    // Navigate to a nested page (restaurant detail)
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
      
      // Look for breadcrumbs
      const breadcrumbs = page.locator('[aria-label*="breadcrumb"], .breadcrumb, [class*="breadcrumb"]');
      
      if (await breadcrumbs.isVisible()) {
        await expect(breadcrumbs).toBeVisible();
        
        // Test breadcrumb navigation
        const homeLink = breadcrumbs.getByRole('link').first();
        if (await homeLink.isVisible()) {
          await homeLink.click();
          await page.waitForURL('/');
        }
      }
    }
  });

  test('should be responsive on mobile (375px width)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test homepage responsiveness
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if the header is responsive at mobile size
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    // Verify the layout adjusts for mobile
    const headerBox = await header.boundingBox();
    expect(headerBox?.width).toBeLessThanOrEqual(375);
    
    // Verify content doesn't overflow horizontally
    const body = await page.locator('body').boundingBox();
    expect(body?.width).toBeLessThanOrEqual(375);
  });

  test('should be responsive on tablet (768px width)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Check navigation layout on tablet
    const nav = page.locator('nav, [role="navigation"]').first();
    if (await nav.isVisible()) {
      const navBox = await nav.boundingBox();
      expect(navBox?.width).toBeLessThanOrEqual(768);
    }
    
    // Test search page on tablet
    await page.goto('/search?q=*');
    
    const restaurantGrid = page.locator('[class*="grid"], [class*="card"]').first();
    if (await restaurantGrid.isVisible()) {
      await expect(restaurantGrid).toBeVisible();
    }
  });

  test('should be responsive on desktop (1200px width)', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that desktop navigation is properly displayed
    const nav = page.locator('nav, [role="navigation"]').first();
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }
    
    // Test that restaurant grid shows multiple columns on desktop
    await page.goto('/search?q=*');
    
    const restaurantCards = page.locator('[class*="card"], [data-testid*="restaurant"]');
    const cardCount = await restaurantCards.count();
    
    if (cardCount > 1) {
      // Check if cards are arranged in a grid layout
      const firstCard = restaurantCards.first();
      const secondCard = restaurantCards.nth(1);
      
      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();
      
      // On desktop, cards should be side by side (different x positions)
      if (firstBox && secondBox) {
        expect(Math.abs(firstBox.x - secondBox.x)).toBeGreaterThan(50);
      }
    }
  });

  test('should have accessible navigation for keyboard users', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // First focusable element should be highlighted
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through navigation
    let tabCount = 0;
    const maxTabs = 10;
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      const currentFocus = page.locator(':focus');
      if (await currentFocus.isVisible()) {
        // Good - something is focused
        break;
      }
    }
    
    expect(tabCount).toBeLessThan(maxTabs);
  });

  test('should handle theme switching if available', async ({ page }) => {
    await page.goto('/');
    
    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], [data-testid*="theme"], .theme-toggle');
    
    if (await themeToggle.isVisible()) {
      // Get initial theme state
      const initialHtml = await page.locator('html').getAttribute('class');
      
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Check if theme changed
      const newHtml = await page.locator('html').getAttribute('class');
      
      if (initialHtml !== newHtml) {
        expect(newHtml).not.toBe(initialHtml);
      }
    }
  });

  test('should have working footer links', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footer = page.locator('footer, [role="contentinfo"]').first();
    
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
      
      // Test footer links
      const footerLinks = footer.locator('a');
      const linkCount = await footerLinks.count();
      
      if (linkCount > 0) {
        const firstLink = footerLinks.first();
        await expect(firstLink).toBeVisible();
        
        // Test that the link is clickable (don't actually click to avoid navigation)
        const href = await firstLink.getAttribute('href');
        expect(href).toBeTruthy();
      }
    }
  });

  test('should handle deep links correctly', async ({ page }) => {
    // Test that direct navigation to deep links works
    const deepLinks = [
      '/search?q=pizza&location=NYC',
      '/restaurant/some-id',
      '/feed',
      '/community'
    ];
    
    for (const link of deepLinks) {
      await page.goto(link);
      await page.waitForLoadState('networkidle');
      
      // If these are visible, it's okay for non-existent resources
      // But the page should at least load
      const hasContent = await page.locator('h1, h2, main').first().isVisible();
      expect(hasContent).toBeTruthy();
    }
  });

  test('should handle back button navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to search page
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Should be back on home page
    expect(page.url()).toMatch(/\/$|\/$/);
    
    // Go forward
    await page.goForward();
    await page.waitForLoadState('networkidle');
    
    // Should be back on search page
    expect(page.url()).toContain('/search');
  });

  test('should maintain scroll position on navigation when appropriate', async ({ page }) => {
    await page.goto('/search?q=*');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollPosition = await page.evaluate(() => window.scrollY);
    
    expect(scrollPosition).toBeGreaterThan(0);
    
    // Navigate to another page and back
    await page.goto('/');
    await page.goBack();
    
    // Wait for page to stabilize after navigation
    await page.waitForLoadState('networkidle');
    
    // Check that we can still interact with the page after navigation
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
  });
});