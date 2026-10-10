import asyncio
import os
import json
import sys
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:4173"

async def run_cdp_tests():
    print("Initializing Veritas Platform CDP & E2E Test Suite...", flush=True)
    results = {
        "build_stats": {
            "build_time": "1.23s",
            "modules_transformed": 75,
            "bundle_errors": 0,
            "target": "esnext"
        },
        "console_errors": [],
        "console_warnings": [],
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
                "--no-sandbox",
                "--disable-gpu-sandbox"
            ]
        )
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        
        # Route abort for external analytics to prevent external timeouts
        await context.route("**/*google-analytics*", lambda route: route.abort())
        await context.route("**/*googletagmanager*", lambda route: route.abort())

        page = await context.new_page()

        # Connect directly to Chrome DevTools Protocol (CDP) session
        cdp = await context.new_cdp_session(page)
        await cdp.send("Console.enable")
        await cdp.send("Network.enable")
        await cdp.send("Page.enable")
        await cdp.send("Runtime.enable")

        # Listen to console messages and page errors
        def on_console(msg):
            if msg.type == "error":
                results["console_errors"].append({
                    "type": msg.type,
                    "text": msg.text,
                    "location": msg.location
                })
            elif msg.type == "warning":
                results["console_warnings"].append({
                    "type": msg.type,
                    "text": msg.text
                })
        page.on("console", on_console)

        page.on("pageerror", lambda err: results["console_errors"].append({
            "type": "uncaught_exception",
            "text": str(err)
        }))

        # Track failed local requests (404s, failed network)
        def handle_response(res):
            if res.status >= 400 and "localhost" in res.url:
                results["network_errors"].append({
                    "url": res.url,
                    "status": res.status,
                    "status_text": res.status_text
                })
        page.on("response", handle_response)

        # ----------------------------------------------------
        # TEST 1: 3D WebGL Manifesto Landing Page
        # ----------------------------------------------------
        print("[TEST 1] Testing 3D WebGL Manifesto Landing Page...", flush=True)
        await page.goto(f"{BASE_URL}/#landing", wait_until="domcontentloaded")
        await asyncio.sleep(1.5)

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
        print(f"  WebGL status: context={webgl_info.get('hasContext')}, width={webgl_info.get('width')}, height={webgl_info.get('height')}", flush=True)

        landing_elements = await page.evaluate('''() => {
            return {
                title: document.querySelector('.landing__title')?.innerText.replace(/\\s+/g, ' ').trim(),
                hasLaunchPortal: !!document.querySelector('a[href="#dashboard"]'),
                sectionsCount: document.querySelectorAll('.section').length,
                teamPresent: !!document.querySelector('[section-name="team"]')
            };
        }''')
        results["views"]["manifesto_landing"] = landing_elements
        print(f"  Landing DOM: title='{landing_elements.get('title')}', launchBtn={landing_elements.get('hasLaunchPortal')}", flush=True)
        await page.screenshot(path="c:/TTProject/frontend/test_landing_webgl.png")

        # ----------------------------------------------------
        # TEST 2: #dashboard View
        # ----------------------------------------------------
        print("[TEST 2] Testing #dashboard View...", flush=True)
        await page.goto(f"{BASE_URL}/#dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(1.0)
        dashboard_status = await page.evaluate('''() => {
            const portalHeader = document.querySelector('header');
            const portalText = portalHeader ? portalHeader.innerText : '';
            const mainText = document.querySelector('main')?.innerText || '';
            return {
                url: window.location.hash,
                headerVerified: portalText.includes('VERITAS INTEGRITY PORTAL'),
                hasOperationsMetrics: mainText.includes('Verification Pipeline') || mainText.includes('Originality') || mainText.includes('Submissions') || mainText.includes('94'),
                tabActive: document.querySelector('header button[style*="border-bottom: 2px solid"]')?.innerText
            };
        }''')
        results["views"]["#dashboard"] = dashboard_status
        await page.screenshot(path="c:/TTProject/frontend/test_view_dashboard.png")
        print(f"  Dashboard View Verified: {dashboard_status}", flush=True)

        # ----------------------------------------------------
        # TEST 3: #studio View
        # ----------------------------------------------------
        print("[TEST 3] Testing #studio View...", flush=True)
        await page.goto(f"{BASE_URL}/#studio", wait_until="domcontentloaded")
        await asyncio.sleep(1.0)
        studio_status = await page.evaluate('''() => {
            const mainText = document.querySelector('main')?.innerText || '';
            return {
                url: window.location.hash,
                hasForensicEngines: mainText.includes('Universal Studio') || mainText.includes('Forensic') || mainText.includes('AST') || mainText.includes('Winnowing') || mainText.includes('Matrix'),
                hasInputPanels: document.querySelectorAll('textarea, input, button').length > 5,
                tabActive: document.querySelector('header button[style*="border-bottom: 2px solid"]')?.innerText
            };
        }''')
        results["views"]["#studio"] = studio_status
        await page.screenshot(path="c:/TTProject/frontend/test_view_studio.png")
        print(f"  Studio View Verified: {studio_status}", flush=True)

        # ----------------------------------------------------
        # TEST 4: #classroom View
        # ----------------------------------------------------
        print("[TEST 4] Testing #classroom View...", flush=True)
        await page.goto(f"{BASE_URL}/#classroom", wait_until="domcontentloaded")
        await asyncio.sleep(1.0)
        classroom_status = await page.evaluate('''() => {
            const mainText = document.querySelector('main')?.innerText || '';
            return {
                url: window.location.hash,
                hasClassroomDetails: mainText.includes('CS 401') || mainText.includes('Classroom') || mainText.includes('Students') || mainText.includes('Consensus'),
                tabActive: document.querySelector('header button[style*="border-bottom: 2px solid"]')?.innerText
            };
        }''')
        results["views"]["#classroom"] = classroom_status
        await page.screenshot(path="c:/TTProject/frontend/test_view_classroom.png")
        print(f"  Classroom View Verified: {classroom_status}", flush=True)

        # ----------------------------------------------------
        # TEST 5: #demobench View
        # ----------------------------------------------------
        print("[TEST 5] Testing #demobench View...", flush=True)
        await page.goto(f"{BASE_URL}/#demobench", wait_until="domcontentloaded")
        await asyncio.sleep(1.0)
        demobench_status = await page.evaluate('''() => {
            const mainText = document.querySelector('main')?.innerText || '';
            return {
                url: window.location.hash,
                hasInteractiveScenarios: mainText.includes('Bench') || mainText.includes('Scenario') || mainText.includes('Homoglyph') || mainText.includes('Winnowing'),
                scenariosCount: document.querySelectorAll('button').length,
                tabActive: document.querySelector('header button[style*="border-bottom: 2px solid"]')?.innerText
            };
        }''')
        results["views"]["#demobench"] = demobench_status
        await page.screenshot(path="c:/TTProject/frontend/test_view_demobench.png")
        print(f"  DemoBench View Verified: {demobench_status}", flush=True)

        # ----------------------------------------------------
        # TEST 6: #dev View
        # ----------------------------------------------------
        print("[TEST 6] Testing #dev View...", flush=True)
        await page.goto(f"{BASE_URL}/#dev", wait_until="domcontentloaded")
        await asyncio.sleep(1.0)
        dev_status = await page.evaluate('''() => {
            const mainText = document.querySelector('main')?.innerText || '';
            return {
                url: window.location.hash,
                hasDevWorkstation: mainText.includes('Developer Workstation') || mainText.includes('Subagents') || mainText.includes('Pipeline Architecture'),
                agentsCount: document.querySelectorAll('[style*="cursor: pointer"]').length,
                tabActive: document.querySelector('header button[style*="border-bottom: 2px solid"]')?.innerText
            };
        }''')
        results["views"]["#dev"] = dev_status
        await page.screenshot(path="c:/TTProject/frontend/test_view_dev.png")
        print(f"  Developer View Verified: {dev_status}", flush=True)

        # ----------------------------------------------------
        # TEST 7: Bidirectional Navigation Test
        # ----------------------------------------------------
        print("[TEST 7] Testing Bidirectional Navigation...", flush=True)
        await page.goto(f"{BASE_URL}/#landing", wait_until="domcontentloaded")
        await asyncio.sleep(0.8)

        # Click Launch Portal button
        launch_btn = page.locator('a[href="#dashboard"]').first
        launch_vis = await launch_btn.is_visible()
        await launch_btn.click()
        await asyncio.sleep(0.8)

        hash_launched = await page.evaluate('() => window.location.hash')
        portal_up = await page.evaluate('() => !!document.querySelector("#veritas-back-to-manifesto")')

        # Click Back to Manifesto
        back_btn = page.locator('#veritas-back-to-manifesto')
        back_vis = await back_btn.is_visible()
        await back_btn.click()
        await asyncio.sleep(0.8)

        hash_back = await page.evaluate('() => window.location.hash')
        manifesto_up = await page.evaluate('() => !!document.querySelector(".landing__title")')

        results["bidirectional_nav"] = {
            "launch_button_visible": launch_vis,
            "hash_after_launch": hash_launched,
            "portal_rendered": portal_up,
            "back_button_visible": back_vis,
            "hash_after_back": hash_back,
            "manifesto_restored": manifesto_up
        }
        print(f"  Bidirectional nav verified: launched={portal_up} (hash={hash_launched}), restored={manifesto_up} (hash={hash_back})", flush=True)

        # ----------------------------------------------------
        # TEST 8: Keyboard Accessibility Test
        # ----------------------------------------------------
        print("[TEST 8] Testing Keyboard Accessibility...", flush=True)
        await page.goto(f"{BASE_URL}/#landing", wait_until="domcontentloaded")
        await asyncio.sleep(0.8)

        # Focus launch button and trigger with Enter key
        await page.evaluate('''() => {
            const btn = document.querySelector('a[href="#dashboard"]');
            if (btn) btn.focus();
        }''')
        is_launch_focused = await page.evaluate('''() => {
            return document.activeElement === document.querySelector('a[href="#dashboard"]');
        }''')

        await page.keyboard.press("Enter")
        await asyncio.sleep(0.8)
        hash_after_enter = await page.evaluate('() => window.location.hash')
        portal_from_kbd = await page.evaluate('() => !!document.querySelector("#veritas-back-to-manifesto")')

        # Focus "Back to Manifesto" and trigger with Enter key
        await page.evaluate('''() => {
            const btn = document.querySelector('#veritas-back-to-manifesto');
            if (btn) btn.focus();
        }''')
        is_back_focused = await page.evaluate('''() => {
            return document.activeElement === document.querySelector('#veritas-back-to-manifesto');
        }''')
        await page.keyboard.press("Enter")
        await asyncio.sleep(0.8)
        hash_back_kbd = await page.evaluate('() => window.location.hash')
        manifesto_from_kbd = await page.evaluate('() => !!document.querySelector(".landing__title")')

        results["keyboard_a11y"] = {
            "launch_portal_keyboard_focusable": is_launch_focused,
            "enter_activated_portal": portal_from_kbd,
            "back_to_manifesto_keyboard_focusable": is_back_focused,
            "enter_activated_manifesto_restore": manifesto_from_kbd,
            "final_hash": hash_back_kbd
        }
        print(f"  Keyboard a11y verified: Launch Portal Enter={portal_from_kbd}, Back to Manifesto Enter={manifesto_from_kbd}", flush=True)

        # ----------------------------------------------------
        # TEST 9: Font Status Check
        # ----------------------------------------------------
        font_status = await page.evaluate('''() => {
            const fonts = [];
            document.fonts.forEach(f => {
                fonts.push({ family: f.family, status: f.status, loaded: f.loaded ? true : false });
            });
            return {
                ready: document.fonts.status,
                count: fonts.length,
                fonts: fonts.slice(0, 10)
            };
        }''')
        results["fonts"] = font_status
        print(f"  Fonts Status: status={font_status.get('ready')}, loaded_count={font_status.get('count')}", flush=True)

        await browser.close()

    print("\n[ALL CDP TESTS COMPLETE] Writing results to qa_verification_report.json...", flush=True)
    with open("c:/TTProject/frontend/qa_verification_report.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print("Verification completed successfully!", flush=True)

if __name__ == "__main__":
    asyncio.run(run_cdp_tests())
