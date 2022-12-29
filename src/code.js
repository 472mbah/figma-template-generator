// "build": "tsc -p tsconfig.json",
// "watch": "npm run build -- --watch"


figma.showUI(__html__, {width: 300, height: 600});

figma.loadFontAsync({ family: "Inter", style: "Regular" })
figma.loadFontAsync({ family: "Roboto", style: "Regular" })
figma.loadFontAsync({ family: "Inter", style: "Bold" })

const flattenArray = (nodes, store=[]) => {

    if (Array.isArray(nodes)) {
        for (let k = 0; k < nodes.length; k++) {
            flattenArray(nodes[k], store)
        }
    }else {
        store.push(nodes);
    }
}

const findContentDimensions = (tempStore) => {

    if (!Array.isArray(tempStore) || !tempStore.length) return {
        xMin:0,
        yMin:0,
        xMax:0,
        yMax:0
    }

    let boxDimensions = { xMin:tempStore[0].x, yMin:tempStore[0].y, xMax:tempStore[0].x + tempStore[0].width, yMax:tempStore[0].y + tempStore[0].height };

    for (let k = 1; k < tempStore.length; k++) {
        let item = tempStore[k];
        let itemXMin = item.x;
        let itemYMin = item.y;
        let itemXMax = item.width + itemXMin;
        let itemYMax = item.height + itemYMin;

        if (itemXMin < boxDimensions.xMin) 
            boxDimensions.xMin = itemXMin
        if (itemYMin < boxDimensions.yMin) 
            boxDimensions.yMin = itemYMin
        if (itemXMax > boxDimensions.xMax) 
            boxDimensions.xMax = itemXMax 
        if (itemYMax > boxDimensions.yMax) 
            boxDimensions.yMax = itemYMax          
    }    

    return boxDimensions;
}

const alignItemsHelper = (item, midPoint, alignType='vertical', data) => {
    if (Array.isArray(item)) {
        for (let j = 0; j < item.length; j++) {
            alignItemsHelper(item[j], midPoint, alignType, data);
        }
    }
    else {
        let itemCordShift = item[alignType==='vertical' ? 'height' : 'width'] / 2;
        item[alignType==='vertical' ? 'y' : 'x'] = midPoint - itemCordShift + ((alignType==='vertical' ? -1 : 1) * data.padding);
    }
}

const alignItems = (group, alignType='vertical', data=[]) => {

    if (!group.length) {
        return group;
    }
    let flat = []
    flattenArray(group, flat);
    let { xMin, xMax, yMin, yMax } = findContentDimensions(flat);

    let minToUse = alignType==='vertical' ? yMin : xMin;
    let maxToUse = alignType==='vertical' ? yMax : xMax;

    let midPoint = ((maxToUse - minToUse) / 2) + minToUse;
    
    for (let k = 0; k < group.length; k++) {
        alignItemsHelper(group[k], midPoint, alignType, data[k]);
    }
}

const identifyTextDimensions = (inputInfo, textNode) => {

    let { value, width, height, contentStartX, contentStartY, fontSize, textStyling } = inputInfo;
    if (fontSize!=undefined && fontSize > 0){
        textNode.fontSize = fontSize;
    }

    if (Array.isArray(textStyling)) {

        textStyling.forEach(style=>{

            let range = style.range;
            if (!Array.isArray(range) || range.length!==2 || range[1] < range[0]) {
                range = [0, value.length]
            }

            switch (style.type) {
                case 'font':
                    textNode.setRangeFontName( range[0], range[1], style.value );
                    break;
                case 'fill':
                    textNode.setRangeFills( range[0], range[1], style.value );
                    break;
                case 'decoration':
                    textNode.setRangeTextDecoration( range[0], range[1], style.value );
                    break;
                case 'spacing':
                    textNode.setRangeLetterSpacing( range[0], range[1], style.value );
                    break; 
                default:
                    break;                   
                    
            }

        })

    }

    // textNode.setRangeFontName(5, 11, {family:'Inter', style:'Bold'});
    // textNode.setRangeFills(5, 11, [{type:'SOLID', color: { r: 1, g: 0, b: 0 } }] );
    // textNode.setRangeTextDecoration(5, 11, 'UNDERLINE' );
    // textNode.setRangeLetterSpacing(5, 11, { value:2, unit:'PIXELS' })

    // let textStylingObject = {
    //     type: 'font', // font | fill | decoration | spacing,
    //     range: [],
    //     value: {}
    // }

    if (width===undefined || width <= 0)
        inputInfo.width = textNode.width;

    if (height===undefined || height <= 0)
        inputInfo.height = textNode.height;

    textNode.resize(inputInfo.width, inputInfo.height)

    inputInfo.width = textNode.width;
    inputInfo.height = textNode.height;

    textNode.x = contentStartX;
    textNode.y = contentStartY;

}

