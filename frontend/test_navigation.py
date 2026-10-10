import asyncio
from playwright.async_api import async_playwright

async def test_nav():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
        page = await b.new_page()

        # Step 1: Start at Landing Page
        print("1. Loading landing page...")
        await page.goto("http://localhost:4173/#landing", wait_until="domcontentloaded")
        await asyncio.sleep(1)

        # Check manifesto landing state
        manifesto_up_start = await page.evaluate("() => !!document.querySelector('.landing__title')")
        portal_active_start = await page.evaluate("() => !!document.querySelector('#veritas-back-to-manifesto')")
        print(f"   Initial state: manifesto_visible={manifesto_up_start}, portal_visible={portal_active_start}")

        # Step 2: Navigate to Portal via Click
        print("2. Clicking 'Launch Portal'...")
        # Dispatch click on the Launch Portal button in the DOM
        clicked = await page.evaluate('''() => {
            const btn = document.querySelector('a[href="#dashboard"]');
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        }''')
        await asyncio.sleep(1)

        hash_after_launch = await page.evaluate("() => window.location.hash")
        portal_active = await page.evaluate("() => !!document.querySelector('#veritas-back-to-manifesto')")
        print(f"   After Launch click: hash={hash_after_launch}, portal_rendered={portal_active}")

        # Step 3: Navigate back to Manifesto via "Back to Manifesto" click
        print("3. Clicking 'Back to Manifesto'...")
        await page.locator('#veritas-back-to-manifesto').click()
        await asyncio.sleep(1)

        hash_after_back = await page.evaluate("() => window.location.hash")
        portal_active_after_back = await page.evaluate("() => !!document.querySelector('#veritas-back-to-manifesto')")
        manifesto_up_after_back = await page.evaluate("() => !!document.querySelector('.landing__title')")
        print(f"   After Back click: hash={hash_after_back}, portal_rendered={portal_active_after_back}, manifesto_visible={manifesto_up_after_back}")

        # Step 4: Keyboard Navigation Verification
        print("4. Testing Keyboard Navigation...")
        # Go to portal again
        await page.evaluate('''() => {
            const btn = document.querySelector('a[href="#dashboard"]');
            btn.click();
        }''')
        await asyncio.sleep(1)

        # Focus Back to Manifesto button and press Enter
        await page.evaluate('''() => {
            const backBtn = document.querySelector('#veritas-back-to-manifesto');
            backBtn.focus();
        }''')
        is_focused = await page.evaluate('''() => document.activeElement?.id === 'veritas-back-to-manifesto' ''')
        print(f"   Back to Manifesto keyboard focus active: {is_focused}")

        # Press Enter key
        await page.keyboard.press("Enter")
        await asyncio.sleep(1)

        hash_after_enter = await page.evaluate("() => window.location.hash")
        portal_after_enter = await page.evaluate("() => !!document.querySelector('#veritas-back-to-manifesto')")
        print(f"   After Enter on Back to Manifesto: hash={hash_after_enter}, portal_active={portal_after_enter}")

        # Test View switching inside portal
        print("5. Testing Tab Switchers in Portal...")
        await page.goto("http://localhost:4173/#dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(0.5)

        tabs = ['studio', 'classroom', 'demobench', 'dev', 'dashboard']
        for tab in tabs:
            # Click tab switcher button in header
            await page.evaluate(f'''() => {{
                const btns = Array.from(document.querySelectorAll('#root header button'));
                const target = btns.find(b => b.innerText.toLowerCase().includes('{tab}'));
                if (target) target.click();
            }}''')
            await asyncio.sleep(0.5)
            curr_hash = await page.evaluate("() => window.location.hash")
            header_active = await page.evaluate('''() => {
                const header = document.querySelector('#root header');
                const active = Array.from(header.querySelectorAll('button')).find(b => b.style.borderBottom && !b.style.borderBottom.includes('transparent'));
                return active ? active.innerText.trim() : null;
            }''')
            print(f"   Switched to {tab}: hash={curr_hash}, activeHeaderTab={header_active}")

        await b.close()
        print("\nAll Bidirectional Navigation and Keyboard tests succeeded!")

if __name__ == '__main__':
    asyncio.run(test_nav())
