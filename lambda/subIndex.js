const textUtils = require('./textUtils');
const rest = require('./restApi');

exports.executeTeacher = function (bundle) {
    return new Promise(((resolve, reject) => {
        let path = textUtils.checkName(bundle.name);
        resolve(rest.getName(bundle.name, path, function (error, data){
            if(error){
                console.log(error);
                return error;
            }
            console.log("Name info retrieved succesfully.");
            let text = '';
            let card = '';
            switch(data.length){
                case 0:
                    text = 'No se ha encontrado a nadie por ese nombre.'
                    card = text;
                    break;
                case 1:
                    text = 'Esta es la información encontrada sobre '+data[0].nombre+' '+data[0].apellido1+' '+data[0].apellido2
                    card = data[0].nombre+' '+data[0].apellido1+' '+data[0].apellido2+'\n'
                    if(data[0].telefono!==''){
                        text+='. Su número de teléfono es <say-as interpret-as="telephone">'+data[0].telefono.replace('-','')+'</say-as>'
                        card+='Telefono: '+data[0].telefono.replace('-','')+'\n'
                    }
                    if(data[0].email!==''){
                        text+='. Su correo es '+data[0].email
                        card+='email: '+data[0].email+'\n'
                    }
                    break;
                default:
                    text = 'Se han encontrado '+data.length+' resultados con ese nombre, por favor añada su apellido en la búsqueda.'
                    for(let i=0;i<data.length;i++){
                        card += data[i].nombre+' '+data[i].apellido1+' '+data[i].apellido2+'\n '
                    }
                    break;
            }
            return {'text':text, 'card':card};
            
        }))
    }))
}

exports.executeHorarios = function (bundle) {
    return new Promise(((resolve, reject) => {
        let mainPath = '/export/sites/uva/2.docencia/2.01.grados/2.01.02.ofertaformativagrados/2.01.02.01.alfabetica/index.html';
        resolve(rest.getWebPage(mainPath, function (error, data){
            if(error){
                console.log(error);
                return error;
            }
            let dataSplit = data.split("\n");
            let gradoLine = textUtils.searchStringInArray(bundle.grado, dataSplit);
            let text = '';
            if(gradoLine === -1){
                text = 'No he podido encontrar el grado '+bundle.grado+'. Por favor inténtelo de nuevo.';
                return text;
            }
            console.log("Career path retrieved succesfully.");
            let pathGrado = dataSplit[gradoLine].split("\"")[1]
            return rest.getWebPage(pathGrado, function(error, data){
                let dataSplit = data.split("\n");
                let tablaLine = textUtils.searchStringInArray("tutorias.htm", dataSplit);
                let tablaPath = dataSplit[tablaLine].split("\"")[3]
                return rest.getWebPage(tablaPath, function(error, data){
                    if(error){
                        console.log(error);
                        return error;
                    }
                    let timeTableArray = textUtils.extractTimeTables(data, bundle.profesor);
                    let text = '';
                    if (timeTableArray === -1){
                        text = 'No he podido encontrar a '+bundle.profesor+' del grado en '+bundle.grado+'. Por favor inténtelo de nuevo.';
                        return text;
                    }
                    let timeTable = textUtils.timeTableJSON(timeTableArray);
                    text = 'El horario de tutorías para '+bundle.profesor+' es ';
                    var today = new Date();
                    var limit = new Date('2021-02-15');
                    for (let j=timeTable.length-1;j>=0;j--){
                        if(today < limit){
                            if(timeTable[j]['formato'] !== 'Segundo Cuatrimestre'){
                                text = text.concat('los '+timeTable[j]['dia']+
                                                   ' de '+timeTable[j]['desde']+
                                                   ' a '+timeTable[j]['hasta']+
                                                   ' en '+timeTable[j]['facultad']+
                                                   ' despacho '+timeTable[j]['despacho'].split(" ")[1]+
                                                   '. ')
                            } 
                        }
                        else{
                            if(timeTable[j]['formato'] !== 'Primer Cuatrimestre'){
                                text = text.concat('los '+timeTable[j]['dia']+
                                                   ' de '+timeTable[j]['desde']+
                                                   ' a '+timeTable[j]['hasta']+
                                                   ' en '+timeTable[j]['facultad']+
                                                   ' despacho '+timeTable[j]['despacho'].split(" ")[1]+
                                                   '. ')
                            } 
                        }
                        
                    }
                    return text;
                    
                })
            })
        }))
    }))
}

exports.textUtils = textUtils;
exports.rest = rest;
