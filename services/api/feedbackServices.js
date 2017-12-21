var ibmdb = require('ibm_db');
var dbname = process.env.DB2_DATABASE_NAME;
var userid = process.env.DB2_DATABASE_UID
var password = process.env.DB2_DATABASE_PWD
var hostname = process.env.DB2_DATABASE_HOSTNAME
var dbPort = process.env.DB2_DATABASE_PORT
/*
 * Call Watson Language Translator Service to identify the language
 */
exports.getFeedback = function () {
    var promise = new Promise((resolve, reject) => {
        const sql = "SELECT * FROM testschema.feedback";
        /*
        create the object to send data back to the browser
        */
        var data = {};
        /*Connect to the database server
        param 1: The DSN string which has the details of database name to connect to, user id, password, hostname, portnumber 
        param 2: The Callback function to execute when connection attempt to the specified database is completed
        */
        ibmdb.open("DRIVER={DB2};DATABASE="+dbname+";UID="+userid+";PWD="+password+";HOSTNAME="+hostname+";port="+dbPort+"", function (err, conn) {
            if (err) {
                /*
                On error in connection, log the error message on console 
                */
                console.error("error: ", err.message);
                reject(err);
            } else {
                /*
                    On successful connection issue the SQL query by calling the query() function on Database
                    param 1: The SQL query to be issued
                    param 2: The callback function to execute when the database server responds
                */
                conn.query(sql, function (err, feedback, moreResultSets) {
                    /*
                        create the auxiliar variables to format 	
                    */
                    let avgValues = [];
                    let avgAnger = 0.00;
                    let avgFear = 0.00;
                    let avgJoy = 0.00;
                    let avgSadness = 0.00;
                    let avgSentiment = 0.00;
                    let sentimentPositive = 0.00;
                    let sentimentNegative = 0.00;
                    let sentimentNeutral = 0;
                    let rows = feedback.length;
                    /*
                        Loop through the feedback list returned and calculate the sentiment scores to display in the dashboard
                    */
                    for (var i = 0; i < feedback.length; i++) {
                        avgAnger = avgAnger + parseFloat(feedback[i].ANGER);
                        avgFear = avgFear + parseFloat(feedback[i].FEAR);
                        avgJoy = avgJoy + parseFloat(feedback[i].JOY);
                        avgSadness = avgSadness + parseFloat(feedback[i].SADNESS);
                        switch (feedback[i].SENTIMENT.trim()) {
                            case 'positive':
                                sentimentPositive += 1;
                                break;
                            case 'negative':
                                sentimentNegative += 1;
                                break;
                            case 'neutral':
                                sentimentNeutral += 1;
                                break;
                        }
                    }
                    /*
                    prepare the average and the style for the dashboard bars
                    */
                    avgValues.push({
                        anger: (avgAnger / rows) * 100,
                        anger_p: "width:" + (avgAnger / rows) * 100 + "%",
                        fear: (avgFear / rows) * 100,
                        fear_p: "width:" + (avgFear / rows) * 100 + "%",
                        joy: (avgJoy / rows) * 100,
                        joy_p: "width:" + (avgJoy / rows) * 100 + "%",
                        sadness: (avgSadness / rows) * 100,
                        sadness_p: "width:" + (avgSadness / rows) * 100 + "%",
                        positive: (sentimentPositive / rows) * 100,
                        positive_p: "width:" + (sentimentPositive / rows) * 100 + "%",
                        negative: (sentimentNegative / rows) * 100,
                        negative_p: "width:" + (sentimentNegative / rows) * 100 + "%",
                        neutral: (sentimentNeutral / rows) * 100,
                        neutral_p: "width:" + (sentimentNeutral / rows) * 100 + "%",
                    });
                    data.dashboard = avgValues;
                    data.detail = feedback;
                    resolve(data);
                    /*
                        Close the connection to the database
                        param 1: The callback function to execute on completion of close function.
                    */
                    conn.close(function () {
                        console.log("DB Connection Closed");
                    });
                });
            }
        });
    });
    return promise;
};

exports.saveFeedback = function (parameters) {
    var promise = new Promise((resolve, reject) => {

        //check the tone analyzer return
        var toneList = {};
        parameters.tones.forEach(function (tone) {
            switch (tone.name) {
                case 'Fear':
                    toneList.fear = tone.score;
                    break;
                case 'Anger':
                    toneList.anger = tone.score;
                    break;
                case 'Joy':
                    toneList.joy = tone.score;
                    break;
                case 'Sadness':
                    toneList.sadness = tone.score;
                    break;
            }
        });

        const sql = "INSERT INTO testschema.FEEDBACK (ORIGINAL_FEEDBACK, LANGUAGE, ENGLISH_FEEDBACK, SENTIMENT, ANGER, FEAR, JOY, SADNESS, KEYWORDS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
        const params = [
            parameters.originalFeedback,
            parameters.language,
            parameters.englishFeedback,
            parameters.nlu.sentiment,
            toneList.anger || 0,
            toneList.fear || 0,
            toneList.joy || 0,
            toneList.sadness || 0,
            parameters.nlu.keywords
        ];

        ibmdb.open("DRIVER={DB2};DATABASE="+dbname+";UID="+userid+";PWD="+password+";HOSTNAME="+hostname+";port="+dbPort+"", function (err, conn) {
            if (err) {
                console.error("error: ", err.message);
            } else {
                conn.query(sql, params, function (err, result) {

                    resolve(result);

                    conn.close(function () {
                        console.log("Connection Closed");
                    });
                });
            }
        });
    });
    return promise;
};

