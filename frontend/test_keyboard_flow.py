import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
        page = await b.new_page()
        await page.goto('http://127.0.0.1:4173/#landing', wait_until='domcontentloaded')
        await asyncio.sleep(1)

        # Tab until we reach an href='#dashboard'
        reached = False
        for i in range(12):
            await page.keyboard.press('Tab')
            href = await page.evaluate("() => document.activeElement ? document.activeElement.getAttribute('href') : null")
            if href == '#dashboard':
                reached = True
                print(f"Reached #dashboard link at Tab {i+1}")
                break
        
        if reached:
            await page.keyboard.press('Enter')
            await asyncio.sleep(1)
            hash_now = await page.evaluate("() => window.location.hash")
            portal_up = await page.evaluate("() => !!document.querySelector('#veritas-back-to-manifesto')")
            print(f"Enter pressed: hash={hash_now}, portal_up={portal_up}")

            # Now test tabbing to Back to Manifesto in the portal
            await page.keyboard.press('Tab')
            active_id = await page.evaluate("() => document.activeElement ? document.activeElement.id : null")
            print(f"First tab in portal: active_id={active_id}")

            # Press Enter to go back to Manifesto
            await page.keyboard.press('Enter')
            await asyncio.sleep(1)
            hash_after_back = await page.evaluate("() => window.location.hash")
            manifesto_restored = await page.evaluate("() => !document.querySelector('#veritas-back-to-manifesto')")
            print(f"Back Enter pressed: hash={hash_after_back}, manifesto_restored={manifesto_restored}")

        await b.close()

if __name__ == '__main__':
    asyncio.run(check())
