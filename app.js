
let cards = [{
  issuer: 'visa',
  name: 'Visa',
  cardLength: 16,
  cvvLen: 3, 
  pattern: '4[0-9]{12}(?:[0-9]{3})?',
  issuerPattern: '4[0-9]',
}, {
  issuer: 'master',
  name: 'Master Card',
  cardLength: 16,
  cvvLen: 3, 
  pattern: '(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}',
  issuerPattern: '(5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)',
}, {
  issuer: 'maestro',
  name: 'Maestro',
  cardLength: 16,
  cvvLen: 3, 
  pattern: '(?:5018|5020|5038|6304|6759|6761|6763)\d{12}',
  issuerPattern: '(5018|5020|5038|6304|6759|6761|6763)',
}, {
  issuer: 'amex',
  name: 'American Express',
  cardLength: 15,
  cvvLen: 4, 
  pattern: '3[47][0-9]{13}',
  issuerPattern: '3[4-7]',
}, {
  issuer: 'diners',
  name: 'Diners Club',
  cardLength: 14,
  cvvLen: 3, 
  pattern: '3(?:0[0-5]|[68][0-9])[0-9]{11}',
  issuerPattern: '3(?:0[0-5]|[68][0-9])',
}, {
  issuer: 'discover',
  name: 'Discover',
  cardLength: 16,
  cvvLen: 3, 
  pattern: '6(?:011|5[0-9]{2})[0-9]{12}',
  issuerPattern: '6(?:011|5[0-9]{2})',
}, {
  issuer: 'jcb',
  name: 'JCB',
  cardLength: 15,
  cvvLen: 3, 
  pattern: '(?:2131|1800|35\d{3})\d{11}',
  issuerPattern: '(?:2131|1800|35\d{3})',
}];
class Card {
  constructor(props) {
    if (!props) props = {};
    Object.assign(this, {
      name: props.name,
      _number: props.number || props._number,
      cvv: props.cvv,
      expiry: props.expiry,
      issuer: props.issuer,
    });
  }
  set number(number) {
    this._number = number.replace(/[^\d]/g, '');
  }
  get number() {
    return this._number;
  }
  hasValidNumber() {
    const add = (sum, curr) => Number(sum) + Number(curr);
    let sequence = this._number.split('');
    const last = sequence.splice(-1);
    // Double alternate digits starting from the right
    sequence = sequence.reverse().map((val, idx) => {
      if (idx % 2 === 0) {
        val = (val * 2).toString().split('').reduce(add, 0);
      }
      return val;
    });
    // Add all digits in sequence and multiply by 9
    const checkSum = (sequence.reduce(add, 0) * 9).toString();
    if (checkSum[checkSum.length - 1] == last) return true;
  }
  isValidExpiry() {
    const [month, year] = this.expiry.split('/');
    const today = new Date();
    const expiry = new Date();
    if (+month < 1 || +month > 12) {
      alert("Invalid Date");
      return false;
    }
    expiry.setFullYear(Number('20' + year), Number(month) - 1, 1);
  
    if (expiry < today) {
      alert("The expiry date is before today's date. Please select a valid expiry date");
      return false;
    }
    return true;
  }
  addToStorage() {
    // Adds card details to localStorage
    let cardList = JSON.parse(window.localStorage.getItem("cardList") || "[]");
    if (cardList.find(card => this.number === card.number)) {
      alert('Card already exists');
      return false;
    }
    cardList.push(this);
    window.localStorage.setItem('cardList', JSON.stringify(cardList));
    return true;
  }
}

function getElById(id) {
  return document.getElementById(id);
}

function formatter(event, el) {
  let str = el.value;
  if (event.keyCode === 8) {
    if (['/', ' '].includes(str[str.length - 1])) el.value = str.slice(0, -1);
    return;
  }
}

function addNewCard(button) {
  // Opens up Form, hides 'Add New' button
  const formElement = getElById('form1');
  formElement.style.display = 'block';
  button.style.display = 'none';
}

function cancelAddOp() {
  // Closes form, makes 'Add New' button visible again
  const formElement = getElById('form1');
  const addBtn = getElById('newCardBtn');
  formElement.style.display = 'none';
  addBtn.style.display = 'inline-block';
}

