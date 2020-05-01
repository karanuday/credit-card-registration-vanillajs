
cards = [{
  issuer: 'visa',
  name: 'Visa',
  length: 16,
  pattern: '4[0-9]{12}(?:[0-9]{3})?',
  issuerPattern: '4[0-9]',
}, {
  issuer: 'master',
  name: 'Master Card',
  length: 16,
  pattern: '(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}',
  issuerPattern: '(5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)',
}, {
  issuer: 'maestro',
  name: 'Maestro',
  length: 16,
  pattern: '(?:5018|5020|5038|6304|6759|6761|6763)\d{12}',
  issuerPattern: '(5018|5020|5038|6304|6759|6761|6763)',
}, {
  issuer: 'amex',
  name: 'American Express',
  length: 15,
  pattern: '3[47][0-9]{13}',
  issuerPattern: '3[4-7]',
}, {
  issuer: 'diners',
  name: 'Diners Club',
  length: 14,
  pattern: '3(?:0[0-5]|[68][0-9])[0-9]{11}',
  issuerPattern: '3(?:0[0-5]|[68][0-9])',
}, {
  issuer: 'discover',
  name: 'Discover',
  length: 16,
  pattern: '6(?:011|5[0-9]{2})[0-9]{12}',
  issuerPattern: '6(?:011|5[0-9]{2})',
}, {
  issuer: 'jcb',
  name: 'JCB',
  length: 15,
  pattern: '(?:2131|1800|35\d{3})\d{11}',
  issuerPattern: '(?:2131|1800|35\d{3})',
}];
let issuingCard = '';
function addNewCard(button) {
  const formElement = document.getElementById('form1');
  formElement.style.display = 'block';
  button.style.display = 'none';
}
function cancelAddOp() {
  const formElement = document.getElementById('form1');
  const addBtn = document.getElementById('newCardBtn');
  formElement.style.display = 'none';
  addBtn.style.display = 'inline-block';
}
function listCards() {
  let ul = document.getElementById('card-list');
  let cardList = JSON.parse(localStorage.getItem("cardList") || "[]");
  if (!cardList.length) {
    let li = createListElement('No cards found! <br /> Feel free to add one from above.');
    li.style.textAlign = 'center';
    ul.appendChild(li);
  }
  for (let card of cardList) {
    let li = createListElement(card.name, card.cardNo);
    const logo = document.createElement('img');
    logo.setAttribute('src', `logos${card.issuer}-logo.png`);
    logo.setAttribute('alt', card.issuer);
    logo.setAttribute('id', 'saved-card-logo');
    li.appendChild(logo);
    ul.appendChild(li);
  }
}
function createListElement(text, subText) {
  let li = document.createElement('li');
  li.setAttribute('id', 'card-item');
  if (text) {
    let textSpan = document.createElement('span');
    textSpan.setAttribute('id', 'name-detail');
    textSpan.innerHTML = text;
    li.appendChild(textSpan);
  }
  if (subText) {
    let subTextSpan = document.createElement('span');
    subTextSpan.setAttribute('id', 'num-detail');
    subTextSpan.innerHTML = subText;
    li.appendChild(subTextSpan);
  }
  return li;
}
function addToStorage(cardDetails) {
  let cardList = JSON.parse(localStorage.getItem("cardList") || "[]");
  cardList.push(cardDetails);
  localStorage.setItem('cardList', JSON.stringify(cardList));
}
function validateAndSubmit(event) {
  var form = document.getElementById('form1');
  let cardDetails = {};
  ['cardNo', 'name', 'expiry', 'cvv'].forEach(field => {
    cardDetails[field] = form[field].value;
  })
  cardDetails.cardNo = cardDetails.cardNo.replace(/[^\d]/g, '');
  cardDetails.issuer = issuingCard.issuer;
  if (!isValidCard(cardDetails.cardNo)) {
    alert('Invalid Card Number!');
    event.preventDefault();
    return false;
  }
  if (!isValidExpiry(cardDetails.expiry)) {
    event.preventDefault();
    return false;
  }
  addToStorage(cardDetails);
  listCards();
}
function isValidExpiry(str) {
  const [month, year] = str.split('/');
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
function isValidCard(cardNo) {
  if (!issuingCard || !RegExp(`^${issuingCard.pattern}$`).test(cardNo)) return false;
  const add = (sum, curr) => Number(sum) + Number(curr);
  let sequence = cardNo.split('');
  const last = sequence.splice(-1);
  sequence = sequence.reverse().map((val, idx) => {
    if (idx % 2 === 0) {
      val = (val * 2).toString().split('').reduce(add, 0);
    }
    return val;
  });
  const checkSum = (sequence.reduce(add, 0) * 9).toString();
  if (checkSum[checkSum.length - 1] == last) return true;
}
function formatter(event, el) {
  let str = el.value;
  if (event.keyCode === 8) {
    if (['/', ' '].includes(str[str.length - 1])) el.value = str.slice(0, -1);
    return;
  }
}
function dateFormatter(event) {
  var expiryEl = document.getElementById('expiry');
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
  let issuerEl = document.getElementById('issuer-logo');
  if (issueCard) {
    issuerEl.setAttribute('src', `logos/${issueCard.issuer}-logo.png`);
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
    return false;
  }
  var v = str.replace(/[^\d]/g, '');
  if (v.length >= 4) issuingCard = setIssuer(v);
  v = v.replace(/.{4}/g, function (a) {
    return a + ' ';
  });
  cardNumField.value = v;
}
var cardNumField = document.getElementById('cardNo');
listCards();