//Language Translator Watson Third Party Module
var LanguageTranslatorV2 = require('watson-developer-cloud/language-translator/v2');

var language_translator = new LanguageTranslatorV2({
    username: process.env.LANGUAGE_TRANSLATOR_USERNAME,
    password: process.env.LANGUAGE_TRANSLATOR_PASSWORD,
    url: 'https://gateway.watsonplatform.net/language-translator/api/'
});

// Two-letter language code for English
const ENGLISH_LANGUAGE = 'en';

/*
 * Call Watson Language Translator Service to identify the language
 */
exports.identifyLanguage = function (feedback) {
    var promise = new Promise((resolve, reject) => {
        language_translator.identify({
            text: feedback
        },
            function (err, language) {
                if (err) {
                    reject(err);
                } else {
                    // Return the detected language
                    var languages = JSON.parse(JSON.stringify(language, null, 2));
                    var detectedLanguage = languages.languages[0].language;
                    resolve(detectedLanguage);
                }
            }
        )
    });
    return promise;
};


/*
 * Call Watson Language Translator service to translate into English
 */
exports.translateIntoEnglish = function (feedback, sourceLanguage) {
    var promise = new Promise((resolve, reject) => {
        // If source language is English, return the text without modification
        if (sourceLanguage === ENGLISH_LANGUAGE) {
            resolve(feedback);
            return promise;;
        }

        language_translator.translate({
            text: feedback,
            model_id: sourceLanguage + '-' + ENGLISH_LANGUAGE
        },
            function (err, translation) {
                if (err) {
                    reject(err);
                } else {
                    // Return the English Translation
                    var translation = JSON.parse(JSON.stringify(translation, null, 2));
                    resolve(translation.translations[0].translation);
                }
            }
        );
    });
    return promise;
};