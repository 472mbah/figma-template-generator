
figma.showUI(__html__, {width: 300, height: 600});

figma.loadFontAsync({ family: "Inter", style: "Regular" })
figma.loadFontAsync({ family: "Roboto", style: "Regular" })
figma.loadFontAsync({ family: "Roboto", style: "Bold" })
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
        // if (item.name==='Rectangle'){
        //     const line = figma.createLine()
        //     // Move to (50, 50)
        //     line.x = item.x
        //     line.y = item.y
        //     // Make line 200px long
        //     line.resize(200, 0)            
        // }
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


    let { value, width, height, contentStartX, contentStartY, fontSize, textStyling, padding, strokeWeight } = inputInfo;
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
    // ()
    // (strokeWeight||0)
    if (width===undefined || width <= 0){
        inputInfo.width = textNode.width;
    }

    if (height===undefined || height <= 0)
        inputInfo.height = textNode.height;



    textNode.resize(inputInfo.width, inputInfo.height)

    inputInfo.width = textNode.width;
    inputInfo.height = textNode.height;


    let shift = ((padding||0));

    textNode.x = contentStartX + shift;
    textNode.y = contentStartY + shift;

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
    // strokeWeight
    let doublePadding = (padding) * 2;
    
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

    containerNode.x = contentStartX;
    containerNode.y = contentStartY;

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
            secondMainRect.bottomRightRadius = radius[2];
            secondMainRect.bottomLeftRadius = radius[3];    
        }else if (alignType==='horizontal') {
            secondMainRect.topRightRadius = radius[0];
            secondMainRect.bottomRightRadius = radius[2];               
        }
    }

}

const makeValuesConsistent = (object, checklist) => {
    for (let key in checklist) {
        let value = checklist[key];
        let typeof_ = typeof checklist[key];
        if (!object.hasOwnProperty(key)) {
            object[key] = undefined;
        };
        if (object[key] === undefined || object[key] === null || typeof object[key] !== typeof_)
            object[key] = value
    }
}

const shiftValue = (item, value=0, axis='x') => {
    if (Array.isArray(item)) {
        for (let j = 0; j < item.length; j++) {
            shiftValue(item[j], value, axis);
        }
    }
    else {
        item[axis] += value;
    }
}

