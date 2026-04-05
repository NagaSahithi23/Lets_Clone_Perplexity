from ddgs import DDGS
try:
    print('Testing DDGS...')
    with DDGS() as ddgs:
        results = list(ddgs.text('latest weather in London', max_results=2))
        print(f'Results found: {len(results)}')
        for r in results:
            print(f"- {r.get('title')}")
except Exception as e:
    print(f'Error: {e}')
