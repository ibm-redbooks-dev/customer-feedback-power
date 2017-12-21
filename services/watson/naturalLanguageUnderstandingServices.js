//Natural Language Understanding Watson Third Party Module and we specify which release we would like to call the Watson NLU Service.
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

var natural_language_understanding = new NaturalLanguageUnderstandingV1({
    username: process.env.NATURAL_LANGUAGE_UNDERSTANDING_USERNAME,
    password: process.env.NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD,
    version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27,
    headers: {'X-Watson-Technology-Preview' : '2017-07-01'} // Use neural machine translation
});

/*
 * Call Watson Language Understanding Service to extract sentiments and keywords
 */
exports.extractSentimentAndKeywords = function (feedback) {
    var promise = new Promise((resolve, reject) => {
        // Specify the sentiment and keywords feature of Natural Language Understanding
        natural_language_understanding.analyze({
            text: feedback,
            features: {
                sentiment: {},
                keywords: {}
            }
        },
            function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    var nluResponse = JSON.parse(JSON.stringify(response, null, 2));
                    var output = {};
                    output.sentiment = nluResponse.sentiment.document.label;
                    output.keywords = '';
                    // Return the relevant keywords as space seperated
                    nluResponse.keywords.forEach(function (keyword) {
                        if (keyword.relevance > 0.5) {
                            output.keywords += keyword.text + ' ';
                        }
                    });
                    output.keywords = output.keywords.trim();
                    resolve(output);
                }
            }
        );
    });
    return promise;
};