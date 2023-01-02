const recursiveDeepCopy = (obj) => 
    Object.keys(obj).reduce((global, key)=>{

        if (typeof obj[key] === 'object') {

            global[key] = { ...recursiveDeepCopy(obj[key]) }

        }else {
            global[key] = obj[key];
        }
        return global;

    }, {})




// let obj = { names:{firstName:{value:'Momodou'}, lastName:'Bah'}, homes:{ prime:{name:'Gambia', addres:'XYZ'}, sub:{name:'UK', addres:'abc'} } }
// let secondObj = JSON.parse(JSON.stringify(obj))

// // recursiveDeepCopy(obj);
// true;
// obj.names.firstName.value = "Ibrahim"
// true;
// obj.names.firstName = "Mariam"
// true;
// let x = 2;

const createRandomString = (size=100) => {
    let letters = ['a', ' ', 'b', 'c',  'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', ' ', 'o', 'p', 'q', 'r', 's', 't', 'u', ' ', 'v', 'w', 'x', ' ', 'y', 'z'];
    let characters = [];
    for (let k = 0; k < size; k++) {
        let nextChar = Math.floor(Math.random()*(letters.length-1));
        characters.push(letters[nextChar]);
    }
    return characters.join('')
}

const roundDecimalNumber = (value, decimalPoints) => {
    if(!Number.isInteger(decimalPoints)) return value;
    let multiplier = 1;
    while(decimalPoints>0) {
        multiplier *= 10;
        decimalPoints--;
    }
    return Math.round(value * multiplier) / multiplier;
}

const createRandomNumber = (min, max, type, unit, round) => {
    let number = min + (Math.random()*(max-min));
    if (type==='decimal') return (round !== undefined ? roundDecimalNumber(number, round) : number) + (unit ? unit : '');
    return Math.floor(number) + (unit ? unit : '');
}

const createRandomDate = (dateFormat='date', language='en-GB') => {

    /*
        resources: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
                   https://stackoverflow.com/questions/3552461/how-do-i-format-a-date-in-javascript
    */

                   let today = new Date();
    let numericalFormat = today/1;
    let lowerBound = numericalFormat - 100;
    let upperBound = numericalFormat + 100;
    let randomised = createRandomNumber(lowerBound, upperBound);
    let randomDate = new Date(randomised);

    switch (dateFormat){
        case 'date':
            return randomDate.toLocaleDateString(language);
        case 'time':
            return randomDate.toLocaleTimeString(language); 
        case 'date-time':
            return randomDate.toLocaleString(language, { timeZone: 'UTC' });
        case 'speakable':
            let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return randomDate.toLocaleDateString(language, options);                      
        default: 
            return randomised;
    }

    // return randomDate.toLocaleDateString(language); // 9/17/2016 (date)
    // return randomDate.toLocaleTimeString(language); // 6:17:29 PM (time)
    // return randomDate.toLocaleDateString(language, options); // Thursday, 7 August 2031 (speakable)
    // return randomDate.toLocaleString(language, { timeZone: 'UTC' }); // 17/08/2073, 08:50:30 (date-time)

}

const createRandomBoolean = (format='yes/no') => {
    let value = Math.random();
    let targetIndex = 0;
    if (value > .5) 
        targetIndex = 1;

    let options = format.split('/');
    if (options.length===2) {
        return options[targetIndex];
    }else {
        return "false"
    }
}

// console.log(createRandomString(400));
// console.log(createRandomNumber(0, 10, 'decimal', ' Degrees', 2));
// console.log(createRandomDate('speakable'));
// console.log(createRandomBoolean());


// colour range (full) (dark) (bright)
const createRandomFigmaColour = (range='full') => { 

    let min = range === 'full' || range === 'dark' ? 0 : 255/2;
    let max = range === 'full' || range === 'bright' ? 255 : 255/2;
    let colours = { r:undefined, g:undefined, b:undefined };
    Object.keys(colours).forEach(key=>colours[key]=parseInt(createRandomNumber(min, max)) / 255);
    return [ { color:colours, type: 'SOLID' } ]

}

const convertFieldToText = (field) => {
    let strs = field.split(/[A-Z]/);
    console.log(strs)
}

// convertFieldToText('goodMorning')
console.log(createRandomFigmaColour('full'))
