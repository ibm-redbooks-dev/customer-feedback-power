// watson.js - Watson route module
var express = require('express');
	router = express.Router();

// Services instantiation 
var languageTranslatorServices = require('../services/watson/languageTranslatorServices');
	toneAnalyzerServices = require('../services/watson/toneAnalyzerService');
	naturalLanguageUnderstandingServices = require('../services/watson/naturalLanguageUnderstandingServices');
	feedbackServices = require('../services/api/feedbackServices');

//error message for missing Feedback
const MISSING_FEEDBACK_ERROR = 'Feedback not passed';

router.post('/', function (req, res) {
	//If the feedback is not passed, return error to the caller
	if (req === null || req.body === null || req.body.feedback === null) {
		res.status(500).send(MISSING_FEEDBACK_ERROR);
	}

	// outputAnalysis object contains all the analysis extracted from the customer feedback
	var outputAnalysis = {};
	outputAnalysis.originalFeedback = req.body.feedback;

	// Identify the feedback language
	languageTranslatorServices.identifyLanguage(outputAnalysis.originalFeedback)
		.then(sourceLanguage => {
			outputAnalysis.language = sourceLanguage;
			// Translate the Feedback into English
			return languageTranslatorServices.translateIntoEnglish(outputAnalysis.originalFeedback, outputAnalysis.language);
		}, err => res.status(500).send(err))
		.then(translation => {
			outputAnalysis.englishFeedback = translation;
			// Extract Sentiment and Keywords from the English translated feedback
			var nluPromise = naturalLanguageUnderstandingServices.extractSentimentAndKeywords(outputAnalysis.englishFeedback)
			// Extract tones from the English translated feedback, or from the feedback directly if it's in English or French
			var tonePromise = toneAnalyzerServices.extractTones(outputAnalysis.originalFeedback, outputAnalysis.englishFeedback, outputAnalysis.language);		
			// Make two parallel calls to extractSentimentAndKeywords and extractTones then output the analysis
			Promise.all([nluPromise , tonePromise]).then(values => {
				outputAnalysis.nlu = values[0];
				outputAnalysis.tones = values[1];
				feedbackServices.saveFeedback(outputAnalysis);

				res.redirect('/thanks');
			});
			
		}, err => res.status(500).send(err));
});

module.exports = router;