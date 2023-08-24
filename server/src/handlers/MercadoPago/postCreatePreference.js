const mercadopago = require("mercadopago");

const postCreatePreference = async (req, res) => {
  const { products } = req.body;

  const items = products.map((product) => ({
    title: product.description,
    description: product.title,
    unit_price: Number(product.price),
    quantity: Number(product.quantity),
  }));

  const preference = {
    items: items,
    back_urls: {
      success: "https://soypuebladeploy-production.up.railway.app/mp/success",
      failure: "https://soypuebladeploy-production.up.railway.app/mp/failure",
      pending: "https://soypuebladeploy-production.up.railway.app/mp/pending",
    },
    auto_return: "approved",
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error" });
  }
};

module.exports = postCreatePreference;
