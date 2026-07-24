export const siteConfig = {
  name: 'Uwezo Fund Portal',
  contact: {
    address: 'Lonrho House, 16th Floor, Standard Street',
    poBox: '42009 - 00100, Nairobi',
    phone: '+254 0776 154 215',
    email: 'info@uwezo.go.ke',
  },
  usefulLinks: [
    { id: 'home', title: 'Home', url: '/', external: false },
    { id: 'apply', title: 'Start application', url: '/apply/create', external: false },
    { id: 'status', title: 'Track application', url: '/status', external: false },
    { id: 'uwezo', title: 'Uwezo Fund website', url: 'https://www.uwezo.go.ke', external: true },
  ],
} as const;
