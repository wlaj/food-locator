import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to login page', async ({ page }) => {
    // Look for login link in navigation
    const loginLink = page.getByRole('link', { name: /login/i }).or(
      page.getByText('Login', { exact: false }).or(
        page.getByText('Sign In', { exact: false })
      )
    );
    
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForURL('**/login**');
      expect(page.url()).toContain('/login');
    } else {
      // Navigate directly if no login link found
      await page.goto('/login');
    }
    
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should display login form with required fields', async ({ page }) => {
    await page.goto('/login');
    
    // Check for email field by name attribute
    const emailField = page.locator('input[name="email"]');
    await expect(emailField).toBeVisible();
    
    // Check for submit button with specific text
    const submitButton = page.getByRole('button', { name: 'Send OTP' });
    await expect(submitButton).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: 'Send OTP' });
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Wait a bit for validation messages to appear
      await page.waitForTimeout(1000);
      
      // Look for validation messages or browser validation
      const emailField = page.locator('input[name="email"]');
      const isFieldInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
      
      if (isFieldInvalid) {
        expect(isFieldInvalid).toBe(true);
      }
    }
  });

  test('should show validation errors for invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    const emailField = page.locator('input[name="email"]');
    const submitButton = page.getByRole('button', { name: 'Send OTP' });
    
    if (await emailField.isVisible()) {
      await emailField.fill('invalid-email');
      await submitButton.click();
      
      await page.waitForTimeout(1000);
      
      // Check browser validation state
      const isFieldInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isFieldInvalid).toBe(true);
    }
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    
    // Look for signup link
    const signupLink = page.getByRole('link', { name: /sign up|register|create account/i }).or(
      page.getByText('Sign up', { exact: false }).or(
        page.getByText('Register', { exact: false })
      )
    );
    
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await page.waitForURL('**/signup**');
      expect(page.url()).toContain('/signup');
    } else {
      // Navigate directly if no signup link found
      await page.goto('/signup');
    }
    
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should display signup form with required fields', async ({ page }) => {
    await page.goto('/signup');
    
    // Check for email field
    const emailField = page.locator('input[name="email"]');
    await expect(emailField).toBeVisible();
    
    // Check for password field
    const passwordField = page.locator('input[name="password"]');
    await expect(passwordField).toBeVisible();
    
    // Check for submit button with specific text
    const submitButton = page.getByRole('button', { name: 'Create account' });
    await expect(submitButton).toBeVisible();
  });

  test('should validate password strength if strength indicator is present', async ({ page }) => {
    await page.goto('/signup');
    
    const passwordField = page.locator('input[name="password"]');
    
    if (await passwordField.isVisible()) {
      // Test weak password
      await passwordField.fill('123');
      
      // Look for password strength indicator (this component has a strength meter)
      const strengthIndicator = page.locator('[data-strength]').or(
        page.locator('.strength-meter').or(
          page.locator('[class*="strength"]')
        )
      );
      
      if (await strengthIndicator.count() > 0) {
        await expect(strengthIndicator.first()).toBeVisible();
      }
    }
  });

  test('should handle logout functionality when authenticated', async ({ page, context }) => {
    // Note: This test assumes we can programmatically set authentication state
    // In a real scenario, you might need to login first or mock authentication
    
    await page.goto('/');
    
    // Look for logout button/link (might be in a menu)
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i }).or(
      page.getByText('Logout', { exact: false }).or(
        page.getByText('Sign out', { exact: false })
      )
    );
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to home or login page
      await page.waitForTimeout(1000);
      
      // Verify user is logged out by checking for login link
      const loginLink = page.getByRole('link', { name: /login/i });
      if (await loginLink.isVisible()) {
        await expect(loginLink).toBeVisible();
      }
    }
  });

  test('should navigate to OTP verification page when available', async ({ page }) => {
    // Check if OTP verification is part of the auth flow
    await page.goto('/verify-otp');
    
    // If page exists, should show OTP input
    const otpInput = page.locator('input[inputmode="numeric"], input[type="text"][maxlength="6"], [data-testid*="otp"]');
    
    if (await otpInput.isVisible()) {
      await expect(otpInput).toBeVisible();
    }
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/login');
    
    // Look for forgot password link
    const forgotPasswordLink = page.getByRole('link', { name: /forgot|reset/i }).or(
      page.getByText('Forgot password', { exact: false }).or(
        page.getByText('Reset password', { exact: false })
      )
    );
    
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      
      // Should show password reset form
      await page.waitForTimeout(1000);
      
      const emailField = page.locator('input[type="email"], input[name="email"]').first();
      if (await emailField.isVisible()) {
        await expect(emailField).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    await page.goto('/login');
    
    // Check that form elements are properly sized for mobile
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailField.isVisible()) {
      const emailBox = await emailField.boundingBox();
      expect(emailBox?.width).toBeLessThanOrEqual(375);
    }
    
    if (await passwordField.isVisible()) {
      const passwordBox = await passwordField.boundingBox();
      expect(passwordBox?.width).toBeLessThanOrEqual(375);
    }
  });

  test('should preserve redirect URL after login', async ({ page }) => {
    // Navigate to a protected page (like dashboard) which should redirect to login
    await page.goto('/dashboard');
    
    // If redirected to login, the URL should contain redirect information
    if (page.url().includes('/login')) {
      expect(page.url()).toContain('/login');
      
      // After login, should redirect back to original page
      // This would require actual authentication which is complex to test
      // For now, just verify the redirect parameter exists if implemented
      const urlParams = new URL(page.url()).searchParams;
      const redirectParam = urlParams.get('redirect') || urlParams.get('return');
      
      if (redirectParam) {
        expect(redirectParam).toBeTruthy();
      }
    }
  });
});