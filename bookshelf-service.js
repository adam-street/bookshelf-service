const fs = require('fs');
const express = require('express');
const cors = require('cors')

// load book list
let book_list = [];
try {
	book_list = JSON.parse(fs.readFileSync('./book-list.json', 'utf8'));
} catch (error) {
	fs.writeFileSync('./book-list.json', JSON.stringify(book_list));
}

// start api
const app = express();
app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
	const filter = req.query.filter;
	if (filter) {
		return res.send(book_list.filter(book => {
			const date_match = new Date(book.published_date).getTime() === new Date(filter).getTime();
			const isbn_match = book.isbn.toString().toUpperCase().includes(filter.toUpperCase());
			const title_match = book.title.toUpperCase().includes(filter.toUpperCase());
			const author_match = book.author.toUpperCase().includes(filter.toUpperCase());

			return date_match || isbn_match || title_match || author_match;
		}));
	}

	return res.send(book_list);
})

app.put('/', function (req, res) {
	const book = req.body;
	const bookIndex = book_list.findIndex(b => b.isbn === req.query.isbn);
	if (bookIndex < 0) {
		return res.send("book not found");
	}

	book_list[bookIndex] = book;
	fs.writeFileSync('./book-list.json', JSON.stringify(book_list));
	return res.send();
});

app.post('/', function (req, res) {
	const bookIndex = book_list.findIndex(b => b.isbn == req.body.isbn);
	if (bookIndex > -1) {
		return res.status(409).send("book already in list");
	}

	book_list.push(req.body);
	fs.writeFileSync('./book-list.json', JSON.stringify(book_list));
	return res.send({
		message: "book added to list"
	});
});

app.delete('/', function (req, res) {
	console.log('delete hit');

	const bookIndex = book_list.findIndex(b => b.isbn == req.query.isbn);
	if (bookIndex < 0) {
		return res.status(409).send("book not found");
	}

	book_list.splice(bookIndex, 1);
	fs.writeFileSync('./book-list.json', JSON.stringify(book_list));
	return res.send();
});

app.listen(3000, () => {
	console.log('service started');
});