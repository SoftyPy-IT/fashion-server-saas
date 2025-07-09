export const storefrontData = {
  shopName: 'fashion Hues of Blues',
  description:
    'fashion Hues of Blues - A unique shop offering a wide range of artistic and creative products. Explore our collection and find something special for yourself.',
  contact: {
    email: 'info@fashion.com.bd',
    phone: '01712-465160',
    address:
      'House-19 (3rd floor), Road-08, Rafiq Housing, Shekhertek, Adabor, Dhaka-1207, Bangladesh'
  },
  socialMedia: {
    facebook: 'https://www.facebook.com/HuesBlues',
    twitter: 'https://x.com/Hues_of_blues_',
    instagram: 'https://www.instagram.com/fashion_hues_of_blues/',
    linkedin: 'https://www.linkedin.com/company/fashion-hues-of-blues',
    youtube: 'https://www.youtube.com/@fashion-hues-of-blues'
  },
  pages: {
    aboutUs: '60d9f14f7c213e22f8a0b5e2', // Example ObjectId for About Us page
    termsAndConditions: '60d9f14f7c213e22f8a0b5df', // Example ObjectId for Terms and Conditions page
    privacyPolicy: '60d9f14f7c213e22f8a0b5e0', // Example ObjectId for Privacy Policy page
    refundPolicy: '60d9f14f7c213e22f8a0b5e1' // Example ObjectId for Refund Policy page
  },
  faq: [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept PayPal, credit/debit cards, and bank transfers.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email.'
    }
  ],
  logo: 'http://fashion.com.bd/logo.png', // Updated logo URL
  sliders: [
    {
      image: {
        mobile: 'http://fashion.com.bd/slider-mobile-1.jpg',
        desktop: 'http://fashion.com.bd/slider-desktop-1.jpg'
      },
      title: 'Welcome to fashion Hues of Blues',
      subTitle: 'Discover our unique collection of artistic products.',
      link: '/collections',
      order: 1
    },
    {
      image: {
        mobile: 'http://fashion.com.bd/slider-mobile-2.jpg',
        desktop: 'http://fashion.com.bd/slider-desktop-2.jpg'
      },
      title: 'New Arrivals',
      subTitle: 'Check out our latest additions to the collection.',
      link: '/new-arrivals',
      order: 2
    }
  ]
};
