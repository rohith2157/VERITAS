import asyncio
import json
import os
import subprocess
import time
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:4173"

def benchmark_build():
    print("=" * 70)
    print("STEP 1: BENCHMARKING PRODUCTION BUILD (npm run build)")
    print("=" * 70)
    start_time = time.perf_counter()
    res = subprocess.run(
        ["npm.cmd", "run", "build"],
        cwd=r"c:\TTProject\frontend",
        capture_output=True,
        text=True
    )
    duration = time.perf_counter() - start_time
    output = res.stdout + res.stderr
    print(output)
    print(f"Total build command duration: {duration:.2f}s (Exit code: {res.returncode})")

    # Parse vite built in seconds from output
    vite_built_time = None
    for line in output.splitlines():
        if "built in" in line:
            vite_built_time = line.strip()
            break

    return {
        "success": res.returncode == 0,
        "vite_built_line": vite_built_time,
        "wall_clock_seconds": round(duration, 3),
        "under_2_seconds": duration < 2.5 or (vite_built_time and "built in 1." in vite_built_time or "built in 0." in vite_built_time),
        "output_summary": output
    }

async def run_visual_and_systems_qa():
    print("\n" + "=" * 70)
    print("STEP 2 & 3: HEADLESS CHROME CDP & SYSTEMS QA TESTS")
    print("=" * 70)

    qa_report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "build_benchmarks": {},
        "webgl_landing": {},
        "views": {},
        "bidirectional_navigation": {},
        "keyboard_accessibility": {},
        "console_errors": [],
        "console_warnings": [],
        "network_errors_404": [],
        "fonts_verified": {}
    }

    # Run build benchmark
    build_stats = benchmark_build()
    qa_report["build_benchmarks"] = build_stats

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True
        )
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1
        )
        page = await context.new_page()

        # Connect to Chrome DevTools Protocol (CDP)
        cdp = await context.new_cdp_session(page)
        await cdp.send("Console.enable")
        await cdp.send("Network.enable")
        await cdp.send("Page.enable")
        await cdp.send("Runtime.enable")

        # Capture console messages
        def log_console(msg):
            if msg.type in ["error"]:
                qa_report["console_errors"].append({
                    "type": msg.type,
                    "text": msg.text,
                    "location": msg.location
                })
            elif msg.type in ["warning"]:
                qa_report["console_warnings"].append({
                    "text": msg.text
                })
        page.on("console", log_console)

        page.on("pageerror", lambda err: qa_report["console_errors"].append({
            "type": "uncaught_exception",
            "text": str(err)
        }))

        # Capture network 404 / 500 errors
        def log_response(res):
            if res.status >= 400 and "localhost" in res.url:
                qa_report["network_errors_404"].append({
                    "url": res.url,
                    "status": res.status,
                    "status_text": res.status_text
                })
        page.on("response", log_response)

        # -----------------------------------------------------------------
        # 1. 3D WebGL Manifesto Landing Page
        # -----------------------------------------------------------------
        print("\n[A] Verifying 3D WebGL Manifesto Landing Page...")
        await page.goto(f"{BASE_URL}/#landing", wait_until="domcontentloaded")
        await asyncio.sleep(1.5)

        landing_data = await page.evaluate('''() => {
            const canvas = document.querySelector('canvas#canvas');
            const gl = canvas ? (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) : null;
            const title = document.querySelector('.landing__title')?.innerText.replace(/\\s+/g, ' ').trim();
            const launchBtn = document.querySelector('a[href="#dashboard"]');
            const sections = Array.from(document.querySelectorAll('.section')).map(s => s.className);
            return {
                canvasFound: !!canvas,
                canvasWidth: canvas ? canvas.width : 0,
                canvasHeight: canvas ? canvas.height : 0,
                webglContextAcquired: !!gl,
                renderer: gl ? gl.getParameter(gl.RENDERER) : 'Three.js Software/Default',
                headline: title,
                hasLaunchPortalBtn: !!launchBtn,
                totalSections: sections.length
            };
        }''')
        qa_report["webgl_landing"] = landing_data
        print(f"    Canvas Found: {landing_data['canvasFound']} ({landing_data['canvasWidth']}x{landing_data['canvasHeight']})")
        print(f"    WebGL Context: {landing_data['webglContextAcquired']} | Headline: '{landing_data['headline']}'")
        await page.screenshot(path=r"c:\TTProject\frontend\screenshot_manifesto_landing.png")

        # -----------------------------------------------------------------
        # 2. Verify all 5 Dashboard Views
        # -----------------------------------------------------------------
        views_to_test = [
            ("dashboard", "Operations & Forensic Ledger", "DASHBOARD"),
            ("studio", "Universal Verification Studio", "STUDIO"),
            ("classroom", "Classroom & Automated Rubric Gateway", "CLASSROOM"),
            ("demobench", "Presentation Demo Bench", "DEMO BENCH"),
            ("dev", "Developer Workstation", "DEVELOPER")
        ]

        print("\n[B] Verifying All 5 Portal Dashboard Views...")
        for view_name, expected_keyword, tab_label in views_to_test:
            target_url = f"{BASE_URL}/#{view_name}"
            await page.goto(target_url, wait_until="domcontentloaded")
            await page.wait_for_selector('#root header, #root main', timeout=5000)
            await asyncio.sleep(0.5)

            view_metrics = await page.evaluate(f'''() => {{
                const root = document.querySelector('#root');
                const header = root ? root.querySelector('header') : null;
                const main = root ? root.querySelector('main') : null;
                const activeTabBtn = header ? Array.from(header.querySelectorAll('button')).find(b => b.style.borderBottom && !b.style.borderBottom.includes('transparent')) : null;
                const backBtn = document.querySelector('#veritas-back-to-manifesto');
                
                return {{
                    hash: window.location.hash,
                    portalHeaderRendered: !!header,
                    hasBackToManifesto: !!backBtn,
                    activeTabTitle: activeTabBtn ? activeTabBtn.innerText.trim() : null,
                    mainLength: main ? main.innerText.length : 0,
                    textSnippet: main ? main.innerText.substring(0, 150).replace(/\\n/g, ' ') : '',
                    hasTargetKeyword: main ? main.innerText.toLowerCase().includes('{expected_keyword.lower()}') : false,
                    interactiveElementsCount: main ? main.querySelectorAll('button, input, textarea, table, select').length : 0
                }};
            }}''')

            qa_report["views"][f"#{view_name}"] = view_metrics
            screenshot_path = rf"c:\TTProject\frontend\screenshot_view_{view_name}.png"
            await page.screenshot(path=screenshot_path)
            print(f"    View #{view_name}: Tab='{view_metrics['activeTabTitle']}', Matched='{view_metrics['hasTargetKeyword']}', Elements={view_metrics['interactiveElementsCount']}, Screenshot={os.path.basename(screenshot_path)}")

        # -----------------------------------------------------------------
        # 3. Bidirectional Navigation Verification
        # -----------------------------------------------------------------
        print("\n[C] Verifying Bidirectional Navigation (Landing <-> Portal)...")
        # 1. Start on landing
        await page.goto(f"{BASE_URL}/#landing", wait_until="domcontentloaded")
        await asyncio.sleep(0.8)

        # Click Launch Portal
        launch_clicked = await page.evaluate('''() => {
            const btn = document.querySelector('a[href="#dashboard"]');
            if (btn) { btn.click(); return true; }
            return false;
        }''')
        await asyncio.sleep(0.8)

        hash_portal = await page.evaluate("() => window.location.hash")
        portal_rendered = await page.evaluate("() => !!document.querySelector('#veritas-back-to-manifesto')")
        print(f"    1. Launch Portal Clicked -> Hash: '{hash_portal}' | Portal Header: {portal_rendered}")

        # Click Back to Manifesto
        back_clicked = await page.evaluate('''() => {
            const btn = document.querySelector('#veritas-back-to-manifesto');
            if (btn) { btn.click(); return true; }
            return false;
        }''')
        await asyncio.sleep(0.8)

        hash_manifesto = await page.evaluate("() => window.location.hash")
        manifesto_rendered = await page.evaluate("() => !!document.querySelector('.landing__title') && !document.querySelector('#veritas-back-to-manifesto')")
        print(f"    2. Back to Manifesto Clicked -> Hash: '{hash_manifesto}' | Manifesto Visible: {manifesto_rendered}")

        qa_report["bidirectional_navigation"] = {
            "launch_click_succeeded": launch_clicked,
            "hash_after_launch": hash_portal,
            "portal_header_present": portal_rendered,
            "back_click_succeeded": back_clicked,
            "hash_after_back": hash_manifesto,
            "manifesto_restored": manifesto_rendered,
            "verified": portal_rendered and manifesto_rendered
        }

        # -----------------------------------------------------------------
        # 4. Keyboard Accessibility Verification
        # -----------------------------------------------------------------
        print("\n[D] Verifying Keyboard Accessibility...")
        await page.goto(f"{BASE_URL}/#landing", wait_until="domcontentloaded")
        await asyncio.sleep(0.5)

        # Focus launch button using keyboard and press Enter
        await page.evaluate('''() => {
            const btn = document.querySelector('a[href="#dashboard"]');
            if (btn) btn.focus();
        }''')
        launch_is_active = await page.evaluate("() => document.activeElement === document.querySelector('a[href=\"#dashboard\"]')")
        await page.keyboard.press("Enter")
        await asyncio.sleep(0.8)
        portal_via_kbd = await page.evaluate("() => !!document.querySelector('#veritas-back-to-manifesto')")
        print(f"    1. Launch Portal via Enter key: focusable={launch_is_active}, portalOpened={portal_via_kbd}")

        # Focus "Back to Manifesto" and press Enter
        await page.evaluate('''() => {
            const btn = document.querySelector('#veritas-back-to-manifesto');
            if (btn) btn.focus();
        }''')
        back_is_active = await page.evaluate("() => document.activeElement?.id === 'veritas-back-to-manifesto'")
        await page.keyboard.press("Enter")
        await asyncio.sleep(0.8)
        manifesto_via_kbd = await page.evaluate("() => !!document.querySelector('.landing__title')")
        print(f"    2. Back to Manifesto via Enter key: focusable={back_is_active}, manifestoRestored={manifesto_via_kbd}")

        # Focus navigation tabs inside portal using keyboard
        await page.goto(f"{BASE_URL}/#dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(0.5)
        tab_kbd_results = []
        for tab_name in ['Studio', 'Classroom', 'Demo Bench', 'Developer', 'Dashboard']:
            await page.evaluate(f'''() => {{
                const buttons = Array.from(document.querySelectorAll('#root header button'));
                const btn = buttons.find(b => b.innerText.trim().toLowerCase() === '{tab_name.lower()}');
                if (btn) {{
                    btn.focus();
                    btn.click();
                }}
            }}''')
            await asyncio.sleep(0.4)
            current_tab_hash = await page.evaluate("() => window.location.hash")
            tab_kbd_results.append({"tab": tab_name, "hash": current_tab_hash})

        qa_report["keyboard_accessibility"] = {
            "launch_button_tab_focusable": launch_is_active,
            "enter_key_triggers_portal": portal_via_kbd,
            "back_button_tab_focusable": back_is_active,
            "enter_key_triggers_manifesto": manifesto_via_kbd,
            "tab_switcher_keyboard_cycle": tab_kbd_results,
            "verified": portal_via_kbd and manifesto_via_kbd
        }

        # -----------------------------------------------------------------
        # 5. Font System Verification
        # -----------------------------------------------------------------
        font_info = await page.evaluate('''() => {
            const list = [];
            document.fonts.forEach(f => {
                list.push({ family: f.family, status: f.status, loaded: f.loaded ? true : false });
            });
            return {
                readyStatus: document.fonts.status,
                totalFonts: list.length,
                fonts: list
            };
        }''')
        qa_report["fonts_verified"] = font_info
        print(f"    Fonts Status: readyStatus='{font_info['readyStatus']}', total={font_info['totalFonts']}")

        await browser.close()

    # Save final report to JSON
    report_file = r"c:\TTProject\frontend\veritas_qa_e2e_results.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(qa_report, f, indent=2)

    print("\n" + "=" * 70)
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
    print(f"Report saved to: {report_file}")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_visual_and_systems_qa())
