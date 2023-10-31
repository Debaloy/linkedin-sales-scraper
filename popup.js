const scrollDownTimer = 10
const scrollUpTimer = 5
const waitTimer = 10

const scrapeBtn = document.getElementById('scrape-btn')

scrapeBtn.addEventListener('click', async () => {
    // Get current active tab
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    })

    // Execute the script to scrape the data
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeData
    })
})

// Function to scrape data
async function scrapeData() {
    let leadList = '', 
        accountList = ''

    let tooManyLeadListReq = false,
        tooManyAccountListReq = false

    function smoothScrollTo(element, duration, reverse=false) {
        return new Promise(resolve => {
            const startingPosition = element.scrollTop
            const distanceToScroll = element.scrollHeight - element.clientHeight
            let startTime = performance.now()

            function scrollAnimation(currentTime) {
                const elapsedTime = currentTime - startTime
                const scrollProgress = Math.min(elapsedTime / duration, 1)
                const scrollValue = startingPosition + distanceToScroll * easeInOutQuad(scrollProgress)

                element.scrollTop = reverse ? -1 * scrollValue : scrollValue

                if (elapsedTime < duration) {
                    requestAnimationFrame(scrollAnimation)
                } else {
                    resolve(); // Resolve the promise when scrolling is completed
                }
            }

            function easeInOutQuad(t) {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
            }

            requestAnimationFrame(scrollAnimation)
        });
    }

    let page = 1
    let N = 2
    while (!document.getElementsByClassName('artdeco-pagination__button--next')[0].disabled) {
    // while (page <= N) { // uncomment this when testing specific pages

        let tooManyReq = document.querySelector("#content-main > div.flex > div.full-width > div.m4.background-color-white.container-with-shadow._search-empty-states-height_1igybl > h3")

        if (tooManyReq != null && ['Too Many Requests', 'Request Timed Out'].includes(tooManyReq.innerText)) {
            console.log("Too many requests, scraping will restart after 10min")
            const csvContentLeadList = leadList.split('\n') // Split lines
                .map(line => line.split('|/|').map(field => `"${field}"`).join(','))
                .join('\n'); // Join lines with newline characters

            // Save LeadList as a downloadable text file
            const blob = new Blob([csvContentLeadList], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'temp-LeadList.csv';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();

            // Clean up
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

            tooManyLeadListReq = true

            console.log("Restart from this URL:")
            console.log(tooManyReq.baseURI)
        }

        // Get the element with ID "search-results-container"
        const searchResultsContainer = document.getElementById('search-results-container')

        // Scroll the "search-results-container" div with smooth scrolling lasting 15 seconds (15000 milliseconds)
        await smoothScrollTo(searchResultsContainer, scrollDownTimer * 1000)

        await smoothScrollTo(searchResultsContainer, scrollUpTimer * 1000, true)

        // Rest of the code that works after the scrolling is done
        let newLeadList = document.querySelectorAll("#search-results-container > div > ol > li > div > div > div.flex.justify-space-between.full-width > div.flex.flex-column")

        for (let i = 0; i < newLeadList.length; i++) {
            const ll = newLeadList[i]
            
            const upperDiv = ll?.childNodes[1]?.childNodes[3]
            const lowerDiv = ll?.childNodes[3]

            let profileLink = upperDiv?.childNodes[1]?.childNodes[2]?.href
            
            let name = upperDiv?.childNodes[3]?.childNodes[1]?.childNodes[1]?.innerText
            
            let designation = upperDiv?.childNodes[3]?.childNodes[4]?.innerText
            
            let address = upperDiv?.childNodes[3]?.childNodes[6]?.innerText
            
            let experience = upperDiv?.childNodes[3]?.childNodes[8]?.innerText

            let about = "N/A"
            if (lowerDiv?.childNodes[3]?.childNodes[1]?.innerText !== '') {
                about = lowerDiv?.childNodes[1]?.childNodes[3]?.childNodes[3]?.innerText
            }

            leadList += `${profileLink}|/|${name}|/|${designation}|/|${address}|/|${experience}|/|${about}\n`
        }

        document.getElementsByClassName('artdeco-pagination__button--next')[0].click()

        await new Promise(resolve => {
            setTimeout(resolve, waitTimer * 1000)
        })

        page++
    }

    document.getElementsByClassName('flex align-items-center border-bottom _panel-tabs_c69tab')[0].childNodes[5].click()

    window.scrollTo(0, 0)

    if (!tooManyLeadListReq) {
        const csvContentLeadList = leadList.split('\n') // Split lines
            .map(line => line.split('|/|').map(field => `"${field}"`).join(','))
            .join('\n'); // Join lines with newline characters

        // Save LeadList as a downloadable text file
        const blob = new Blob([csvContentLeadList], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'LeadList.csv';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // ACCOUNTS
    await new Promise(resolve => {
        setTimeout(resolve, waitTimer * 1000)
    })

    page = 1
    N = 2
    while (!document.getElementsByClassName('artdeco-pagination__button--next')[0].disabled) {
    // while (page <= N) {

        let tooManyReq = document.querySelector("#content-main > div.flex > div.full-width > div.m4.background-color-white.container-with-shadow._search-empty-states-height_1igybl > h3")

        if (tooManyReq != null && ['Too Many Requests', 'Request Timed Out'].includes(tooManyReq.innerText)) {
            console.log("Too many requests")
            // Save AccountList as a downloadable text file
            const csvContentAccountList = accountList.split('\n') // Split lines
                .map(line => line.split('|/|').map(field => `"${field}"`).join(','))
                .join('\n'); // Join lines with newline characters

            const blob2 = new Blob([csvContentAccountList], { type: 'text/csv' });
            const url2 = URL.createObjectURL(blob2);

            const a2 = document.createElement('a');
            a2.href = url2;
            a2.download = 'AccountList.csv';
            a2.style.display = 'none';
            document.body.appendChild(a2);
            a2.click();

            tooManyAccountListReq = true

            console.log("Restart from this URL:")
            console.log(tooManyReq.baseURI)
        }

        // Get the element with ID "search-results-container"
        const searchResultsContainer = document.getElementById('search-results-container')

        // Scroll the "search-results-container" div with smooth scrolling lasting 15 seconds (15000 milliseconds)
        await smoothScrollTo(searchResultsContainer, scrollDownTimer * 1000)

        await smoothScrollTo(searchResultsContainer, scrollUpTimer * 1000, true)

        // Rest of the code that works after the scrolling is done
        let newAccountList = document.querySelectorAll("#search-results-container > div > ol > li > div > div > div.flex.justify-space-between.full-width > div.flex.flex-column")

        for (let i = 0; i < newAccountList.length; i++) {
            const al = newAccountList[i]
            
            const upperDiv = al?.childNodes[1]?.childNodes[4]
            const lowerDiv = al?.childNodes[3]

            let profileLink = upperDiv?.childNodes[3]?.childNodes[1]?.childNodes[1]?.childNodes[1]?.href
            
            let name = upperDiv?.childNodes[3]?.childNodes[1]?.childNodes[1]?.innerText
            
            let service = upperDiv?.childNodes[3]?.childNodes[1]?.innerText
            
            let employees = upperDiv?.childNodes[3]?.childNodes[3]?.childNodes[6]?.innerText

            let about = "N/A"
            if (lowerDiv?.childNodes[3]?.childNodes[1]?.innerText !== '') {
                about = lowerDiv?.childNodes[1]?.childNodes[4]?.childNodes[3]?.innerText
            }

            accountList += `${profileLink}|/|${name}|/|${service}|/|${employees}|/|${about}\n`
        }

        document.getElementsByClassName('artdeco-pagination__button--next')[0].click()

        await new Promise(resolve => {
            setTimeout(resolve, waitTimer * 1000)
        })

        page++
    }

    if (!tooManyAccountListReq) {
        // Save AccountList as a downloadable text file
        const csvContentAccountList = accountList.split('\n') // Split lines
            .map(line => line.split('|/|').map(field => `"${field}"`).join(','))
            .join('\n'); // Join lines with newline characters

        const blob2 = new Blob([csvContentAccountList], { type: 'text/csv' });
        const url2 = URL.createObjectURL(blob2);

        const a2 = document.createElement('a');
        a2.href = url2;
        a2.download = 'AccountList.csv';
        a2.style.display = 'none';
        document.body.appendChild(a2);
        a2.click();
    }
}
