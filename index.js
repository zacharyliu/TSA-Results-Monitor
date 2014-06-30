var cheerio = require('cheerio');
var request = require('request');

var titleRegex = /(.*?) \((.*?)\)/;

var seenEvents = [];

function check(done) {
    console.log("Checking...");
    request('https://www.registermychapter.com/tsa/nat/results.aspx', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var events = $('#TR table');
            for (var i = 0; i < events.length; i++) {
                var fullTitle = events.eq(i).find('tr:first-child th').html();
                var match = titleRegex.exec(fullTitle);
                var eventTitle = match[1];
                var eventLevel = match[2];
                if (eventLevel == "High School") {
                    if (seenEvents.indexOf(eventTitle) == -1) {

                        seenEvents.push(eventTitle);

                        var teams = events.eq(i).find('tr td');

                        var teamIsInList = false;
                        for (var j=0; j<teams.length; j++) {
                            if (teams.eq(j).html().indexOf('T0550') > -1) {
                                teamIsInList = true;
                                break;
                            }
                        }

                        var message = "HTHS " + (teamIsInList ? "is semifinalist" : "is not semifinalist") + " in " + eventTitle;

                        console.log(message);

                        if (done) done();
                    }
                }
            }
        }
    });
}

check();
