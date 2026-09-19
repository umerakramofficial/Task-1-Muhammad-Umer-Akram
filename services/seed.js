const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Contact = require('../models/Contact');

const seedDatabase = async () => {
  try {
    // 1. Seed Users if empty
    const userCount = await User.countDocuments();
    let adminUser;
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminPasswordHash = await bcrypt.hash('Admin@12345', salt);
      const userPasswordHash = await bcrypt.hash('User@12345', salt);

      adminUser = await User.create({
        name: 'Admin Developer',
        email: 'admin@auratech.com',
        password: adminPasswordHash,
        role: 'admin'
      });

      await User.create({
        name: 'Jane Intern',
        email: 'jane@auratech.com',
        password: userPasswordHash,
        role: 'user'
      });
      console.log('🌱 Seeded default admin and standard user accounts.');
    } else {
      adminUser = await User.findOne({ role: 'admin' });
    }

    // 2. Seed Skills if empty
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      await Skill.insertMany([
        {
          customId: 'sk-1',
          title: 'Semantic HTML5',
          icon: 'fa-layer-group',
          iconColor: 'icon-blue',
          description: 'Structured markup using proper landmarks ensuring accessibility, screen reader compatibility, and SEO.',
          badges: ['WCAG 2.1 Ready', 'SEO Optimized']
        },
        {
          customId: 'sk-2',
          title: 'CSS Grid & Flexbox',
          icon: 'fa-table-cells',
          iconColor: 'icon-mocha',
          description: 'Utilizing CSS Grid for macro-layout structure and Flexbox for micro-component alignment across viewports.',
          badges: ['Macro Grids', 'Flex Components']
        },
        {
          customId: 'sk-3',
          title: 'Mobile-First Strategy',
          icon: 'fa-mobile-screen-button',
          iconColor: 'icon-blue',
          description: 'Progressive enhancement starting from 375px mobile viewports up to 1024px+ desktop layouts.',
          badges: ['768px Breakpoint', '1024px Desktop']
        },
        {
          customId: 'sk-4',
          title: 'REST API & Node.js',
          icon: 'fa-server',
          iconColor: 'icon-mocha',
          description: 'Scalable backend API design with Gatekeeper validation, JWT authentication, and semantic HTTP responses.',
          badges: ['Gatekeeper Engine', 'Stateless JWT']
        }
      ]);
      console.log('🌱 Seeded technical skills data.');
    }

    // 3. Seed Projects if empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.insertMany([
        {
          customId: '1',
          title: 'Analytics Dashboard Pro',
          category: 'frontend',
          summary: 'A high-performance analytics interface featuring custom CSS Grid dashboard widgets, responsive data tables, and dark/light color themes.',
          description: 'Analytics Dashboard Pro is a scalable web application template showcasing responsive CSS Grid widget placement, real-time metrics cards, and a dark/light aesthetic theme. Built for performance and screen reader accessibility.',
          tech: ['HTML5', 'CSS Grid', 'Flexbox', 'JavaScript ES6+'],
          iconClass: 'fa-chart-line',
          gradientClass: 'img-gradient-1',
          githubUrl: 'https://github.com',
          createdBy: adminUser ? adminUser._id : null
        },
        {
          customId: '2',
          title: 'CloudSync SaaS Landing',
          category: 'fullstack',
          summary: 'Product landing page with interactive pricing calculator, testimonial slider, mobile hamburger navigation, and contact form validation.',
          description: 'CloudSync is a sleek SaaS product showcase complete with dynamic pricing tiers, customer testimonial sliders, mobile hamburger menu navigation, and integrated REST API form handling.',
          tech: ['Flexbox', 'Node.js API', 'ES6 Modules', 'Aesthetic Palette'],
          iconClass: 'fa-cloud',
          gradientClass: 'img-gradient-2',
          githubUrl: 'https://github.com',
          createdBy: adminUser ? adminUser._id : null
        },
        {
          customId: '3',
          title: 'Digital Udhaar Finance Web App',
          category: 'ui',
          summary: 'Clean financial ledger and debt-tracking web app UI built with warm aesthetic colors, accessibility landmarks, and instant search filter.',
          description: 'A modern financial ledger interface crafted for simple debt-tracking, user authentication overlays, responsive mobile navigation, and clear visual hierarchy.',
          tech: ['CSS Custom Properties', 'Semantic HTML5', 'UX Research', 'Mobile-First'],
          iconClass: 'fa-wallet',
          gradientClass: 'img-gradient-3',
          githubUrl: 'https://github.com',
          createdBy: adminUser ? adminUser._id : null
        }
      ]);
      console.log('🌱 Seeded default portfolio projects.');
    }

    // 4. Seed Contacts if empty
    const contactCount = await Contact.countDocuments();
    if (contactCount === 0) {
      await Contact.create({
        name: 'Demo Recruiter',
        email: 'recruiter@techcorp.com',
        subject: 'Full Stack Opportunity',
        message: 'We loved your portfolio and would like to invite you for an interview.'
      });
      console.log('🌱 Seeded sample contact submission.');
    }
  } catch (err) {
    console.error('⚠️ Database Seeding Warning:', err.message);
  }
};

module.exports = seedDatabase;
