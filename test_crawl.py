import asyncio
from crawl4ai import AsyncWebCrawler

async def main():
    try:
        print("Testing Crawl4AI...")
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url="https://www.google.com")
            if result and result.markdown:
                print(f"Crawl success! Extracted {len(result.markdown)} characters.")
            else:
                print("Crawl failed: no content extracted.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
