let cart = [];

function addItem(name, price) {
  const item = cart.find(product => product.name === name);

  if (item) {
    item.qty++;
  } else {
    cart.push({ name: name, price: price, qty: 1 });
  }

  showCart();
}

function removeItem(name) {
  cart = cart.filter(item => item.name !== name);
  showCart();
}

function showCart() {
  const box = document.getElementById("cartItems");
  const totalBox = document.getElementById("total");

  if (!box || !totalBox) return;

  let total = 0;
  box.innerHTML = "";

  if (cart.length === 0) {
    box.textContent = "आपका कार्ट खाली है।";
  }

  cart.forEach(item => {
    const amount = item.price * item.qty;
    total += amount;

    const p = document.createElement("p");
    p.textContent =
      item.name + " × " + item.qty + " = ₹" + amount;

    box.appendChild(p);
  });

  totalBox.textContent = total;
}

function orderWhatsApp() {
  if (cart.length === 0) {
    alert("पहले प्रोडक्ट कार्ट में जोड़ें।");
    return;
  }

  const phone = prompt(
    "Amar Dairy का WhatsApp नंबर देश के कोड सहित लिखें।"
  );

  if (!phone || !/^\d{10,15}$/.test(phone)) {
    alert("सही WhatsApp नंबर दर्ज करें।");
    return;
  }

  let message = "Namaste Amar Dairy! Mera order:\n";
  let total = 0;

  cart.forEach(item => {
    const amount = item.price * item.qty;
    total += amount;
    message += item.name + " x " + item.qty +
      " = Rs. " + amount + "\n";
  });

  message += "\nTotal = Rs. " + total;

  const url = "https://wa.me/" + phone +
    "?text=" + encodeURIComponent(message);

  window.open(url, "_blank");
}
