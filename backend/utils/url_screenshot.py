import base64
import logging
from typing import Optional

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

logger = logging.getLogger(__name__)


def get_screenshot_base64(url: str, timeout: int = 15000, full_page: bool = False) -> Optional[str]:
    
    try:
        with sync_playwright() as p:
            
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",           
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage" 
                ]
            )
            try:
                page = browser.new_page(viewport={"width": 1280, "height": 720})

                response = page.goto(
                    url,
                    wait_until="load",      
                    timeout=timeout
                )

                if response is None:
                    logger.warning(f"No response received when navigating to: {url}")
                else:
                    logger.info(f"Successfully loaded {url} with status code {response.status}")

                try:
                    page.wait_for_load_state("networkidle", timeout=3000)
                except PlaywrightTimeoutError:
                    pass
                
                page.wait_for_timeout(1500)

                screenshot_bytes = page.screenshot(full_page=full_page, type="png")

                screenshot_base64 = base64.b64encode(screenshot_bytes).decode("utf-8")
                logger.debug(f"Screenshot captured successfully for {url} (size: {len(screenshot_base64)} chars)")

                return screenshot_base64

            except PlaywrightTimeoutError:
                logger.error(f"Timeout while loading URL: {url} (timeout={timeout}ms)")
                return None
            except Exception as page_err:
                logger.error(f"Error during page interaction for {url}: {page_err}")
                return None
            finally:
                
                browser.close()
                logger.debug("Browser instance closed")

    except Exception as e:
        logger.exception(f"Failed to capture screenshot for URL '{url}': {e}")
        return None