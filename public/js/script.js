
const myfunction = (ev) => {

	const form = document.getElementById('form');
	const result = document.getElementById('result');
	const text = document.getElementById('text-underline');

	const buildHtml = (Errors, formData, text, result, htmlDisplayer) => {
		//build erreur display
		htmlDisplayer = Errors.map(element => {
			return `<div class="item">
					<div>❌ <b>${element.error}</b> -> <span style="color:#24855B">${element.substitution}</span></div>
					<div>${element.message}</div>
					</div>
					<br />
					<hr>
					<br />`
		}).join('');

		let emphasize = Errors.map(x => ({ startIndex: x.start - 2, endIndex: x.end - 2, mot: x.error }))
		let indexGap = 0
		for (let el of emphasize) {
			formData = formData.slice(0, (el.startIndex + indexGap)) + "<highlight>" + el.mot + "</highlight>" + formData.slice(el.endIndex + indexGap);
			indexGap += 23 // cause balises are added to string
		}
		text.innerHTML = formData;
		result.innerHTML = htmlDisplayer;
	}

	form.addEventListener('submit', async event => {
		event.preventDefault();

		let formData = document.getElementById('text').value;
		// todo refacto logic, so repeat code can be write only once
		try {

			// Call the Node server Api
			const response = await axios.post('http://localhost:5000/api', { text: formData }, { headers: { 'Content-Type': 'application/json' } });
			const data = response.data.document; // get xml response from Cordial API

			// lets gather all errors in one Array
			let Errors = []
			let htmlDisplayer = ""

			// if No error then return nothing
			if (data.sentences._nb == "0") {
				result.innerHTML = "Congrats, I couldn't find any mistakes 👏🏼";
			}
			// check if sentence is just {Object}
			else if (data.sentences._nb == "1") {
				let errors = data.sentences.sentence.errors
				if (errors._nb == "1") {
					Errors.push({
						start: errors.error._start,
						end: errors.error._end,
						message: errors.error.message,
						error: formData.substring(errors.error._start - 2, errors.error._end - 2),
						substitution: errors.error._substitution
					});
				} else {
					errors.error.forEach(el => {
						Errors.push({
							start: el._start,
							end: el._end,
							message: el.message,
							error: formData.substring(el._start - 2, el._end - 2),
							substitution: el._substitution
						});
					})
				}

				// set html return
				buildHtml(Errors, formData, text, result, htmlDisplayer);

			}
			// check if sentence is an [Array]
			else {
				// Cordial split response by sentences, so for each sentences
				data.sentences.sentence.forEach(element => {
					// for each error in sentence
					if (element.errors._nb == "1") {
						Errors.push({
							start: element.errors.error._start,
							end: element.errors.error._end,
							message: element.errors.error.message,
							error: formData.substring(element.errors.error._start - 2, element.errors.error._end - 2),
							substitution: element.errors.error._substitution
						});
					}
					else {
						element.errors.error.forEach(el => {
							// add an object that describe the erro with all elements needed
							Errors.push({
								start: el._start,
								end: el._end,
								message: el.message,
								error: formData.substring(el._start - 2, el._end - 2),
								substitution: el._substitution
							});
						})
					}
				});

				buildHtml(Errors, formData, text, result, htmlDisplayer);

			}
		}
		catch (error) {
			console.error(`An error occurred while calling the node API : ${error}`);
		}

	});
};

