/*
    convert -> [{
            name: "Momodou",
            age: 21,
            message: "Hello world my name is Momodou and I really like chicken and chips"
            }, ...
        ] 
        + styling { align, gap, padding, ... }

    [
        {  }
    ]
*/



// let mockData = {
//     blocks: [
//             {
//                 contents:[                    
//                     {type:'text', fontSize:18, key:undefined, value:"hello world how is it going today?", padding:0, width: 1000, strokes:[{ type: 'SOLID', color: { r: .5, g: .2, b: 0 } }], strokeWeight:0 },
//                     {type:'text', key:undefined, value:"This is a second piece of text", padding:0, width: 1000, strokes:[{ type: 'SOLID', color: { r: .1, g: .7, b: 0 } }], strokeWeight:0 },
//                     {type:'text', fontSize:18, key:undefined, value:"This is just cool!", padding:0, width: 1000, strokeWeight:0 },
//                     {type:'text', key:undefined, value:"This is the zigzag design for each element and it just works", padding:0, width: 1000, strokeWeight:0, strokes:[{ type: 'SOLID', color: { r: .5, g: .2, b: 0 } }], strokeWeight:0 },
//                 ],
//             }
//     ],
//     align:'vertical', // or horizontal or diagonal
//     gap: 10,
//     padding:20,
//     matchWidth:true,
//     cornerRadius:10,
//     contentAlign: 'center',
//     tightRadius:true,
//     strokeWeight:3,
//     dynamicBlock:true, // only add Reectangle behind if background fill is there or strokeWeight > 0
//     fills:[{ type: 'SOLID', color: { r: 255/255, g: 255/255, b: 255/255 } }],
//     strokes:[{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]
// }

let example = {
    name: "Momodou",
    age: 21,
    message: "Hello world my name is Momodou and I really like chicken and chips"
}

let meta = {
    name: { padding:0, width: 1000, strokes:[{ type: 'SOLID', color: { r: .5, g: .2, b: 0 } }], strokeWeight:0 },
    age: { height: 100 }
}



const convertObjectIntoCollectionArr = (obj, meta={}) =>
    Object.keys(obj).map(key=> Object.assign(
        { type:'text', value:obj[key], key }, 
        meta.hasOwnProperty(key) ? meta[key] : {} 
    ))



let data = convertObjectIntoCollectionArr(example, meta)
true