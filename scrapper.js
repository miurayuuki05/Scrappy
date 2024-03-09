const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const loading = require('loading-cli')
const fs = require('fs')


//IF YOU WANT TO SCRAP DATA FROM MAIN CITY THEN SUBDIVIDED THE MAIN CITY INTO
//ITS OWN SUB REGION AND ADD THE SUB REGION TO THE SUBCITIES ARRAY
//IF YOU WANT TO SCRAP DATA FROM THE WHOLE CITY THEN JUST ADD THE MAIN CITY TO THE MAINCITIES VARIABLE
//AND ADD MAINCITIES TO THE SUBCITIES ARRAY AS WELL
const mainCities = "";

const subCities = [
    "shibuya",
    "shinjuku",
    "tokyo",
    "osaka",
    "kyoto",
    "nagoya",
];


//PLACE IS THE TYPE OF PLACE YOU WANT TO SCRAP DATA FROM
//FOR EXAMPLE IF YOU WANT TO GET DATA FROM CAFE WITHIN THE CITY
//THEN YOU CAN USE "cafe" AS THE PLACE
const place = "cafe"

//FILENAME TO SAVE THE DATA, CHANGE IT AS YOU NEED
const fileName = "data"

//IMPORTANT: IF YOU WANT TO SAVE THE DATA TO DIFFERENT FILE 
//THEN CHANGE THE FILENAME AFTER EVERY SCRAP AND THEN DONT FORGET TO SAVE scrapper.js FILE
//IF NOT THEN THE DATA WILL BE OVERWRITTEN AFTER EVERY SCRAP



const getCafeData = (query, datalimit, mainarea, area) => {
    let dataFinal = []
    console.log('🚀 | Starting the scrapper')

    puppeteer.use(StealthPlugin())  
    const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
    puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
    puppeteer.launch({ headless: true }).then(async browser => {

        for (let i = 0; i < area.length; i++) {
            
        const city = area[i]

        // console.log('🔍|Searching for ' + query + ' in ' + city + ' ' + mainarea)
        const load = loading({
            text: 'Searching for ' + query + ' in ' + city + ' ' + mainarea,
            color: 'blue',
            interval: 100,
            stream: process.stdout,
            frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
            }).start()

        const page = await browser.newPage()
        await page.setViewport({ width: 1080, height: 2048 })
    
        await page.goto('https://www.google.com/maps')
        await page.waitForSelector('input#searchboxinput')
        await page.type('input#searchboxinput', query + " in " + city )
        await page.keyboard.press('Enter')
    
        await page.waitForSelector('div.Nv2PK')
    
    
        const extractData = async (page) => {
            let maps_data = await page.evaluate(() => {
                return Array.from(document.querySelectorAll(".Nv2PK")).map((el) => {
                    const link = el.querySelector("a.hfpxzc").getAttribute("href");
                    return {
                    title: el.querySelector(".qBF1Pd")?.textContent.trim(),
                    avg_rating: el.querySelector(".MW4etd")?.textContent.replace(".","").replace(",",".").trim(),
                    reviews: el.querySelector(".UY7F9")?.textContent.replace("(", "").replace(")", "").replace(",", "").trim(),
                    address: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(1) > span:last-child")?.textContent.replaceAll("·", "").trim(),
                    description: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(2)")?.textContent.replace("·", "").trim(),
                    website: el.querySelector("a.lcr4fd")?.getAttribute("href"),
                    category: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(1) > span:first-child")?.textContent.replaceAll("·", "").trim(),
                    timings: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(3) > span:first-child")?.textContent.replaceAll("·", "").trim(),
                    phone_num: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(3) > span:last-child")?.textContent.replaceAll("·", "").trim(),
                    extra_services: el.querySelector(".qty3Ue")?.textContent.replaceAll("·", ",").replaceAll("  ", " ").trim(),
                    latitude: link.split("!8m2!3d")[1].split("!4d")[0],
                    longitude: link.split("!4d")[1].split("!16s")[0],
                    link,
                    dataId: link.split("1s")[1].split("!8m")[0],
                    };
                });
                });
                return maps_data;
                
        }
    
    
        const scrollPage = async (page, scrollContainer, itemTarget) => {
            let items = []
            let previousHeight = await page.evaluate('document.querySelector("'+scrollContainer+'").scrollHeight')
            while(itemTarget > items.length){
                items = await extractData(page);
                let isEnd = (await page.$("span.HlvSq")) ? true : false
                if(isEnd){
                    break;
                }
                await page.evaluate(`document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`);
                await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight > ${previousHeight}`);
            }
    
            return items;
        }
    
        let data = await scrollPage(page, ".m6QErb[aria-label]", datalimit)
        dataFinal.push(data)
        fs.writeFileSync(fileName + '.json', JSON.stringify(dataFinal, null, 2))
    
        await page.screenshot({ path: 'screenshots/' + city + '.png'})
        load.clear()
        load.succeed('📦 |' + city + ' Data saved to ' + fileName + '.json')
        }
        await browser.close()
    }).then(() => {
        console.log('🎉 | Scrapper finished')
    })
}

getCafeData(place, 5, mainCities, subCities)