const identifyBoxDimensions = (inputInfo, containerNode) => {

    let { width, height, padding, contentStartX, contentStartY, strokes, strokeWeight, cornerRadius, fills } = inputInfo;

    if (padding===undefined || padding <= 0)
        padding = 0;
    
    if (strokeWeight===undefined || strokeWeight <= 0)
        strokeWeight = 0;  
    
    if (cornerRadius===undefined || cornerRadius <= 0 || (Array.isArray(cornerRadius) && cornerRadius.length!==4))
        cornerRadius = [0, 0, 0, 0]; 
    else if (!Array.isArray(cornerRadius)) {
        cornerRadius = [cornerRadius, cornerRadius, cornerRadius, cornerRadius]
    }

    let doublePadding = (padding + strokeWeight) * 2;
    
    if (Array.isArray(fills)) {
        containerNode.fills = fills;
        // [{ type: 'SOLID', color: { r: 255/255, g: 255/255, b: 255/255 } }]
    }


    if (Array.isArray(strokes)) {
        containerNode.strokes = strokes;
    }
    containerNode.strokeWeight = strokeWeight;
    containerNode.topLeftRadius = cornerRadius[0]
    containerNode.topRightRadius = cornerRadius[1]
    containerNode.bottomRightRadius = cornerRadius[2]
    containerNode.bottomLeftRadius = cornerRadius[3]
    containerNode.resize(width + doublePadding, height + doublePadding);

    containerNode.x = contentStartX - padding;
    containerNode.y = contentStartY - padding;

}

const createEntity = (inputInfo, nodes) => {

    let { value, padding, backgroundColour, borderRadius, width, height, contentStartX, contentStartY } = inputInfo

    let rectNode = figma.createRectangle();
    let textNode = figma.createText();
    textNode.characters = value;

    identifyTextDimensions(inputInfo, textNode);
    identifyBoxDimensions(inputInfo, rectNode);

    let tempStore = [textNode, rectNode];
    let boxDimensions = findContentDimensions(tempStore);

    nodes.push(tempStore); 

    return boxDimensions;

}   

const matchDimensions = (group, alignType='vertical') => {
    
    if (!group.length) {
        return group;
    }

    let flat = []


    flattenArray(group, flat);
    let { xMin, xMax, yMin, yMax } = findContentDimensions(flat);    
    let contentMax = alignType==='vertical' ? xMax - xMin : yMax - yMin;

    flat.forEach(item=>{
        if (item.name=='Rectangle') {
            item.resize(alignType==='vertical' ? contentMax : item.width, alignType==='vertical' ? item.height : contentMax );
        }
    })

}

const alignRadius = (groups, radius=[1, 1, 1, 1], alignType='vertical') => {

    // larger padding, smaller radius

    if (!Array.isArray(radius)) {
        radius = [ radius, radius, radius, radius ]
    }

    radius = radius.map(r=> r * .75 )

    let firstBlock = groups[0];
    let firstMainRect = Array.isArray(firstBlock) ? firstBlock.filter(block => block.name=='Rectangle') : firstBlock;
    if (firstMainRect.length) {
        firstMainRect = firstMainRect[0];
        if (alignType==='vertical') {
            console.log('first', firstMainRect);
            firstMainRect.topLeftRadius = radius[0];
            firstMainRect.topRightRadius = radius[1];    
        }else if (alignType==='horizontal') {
            firstMainRect.topLeftRadius = radius[0];
            firstMainRect.bottomLeftRadius = radius[3];               
        }
    }

    let lastBlock = groups[groups.length - 1];
    let secondMainRect = Array.isArray(lastBlock) ? lastBlock.filter(block => block.name=='Rectangle') : lastBlock;
    if (secondMainRect.length) {
        // alert('got second one');
        secondMainRect = secondMainRect[0];
        if (alignType==='vertical') {
            console.log('second', secondMainRect);
            secondMainRect.bottomRightRadius = radius[2];
            secondMainRect.bottomLeftRadius = radius[3];    
        }else if (alignType==='horizontal') {
            secondMainRect.topRightRadius = radius[0];
            secondMainRect.bottomRightRadius = radius[2];               
        }
    }

}

