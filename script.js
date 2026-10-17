function orderWhatsApp() {
  if (cart.length === 0) {
    alert("पहले प्रोडक्ट कार्ट में जोड़ें।");
    return;
  }

  const phone = "8081104054";

  let message = "Namaste Amar Dairy! Mera order:\n\n";
  let total = 0;

  cart.forEach(item => {
    const amount = item.price * item.qty;
    total += amount;

    message += `${item.name} x ${item.qty} = Rs. ${amount}\n`;
  });

  message += `\nTotal = Rs. ${total}`;

  const url =
    `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

  window.location.href = url;
}
