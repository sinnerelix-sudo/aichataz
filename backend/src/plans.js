export const PLANS = {
  INSTAGRAM: {
    id: 'instagram_pkg',
    name: 'Instagram Paketi',
    price: 29.90,
    botLimit: 1,
    productLimit: 50,
    channels: ['instagram']
  },
  WHATSAPP: {
    id: 'whatsapp_pkg',
    name: 'WhatsApp Paketi',
    price: 29.90,
    botLimit: 1,
    productLimit: 50,
    channels: ['whatsapp']
  },
  COMBO: {
    id: 'combo_pkg',
    name: 'Instagram + WhatsApp Paketi',
    price: 39.90,
    botLimit: 1,
    productLimit: 100,
    channels: ['instagram', 'whatsapp']
  },
  MULTI: {
    id: 'multi_pkg',
    name: 'Multi-Panel Paket',
    price: 99.90,
    botLimit: 5,
    productLimit: 500,
    channels: ['instagram', 'whatsapp']
  }
};
