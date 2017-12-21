/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Load environment variables from .env file
require('dotenv').config();

var port = process.env.PORT || 3000;

//Express Web Framework, and create a new express server
var express = require('express'),
	app = express();

// Helper modules
var path = require('path');
    bodyParser = require('body-parser');
global.__basedir = __dirname;

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}));

//Routes modules
var index = require('./routes'),
	watson = require('./routes/watson');
	api = require('./routes/api');

//In case the caller access any resource under the root /, call index route
app.use('/', index);

//In case the caller access any resource under /watson, call watson route
app.use('/watson', watson);


//In case the caller access any resource under /watson, call watson route
app.use('/api', api);

//In case caller want to see the dashboard, call the /feedback, 
app.use("/dashboard", express.static(path.join(__dirname, "/dashboard")));

// start server on the specified port and binding host
app.listen(port, function(){
	console.log("The server is running on http:localhost:", port);
	console.log("To stop the server, press: crtl + c");
});
