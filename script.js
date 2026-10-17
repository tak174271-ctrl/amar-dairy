let cart = [];

const WHATSAPP_NUMBER = "8081104054";

function addItem(name, price) {
  const item = cart.find(product => product.name === name);

  if (item) {
    item.qty++;
  } else {
    cart.push({
      name: name,
      price: price,
      qty: 1
    });
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

  box.innerHTML = "";
  let total = 0;

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

  let message = "नमस्ते Amar Dairy! मुझे यह ऑर्डर करना है:\n\n";
  let total = 0;

  cart.forEach(item => {
    const amount = item.price * item.qty;
    total += amount;

    message +=
      item.name + " × " + item.qty + " = ₹" + amount + "\n";
  });

  message += "\nकुल कीमत: ₹" + total;
  message += "\nकृपया मेरे ऑर्डर की पुष्टि करें।";

  const url =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message);

  window.location.href = url;
}
