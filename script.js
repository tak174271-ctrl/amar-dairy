const firebaseConfig = {
  apiKey: "AIzaSyBnU8sAtOusUje44o4Unf8JtG3nUjSCyQ0",
  authDomain: "amar-dairy-78c39.firebaseapp.com",
  projectId: "amar-dairy-78c39",
  storageBucket: "amar-dairy-78c39.firebasestorage.app",
  messagingSenderId: "925508209476",
  appId: "1:925508209476:web:bf9dc517019f055a4d6511"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// अपना WhatsApp नंबर country code के साथ
const WHATSAPP_NUMBER = "918081104054";

let cart = [];
let products = [];

const productIcons = {
  "दूध": "🥛",
  "ताज़ा दूध": "🥛",
  "milk": "🥛",
  "दही": "🥣",
  "curd": "🥣",
  "yogurt": "🥣",
  "पनीर": "🧀",
  "paneer": "🧀",
  "देसी घी": "🫙",
  "घी": "🫙",
  "ghee": "🫙"
};

function getProductIcon(name) {
  return productIcons[String(name).toLowerCase()] || "🛍️";
}

function loadProducts() {
  const list = document.getElementById("productsList");
  const status = document.getElementById("productStatus");

  db.collection("products").onSnapshot(snapshot => {
    products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).filter(p =>
      typeof p.name === "string" &&
      p.name.trim() !== "" &&
      Number.isFinite(Number(p.price)) &&
      Number(p.price) >= 0
    );

    list.replaceChildren();

    if (products.length === 0) {
      status.textContent = "अभी कोई प्रोडक्ट उपलब्ध नहीं है।";
      return;
    }

    status.textContent = "उपलब्ध प्रोडक्ट: " + products.length;

    products.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";

      const icon = document.createElement("div");
      icon.className = "product-icon";
      icon.textContent = getProductIcon(product.name);

      const title = document.createElement("h3");
      title.textContent = product.name;

      const price = document.createElement("p");
      price.textContent =
        "₹" + Number(product.price) + " प्रति " +
        (product.unit || "item");

      const button = document.createElement("button");
      button.textContent = "कार्ट में जोड़ें";
      button.addEventListener("click", () => {
        addItem(product.id, product.name, Number(product.price), product.unit || "item");
      });

      card.append(icon, title, price, button);
      list.appendChild(card);
    });

    renderCart();
  }, error => {
    console.error("Firebase products error:", error);
    status.textContent =
      "प्रोडक्ट लोड नहीं हुए। Internet और Firebase Rules जाँचें।";
  });
}

function addItem(id, name, price, unit) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, unit, quantity: 1 });
  }

  renderCart();
}

function removeItem(id) {
  const existing = cart.find(item => item.id === id);
  if (!existing) return;

  existing.quantity -= 1;

  if (existing.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const totalElement = document.getElementById("total");

  cartItems.replaceChildren();

  if (cart.length === 0) {
    cartItems.textContent = "आपका कार्ट खाली है।";
    totalElement.textContent = "0";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    const row = document.createElement("p");
    row.textContent =
      item.name + " — ₹" + item.price +
      " × " + item.quantity + " = ₹" +
      (item.price * item.quantity) + " ";

    const removeButton = document.createElement("button");
    removeButton.textContent = "−";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", item.name + " की एक मात्रा हटाएँ");
    removeButton.addEventListener("click", () => removeItem(item.id));

    row.appendChild(removeButton);
    cartItems.appendChild(row);
  });

  totalElement.textContent = total;
}

function orderWhatsApp() {
  if (cart.length === 0) {
    alert("पहले कार्ट में प्रोडक्ट जोड़ें।");
    return;
  }

  let message = "नमस्ते Amar Dairy! मुझे ये सामान ऑर्डर करना है:\n\n";
  let total = 0;

  cart.forEach(item => {
    const amount = item.price * item.quantity;
    total += amount;
    message += item.name + " — " + item.quantity + " " +
      item.unit + " × ₹" + item.price + " = ₹" + amount + "\n";
  });

  message += "\nकुल कीमत: ₹" + total;
  message += "\n\nकृपया ऑर्डर कन्फर्म करें।";

  const url = "https://wa.me/" + WHATSAPP_NUMBER +
    "?text=" + encodeURIComponent(message);

  window.open(url, "_blank");
}

loadProducts();
