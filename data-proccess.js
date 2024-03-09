// THIS IS A SIMPLE DATA PROCESSING ALGORITHM, EDIT IT AS YOU NEED
// OR YOU CAN TAKE THE JSON DATA AND IMPORT IT INTO PYTHON OR OTHER LANGUAGES

const dataindonesia = require('./data-wisataindonesia.json')
const dataluar = require('./data-wisataluar.json')


let lastDat = []
let FileData = []

for(let i=0; i<dataindonesia.length; i++){
    let datains = dataindonesia[i]
    datains.forEach((rm) => {
        if(parseFloat(rm.avg_rating) >= 4.5 && parseInt(rm.reviews) >= 700){
            lastDat.push(rm)
        }
    });
}

for(let i=0; i<dataluar.length; i++){
    let datains = dataluar[i]
    datains.forEach((rm) => {
        if(parseFloat(rm.avg_rating) >= 4.5 && parseInt(rm.reviews) >= 700){
            lastDat.push(rm)
        }
    });
}



console.log("Here is the Data: ")
lastDat.forEach((rm) => {
    let score = (rm.avg_rating * rm.reviews).toFixed(2)
    // console.log(rm.title, rm.avg_rating, rm.reviews)
    console.log(rm.title)

    let data = {
        title: rm.title,
        address: rm.address,
        website: rm.website,
        phone_num: rm.phone_num,
        link: rm.link,
        score: score
    }
    FileData.push(data)
})

const fs = require('fs')
fs.writeFileSync('finalData.json', JSON.stringify(FileData, null, 2))