const createBlock = (data) => {
    try {
        let nodes = [];

        data.blocks.forEach(section=>{

            let primeRect = figma.createRectangle();

            let groupedNodes = [];
            let contentStartX = 100;
            let contentStartY = 100
            let { contents } = section;
            let { align, gap, contentAlign, matchWidth, matchHeight, dynamicBlock, cornerRadius, fills, strokes, strokeWeight, padding, tightRadius } = data;
            let zigZagRight = true;
            // contentAlign

            if (!Array.isArray(cornerRadius)) {
                cornerRadius = [cornerRadius, cornerRadius, cornerRadius, cornerRadius]
            }

            let previousComponentWidth = undefined; 
    
            contents.forEach(cont=> {
                cont.contentStartX = contentStartX;
                cont.contentStartY = contentStartY;
                
                let dimensions = createEntity(cont, groupedNodes);
    
                if (align==='vertical' || align==='diagonal')
                    contentStartY = dimensions.yMax + cont.padding + cont.strokeWeight + gap
                if (align==='horizontal' || align==='diagonal'){
                    contentStartX = dimensions.xMax + cont.padding  + gap
                }
                if (align==='zigzag') {
                    contentStartY = dimensions.yMax + (cont.padding) - cont.strokeWeight
                    // + cont.padding - cont.strokeWeight
                    if (zigZagRight)
                        contentStartX = dimensions.xMax + cont.padding
                        // + cont.padding
                    else {
                        let useWidth = previousComponentWidth === undefined ? ( dimensions.xMax - dimensions.xMin ) : previousComponentWidth
                        contentStartX = dimensions.xMin - useWidth 
                        // + cont.padding
                    }
                    previousComponentWidth = ( dimensions.xMax - dimensions.xMin ) - (cont.padding) - (cont.strokeWeight)
                    // + cont.padding
                    zigZagRight = !zigZagRight
                }


                if (dynamicBlock && !((cont.strokeWeight!==undefined && cont.strokeWeight > 0) || Array.isArray(cont.backgroundColours) && cont.backgroundColours.length) ) {
                    groupedNodes[groupedNodes.length-1] =
                        groupedNodes[groupedNodes.length-1].filter(b=>{
                            if (b.name!=='Rectangle') {
                                return true
                            }
                            b.remove();                                
                            return false;
                        })  
                }

            })
    
            if (contentAlign==='center' && (align==='vertical' || align==='horizontal')) {
                alignItems(groupedNodes, align==='vertical' ? 'horizontal' : 'vertical', contents)
            }

            if ((matchWidth || matchHeight) && (align==='vertical' || align==='horizontal')) {
                matchDimensions(groupedNodes, align)
            }

            let needExtraRectangle = false;

            let needBlock = 
                padding!==undefined && padding > 0 ||
                cornerRadius!==undefined && cornerRadius > 0 ||
                strokeWeight!==undefined && strokeWeight > 0 ||
                Array.isArray(strokes) ||
                Array.isArray(fills)

            if (needBlock) {
                // if (align==='vertical' || align==='horizontal') {
                let flat = []
                flattenArray(groupedNodes, flat);
                let primeDimensions = findContentDimensions(flat);
                if (align==='vertical' || align==='horizontal') {
                    needExtraRectangle = true;
                    identifyBoxDimensions({ 
                        width: primeDimensions.xMax - primeDimensions.xMin - 2,
                        height: primeDimensions.yMax - primeDimensions.yMin - 2,
                        contentStartX:primeDimensions.xMin, 
                        contentStartY: primeDimensions.yMin,
                        padding,
                        strokes, 
                        fills,
                        strokeWeight, 
                        cornerRadius
                    }, primeRect)
                    tightRadius && alignRadius(groupedNodes, cornerRadius, align)
                }

            }

            if (!needExtraRectangle) {
                primeRect.remove();
            }

            console.log('grouped', groupedNodes)

    
            nodes.push(groupedNodes)
    
        })
    
    
    
        let flatNodes = []
        flattenArray(nodes, flatNodes)

        return flatNodes;

    }catch (e) {
        console.log(e);
        return []
    }


}

