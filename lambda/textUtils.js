'use strict';

//==============================================================================
//Text data manipulation functions
//==============================================================================


function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].toLowerCase().match(str)) return j;
    }
    return -1;
}


function checkName(rawName){
    var output = '';
    console.log(rawName);
    var completeName = encodeURIComponent(rawName).split('%20');
    console.log(completeName);
    console.log(completeName[0]);
    switch(completeName.length){
        case 0:
            break;
        case 1:
            output = '/directorio_ws/index.php/Directorio/search/nombre/'+completeName[0]+'/' ;
            break;
        case 2:
            output = '/directorio_ws/index.php/Directorio/search/nombre/'+completeName[0]+'/apellido1/'+completeName[1];
            break;
        case 3:
            output = '/directorio_ws/index.php/Directorio/search/nombre/'+completeName[0]+'/apellido1/'+completeName[1]+'/apellido2/'+completeName[2];
            break;
        case 4:
            if(completeName[1]==='de'){
                completeName[0]+='%20'+completeName[1];
                if(completeName[2]==='la' || completeName[2]==='los'){
                    completeName[0]+='%20'+completeName[2];
                    completeName.splice(2,1);
                    output = '/directorio_ws/index.php/Directorio/search/nombre/'+completeName[0]+'/apellido1/'+completeName[1]
                    break;
                }
                else{
                    completeName.splice(1,1);
                }
            }
            else if(completeName[1]==='del'){
                completeName[0]+='%20'+completeName[1];
                completeName.splice(1,1);
            }
            else if(completeName[2]==='de' || completeName[2]==='del'){
                completeName[1]+='%20'+completeName[2];
                completeName.splice(2,1);
            }
            output = '/directorio_ws/index.php/Directorio/search/nombre/'+completeName[0]+'/apellido1/'+completeName[1]+'/apellido2/'+completeName[2];
            break;
        case 5:
            if(completeName[1]==='de'){
                completeName[0]+='%20'+completeName[1];
                completeName[0]+='%20'+completeName[2];
                completeName.splice(2,1);
                completeName.splice(1,1);
            }
            else if(completeName[2]==='de'){
                completeName[1]+='%20'+completeName[2];
                completeName[1]+='%20'+completeName[3];
                completeName.splice(3,1);
                completeName.splice(2,1);
            }
            output = '/directorio_ws/index.php/Directorio/search/nombre/'+completeName[0]+'/apellido1/'+completeName[1]+'/apellido2/'+completeName[2];
            break;
        default:
            break;
    }
    return output;
}

function extractTimeTables(webPage, profesor){
    var timeTable = [];
    let textByTeacher = webPage.split('<span style="font-family: Arial; color: #000000; font-size: 14px; line-height: 1; *line-height: normal; font-weight: bold;">');
    textByTeacher.shift();
    let timeTableLine = searchStringInArray(profesor, textByTeacher);
    let timeTableText = textByTeacher[timeTableLine].split("\n");
    for(var i in timeTableText){
        if(timeTableText[i].match('<span style="font-family: \'DejaVu Sans\', Arial, Helvetica, sans-serif; color: #000000; font-size: 10px; line-height: 1.215332;">')){
            timeTable.push(timeTableText[i].split(">")[1].split("<")[0]);
        }
    }
    return timeTable;
}

function timeTableJSON(array){
    var timeTableFormated = []
    let template = {};
    for (let i=0; i < array.length/6; i++){
        template =  {'formato':'','dia':'','desde':'','hasta':'','facultad':'','despacho':''};
        for (let j=0;j<6;j++){
            template[Object.keys(template)[j]]=array[(i*6)+j];
        }
        timeTableFormated.push(template);

    }
    return timeTableFormated;
}

//==============================================================================
//Slots data extraction function
//==============================================================================

/**
 * @description Extract and check the slots data.
 * @param {JSON} obj The JSON with the raw slots data.
 * @returns {object}
 */
function getSlots(obj) {
    var extracted = {}
    //Object iteration
    Object.keys(obj).forEach(function (d) {
        //Check if default slot type
        if (!Object.keys(obj[d]).includes('resolutions')) {
            extracted[d] = obj[d].value;
        }
        //Check if custom slot type and if succesfull id 
        else if (obj[d].resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
            extracted[d] = obj[d].resolutions.resolutionsPerAuthority[0].values[0].value.id
        }
        //Error on slot identification
        else {
            return null;
        }
    });
    return extracted;
}

module.exports = {
    getSlots,
    searchStringInArray,
    extractTimeTables,
    timeTableJSON,
    checkName
}