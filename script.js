const firebaseConfig = {
  apiKey: "AIzaSyBnU8sAtOusUje44o4Unf8JtG3nUjSCQ0",
  authDomain: "amar-dairy-78c39.firebaseapp.com",
  projectId: "amar-dairy-78c39",
  storageBucket: "amar-dairy-78c39.firebasestorage.app",
  messagingSenderId: "925508209476",
  appId: "1:925508209476:web:bf9dc517019f055a4d6511"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const WHATSAPP_NUMBER = "918081104054";

let cart = [];
let products = [];

function getProductIcon(name) {
  const n = String(name || "").trim().toLowerCase();

  if (
    n.includes("khoya") ||
    n.includes("mawa") ||
    n.includes("खोया") ||
    n.includes("खोवा") ||
    n.includes("मावा")
  ) return "🍮";

  if (n.includes("milk") || n.includes("दूध")) return "🥛";

  if (
    n.includes("curd") ||
    n.includes("yogurt") ||
    n.includes("दही")
  ) return "🥣";

  if (n.includes("paneer") || n.includes("पनीर")) return "🧀";

  if (n.includes("ghee") || n.includes("घी")) return "🫙";

  return "🛍️";
}

function createProductImage(product) {
  const imageUrl =
    product.imageUrl ||
    product.image ||
    product.photo ||
    "";

  if (
    typeof imageUrl === "string" &&
    /^https?:\/\//i.test(imageUrl)
  ) {
    const img = document.createElement("img");

    img.className = "product-image";
    img.src = imageUrl;
    img.alt = product.name || "Amar Dairy Product";
    img.loading = "lazy";
    img.style.width = "100%";
    img.style.height = "180px";
    img.style.objectFit = "contain";
    img.style.borderRadius = "10px";

    img.onerror = function () {
      const fallback = document.createElement("div");

      fallback.className = "product-icon";
      fallback.textContent = getProductIcon(product.name);
      fallback.style.fontSize = "55px";
      fallback.style.textAlign = "center";
      fallback.style.padding = "20px";

      img.replaceWith(fallback);
    };

    return img;
  }

  const icon = document.createElement("div");

  icon.className = "product-icon";
  icon.textContent = getProductIcon(product.name);
  icon.style.fontSize = "55px";
  icon.style.textAlign = "center";
  icon.style.padding = "20px";

  return icon;
}

function loadProducts() {
  const list = document.getElementById("productsList");
  const status = document.getElementById("productStatus");

  if (!list || !status) {
    console.error(
      "HTML में productsList या productStatus नहीं मिला।"
    );
    return;
  }

  db.collection("products").onSnapshot(
    snapshot => {
      products = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(product =>
          typeof product.name === "string" &&
          product.name.trim() !== "" &&
          Number.isFinite(Number(product.price)) &&
          Number(product.price) >= 0
        );

      list.replaceChildren();

      if (products.length === 0) {
        status.textContent =
          "अभी कोई प्रोडक्ट उपलब्ध नहीं है।";

        renderCart();
        return;
      }

      status.textContent =
        "उपलब्ध प्रोडक्ट: " + products.length;

      products.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = createProductImage(product);

        const title = document.createElement("h3");
        title.textContent = product.name;

        const price = document.createElement("p");
        price.textContent =
          "₹" + Number(product.price) +
          " प्रति " + (product.unit || "item");

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "कार्ट में जोड़ें";

        button.addEventListener("click", () => {
          addItem(
            product.id,
            product.name,
            Number(product.price),
            product.unit || "item"
          );
        });

        card.append(image, title, price, button);
        list.appendChild(card);
      });

      renderCart();
    },
    error => {
      console.error("Firebase products error:", error);

      status.textContent =
        "प्रोडक्ट लोड नहीं हुए। Internet और Firebase Rules जाँचें।";
    }
  );
}

function addItem(id, name, price, unit) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id,
      name,
      price,
      unit,
      quantity: 1
    });
  }

  renderCart();
}

function removeItem(id) {
  const existing = cart.find(item => item.id === id);

  if (!existing) return;

  if (existing.quantity > 1) {
    existing.quantity -= 1;
  } else {
    cart = cart.filter(item => item.id !== id);
  }

  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cartItems");
  const totalElement = document.getElementById("cartTotal");

  if (!cartList || !totalElement) {
    console.warn(
      "HTML में cartItems या cartTotal नहीं मिला।"
    );
    return;
  }

  cartList.replaceChildren();

  let total = 0;

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "आपका कार्ट खाली है।";
    cartList.appendChild(empty);
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const details = document.createElement("span");
    details.textContent =
      item.name + " × " + item.quantity +
      " = ₹" + (item.price * item.quantity);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "− हटाएँ";

    removeButton.addEventListener("click", () => {
      removeItem(item.id);
    });

    row.append(details, removeButton);
    cartList.appendChild(row);

    total += item.price * item.quantity;
  });

  totalElement.textContent = "₹" + total;
}

function orderWhatsApp() {
  if (cart.length === 0) {
    alert("कृपया पहले कार्ट में प्रोडक्ट जोड़ें।");
    return;
  }

  let total = 0;

  let message = "नमस्ते Amar Dairy! मुझे ये प्रोडक्ट ऑर्डर करने हैं:\n\n";

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    message +=
      "• " + item.name +
      " × " + item.quantity +
      " " + item.unit +
      " — ₹" + itemTotal + "\n";
  });

  message += "\nकुल राशि: ₹" + total;
  message += "\n\nकृपया मेरा ऑर्डर कन्फर्म करें।";

  const url =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");
}

loadProducts();
