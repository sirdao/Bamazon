var mysql = require('mysql');

var inquirer = require('inquirer');

require('console.table');

var connection = mysql.createConnection({

	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'Bamazon'

});


// makes a connection with the mysql DB
connection.connect(function(err){
	if(err) throw err;

});

var questions = [
	{
		type: 'list',
		name: 'choice',
		message: 'What Would You like to do?',
		choices: [
			'View Product Sales by Department',
			'Create New Department'
		]
	}
];

var createDep = [
	{
		type: 'input',
		name: 'name',
		message: 'Enter Department Name: '

	},
	{
		type: 'input',
		name: 'overhead',
		message: 'Enter Estimate Overhead Costs: '
	},
	{
		type: 'input',
		name: 'sales',
		message: 'Enter Any Sales so far: '
	}
];

var overView = function(){

	connection.query('SELECT * FROM Departments', function(err, data){
		
		for(var i = 0; i < data.length; i++){
			data[i]['profit'] = data[i].TotalSales - data[i].OverHeadCosts;
			if(i == data.length - 1){
				console.table(data);
				homePrompt();
			}
		}
	});
};

var createNew = function(){

	inquirer.prompt(createDep).then(function(input){
		var theQuery = 'INSERT INTO Departments (DepartmentName, OverHeadCosts, TotalSales) VALUES("' + input.name + '",' + input.overhead + ',' + input.sales + ')';
		connection.query(theQuery);
		console.table([input]);
		console.log('Successfully added to DataBase');
		homePrompt();
	});

};




var homePrompt = function(){

inquirer.prompt(questions).then(function(input){

	switch (input.choice) {
		case 'View Product Sales by Department':
		overView();
		break;
		case 'Create New Department':
		createNew();
		break;
	}

});

};
homePrompt();


