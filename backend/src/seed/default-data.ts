export const defaultSiteContent = {
  hero: {
    eyebrow: "Premium Ponytail Extensions",
    titleLine1: "Luxury Hair That Moves",
    titleHighlight: "With You",
    description:
      "Soft, reusable ponytail extensions designed for elegant everyday glam, birthdays, events, and effortless styling.",
    ctaLabel: "Shop Ponytails",
  },
  howItWorks: {
    eyebrow: "Simple Process",
    title: "How It",
    titleHighlight: "Works",
    steps: [
      {
        num: "01",
        title: "Browse",
        text: "Explore our collection and look through the ponytail styles, textures, and lengths available.",
      },
      {
        num: "02",
        title: "Choose",
        text: "Pick the ponytail you want and continue the order process directly on the website.",
      },
      {
        num: "03",
        title: "Pay via MoMo",
        text: "Make your payment securely on the website through Mobile Money.",
      },
    ],
  },
  about: {
    eyebrow: "About Us",
    title: "The",
    titleHighlight: "Dees_ponytails Promise",
    description:
      "We believe every woman deserves to feel confident and beautiful. Our ponytail extensions are sourced for quality, designed for comfort, and styled for impact so you can slay effortlessly, every single day.",
    features: [
      {
        title: "Premium Quality",
        text: "Handpicked, high-grade hair that looks and feels natural.",
      },
      {
        title: "Made with Love",
        text: "Each ponytail is carefully crafted for a flawless, secure fit.",
      },
      {
        title: "Trusted by 500+",
        text: "Loved by women across Ghana who trust Dees_ponytails for their glam.",
      },
    ],
  },
};

export const defaultProducts = [
  {
    slug: "sleek-straight-ponytail",
    name: "Sleek Straight Ponytail",
    image: "/images/product-straight-new.jpg",
    category: "Straight",
    textureStyle: "Silky Straight",
    length: "18, 22, 26",
    color: "Natural Black, Brown",
    stock: 12,
    price: 180,
    description: "A polished straight ponytail extension with a sleek finish for clean everyday glam.",
    featured: true,
    status: "IN_STOCK",
  },
  {
    slug: "body-wave-ponytail",
    name: "Body Wave Ponytail",
    image: "/images/product-body-wave.jpg",
    category: "Waves",
    textureStyle: "Body Wave",
    length: "20, 24, 28",
    color: "Natural Black, 1B",
    stock: 9,
    price: 220,
    description: "Soft body wave texture with bounce and fullness for birthdays, events, and soft glam looks.",
    featured: true,
    status: "IN_STOCK",
  },
  {
    slug: "deep-curl-ponytail",
    name: "Deep Curl Ponytail",
    image: "/images/product-deep-curl.jpg",
    category: "Curls",
    textureStyle: "Deep Curl",
    length: "18, 22, 26",
    color: "Natural Black",
    stock: 7,
    price: 240,
    description: "Defined curl pattern with rich volume for a statement ponytail look.",
    featured: true,
    status: "IN_STOCK",
  },
  {
    slug: "natural-texture-ponytail",
    name: "Natural Texture Ponytail",
    image: "/images/product-natural-texture.jpg",
    category: "Natural Texture",
    textureStyle: "Yaki Natural",
    length: "18, 22, 24",
    color: "Natural Black, Off Black",
    stock: 6,
    price: 210,
    description: "A textured ponytail that blends beautifully for natural-looking fullness and easy styling.",
    featured: false,
    status: "IN_STOCK",
  },
] as const;

export const defaultProductReviews = [
  {
    productSlug: "sleek-straight-ponytail",
    customerName: "Ama K.",
    rating: 5,
    text: "This straight ponytail looks sleek and polished every single time.",
    status: "APPROVED" as const,
  },
  {
    productSlug: "body-wave-ponytail",
    customerName: "Nana A.",
    rating: 5,
    text: "The body wave has the perfect bounce and blends beautifully with my hair.",
    status: "APPROVED" as const,
  },
  {
    productSlug: "deep-curl-ponytail",
    customerName: "Akosua B.",
    rating: 5,
    text: "The deep curl ponytail is full, defined, and so pretty in person.",
    status: "APPROVED" as const,
  },
];
