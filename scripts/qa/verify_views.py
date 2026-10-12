import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
        page = await b.new_page()
        for hash_view in ['#dashboard', '#studio', '#classroom', '#demobench', '#dev']:
            await page.goto(f'http://localhost:4173/{hash_view}', wait_until='domcontentloaded')
            await asyncio.sleep(1)
            info = await page.evaluate("""() => {
                const backBtn = document.querySelector('#veritas-back-to-manifesto');
                const portalHeader = backBtn ? backBtn.closest('header') : null;
                const activeBtn = portalHeader ? portalHeader.querySelector('button[style*="border-bottom: 2px solid"]') : null;
                const portalMain = portalHeader ? portalHeader.closest('div').querySelector('main') : null;
                return {
                    hash: window.location.hash,
                    hasBackBtn: !!backBtn,
                    activeTabText: activeBtn ? activeBtn.innerText : null,
                    mainTextPreview: portalMain ? portalMain.innerText.substring(0, 120).replace(/\\n/g, ' ') : null
                };
            }""")
            print(f"VIEW {hash_view}: {info}")
        await b.close()

if __name__ == '__main__':
    asyncio.run(check())