figma.ui.onmessage = function (msg) {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    // if (msg.type === 'create-rectangles') {
    //     var nodes = [];
    //     for (var i = 0; i < msg.count; i++) {
    //         var rect = figma.createRectangle();
    //         var text = figma.createText();

    //         text.characters = "Hello world just testing"
    //         console.log(text.width, text.height)

    //         text.resize(50, 100);

    //         rect.x = i * 150;
    //         rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
    //         figma.currentPage.appendChild(rect);
    //         // nodes.push(rect);
    //         // nodes.push(text);
    //     }
    //     figma.currentPage.selection = nodes;
    //     figma.viewport.scrollAndZoomIntoView(nodes);
    // }


    if (msg.type === 'create-block') {
        var nodes = [];

    // textNode.setRangeFontName(5, 11, {family:'Inter', style:'Bold'});
    // textNode.setRangeFills(5, 11, [{type:'SOLID', color: { r: 1, g: 0, b: 0 } }] );
    // textNode.setRangeTextDecoration(5, 11, 'UNDERLINE' );
    // textNode.setRangeLetterSpacing(5, 11, { value:2, unit:'PIXELS' })

    // let textStylingObject = {
    //     type: 'font', // font | fill | decoration | spacing,
    //     range: [],
    //     value: {}
    // }



        let mockData = {
            blocks: [
                    {
                        contents:[                    
                            {type:'text', 
                                textStyling:[
                    { type:'font', range:[0, 4], value:{family:'Inter', style:'Bold'}}, 
                    { type:'fill', range:[6, 10], value:[{type:'SOLID', color: { r: 1, g: 0, b: 0 } }]  },
                    { type:'decoration', range:[13, 17], value:'STRIKETHROUGH'  },
                    { type:'spacing', range:[19, 25], value:{ value:10, unit:'PIXELS' }  }
                ],
                                    fontSize:18, key:undefined, value:"hello world how is it going today?", padding:0, width: 1000, strokes:[{ type: 'SOLID', color: { r: .5, g: .2, b: 0 } }], strokeWeight:0 },
                            {type:'text', key:undefined, value:"This is a second piece of text", padding:0, width: 1000, strokes:[{ type: 'SOLID', color: { r: .1, g: .7, b: 0 } }], strokeWeight:0 },
                            {type:'text', fontSize:18, key:undefined, value:"This is just cool!", padding:0, width: 1000, strokeWeight:0 },
                            {type:'text', key:undefined, value:"This is the zigzag design for each element and it just works", padding:0, width: 1000, strokeWeight:0, strokes:[{ type: 'SOLID', color: { r: .5, g: .2, b: 0 } }], strokeWeight:0 },
                        ],
                        
                    }
            ],
            align:'vertical', // or horizontal or diagonal
                        gap: 10,
                        padding:20,
                        matchWidth:true,
                        cornerRadius:10,
                        contentAlign: 'center',
                        tightRadius:true,
                        strokeWeight:3,
                        dynamicBlock:true, // only add Reectangle behind if background fill is there or strokeWeight > 0
                        fills:[{ type: 'SOLID', color: { r: 255/255, g: 255/255, b: 255/255 } }],
                        strokes:[{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]
        }

        // // createEntity({value:'hello world how is it going today?', padding:20, width:100, contentStartX:100, contentStartY:100}, nodes)
        
        // let textNode = figma.createText();
        // let textNode2 = figma.createText();
        
        // textNode.insertCharacters(0, 'hello');
        // textNode.insertCharacters(5, ' world');



        // textNode.insertCharacters(11, ' AGAIN');

        // textNode2.characters = 'nice knowing you!'
        // nodes = [textNode, textNode2]
        // figma.currentPage.selection = createBlock(mockData, nodes);;
        // figma.viewport.scrollAndZoomIntoView(nodes);
    }



    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};