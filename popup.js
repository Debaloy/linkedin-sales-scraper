const scrapeBtn = document.getElementById('scrape-btn')

scrapeBtn.addEventListener('click', async () => {
    // Get current active tab
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    })

    // Execute the script to scrape the data
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeData
    })
})

// Function to scrape data
async function scrapeData() {
    const secondsToWaitForTheNextPageToLoad = 5
    let list = []

    const scrollAndScrape = async () => {
        let newList = document.getElementsByClassName('artdeco-list__item')
        for (let i = 0; i < newList.length; i += 2) {
            await new Promise(resolve => {
                setTimeout(() => {
                    document.getElementsByClassName('artdeco-list__item')[i].scrollIntoView()
                    resolve();
                }, 4000)
            });
        }

        await new Promise(resolve => {
            setTimeout(() => {
                newList = [...document.getElementsByClassName('artdeco-list__item')]
                list.push(newList.map(item => item.innerText))

                // this data needs to be saved in file
                console.log(list.length)
                console.log(list)

                document.getElementsByClassName('artdeco-pagination__button--next')[0].click()
                resolve();
            }, 5000)
        });
    };

    const intervalId = setInterval(async () => {
        if (document.getElementsByClassName('artdeco-pagination__button--next')[0] !== undefined) {
            await scrollAndScrape();
        } else {
            clearInterval(intervalId);
            console.log('Scraping completed.');
            console.log('Total items scraped: ', list.length);
            console.log('Scraped data: ', list);
        }
    }, secondsToWaitForTheNextPageToLoad * 1000);
}
