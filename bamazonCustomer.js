var mysql = require('mysql');

var inquirer = require('inquirer');

var retrieveQuery = 'SELECT * FROM Products';

var store; // will hold DB object for global use

var userInput; // will hold the object that is returned after user input (inquirer)



var connection = mysql.createConnection({

	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'Bamazon'

});


// Promise used so that database is connected before inquirer prompts the user for a seamless expirence.
	var connectPromise = new Promise(function(resolve, reject){ 
		// makes a connection with the mysql DB
		connection.connect(function(err){
			if(err) throw err;
	
		});
		connection.query(retrieveQuery, function(err, data){
			store = data;
			var ii = false;
			for(var i = 0; i < data.length; i++){

				console.log('--------------------');
				console.log('Product ID#: ' + data[i].ItemID);
				console.log('Name :' + data[i].ProductName);
				console.log('Price: $' + data[i].Price);
				console.log('Quantity: ' + data[i].StockQuantity);

				if(i == (data.length - 1)){
					ii = true;
				}

			}
				if(ii == true){
					resolve();
				}

		});

	});


var startPrompt = function() {

// questions used to gather user inputs.
var questions = [
{
	type: 'input',
	name: 'product',
	message: 'Type in the ID number of the product you want to buy:',
	validate: function(value){
		if(value >= 1 && value <= store.length){
			return true;
		}
		return false;
	}
},
{
	type: 'input',
	name: 'quantity',
	message: 'How many would you like?',
}

];

// code within only executes once promise is fullfilled. 
connectPromise.then(function(){
	// calls inquirer to start question prompts
		inquirer.prompt(questions).then(function(answers){
			userInput = answers; // stored in global variable for use later in program.
			quantityCheck(answers);
		});
	},function(){
 	// err will be thrown and execution will stop before this reject function ever executes.
});

};
// function that makes certain there is enough products to sell.
var quantityCheck = function(userInput){
	var theItem;
	var quanRequest = userInput.quantity;
	var itemRequest = userInput.product;
// checks each item from the data base for item number
	for(var i = 0; i < store.length; i++){
		if(itemRequest == store[i].ItemID){
			theItem = store[i];
			break;
		}
	}


	if(quanRequest > theItem.StockQuantity){
		console.log('The quantity you requested is more than we have in stock!');
	}
	else if(quanRequest <= theItem.StockQuantity){ // prints receipt then updates data base with new total below.
		var total = quanRequest * theItem.Price;
		console.log('=====Your Receipt=====');
		console.log('Product Name: ' + theItem.ProductName);
		console.log('Unit Price: $' + theItem.Price)
		console.log('Quantity: ' + quanRequest);
		console.log('Total: $' + total);
		console.log('Thank You for shopping at Bamazon!');

		var newQuan =  theItem.StockQuantity - quanRequest;
		connection.query('UPDATE Departments SET TotalSales = TotalSales + ' + total + ' WHERE DepartmentName = "' + theItem.DepartmentName + '"');
		var updateQuery = String('UPDATE Products SET StockQuantity = ' + newQuan + ' WHERE ItemID = ' + itemRequest);
		connection.query(updateQuery);
		console.log('Transaction Successful!');
		connection.end();
			
		
	}


};

startPrompt(); // intial function call.



