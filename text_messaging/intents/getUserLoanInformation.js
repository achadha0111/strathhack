const request = require('superagent')

var getUserLoanInformation = function(slc, loan_category, payment, user, debt_query, duration) {
	var interest = (payment) ? payment.raw: ""
	var user = (user) ? user.raw: ""
	var debt_query = (debt_query) ? debt_query.raw: ""
	var bookId = '589f5c6afe584704004f7a41';
	var baseUrl = 'https://api.fieldbook.com/v1/' + bookId;
	return new Promise(function(resolve, reject) {
		request.get(baseUrl + '/loaners/' + user)
		.end((err, res) => {
			if(err) {
				console.log('ERROR')
			}
			else {
				result = JSON.parse(res.body)
				console.log(res)
			}
		}) 
	})
}