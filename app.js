const express = require('express');
const app = express();
const config = require('config');
const fs = require('fs');

const app_key = config.get("AppAuthKey");
const port = config.get("port");

app.use(express.json());
app.use(express.urlencoded({
    "extended": true
}));


var user_auth = function (req, res, next) {
  req_api_key = req.headers['authorization'];
  if (req_api_key) {
    const bearer = req_api_key.split(' ');
    const bearerToken = bearer[1];
    if(bearerToken == app_key){
	    next();
	} else {
    	res.sendStatus(403);
 	}
  } else {
    res.sendStatus(403);
  }
};

app.use(user_auth);


const data_file_path = 'data.json';

const contacts = JSON.parse(fs.readFileSync(data_file_path));

app.get("/api/contacts", function (req, res) {
    res.send(JSON.parse(fs.readFileSync(data_file_path)));
});

app.get("/api/contacts/:id", function (req, res) {
	var contacts_data = JSON.parse(fs.readFileSync(data_file_path));
    const constant = contacts_data.find(u => u.id === parseInt(req.params.id));
    if (!constant) {
        res.status(404).send();
    } else {
        res.send(constant);
    }
});

app.post("/api/contact", function (req, res) {
    const contact = {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        phone_number: req.body.phone_number,
        id: contacts.length + 1
    };
	fs.readFile(data_file_path, 'utf8', function readFileCallback(err, data){
	    if (err){
	        console.log(err);
	    }else {
		    all_contacts = JSON.parse(data);
		    all_contacts.push(contact); 

		    contacts_with_new = JSON.stringify(all_contacts, null, 2);
		    fs.writeFile(data_file_path, contacts_with_new, 'utf8', (err) => {
			    if (err) throw err;
			    console.log('Data written to file');
			});
		}
	});
	res.send(contact);
});

app.delete('/api/contacts/:id', function(req, res) {
	var contacts_data = JSON.parse(fs.readFileSync(data_file_path));
	var index = contacts_data.findIndex(contact=> contact.id == req.params.id);
	if (index > -1) {
  		contacts_data.splice(index, 1);
	}
	var contacts_json = JSON.stringify(contacts_data, null, 2);
	fs.writeFile(data_file_path, contacts_json, 'utf8', function(err){
	   if(err) throw err;
	   res.send(contacts_data);
	});

});

app.put('/api/contacts/edit/:id', (req,res) => {
	var id = req.params.id;
	var name = req.body.name;
	var email = req.body.email;
	var address = req.body.address;
	var phone_numbers = req.body.phone_numbers;

  	fs.readFile(data_file_path, 'utf8', function(err,data) {
    	var fileObj = JSON.parse(data);
	    fileObj.map((curr) => {
		    if(curr.id == id) {
		        curr.name = name;
		        curr.email = email;
		        curr.address = address;
		        curr.phone_numbers = phone_numbers;
		   }
	    });
	   fileObj_json = JSON.stringify(fileObj, null, 2);

	    fs.writeFile(data_file_path, fileObj_json, 'utf8', function(err) {
	        if(err) throw err;
	        res.send(fileObj);
	    });
	});
});

app.get("/api/search/contacts", function (req, res) {
	var result = [];
	var name = req.query.name;
	var email = req.query.email;
	var phone_number = req.query.phone_number;

  	fs.readFile(data_file_path, 'utf8', function(err,data) {
    	var fileObj = JSON.parse(data);
	    fileObj.map((curr) => {
		    if((curr.name == name) && (curr.email == email) 
		    	&& curr.phone_numbers.find(element => element == phone_number)) {
		    	result.push(curr);
		    }
	    });
	   res.send(result);

	});
});


app.listen(port, () => {
    console.log("app started on port " + port);
});