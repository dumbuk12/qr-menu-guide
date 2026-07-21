// QR Menu Guide — https://github.com/dumbuk12/qr-menu-guide
// Copyright (c) 2026 dumbuk12 — MIT License
//
// Your menu, in one place. Edit THIS file to change items, prices, or photos —
// the page and the /api/menu endpoint both read from here automatically.
//
// Fields per item:
//   name    (required) — item name
//   price   (required) — number, no currency symbol
//   desc    (optional) — short description
//   image   (optional) — path under /public, e.g. "/images/margherita.jpg"
//
// Fields per category:
//   name    (required) — category title, also becomes the nav link
//   note    (optional) — small subtitle under the category title
//   items   (required) — array of items, see above

export const menu = {
  "restaurant": "Your Restaurant Name",
  "tagline": "A short tagline goes here",
  "logo": "/images/logo.png",
  "currency": "$",
  "categories": [
    {
      "name": "Favorites",
      "note": "Chef's picks",
      "items": [
        {
          "name": "Margherita Pizza",
          "price": 14,
          "desc": "San Marzano tomato, fresh mozzarella, basil, olive oil"
        },
        {
          "name": "Grilled Salmon",
          "price": 22,
          "desc": "Lemon butter sauce, seasonal vegetables"
        }
      ]
    },
    {
      "name": "Starters",
      "items": [
        {
          "name": "Bruschetta",
          "price": 8,
          "image": "/images/bruschetta.jpg",
          "desc": "Grilled bread, tomato, garlic, basil"
        },
        {
          "name": "Soup of the Day",
          "price": 7
        }
      ]
    },
    {
      "name": "Mains",
      "note": "Served with a side of your choice",
      "items": [
        {
          "name": "Margherita Pizza",
          "price": 14,
          "desc": "San Marzano tomato, fresh mozzarella, basil, olive oil"
        },
        {
          "name": "Grilled Salmon",
          "price": 22,
          "desc": "Lemon butter sauce, seasonal vegetables"
        },
        {
          "name": "Mushroom Risotto",
          "price": 16,
          "desc": "Arborio rice, wild mushrooms, parmesan"
        }
      ]
    },
    {
      "name": "Drinks",
      "items": [
        {
          "name": "Orange Juice",
          "price": 4,
          "image": "/images/orange-juice.jpg"
        },
        {
          "name": "Sparkling Water",
          "price": 3
        },
        {
          "name": "Espresso",
          "price": 3
        }
      ]
    }
  ]
};