function deleteFuncGenerator(cardToDel) {
  // Returns function to delete a card with closure over a card's info
  return function deleteCard() {
    // Finds and deletes card from cardList, refreshes list
    const res = window.prompt("Are you sure you want to delete this card? 'Y' or 'N'");
    if (res && (res == 'Y' || res == 'y')) {
      let cardList = JSON.parse(localStorage.getItem("cardList") || "[]");
      let idx = cardList.findIndex(card => card._number === cardToDel.number);
      if (idx > -1) {
        cardList.splice(idx, 1);
        localStorage.setItem('cardList', JSON.stringify(cardList));
        setTimeout(listCards, 500);
        return true;
      } else {
        alert('Unable to delete card!');
        return false;
      }
    }
  }
}
function listCards() {
  // Refreshes/Creates Cards list
  let ul = getElById('card-list');
  ul.innerHTML = '';
  let cardList = JSON.parse(localStorage.getItem("cardList") || "[]");
  if (!cardList.length) {
    let li = document.createElement('li');
    let span = document.createElement('span');
    span.setAttribute('id', 'empty-list-msg');
    span.innerHTML = 'No cards found! <br /> Add a new card to the list';
    li.appendChild(span);
    li.style.textAlign = 'center';
    ul.appendChild(li);
  }
  for (let card of cardList) {
    card = new Card(card);
    let li = createCardElement(card, true);
    // Add issuer logo to every card
    const logo = document.createElement('img');
    Object.assign(logo, {
      src: `assets/${card.issuer}-logo.png`,
      alt: card.issuer,
      id: 'saved-card-logo',
    });
    li.appendChild(logo);
    ul.appendChild(li);
  }
}
function createCardElement(card, canDelete) {
  /* 
    Creates a 'li' element to display within list 
    takes 'canDelete' as param to add a delete control to the 'li' element
  */
  let { name, number, expiry } = card;
  let spanWithText = (text, id, cl) => {
    let span = document.createElement('span');
    if (id) span.setAttribute('id', id);
    if (cl) span.setAttribute('class', cl);
    if (text) span.innerHTML = text;
    return span;
  };

  let li = document.createElement('li');
  li.setAttribute('id', 'card-item');
  
  li.appendChild(spanWithText(name, 'name-detail'));
  li.appendChild(spanWithText(number, 'num-detail'));
  li.appendChild(spanWithText(`Valid Till: <b>${expiry}</b>`, 'expiry-detail'));
  
  if (canDelete) {
    let deleteBtn = document.createElement('button');
    Object.assign(deleteBtn, {
      id: 'delete-btn',
      innerText: 'Delete Card',
      onclick: deleteFuncGenerator(card),
    });
    li.appendChild(deleteBtn);
  }
  return li;
}

function validateAndSubmit(event) {
  // Form validations, Call to Store card, List refresh
  try {
    var form = getElById('form1');
    newCard = new Card();
    ['number', 'name', 'expiry', 'cvv'].forEach(field => {
      newCard[field] = form[field].value;
    })
    newCard.issuer = issuingCard.issuer;
    if (
      !issuingCard
      || !RegExp(`^${issuingCard.pattern}$`).test(newCard.number)
      || !newCard.hasValidNumber()
    ) {
      alert('Invalid Card Number!');
      event.preventDefault();
      return false;
    }
    if (!newCard.isValidExpiry()) {
      event.preventDefault();
      return false;
    }
    console.log(newCard);
    const added = newCard.addToStorage();
    if (!added) {
      event.preventDefault();
      return false;
    }
    listCards();
  } catch(e) {
    console.log('ERROR: ', e);
    event.preventDefault();
    return false;
  }
}

function dateFormatter(event) {
  var expiryEl = getElById('expiry');
  var str = expiryEl.value;
  var v = str.replace(/[^\d]/g, '');
  v = v.replace(/.{2}/g, function (a) {
    return a + '/';
  }).slice(0, 5);
  expiryEl.value = v;
}

function setIssuer(cardNumber) {
  let first4 = cardNumber.slice(0, 5);
  let issueCard = '';
  for (let card of cards) {
    const reg = new RegExp(`^${card.issuerPattern}`);
    if (reg.test(first4)) {
      issueCard = card;
      break;
    }
  }
  let issuerEl = getElById('issuer-logo');
  if (issueCard) {
    cardNumField.maxLength = issueCard.cardLength + 3; // '+3' to account for spaces
    let cvvInput = getElById('cvv');
    cvvInput.maxLength = issueCard.cvvLen;
    cvvInput.minLength = issueCard.cvvLen;
    issuerEl.setAttribute('src', `assets/${issueCard.issuer}-logo.png`);
    issuerEl.setAttribute('title', issueCard.name);
    issuerEl.style.visibility = 'visible';
  } else {
    issuerEl.style.visibility = 'hidden';
  }
  return issueCard;
}

function cardFormatter(event) {
  str = cardNumField.value;
  if (!str) {
    toggleInputs(true);
    return false;
  }
  toggleInputs(false);
  var v = str.replace(/[^\d]/g, '');
  if (v.length >= 4) issuingCard = setIssuer(v);
  v = v.replace(/.{4}/g, function (a) {
    return a + ' ';
  });
  cardNumField.value = v;
}

function toggleInputs(disable) {
  let expiry = getElById('expiry');
  let cvv = getElById('cvv');
  let submitBtn = getElById('submit-btn');
  expiry.disabled = disable;
  cvv.disabled = disable;
  submitBtn.disabled = disable;
}
let issuingCard = '';
let newCard;
var cardNumField = getElById('number');
listCards();