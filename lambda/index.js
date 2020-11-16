const Alexa = require('ask-sdk');
const textUtils = require('./textUtils');
const subIndex = require('./subIndex');

function callDirectiveService(speech, handlerInput) {

    const requestEnvelope = handlerInput.requestEnvelope;
    const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();

    const requestId = requestEnvelope.request.requestId;
    const endpoint = requestEnvelope.context.System.apiEndpoint;
    const token = requestEnvelope.context.System.apiAccessToken;

    const directive = {
        header: {
            requestId,
        },
        directive: {
            type: 'VoicePlayer.Speak',
            speech: speech + ' Gracias por esperar.',
        },
    };
    // send directive
    return directiveServiceClient.enqueue(directive, endpoint, token);
}

const TeacherHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'teacher';
    },
    async handle(handlerInput) {
        var me = handlerInput.requestEnvelope;

        //slots check and extraction
        var slots = {};
        var sourceSlots = me.request.intent.slots;
        slots = textUtils.getSlots(sourceSlots);
        if (!slots) {
            throw new Error('no se han podido detectar los slots');
        }
        var nombre = slots.nombre;
        var bundle = {
            'speechWaiting': 'Voy a mirar en los archivos.',
            'name': nombre,
        }

        try {
            callDirectiveService(bundle.speechWaiting, handlerInput);
        } catch (err) {
            // if it failed we can continue, just the user will wait longer for first response
            console.log(err);
        }
        try {
            const responseBundle = await subIndex.executeTeacher(bundle);
            return handlerInput.responseBuilder
                .speak(responseBundle.text)
                .withSimpleCard('Resultados', responseBundle.card)
                .getResponse()
        } catch (err) {
            console.log(err);
        }
    }
};

const HorariosHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'horarios';
    },
    async handle(handlerInput) {
        var me = handlerInput.requestEnvelope;

        //slots check and extraction
        var slots = {};
        var sourceSlots = me.request.intent.slots;
        slots = textUtils.getSlots(sourceSlots);
        if (!slots) {
            throw new Error('no se han podido detectar los slots');
        }
        var grado = slots.grado;
        var profesor = slots.profesor;
        var bundle = {
            'speechWaiting': 'Un momento que consulto las tablas de horarios.',
            'grado': grado,
            'profesor': profesor,
        }
        try {
            callDirectiveService(bundle.speechWaiting, handlerInput);
        } catch (err) {
            // if it failed we can continue, just the user will wait longer for first response
            console.log(err);
        }
        try {
            const responseText = await subIndex.executeHorarios(bundle);
            return handlerInput.responseBuilder
                .speak(responseText)
                .withSimpleCard('Resultados', responseText)
                .getResponse()
        } catch (err) {
            console.log(err);
        }
    }
};


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hola, bienvenido a Uva Informer. Puedo ofrecerte información sobre profesores u horarios de tutoría. ¿Cuál te gustaría probar?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Puedes pedir información o el horario de tutorías de un profesor. Prueba a decir <break strength="weak"/>  información sobre profesores. Ó <break strength="weak"/> el horario de tutorías.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Adiós!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Lo siento, no sé nada sobre ese tema. Por favor intentelo de nuevo.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo siento, he tenido problemas intentando hacer lo que me has pedido. Por favor inténtelo de nuevo.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        TeacherHandler,
        HorariosHandler,
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();