const createBlock = (data) => {
    try {
        let nodes = [];
        let checklist = { padding:0, strokeWeight:0 }
        let checklistOuter = { padding:0, strokeWeight:0, gap:0 }
        let alignInfo = data.alignInfo;
        let blockAlignDistance = 100;

        let previousGridStatus = 0;
        let gridLevelCounter = 0;
        
        let contentStartX = data.startFromX || 100;
        let contentStartY = data.startFromY || 100;
        
        let maxYValue = contentStartY - blockAlignDistance;
        let maxXValue = contentStartX - blockAlignDistance;

        makeValuesConsistent(data, checklistOuter);

        data.blocks.forEach(section=>{

            let primeRect = figma.createRectangle();

            let groupedNodes = [];
            let { contents } = section;
            let { align, gap, contentAlign, matchWidth, matchHeight, dynamicBlock, cornerRadius, fills, strokes, strokeWeight, padding, tightRadius } = data;
            let zigZagRight = true;

            if (!Array.isArray(cornerRadius)) {
                cornerRadius = [cornerRadius, cornerRadius, cornerRadius, cornerRadius]
            }

            let inZigZagModeShiftLeft = false;
            let inZigZagModePreviousXMax = undefined;


            contents.forEach(cont=> {
                cont.contentStartX = contentStartX;
                cont.contentStartY = contentStartY;
                
                makeValuesConsistent(cont, checklist);
                let dimensions = createEntity(cont, groupedNodes);

                if (inZigZagModeShiftLeft) {
                    shiftValue(groupedNodes[groupedNodes.length - 1], -(dimensions.xMax - dimensions.xMin), 'x');
                    inZigZagModeShiftLeft = false;
                    inZigZagModePreviousXMax = dimensions.xMax - (dimensions.xMax - dimensions.xMin)
                }

                if (align==='vertical' || align==='diagonal')
                    contentStartY = dimensions.yMax + gap
                if (align==='horizontal' || align==='diagonal'){
                    contentStartX = dimensions.xMax + gap
                }
                if (align==='zigzag') {
                    contentStartY = dimensions.yMax + gap
                    if (zigZagRight){
                        contentStartX = inZigZagModePreviousXMax!==undefined ? inZigZagModePreviousXMax : dimensions.xMax
                        inZigZagModeShiftLeft = false;
                        // const line = figma.createRectangle()
                        // line.x = dimensions.xMax
                        // line.y = dimensions.yMax
                        // line.resize(20, 30)                        
                    }
                    else {
                        contentStartX = dimensions.xMin
                        inZigZagModeShiftLeft = true;

                    }
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
                (Array.isArray(strokes) && strokes.length) ||
                (Array.isArray(fills) && fills.length)

                
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
                        contentStartX:primeDimensions.xMin - padding, 
                        contentStartY: primeDimensions.yMin - padding,
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
            }else {
                groupedNodes.push(primeRect);
            }

            let flattenedBlock = [];
            flattenArray(groupedNodes, flattenedBlock)
            let blockDimensions = findContentDimensions(flattenedBlock);
            
            // alignInfo { type, direction, batchSize }

            if (alignInfo.type==='flex') {
                if (alignInfo.direction==='horizontal') {
                    contentStartX = blockDimensions.xMax + blockAlignDistance;
                    contentStartY = 100;
                }else {
                    contentStartX = 100;
                    contentStartY = blockDimensions.yMax + blockAlignDistance;
                }
            }else {

                if (alignInfo.direction==='vertical') {

                    let gridStatus = Math.floor(gridLevelCounter%alignInfo.batchSize);
                    let reset = gridStatus===(alignInfo.batchSize-1);
                    // let tempText = figma.createText();
                    // tempText.characters = `${gridLevelCounter} ( ${contentStartX}, ${contentStartY} ) - counter:${gridLevelCounter}, modulo:${gridStatus}, reset:${reset.toString()}`;
                    // tempText.x = contentStartX;
                    // tempText.y = contentStartY;

                    contentStartX = reset ? 100 : blockDimensions.xMax + blockAlignDistance;
                    contentStartY = reset ? blockDimensions.yMax + blockAlignDistance : maxYValue + blockAlignDistance;

                    if (reset) maxYValue = blockDimensions.yMax;

                    gridLevelCounter++;

                    // if (gridStatus === 0) {
                    //     maxYValue = blockDimensions.yMax;
                    //     contentStartX = 100;
                    // }

                    // console.log(gridLevelCounter-1, maxYValue, contentStartY);

                    // previousGridStatus = gridStatus;

                }else {

                    let gridStatus = Math.floor(gridLevelCounter%alignInfo.batchSize);
                    let reset = gridStatus===(alignInfo.batchSize-1);

                    // let tempText = figma.createText();
                    // tempText.characters = `${gridLevelCounter} ( ${contentStartX}, ${contentStartY} ) - counter:${gridLevelCounter}, modulo:${gridStatus}, reset:${reset.toString()}`;
                    // tempText.x = contentStartX;
                    // tempText.y = contentStartY;

                    contentStartX = reset ? blockDimensions.xMax + blockAlignDistance : maxXValue + blockAlignDistance; 
                    contentStartY = reset ? 100 : blockDimensions.yMax + blockAlignDistance;

                    if (reset) maxXValue = blockDimensions.xMax;

                    gridLevelCounter++;

                }


            }



            nodes.push(groupedNodes)
    
        })
    
        let flatNodes = []
        flattenArray(nodes, flatNodes)
        return flatNodes;

    }catch (e) {
        console.log(e);
        figma.closePlugin();
        return []
    }
}

figma.ui.onmessage = function (msg) {

    if (msg.type === 'create-block') {
        var nodes = [];
        figma.currentPage.selection = createBlock(msg.value, nodes);
        // figma.currentPage.selection = createBlock(mockData, nodes);;
        figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};