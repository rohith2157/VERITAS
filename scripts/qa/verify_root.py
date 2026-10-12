import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
        page = await b.new_page()
        
        for hash_view in ['#dashboard', '#studio', '#classroom', '#demobench', '#dev']:
            await page.goto(f'http://localhost:4173/{hash_view}', wait_until='domcontentloaded')
            # Wait for suspense / content
            await page.wait_for_selector('#root main h1, #root main h2, #root main h3, #root main div', timeout=5000)
            await asyncio.sleep(0.5)

            info = await page.evaluate("""() => {
                const root = document.querySelector('#root');
                const portalHeader = root ? root.querySelector('header') : null;
                const portalMain = root ? root.querySelector('main') : null;
                const activeTab = portalHeader ? Array.from(portalHeader.querySelectorAll('button')).find(b => b.style.borderBottom && !b.style.borderBottom.includes('transparent')) : null;
                
                return {
                    hash: window.location.hash,
                    rootPresent: !!root,
                    hasHeader: !!portalHeader,
                    headerTitle: portalHeader ? portalHeader.querySelector('span')?.innerText : null,
                    activeTabName: activeTab ? activeTab.innerText.trim() : null,
                    mainLength: portalMain ? portalMain.innerText.length : 0,
                    mainHeading: portalMain ? (portalMain.querySelector('h1, h2, h3, h4')?.innerText || portalMain.innerText.substring(0, 80)) : null
                };
            }""")
            print(f"{hash_view}: {info}")
            
        await b.close()

if __name__ == '__main__':
    asyncio.run(check())
