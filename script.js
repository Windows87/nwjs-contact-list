const nedb = require('nedb');
const db = new nedb({ filename: 'contacts.db', autoload: true });

let addContact = {
  name: '',
  number: ''
};

function createContactElement(name, number, id) {
  const contactList = document.querySelector('#contact-list');

  const contactDiv = document.createElement('div');
  const contactNumberAndRemove = document.createElement('div');
  const contactName = document.createElement('span');
  const contactNumber = document.createElement('span');
  const contactRemove = document.createElement('span');

  contactDiv.classList.add('contact');
  contactName.classList.add('contact-name');
  contactRemove.classList.add('contact-remove');

  contactName.innerText = name;
  contactNumber.innerText = number;
  contactRemove.innerText = 'Remove';

  const contactRemoveFunction = async () => {
  	try {
  	  await removeContact(id);
  	  setContacts();
  	} catch(err) {
  	  console.log(err);
  	  alert('Error on remove contact');
  	}
  };

  contactRemove.addEventListener('click', contactRemoveFunction);

  contactNumberAndRemove.appendChild(contactNumber);
  contactNumberAndRemove.appendChild(contactRemove);
  contactDiv.appendChild(contactName);
  contactDiv.appendChild(contactNumberAndRemove);
  contactList.appendChild(contactDiv);
}

function getContacts() {
  return new Promise((next, reject) => {
  	db.find({}).sort({ name: 1 }).exec((err, results) => {
  	  if(err)
  	    return reject(err);

      next(results);
    });
  });
}

function searchContacts(name) {
  return new Promise((next, reject) => {
    db.find({ name: {$regex: new RegExp(name, 'i')} }).sort({ name: 1 }).exec((err, results) => {
  	  if(err)
  	    return reject(err);

  	  next(results);
    });
  });
}

function insertContact(newContact) {
  return new Promise((next, reject) => {
    db.insert(newContact, err => {
  	  if(err)
  	    return reject(err);

  	  next();
    });
  });
}

function removeContact(_id) {
  return new Promise((next, reject) => {
  	db.remove({ _id }, {}, (err) => {
  	  if(err)
  	    return reject(err);

  	  next();
  	});
  });
}

function openAddContact() {
  const addContactBackground = document.querySelector('#add-contact-background');
  addContactBackground.style.display = 'flex';  
}

function closeAddContact() {
  const addContactBackground = document.querySelector('#add-contact-background');
  addContactBackground.style.display = 'none';
}

function cleanAddContact() {
  const submitButton = document.querySelector('#submit');
  const nameInput = document.querySelector('#name');
  const numberInput = document.querySelector('#number');

  addContact.name = '';
  addContact.number = '';

  nameInput.value = '';
  numberInput.value = '';
  submitButton.style.display = 'none';	
}

async function onSearchChange(event) {
  const searchText = event.target.value;

  try {
  	const contacts = await searchContacts(searchText);
  	
  	const contactList = document.querySelector('#contact-list');
  	contactList.innerHTML = '';

  	contacts.map(contact => {
  	  createContactElement(contact.name, contact.number, contact._id);
  	});
  } catch(err) {
  	alert('Error on Search');
  	console.log(err);
  }
}

function onChange(event, parameter) {
  const submitButton = document.querySelector('#submit');
  addContact[parameter] = event.target.value;

  if(!addContact.name || !addContact.number)
    return submitButton.style.display = 'none';

  submitButton.style.display = 'block';
}

async function onSubmit(event) {
  event.preventDefault();

  if(!addContact.name || !addContact.number)
    return;

  try {
  	await insertContact(addContact);
  	cleanAddContact();
  	setContacts();
  } catch(err) {
  	alert('Error on insert contact');
  	console.log(err);
  }
}

async function setContacts() {
  try {
  	const contacts = await getContacts();
  	
  	const contactList = document.querySelector('#contact-list');
    contactList.innerHTML = '';

  	contacts.map(contact => {
  	  createContactElement(contact.name, contact.number, contact._id);
  	});
  } catch(err) {
  	alert('Error on set contacts');
  	console.log(err);
  }
}

RegExp.escape = (s) => {
  return s.replace(/[-\/\\^$*+?.,()|[\]{}]/g, '\\$&');
};

setContacts();