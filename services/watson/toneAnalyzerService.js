//Tone Analyzer Watson Third Party Module and we specify which release we would like to call the Watson NLU Service.
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

// override the version to use 21-September Watson Tone Analyzer release
const TONE_ANALYZER_VERSION = '2017-09-21';
var tone_analyzer = new ToneAnalyzerV3({
    username: process.env.TONE_ANALYZER_USERNAME,
    password: process.env.TONE_ANALYZER_PASSWORD,
    version_date: TONE_ANALYZER_VERSION
});

const FRENCH_LANGUAGE='fr';

/*
 * Call Watson Tone Analyzer Service to extract the tones
 */
exports.extractTones = function (originalFeedback, translatedFeedback, feedbackLanguage) {
    var promise = new Promise((resolve, reject) => {
        var params;

        /* Watson Tone Analyzer supports English and French. 
        In case the feedback language is French, pass to the service the original feedback text
        Otherwise, pass the English feedback translation
        */
        if (feedbackLanguage === FRENCH_LANGUAGE) {
            params = {
                tone_input: originalFeedback,
                content_type: 'text/plain',
                sentences: false,
                content_language: FRENCH_LANGUAGE
            };
        } else {
            params = {
                tone_input: translatedFeedback,
                content_type: 'text/plain',
                sentences: false
            };
        }

        tone_analyzer.tone(params,
            function (err, tone) {
                if (err) {
                    reject(err);
                } else {
                    var toneAnalyzerResponse = JSON.parse(JSON.stringify(tone, null, 2));
                    // Return the output tones
                    var outputTones = [];
                    toneAnalyzerResponse.document_tone.tones.forEach(function (tone) {
                        var outputTone = {};
                        outputTone.name = tone.tone_name;
                        outputTone.score = tone.score;
                        outputTones.push(outputTone);
                    });
                    resolve(outputTones);
                }
            }
        );
    });
    return promise;

};