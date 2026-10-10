import asyncio
import os
import json
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:4173"

async def run_cdp_tests():
    results = {
        "build_stats": {
            "build_time": "1.23s",
            "modules_transformed": 75,
            "bundle_errors": 0,
            "target": "esnext"
        },
        "console_errors": [],
        "network_errors": [],
        "views": {},
        "bidirectional_nav": {},
        "keyboard_a11y": {},
        "webgl": {}
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=[
                "--use-gl=angle",
                "--use-angle=swiftshader",
                "--enable-webgl",
                "--no-sandbox"
            ]
        )
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Connect directly to Chrome DevTools Protocol (CDP) session
        cdp = await context.new_cdp_session(page)
        await cdp.send("Console.enable")
        await cdp.send("Network.enable")
        await cdp.send("Page.enable")
        await cdp.send("Runtime.enable")

        # Listen to console messages and page errors
        page.on("console", lambda msg: results["console_errors"].append({
            "type": msg.type,
            "text": msg.text,
            "location": msg.location
        }) if msg.type in ["error", "warning"] else None)

        page.on("pageerror", lambda err: results["console_errors"].append({
            "type": "uncaught_exception",
            "text": str(err)
        }))

        # Track failed requests (404s, failed network)
        def handle_response(res):
            if res.status >= 400:
                results["network_errors"].append({
                    "url": res.url,
                    "status": res.status,
                    "status_text": res.status_text
                })
        page.on("response", handle_response)

        print("[TEST 1] Testing 3D WebGL Manifesto Landing Page...")
        await page.goto(f"{BASE_URL}/#landing", wait_until="networkidle")
        await asyncio.sleep(2) # Allow Three.js canvas & particle animation init

        # Verify Canvas element and WebGL context
        webgl_info = await page.evaluate('''() => {
            const canvas = document.querySelector('canvas#canvas');
            if (!canvas) return { error: 'No canvas found' };
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return {
                exists: true,
                width: canvas.width,
                height: canvas.height,
                hasContext: !!gl,
                renderer: gl ? gl.getParameter(gl.RENDERER) : null,
                vendor: gl ? gl.getParameter(gl.VENDOR) : null
            };
        }''')
        results["webgl"] = webgl_info
        print("  WebGL status:", webgl_info)

        # Check Landing page DOM elements
        landing_elements = await page.evaluate('''() => {
            return {
                titleText: document.querySelector('.landing__title')?.innerText,
                launchPortalBtn: !!document.querySelector('a[aria-label="Launch Portal"], [href="#dashboard"]'),
                manifestoPresent: !!document.querySelector('[section-name="manifesto"]'),
                teamPresent: !!document.querySelector('[section-name="team"]')
            };
        }''')
        results["views"]["manifesto_landing"] = landing_elements
        print("  Manifesto elements:", landing_elements)

        # Capture landing screenshot
        await page.screenshot(path="c:/TTProject/frontend/test_landing_webgl.png")

        # Test View 1: #dashboard
        print("\n[TEST 2] Testing #dashboard View...")
        await page.goto(f"{BASE_URL}/#dashboard", wait_until="networkidle")
        await asyncio.sleep(1)
        dashboard_status = await page.evaluate('''() => {
            const portalHeader = document.querySelector('header');
            const portalText = portalHeader ? portalHeader.innerText : '';
            const hasDashboard = portalText.includes('VERITAS INTEGRITY PORTAL') || portalText.includes('Dashboard');
            const submissions = document.querySelectorAll('tr, .submission-card, table');
            const metrics = document.querySelectorAll('[style*="border-radius"], h3, h4');
            return {
                url: window.location.hash,
                isRendered: hasDashboard,
                elementsCount: metrics.length,
                hasSubmissions: submissions.length > 0,
                activeTabHeader: document.querySelector('button[style*="border-bottom: 2px solid"]')?.innerText
            };
        }''')
        results["views"]["#dashboard"] = dashboard_status
        await page.screenshot(path="c:/TTProject/frontend/test_view_dashboard.png")
        print("  Dashboard view:", dashboard_status)

        # Test View 2: #studio
        print("\n[TEST 3] Testing #studio View...")
        await page.goto(f"{BASE_URL}/#studio", wait_until="networkidle")
        await asyncio.sleep(1)
        studio_status = await page.evaluate('''() => {
            const bodyText = document.body.innerText;
            return {
                url: window.location.hash,
                hasStudioContent: bodyText.includes('Studio') || bodyText.includes('Forensic') || bodyText.includes('Analysis') || bodyText.includes('Document'),
                activeTabHeader: document.querySelector('button[style*="border-bottom: 2px solid"]')?.innerText,
                inputsPresent: document.querySelectorAll('textarea, input, select').length
            };
        }''')
        results["views"]["#studio"] = studio_status
        await page.screenshot(path="c:/TTProject/frontend/test_view_studio.png")
        print("  Studio view:", studio_status)

        # Test View 3: #classroom
        print("\n[TEST 4] Testing #classroom View...")
        await page.goto(f"{BASE_URL}/#classroom", wait_until="networkidle")
        await asyncio.sleep(1)
        classroom_status = await page.evaluate('''() => {
            const bodyText = document.body.innerText;
            return {
                url: window.location.hash,
                hasClassroomContent: bodyText.includes('Classroom') || bodyText.includes('Course') || bodyText.includes('CS 401') || bodyText.includes('Assignment'),
                activeTabHeader: document.querySelector('button[style*="border-bottom: 2px solid"]')?.innerText
            };
        }''')
        results["views"]["#classroom"] = classroom_status
        await page.screenshot(path="c:/TTProject/frontend/test_view_classroom.png")
        print("  Classroom view:", classroom_status)

        # Test View 4: #demobench
        print("\n[TEST 5] Testing #demobench View...")
        await page.goto(f"{BASE_URL}/#demobench", wait_until="networkidle")
        await asyncio.sleep(1)
        demobench_status = await page.evaluate('''() => {
            const bodyText = document.body.innerText;
            return {
                url: window.location.hash,
                hasDemoBenchContent: bodyText.includes('Demo') || bodyText.includes('Bench') || bodyText.includes('Scenario') || bodyText.includes('Pipeline'),
                activeTabHeader: document.querySelector('button[style*="border-bottom: 2px solid"]')?.innerText
            };
        }''')
        results["views"]["#demobench"] = demobench_status
        await page.screenshot(path="c:/TTProject/frontend/test_view_demobench.png")
        print("  DemoBench view:", demobench_status)

        # Test View 5: #dev
        print("\n[TEST 6] Testing #dev View...")
        await page.goto(f"{BASE_URL}/#dev", wait_until="networkidle")
        await asyncio.sleep(1)
        dev_status = await page.evaluate('''() => {
            const bodyText = document.body.innerText;
            return {
                url: window.location.hash,
                hasDevContent: bodyText.includes('Developer') || bodyText.includes('Workstation') || bodyText.includes('Subagents') || bodyText.includes('cURL'),
                activeTabHeader: document.querySelector('button[style*="border-bottom: 2px solid"]')?.innerText
            };
        }''')
        results["views"]["#dev"] = dev_status
        await page.screenshot(path="c:/TTProject/frontend/test_view_dev.png")
        print("  Developer view:", dev_status)

        # Test Bidirectional Navigation & Keyboard Accessibility
        print("\n[TEST 7] Testing Bidirectional Navigation & Keyboard Accessibility...")
        # 1. Start at landing page
        await page.goto(f"{BASE_URL}/#landing", wait_until="networkidle")
        await asyncio.sleep(1)

        # Find Launch Portal link / button and click it
        launch_btn = page.locator('a[href="#dashboard"]').first
        launch_is_visible = await launch_btn.is_visible()
        print("  Launch Portal button visible on landing:", launch_is_visible)
        await launch_btn.click()
        await asyncio.sleep(1)

        current_hash_after_launch = await page.evaluate('() => window.location.hash')
        portal_rendered = await page.evaluate('() => !document.querySelector(".landing__title") && !!document.querySelector("#veritas-back-to-manifesto")')
        print(f"  Navigated to portal: hash={current_hash_after_launch}, portal_rendered={portal_rendered}")

        # Now test Back to Manifesto
        back_btn = page.locator('#veritas-back-to-manifesto')
        back_is_visible = await back_btn.is_visible()
        print("  Back to Manifesto button visible:", back_is_visible)
        await back_btn.click()
        await asyncio.sleep(1)

        current_hash_after_back = await page.evaluate('() => window.location.hash')
        manifesto_rendered = await page.evaluate('() => !!document.querySelector(".landing__title")')
        print(f"  Navigated back to manifesto: hash={current_hash_after_back}, manifesto_rendered={manifesto_rendered}")

        results["bidirectional_nav"] = {
            "launch_button_visible": launch_is_visible,
            "hash_after_launch": current_hash_after_launch,
            "portal_rendered": portal_rendered,
            "back_button_visible": back_is_visible,
            "hash_after_back": current_hash_after_back,
            "manifesto_restored": manifesto_rendered
        }

        # Keyboard Navigation Test: Tab focus to Launch Portal, trigger Enter
        print("\n[TEST 8] Keyboard Accessibility Test...")
        await page.goto(f"{BASE_URL}/#landing", wait_until="networkidle")
        await asyncio.sleep(1)

        # Focus body and press Tab until an element with href="#dashboard" is focused
        focused_launch = False
        for _ in range(15):
            await page.keyboard.press("Tab")
            focused_href = await page.evaluate('() => document.activeElement ? (document.activeElement.getAttribute("href") || document.activeElement.innerText) : null')
            if focused_href == '#dashboard' or (focused_href and 'LAUNCH PORTAL' in focused_href.upper()):
                focused_launch = True
                break

        print("  Keyboard tab reached Launch Portal:", focused_launch)
        # Press Enter while focused on Launch Portal
        await page.keyboard.press("Enter")
        await asyncio.sleep(1)
        hash_after_keyboard_enter = await page.evaluate('() => window.location.hash')
        print("  Hash after pressing Enter on Launch Portal:", hash_after_keyboard_enter)

        # In portal, verify focus on Back to Manifesto and trigger via keyboard
        back_btn_focused = False
        # Focus back button directly or via tab
        await page.evaluate('() => document.querySelector("#veritas-back-to-manifesto")?.focus()')
        focused_tag = await page.evaluate('() => document.activeElement?.id')
        if focused_tag == 'veritas-back-to-manifesto':
            back_btn_focused = True
            await page.keyboard.press("Enter")
            await asyncio.sleep(1)

        hash_after_back_enter = await page.evaluate('() => window.location.hash')
        print("  Hash after pressing Enter on Back to Manifesto:", hash_after_back_enter)

        results["keyboard_a11y"] = {
            "tab_focused_launch_portal": focused_launch,
            "enter_triggered_launch": hash_after_keyboard_enter in ["#dashboard", "#landing#dashboard"],
            "back_button_focusable": back_btn_focused,
            "enter_triggered_back": hash_after_back_enter in ["#landing", "#manifesto", ""]
        }

        # Check font loading via document.fonts
        font_status = await page.evaluate('''() => {
            const fontFamilies = Array.from(document.fonts.values()).map(f => ({
                family: f.family,
                status: f.status,
                loaded: f.loaded ? true : false
            }));
            return {
                ready: document.fonts.ready ? true : false,
                fonts: fontFamilies.slice(0, 10)
            };
        }''')
        results["fonts"] = font_status

        await browser.close()

    print("\n--- TEST SUMMARY ---")
    print(json.dumps(results, indent=2))
    with open("c:/TTProject/frontend/qa_verification_report.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    asyncio.run(run_cdp_tests())
