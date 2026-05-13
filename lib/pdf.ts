export async function generatePDF(html: string): Promise<Buffer> {
  const isProduction = process.env.NODE_ENV === 'production';
  let browser;

  if (isProduction) {
    // Vercel Serverless environment
    const chromium = (await import('@sparticuz/chromium')).default;
    const playwright = await import('playwright-core');
    
    browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    // Local environment (Docker or Turbopack)
    const { chromium } = await import('playwright');
    browser = await chromium.launch({
      headless: true,
    });
  }
  const page = await browser.newPage();

  // Set HTML content and wait for it to be fully rendered
  await page.setContent(html, { 
    waitUntil: 'networkidle',
  });

  // Generate PDF buffer
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    },
    preferCSSPageSize: true
  });

  await browser.close();
  // Playwright returns a Uint8Array; Buffer.from converts it for Node.js usage
  return Buffer.from(pdfBuffer);
}
