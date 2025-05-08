import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import tinycolor from "tinycolor2";

interface UXScore {
  contrastScore: number;
  clickableSpacingScore: number;
  underlinedLinksScore: number;
  fontSizeScore: number;
  mobileResponsiveScore: number;
  totalScore: number;
  issues: string[];
  contrastNotes: string[];
  fontSizeNotes: string[];
}

export async function POST(request: Request) {
  let browser;
  try {
    const { url } = await request.json();
    const issues: string[] = [];
    const contrastNotes: string[] = [];
    const fontSizeNotes: string[] = [];

    // Launch browser with specific settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set longer timeout and viewport
    await page.setDefaultNavigationTimeout(60000); // 60 seconds
    await page.setViewport({ width: 1920, height: 1080 });

    let navigationError = null;
    try {
      await page.goto(url, {
        waitUntil: ["domcontentloaded", "networkidle2"],
        timeout: 60000,
      });
    } catch (err) {
      navigationError = err;
    }

    if (navigationError) {
      await browser.close();
      return NextResponse.json(
        {
          success: false,
          error:
            "Siteye erişilemiyor veya URL hatalı. Lütfen adresi kontrol edin.",
        },
        { status: 400 }
      );
    }

    // Wait for a bit to ensure page is fully loaded
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get page meta
    const meta = await page.evaluate(() => {
      const title = document.title;
      const description =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "";
      const favicon =
        document.querySelector('link[rel~="icon"]')?.getAttribute("href") || "";
      return { title, description, favicon };
    });

    const desktopScreenshot = await page.screenshot({ fullPage: true });

    // Get all elements and their properties
    const elements = await page.evaluate(() => {
      const elements = document.querySelectorAll("*");
      return Array.from(elements).map((element) => {
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);

        return {
          type: element.tagName.toLowerCase(),
          text: element.textContent?.trim() || "",
          position: {
            x: rect.x,
            y: rect.y,
          },
          size: {
            width: rect.width,
            height: rect.height,
          },
          styles: {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            fontSize: styles.fontSize,
            fontFamily: styles.fontFamily,
            textDecoration: styles.textDecoration,
            cursor: styles.cursor,
            fontWeight: styles.fontWeight,
            border: styles.border,
            borderRadius: styles.borderRadius,
            boxShadow: styles.boxShadow,
            borderBottom: styles.borderBottom,
          },
          isClickable:
            element.tagName.toLowerCase() === "a" ||
            element.tagName.toLowerCase() === "button" ||
            styles.cursor === "pointer",
        };
      });
    });

    // Mobile Analysis
    await page.setViewport({ width: 375, height: 812 }); // iPhone X viewport
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for viewport change
    const mobileScreenshot = await page.screenshot({ fullPage: true });

    // Calculate UX Scores
    const scores: UXScore = {
      contrastScore: 0,
      clickableSpacingScore: 0,
      underlinedLinksScore: 0,
      fontSizeScore: 0,
      mobileResponsiveScore: 0,
      totalScore: 0,
      issues: [],
      contrastNotes: [],
      fontSizeNotes: [],
    };

    // Check contrast ratios (less weight, add note)
    let contrastPenalty = 0;
    elements.forEach((element) => {
      if (element.styles.color && element.styles.backgroundColor) {
        const contrast = tinycolor.readability(
          tinycolor(element.styles.color),
          tinycolor(element.styles.backgroundColor)
        );

        if (element.text.substring(0, 30) === "..." || element.text.substring(0, 30) === "") {
            scores.contrastScore += elements.length * (elements.length / 100);
          return;
        }

        if (contrast < 3.5 && contrast > 0.99) {
          scores.contrastScore += elements.length * (elements.length / 100);
          return;
        } else {
          issues.push(
            `Low contrast (${contrast.toFixed(
              2
            )}) for text: "${element.text.substring(0, 30)}..."`
          );
          contrastPenalty++;
          scores.contrastScore -= 5;
        }
      }
    });
    scores.contrastScore = Math.max(
      0,
      Math.min(
        100,
        (scores.contrastScore / elements.length) * 10 - contrastPenalty * 1.5
      )
    );

    // Clickable Spacing (daha esnek)
    const clickableElements = elements.filter(
      (e) =>
        e.isClickable &&
        e.text.length > 0 &&
        e.size.width > 10 &&
        e.size.height > 10
    );
    let spacingIssues = 0;
    for (let i = 0; i < clickableElements.length; i++) {
      for (let j = i + 1; j < clickableElements.length; j++) {
        const e1 = clickableElements[i];
        const e2 = clickableElements[j];
        // Aynı metin ve aynı pozisyon ise atla
        if (
          e1.text === e2.text &&
          Math.abs(e1.position.x - e2.position.x) < 2 &&
          Math.abs(e1.position.y - e2.position.y) < 2
        ) {
          continue;
        }
        const distance = Math.sqrt(
          Math.pow(e1.position.x - e2.position.x, 2) +
            Math.pow(e1.position.y - e2.position.y, 2)
        );
        if (distance < 4) {
          // 4px minimum spacing
          spacingIssues++;
          issues.push(
            `Clickable elements too close: "${e1.text}" and "${e2.text}"`
          );
        }
      }
    }
    if (spacingIssues === 0) {
      scores.clickableSpacingScore = 100;
    } else {
      scores.clickableSpacingScore = Math.max(0, 100 - spacingIssues * 1.5);
    }

    // Link Underlines (hover kontrolü)
    const links = elements.filter((e) => e.type === "a");
    const nonUnderlinedLinks = links.filter((e) => {
      const hasUnderline =
        e.styles.textDecoration.includes("underline") ||
        e.styles.borderBottom !== "none";
      // e.hoverStyles alınabiliyorsa burada hover stilini de kontrol edin
      return !hasUnderline;
    });
    scores.underlinedLinksScore = Math.max(
      0,
      100 - nonUnderlinedLinks.length * 10
    );
    nonUnderlinedLinks.forEach((link) => {
      issues.push(`Link not underlined: "${link.text}"`);
    });

    // Check font sizes (less weight, add note)
    const smallTextElements = elements.filter((e) => {
      const fontSize = parseFloat(e.styles.fontSize);
      return fontSize < 10;
    });
    scores.fontSizeScore = Math.max(0, 100 - smallTextElements.length * 5);
    smallTextElements.forEach((element) => {
      fontSizeNotes.push(
        `Small font size (${
          element.styles.fontSize
        }) for text: "${element.text.substring(0, 30)}..." (Design choice?)`
      );
    });

    // Mobile responsive score (simple: penalize if many small fonts on mobile)
    let mobileResponsiveScore = 100;
    const mobileSmallFonts = elements.filter((e) => {
      const fontSize = parseFloat(e.styles.fontSize);
      return fontSize < 10;
    });
    mobileResponsiveScore = Math.max(0, 100 - mobileSmallFonts.length * 5);
    scores.mobileResponsiveScore = mobileResponsiveScore;

    // Calculate total score (include mobileResponsiveScore)
    scores.totalScore = Math.round(
      (scores.contrastScore +
        scores.clickableSpacingScore +
        scores.underlinedLinksScore +
        scores.fontSizeScore +
        scores.mobileResponsiveScore) /
        5
    );

    scores.issues = issues;
    scores.contrastNotes = contrastNotes;
    scores.fontSizeNotes = fontSizeNotes;

    return NextResponse.json({
      success: true,
      elements,
      meta,
      elementCount: elements.length,
      scores,
      screenshots: {
        desktop: Buffer.from(desktopScreenshot).toString("base64"),
        mobile: Buffer.from(mobileScreenshot).toString("base64"),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to analyze website",
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
