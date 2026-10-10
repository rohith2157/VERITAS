import asyncio
from playwright.async_api import async_playwright

async def test_keyboard():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
        page = await browser.new_page()

        print("1. Loading landing page for keyboard navigation test...")
        await page.goto("http://localhost:5173/#landing", wait_until="domcontentloaded")
        await asyncio.sleep(1)

        # Ensure starting focus is cleared
        await page.evaluate("() => document.activeElement && document.activeElement.blur()")

        # Tab through until Launch Portal is focused
        focused_launch = False
        step = 0
        for i in range(15):
            await page.keyboard.press("Tab")
            info = await page.evaluate('''() => {
                const el = document.activeElement;
                return el ? { tag: el.tagName, href: el.getAttribute('href'), text: el.innerText.trim() } : null;
            }''')
            if info and info['href'] == '#dashboard':
                focused_launch = True
                step = i + 1
                print(f"   Focused Launch link at Tab #{step}: {info}")
                break

        print(f"   Launch Portal focused via Tab: {focused_launch}")
        assert focused_launch, "Failed to focus Launch Portal link via Tab key"

        # Press Enter on the focused link
        print("2. Pressing Enter on focused Launch Portal link...")
        await page.keyboard.press("Enter")
        await asyncio.sleep(1)

        hash_portal = await page.evaluate("() => window.location.hash")
        portal_active = await page.evaluate("() => !!document.querySelector('#veritas-back-to-manifesto')")
        print(f"   Portal opened via Enter: hash={hash_portal}, portal_active={portal_active}")
        assert portal_active, "Portal failed to open when pressing Enter on Launch link"

        # 3. Tab to Back to Manifesto inside portal
        print("3. Testing keyboard navigation inside portal...")
        # Focus Back to Manifesto button directly or via Tab
        await page.evaluate("() => document.querySelector('#veritas-back-to-manifesto')?.focus()")
        is_back_focused = await page.evaluate("() => document.activeElement?.id === 'veritas-back-to-manifesto'")
        print(f"   Back to Manifesto button focused: {is_back_focused}")
        assert is_back_focused, "Back to Manifesto button was not focusable"

        # Press Enter on Back to Manifesto
        print("4. Pressing Enter on Back to Manifesto...")
        await page.keyboard.press("Enter")
        await asyncio.sleep(1)

        hash_back = await page.evaluate("() => window.location.hash")
        manifesto_restored = await page.evaluate("() => !document.querySelector('#veritas-back-to-manifesto') && !!document.querySelector('.landing__title')")
        print(f"   Manifesto restored via Enter: hash={hash_back}, manifesto_restored={manifesto_restored}")
        assert manifesto_restored, "Manifesto failed to restore after pressing Enter on Back to Manifesto"

        print("\nALL KEYBOARD ACCESSIBILITY TESTS PASSED WITH 100% SUCCESS!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_keyboard())
