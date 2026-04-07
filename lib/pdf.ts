import puppeteer from 'puppeteer';

export async function generatePDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Set HTML content and wait for fonts to load
  await page.setContent(html, { 
    waitUntil: 'networkidle0',
    timeout: 30000 
  });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    },
    preferCSSPageSize: true
  });

  await browser.close();
  // Casting to Buffer for older node environments if needed, but Unit8Array/Buffer works globally here
  return Buffer.from(pdf);
}
