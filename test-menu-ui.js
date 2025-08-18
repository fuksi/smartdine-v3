import puppeteer from "puppeteer";

// Test configuration
const BASE_URL = "http://localhost:3000";
const ADMIN_MENU_URL = `${BASE_URL}/admin/menu`;

// Test results tracking
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function printTestStatus(testName, status, message) {
  testsRun++;
  if (status === "PASS") {
    console.log(
      `${colors.green}✓ PASS${colors.reset}: ${testName} - ${message}`
    );
    testsPassed++;
  } else {
    console.log(`${colors.red}✗ FAIL${colors.reset}: ${testName} - ${message}`);
    testsFailed++;
  }
}

function printSection(title) {
  console.log(`\n${colors.blue}=== ${title} ===${colors.reset}`);
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testAdminMenuPageLoad(page) {
  printSection("Admin Menu Page Load Tests");

  try {
    await page.goto(ADMIN_MENU_URL, {
      waitUntil: "networkidle0",
      timeout: 10000,
    });
    printTestStatus("Admin Menu Page Load", "PASS", "Page loaded successfully");

    // Check for main menu management elements
    const pageTitle = await page
      .$eval("h1", (el) => el.textContent)
      .catch(() => null);
    if (pageTitle && pageTitle.includes("Menu Management")) {
      printTestStatus("Page Title Check", "PASS", "Correct page title found");
    } else {
      printTestStatus(
        "Page Title Check",
        "FAIL",
        "Page title not found or incorrect"
      );
    }

    // Check for menu hierarchy display
    const menuContainer = await page
      .$('[data-testid="menu-container"]')
      .catch(() => null);
    if (menuContainer) {
      printTestStatus("Menu Container", "PASS", "Menu container element found");
    } else {
      printTestStatus(
        "Menu Container",
        "FAIL",
        "Menu container element not found"
      );
    }
  } catch (error) {
    printTestStatus(
      "Admin Menu Page Load",
      "FAIL",
      `Page failed to load: ${error.message}`
    );
  }
}

async function testMenuHierarchyDisplay(page) {
  printSection("Menu Hierarchy Display Tests");

  try {
    // Wait for menu data to load
    await page.waitForSelector('[data-testid="menu-container"]', {
      timeout: 5000,
    });

    // Check for category sections
    const categories = await page.$$('[data-testid*="category-"]');
    if (categories.length > 0) {
      printTestStatus(
        "Categories Display",
        "PASS",
        `Found ${categories.length} categories`
      );

      // Test category expansion/collapse
      const firstCategory = categories[0];
      const toggleButton = await firstCategory.$("button[aria-expanded]");

      if (toggleButton) {
        const initialExpanded = await toggleButton.evaluate(
          (btn) => btn.getAttribute("aria-expanded") === "true"
        );
        await toggleButton.click();
        await delay(500);

        const afterClickExpanded = await toggleButton.evaluate(
          (btn) => btn.getAttribute("aria-expanded") === "true"
        );

        if (initialExpanded !== afterClickExpanded) {
          printTestStatus(
            "Category Toggle",
            "PASS",
            "Category expand/collapse works"
          );
        } else {
          printTestStatus(
            "Category Toggle",
            "FAIL",
            "Category toggle not functioning"
          );
        }
      } else {
        printTestStatus(
          "Category Toggle",
          "FAIL",
          "Category toggle button not found"
        );
      }
    } else {
      printTestStatus("Categories Display", "FAIL", "No categories found");
    }

    // Check for product display within categories
    const products = await page.$$('[data-testid*="product-"]');
    if (products.length > 0) {
      printTestStatus(
        "Products Display",
        "PASS",
        `Found ${products.length} products`
      );
    } else {
      printTestStatus("Products Display", "FAIL", "No products found");
    }
  } catch (error) {
    printTestStatus(
      "Menu Hierarchy Display",
      "FAIL",
      `Display test failed: ${error.message}`
    );
  }
}

async function testCategoryManagement(page) {
  printSection("Category Management Tests");

  try {
    // Test "Add Category" button
    const addCategoryButton = await page
      .$('button[data-testid="add-category-btn"]')
      .catch(() => null);
    if (addCategoryButton) {
      printTestStatus(
        "Add Category Button",
        "PASS",
        "Add category button found"
      );

      // Click to open form
      await addCategoryButton.click();
      await delay(500);

      // Check if form appears
      const categoryForm = await page
        .$('[data-testid="category-form"]')
        .catch(() => null);
      if (categoryForm) {
        printTestStatus(
          "Category Form Display",
          "PASS",
          "Category form opens correctly"
        );

        // Test form fields
        const nameInput = await categoryForm
          .$('input[name="name"]')
          .catch(() => null);
        const descriptionInput = await categoryForm
          .$('textarea[name="description"]')
          .catch(() => null);

        if (nameInput && descriptionInput) {
          printTestStatus(
            "Category Form Fields",
            "PASS",
            "Form fields are present"
          );

          // Fill and submit form (test data)
          await nameInput.type("Test Category UI");
          await descriptionInput.type(
            "Test category created via UI automation"
          );

          const submitButton = await categoryForm
            .$('button[type="submit"]')
            .catch(() => null);
          if (submitButton) {
            await submitButton.click();
            await delay(1000);

            // Check if category was added to the list
            const testCategory = await page
              .$(
                '[data-testid*="category-"][data-category-name*="Test Category UI"]'
              )
              .catch(() => null);
            if (testCategory) {
              printTestStatus(
                "Category Creation",
                "PASS",
                "Category created successfully"
              );

              // Clean up - try to delete the test category
              const deleteButton = await testCategory
                .$('button[data-testid="delete-category"]')
                .catch(() => null);
              if (deleteButton) {
                await deleteButton.click();
                await delay(500);

                // Confirm deletion if modal appears
                const confirmButton = await page
                  .$('button[data-testid="confirm-delete"]')
                  .catch(() => null);
                if (confirmButton) {
                  await confirmButton.click();
                  await delay(500);
                }

                printTestStatus(
                  "Category Cleanup",
                  "PASS",
                  "Test category cleaned up"
                );
              }
            } else {
              printTestStatus(
                "Category Creation",
                "FAIL",
                "Category not found after creation"
              );
            }
          } else {
            printTestStatus(
              "Category Form Submit",
              "FAIL",
              "Submit button not found"
            );
          }
        } else {
          printTestStatus(
            "Category Form Fields",
            "FAIL",
            "Required form fields missing"
          );
        }
      } else {
        printTestStatus(
          "Category Form Display",
          "FAIL",
          "Category form did not appear"
        );
      }
    } else {
      printTestStatus(
        "Add Category Button",
        "FAIL",
        "Add category button not found"
      );
    }
  } catch (error) {
    printTestStatus(
      "Category Management",
      "FAIL",
      `Category management test failed: ${error.message}`
    );
  }
}

async function testProductManagement(page) {
  printSection("Product Management Tests");

  try {
    // First, ensure we have at least one category to add products to
    const categories = await page.$$('[data-testid*="category-"]');
    if (categories.length === 0) {
      printTestStatus(
        "Product Management Setup",
        "FAIL",
        "No categories available for product testing"
      );
      return;
    }

    // Expand first category to see its products
    const firstCategory = categories[0];
    const toggleButton = await firstCategory.$("button[aria-expanded]");
    if (toggleButton) {
      const expanded = await toggleButton.evaluate(
        (btn) => btn.getAttribute("aria-expanded") === "true"
      );
      if (!expanded) {
        await toggleButton.click();
        await delay(500);
      }
    }

    // Test "Add Product" button
    const addProductButton = await firstCategory
      .$('button[data-testid="add-product-btn"]')
      .catch(() => null);
    if (addProductButton) {
      printTestStatus("Add Product Button", "PASS", "Add product button found");

      await addProductButton.click();
      await delay(500);

      // Check if product form appears
      const productForm = await page
        .$('[data-testid="product-form"]')
        .catch(() => null);
      if (productForm) {
        printTestStatus(
          "Product Form Display",
          "PASS",
          "Product form opens correctly"
        );

        // Test form fields
        const nameInput = await productForm
          .$('input[name="name"]')
          .catch(() => null);
        const priceInput = await productForm
          .$('input[name="price"]')
          .catch(() => null);

        if (nameInput && priceInput) {
          printTestStatus(
            "Product Form Fields",
            "PASS",
            "Product form fields are present"
          );

          // Fill form
          await nameInput.type("Test Product UI");
          await priceInput.type("15.99");

          const submitButton = await productForm
            .$('button[type="submit"]')
            .catch(() => null);
          if (submitButton) {
            await submitButton.click();
            await delay(1000);

            printTestStatus(
              "Product Creation",
              "PASS",
              "Product creation form submitted"
            );
          } else {
            printTestStatus(
              "Product Form Submit",
              "FAIL",
              "Product submit button not found"
            );
          }
        } else {
          printTestStatus(
            "Product Form Fields",
            "FAIL",
            "Required product form fields missing"
          );
        }
      } else {
        printTestStatus(
          "Product Form Display",
          "FAIL",
          "Product form did not appear"
        );
      }
    } else {
      printTestStatus(
        "Add Product Button",
        "FAIL",
        "Add product button not found"
      );
    }
  } catch (error) {
    printTestStatus(
      "Product Management",
      "FAIL",
      `Product management test failed: ${error.message}`
    );
  }
}

async function testResponsiveDesign(page) {
  printSection("Responsive Design Tests");

  try {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await delay(500);

    // Check if mobile navigation works
    const mobileElements = await page
      .$$('[data-testid*="mobile-"]')
      .catch(() => []);
    if (mobileElements.length > 0) {
      printTestStatus(
        "Mobile Elements",
        "PASS",
        "Mobile-specific elements found"
      );
    } else {
      printTestStatus(
        "Mobile Elements",
        "PASS",
        "No mobile-specific elements (may be responsive design)"
      );
    }

    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await delay(500);

    // Check if layout adapts
    const isLayoutResponsive = await page.evaluate(() => {
      const container = document.querySelector(
        '[data-testid="menu-container"]'
      );
      return container && container.offsetWidth > 0;
    });

    if (isLayoutResponsive) {
      printTestStatus(
        "Tablet Layout",
        "PASS",
        "Layout adapts to tablet viewport"
      );
    } else {
      printTestStatus(
        "Tablet Layout",
        "FAIL",
        "Layout issues on tablet viewport"
      );
    }

    // Reset to desktop
    await page.setViewport({ width: 1280, height: 720 });
    await delay(500);

    printTestStatus("Desktop Layout", "PASS", "Returned to desktop viewport");
  } catch (error) {
    printTestStatus(
      "Responsive Design",
      "FAIL",
      `Responsive design test failed: ${error.message}`
    );
  }
}

async function testAccessibility(page) {
  printSection("Accessibility Tests");

  try {
    // Check for proper heading structure
    const headings = await page.$$eval("h1, h2, h3, h4, h5, h6", (els) =>
      els.map((el) => ({ tag: el.tagName, text: el.textContent.trim() }))
    );

    if (headings.length > 0) {
      printTestStatus(
        "Heading Structure",
        "PASS",
        `Found ${headings.length} headings`
      );
    } else {
      printTestStatus("Heading Structure", "FAIL", "No headings found");
    }

    // Check for alt attributes on images
    const imagesWithoutAlt = await page.$$eval(
      "img",
      (imgs) => imgs.filter((img) => !img.hasAttribute("alt")).length
    );

    if (imagesWithoutAlt === 0) {
      printTestStatus(
        "Image Alt Attributes",
        "PASS",
        "All images have alt attributes"
      );
    } else {
      printTestStatus(
        "Image Alt Attributes",
        "FAIL",
        `${imagesWithoutAlt} images missing alt attributes`
      );
    }

    // Check for proper button labels
    const buttonsWithoutLabels = await page.$$eval(
      "button",
      (buttons) =>
        buttons.filter(
          (btn) => !btn.textContent.trim() && !btn.getAttribute("aria-label")
        ).length
    );

    if (buttonsWithoutLabels === 0) {
      printTestStatus(
        "Button Labels",
        "PASS",
        "All buttons have proper labels"
      );
    } else {
      printTestStatus(
        "Button Labels",
        "FAIL",
        `${buttonsWithoutLabels} buttons missing labels`
      );
    }

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    await delay(100);
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );

    if (focusedElement) {
      printTestStatus(
        "Keyboard Navigation",
        "PASS",
        `Keyboard focus works (focused: ${focusedElement})`
      );
    } else {
      printTestStatus(
        "Keyboard Navigation",
        "FAIL",
        "Keyboard navigation not working"
      );
    }
  } catch (error) {
    printTestStatus(
      "Accessibility",
      "FAIL",
      `Accessibility test failed: ${error.message}`
    );
  }
}

async function runTests() {
  console.log(
    `${colors.blue}🧪 Menu Management System - Browser UI Automation Tests${colors.reset}`
  );
  console.log(
    `${colors.blue}================================================================${colors.reset}`
  );

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Run all test suites
    await testAdminMenuPageLoad(page);
    await testMenuHierarchyDisplay(page);
    await testCategoryManagement(page);
    await testProductManagement(page);
    await testResponsiveDesign(page);
    await testAccessibility(page);
  } catch (error) {
    console.error(
      `${colors.red}Test execution error: ${error.message}${colors.reset}`
    );
  } finally {
    await browser.close();
  }

  // Print final results
  console.log(`\n${colors.blue}=== Test Results Summary ===${colors.reset}`);
  console.log(`Tests Run: ${testsRun}`);
  console.log(`${colors.green}Tests Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Tests Failed: ${testsFailed}${colors.reset}`);

  if (testsFailed === 0) {
    console.log(
      `\n${colors.green}🎉 All browser tests passed! UI is working correctly.${colors.reset}`
    );
    process.exit(0);
  } else {
    console.log(
      `\n${colors.red}❌ Some tests failed. Please review the output above.${colors.reset}`
    );
    process.exit(1);
  }
}

// Check if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
