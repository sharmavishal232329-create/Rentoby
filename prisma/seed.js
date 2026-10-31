const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Rentoby categories, admin, and initial catalog...');

  // 1. Hash default password for admin and seed demo accounts
  const adminPasswordHash = await bcrypt.hash('AdminRentoby@2026', 10);
  const userPasswordHash = await bcrypt.hash('UserRentoby@2026', 10);

  // 2. Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rentoby.com' },
    update: {},
    create: {
      email: 'admin@rentoby.com',
      passwordHash: adminPasswordHash,
      name: 'Rentoby Admin',
      phone: '+91 98765 43210',
      city: 'Bengaluru',
      localArea: 'Central Business District',
      role: 'ADMIN',
      isVerified: true,
      bio: 'Platform safety and marketplace administrator for Rentoby.',
    },
  });

  // 3. Upsert Sample Verified Owners & Providers (Real user accounts for testing)
  const rajeshFarmer = await prisma.user.upsert({
    where: { email: 'rajesh.patel@rentoby.com' },
    update: {},
    create: {
      email: 'rajesh.patel@rentoby.com',
      passwordHash: userPasswordHash,
      name: 'Rajesh Patel',
      phone: '+91 98234 56781',
      city: 'Bengaluru',
      localArea: 'Nelamangala Rural',
      role: 'USER',
      isVerified: true,
      bio: 'Farm equipment owner offering modern agricultural machinery and irrigation pumps.',
    },
  });

  const priyaCreator = await prisma.user.upsert({
    where: { email: 'priya.sharma@rentoby.com' },
    update: {},
    create: {
      email: 'priya.sharma@rentoby.com',
      passwordHash: userPasswordHash,
      name: 'Priya Sharma',
      phone: '+91 98111 22334',
      city: 'Bengaluru',
      localArea: 'Indiranagar',
      role: 'USER',
      isVerified: true,
      bio: 'Professional freelance photographer & equipment owner renting cinema cameras and gear.',
    },
  });

  const anandServices = await prisma.user.upsert({
    where: { email: 'anand.kumar@rentoby.com' },
    update: {},
    create: {
      email: 'anand.kumar@rentoby.com',
      passwordHash: userPasswordHash,
      name: 'Anand Kumar',
      phone: '+91 97400 99881',
      city: 'Bengaluru',
      localArea: 'Koramangala',
      role: 'USER',
      isVerified: true,
      bio: 'Expert certified technician and equipment operator providing home and farm services.',
    },
  });

  // 4. CATEGORIES HIERARCHY
  const categoriesData = [
    {
      name: 'Agriculture',
      slug: 'agriculture',
      description: 'Machinery, irrigation systems, harvesting tools, and farming equipment.',
      icon: 'Tractor',
      type: 'ITEM',
      children: [
        { name: 'Agricultural Machinery', slug: 'agricultural-machinery', description: 'Tractors, rotavators, cultivators, seed drills, harvesters, threshers, sprayers' },
        { name: 'Irrigation Equipment', slug: 'irrigation-equipment', description: 'Water pumps, sprinkler systems, drip irrigation lines, delivery pipes' },
        { name: 'Farm Tools', slug: 'farm-tools', description: 'Power weeders, brush cutters, harvesting tools, cultivation tools' },
        { name: 'Agricultural Equipment', slug: 'agricultural-storage-equipment', description: 'Storage silos, digital weighing scales, moisture meters, solar dryers' },
      ],
    },
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Cinema cameras, sound systems, projectors, drones, audio and visual equipment.',
      icon: 'Camera',
      type: 'ITEM',
      children: [
        { name: 'Cameras & Lenses', slug: 'cameras-lenses', description: 'DSLRs, mirrorless, cinema lenses, gimbals' },
        { name: 'Audio & Speakers', slug: 'audio-speakers', description: 'PA sound systems, microphones, DJ gear' },
        { name: 'Projectors & Screens', slug: 'projectors-screens', description: '4K laser projectors, portable outdoor screens' },
      ],
    },
    {
      name: 'Tools & Equipment',
      slug: 'tools-equipment',
      description: 'Power tools, ladders, pressure washers, construction and DIY gear.',
      icon: 'Wrench',
      type: 'ITEM',
      children: [
        { name: 'Power Tools', slug: 'power-tools', description: 'Hammer drills, angle grinders, circular saws' },
        { name: 'Ladders & Scaffolding', slug: 'ladders-scaffolding', description: 'Telescopic ladders, platform steps' },
        { name: 'Cleaning Machines', slug: 'cleaning-machines', description: 'Commercial pressure washers, carpet extractors' },
      ],
    },
    {
      name: 'Travel & Outdoor',
      slug: 'travel-outdoor',
      description: 'Camping tents, trekking bags, rooftop carriers, portable stoves.',
      icon: 'Compass',
      type: 'ITEM',
      children: [
        { name: 'Camping & Tents', slug: 'camping-tents', description: 'Waterproof 4-person tents, sleeping bags, camp stoves' },
        { name: 'Trekking & Bags', slug: 'trekking-bags', description: 'Rucksacks, trekking poles, GPS navigators' },
        { name: 'Bicycles & Carriers', slug: 'bicycles-carriers', description: 'Mountain bikes, car roof cycle mounts' },
      ],
    },
    {
      name: 'Events & Parties',
      slug: 'events-parties',
      description: 'Stage lighting, party furniture, decorative arches, banquet canopies.',
      icon: 'PartyPopper',
      type: 'ITEM',
      children: [
        { name: 'Event Furniture', slug: 'event-furniture', description: 'Folding chairs, banquet tables, gazebo canopies' },
        { name: 'Stage & Lighting', slug: 'stage-lighting', description: 'LED par cans, moving heads, fog machines' },
      ],
    },
    {
      name: 'Home & Lifestyle',
      slug: 'home-lifestyle',
      description: 'Appliances, air purifiers, deep clean vacuums, folding beds.',
      icon: 'Home',
      type: 'ITEM',
      children: [
        { name: 'Home Appliances', slug: 'home-appliances', description: 'Dehumidifiers, portable ACs, garment steamers' },
      ],
    },
    {
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Fitness machines, sports kits, cricket bowling machines.',
      icon: 'Dumbbell',
      type: 'ITEM',
      children: [
        { name: 'Cardio & Strength', slug: 'cardio-strength', description: 'Foldable treadmills, barbell sets' },
      ],
    },
    {
      name: 'Vehicles & Trailers',
      slug: 'vehicles',
      description: 'Utility trailers, transport trollies, permitted mobility vehicles.',
      icon: 'Truck',
      type: 'ITEM',
      children: [
        { name: 'Utility Trailers', slug: 'utility-trailers', description: 'Goods towing trailers, luggage trolleys' },
      ],
    },
    // SERVICE CATEGORIES
    {
      name: 'Local Services',
      slug: 'local-services',
      description: 'Professional photographers, cleaners, technicians, equipment operators, and home helpers.',
      icon: 'Briefcase',
      type: 'SERVICE',
      children: [
        { name: 'Photography & Video', slug: 'service-photography', description: 'Events, product shoots, aerial drone filming' },
        { name: 'Equipment Operators', slug: 'service-equipment-operators', description: 'Tractor drivers, excavator operators, machinery technicians' },
        { name: 'Home Repair & Plumbing', slug: 'service-repairs', description: 'Electricians, plumbers, appliance fixes' },
        { name: 'Cleaning & Deep Wash', slug: 'service-cleaning', description: 'Sofa cleaning, water tank cleaning, sanitization' },
        { name: 'Pet Care & Sitting', slug: 'service-pet-care', description: 'Dog walking, weekend pet boarding' },
        { name: 'Moving & Porter Help', slug: 'service-moving', description: 'Furniture moving, packing, heavy item loading' },
      ],
    },
  ];

  for (const cat of categoriesData) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, type: cat.type },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        type: cat.type,
      },
    });

    if (cat.children && cat.children.length > 0) {
      for (const child of cat.children) {
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: { name: child.name, description: child.description, parentId: parent.id, type: cat.type },
          create: {
            name: child.name,
            slug: child.slug,
            description: child.description,
            parentId: parent.id,
            type: cat.type,
          },
        });
      }
    }
  }

  // Fetch created categories for foreign key reference
  const agriCat = await prisma.category.findUnique({ where: { slug: 'agriculture' } });
  const agriMachinery = await prisma.category.findUnique({ where: { slug: 'agricultural-machinery' } });
  const irrigationCat = await prisma.category.findUnique({ where: { slug: 'irrigation-equipment' } });
  const electronicsCat = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  const camerasCat = await prisma.category.findUnique({ where: { slug: 'cameras-lenses' } });
  const toolsCat = await prisma.category.findUnique({ where: { slug: 'tools-equipment' } });
  const powerToolsCat = await prisma.category.findUnique({ where: { slug: 'power-tools' } });
  const travelCat = await prisma.category.findUnique({ where: { slug: 'travel-outdoor' } });
  const campingCat = await prisma.category.findUnique({ where: { slug: 'camping-tents' } });
  const photoServiceCat = await prisma.category.findUnique({ where: { slug: 'service-photography' } });
  const operatorServiceCat = await prisma.category.findUnique({ where: { slug: 'service-equipment-operators' } });

  // 5. Initial Legitimate Verified Listings
  const sampleListings = [
    {
      title: 'Mahindra 575 DI 45HP Tractor with Rotavator Attachment',
      slug: 'mahindra-575-di-tractor-with-rotavator',
      categoryId: agriCat.id,
      subcategoryId: agriMachinery ? agriMachinery.id : null,
      description: 'High-torque 45 HP diesel tractor ideal for ploughing, land preparation, and harvesting support. Comes with 42-blade heavy duty rotavator. Fuel filled at pickup, operator available on request.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
      ]),
      condition: 'LIKE_NEW',
      priceHourly: 450,
      priceDaily: 2800,
      priceWeekly: 17500,
      securityDeposit: 3000,
      city: 'Bengaluru',
      localArea: 'Nelamangala Highway',
      approxAddress: 'Near Nelamangala Toll Gate, Bengaluru Rural',
      exactAddress: 'Survey No. 42/3, Patel Agro Hub, Nelamangala, Bengaluru 562123',
      latitude: 13.0988,
      longitude: 77.3912,
      pickupAvailable: true,
      deliveryAvailable: true,
      deliveryFee: 500,
      specs: JSON.stringify({
        hp: '45 HP',
        fuel: 'Diesel',
        operatorAvailable: 'Yes (+₹600/day)',
        attachments: '42-blade Rotavator & 9-tyne Cultivator',
      }),
      rentalRules: 'Valid Aadhaar / Farmer ID required. Return with clean attachments or cleaning charges apply.',
      cancellationPolicy: 'MODERATE',
      ownerId: rajeshFarmer.id,
      status: 'ACTIVE',
    },
    {
      title: 'Kirloskar 5HP High-Discharge Diesel Water Pump & Sprinkler Kit',
      slug: 'kirloskar-5hp-water-pump-sprinkler-kit',
      categoryId: agriCat.id,
      subcategoryId: irrigationCat ? irrigationCat.id : null,
      description: 'Reliable 5 HP portable irrigation pump with 100-meter suction/delivery hoses and 4 high-throw impact sprinklers. Ideal for borewell backup and farm flood/sprinkler irrigation.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
      ]),
      condition: 'GOOD',
      priceHourly: 120,
      priceDaily: 750,
      priceWeekly: 4500,
      securityDeposit: 1500,
      city: 'Bengaluru',
      localArea: 'Hessarghatta Road',
      approxAddress: 'Near Horticultural Research Station, Hessarghatta',
      exactAddress: 'Plot 12, Farm Lane 3, Hessarghatta, Bengaluru 560088',
      latitude: 13.1384,
      longitude: 77.4912,
      pickupAvailable: true,
      deliveryAvailable: true,
      deliveryFee: 250,
      specs: JSON.stringify({
        motorType: '5 HP Diesel',
        hosesIncluded: '100m Delivery Hose + 15m Suction Pipe',
        flowRate: '1200 LPM',
      }),
      rentalRules: 'Ensure proper oil level before operation. Handle hoses without sharp bending.',
      cancellationPolicy: 'FLEXIBLE',
      ownerId: rajeshFarmer.id,
      status: 'ACTIVE',
    },
    {
      title: 'Sony FX3 Cinema Camera Kit with 24-70mm GM II Lens & Cage',
      slug: 'sony-fx3-cinema-camera-kit',
      categoryId: electronicsCat.id,
      subcategoryId: camerasCat ? camerasCat.id : null,
      description: 'Full-frame Sony FX3 cinema line camera capable of 4K 120p 10-bit 4:2:2 recording. Includes Sony 24-70mm f/2.8 GM II lens, 4x NP-FZ100 batteries, dual charger, SmallRig half cage, and 160GB CFexpress Type A card.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
      ]),
      condition: 'LIKE_NEW',
      priceHourly: 350,
      priceDaily: 2500,
      priceWeekly: 14000,
      securityDeposit: 5000,
      city: 'Bengaluru',
      localArea: 'Indiranagar 100ft Road',
      approxAddress: 'Near 12th Main Junction, Indiranagar',
      exactAddress: 'House 84, 12th Main Road, Indiranagar, Bengaluru 560038',
      latitude: 12.9784,
      longitude: 77.6408,
      pickupAvailable: true,
      deliveryAvailable: false,
      specs: JSON.stringify({
        resolution: '4K 120fps Full Frame',
        media: '160GB CFexpress Type A + 128GB V90 SD',
        batteries: '4x Original Sony NP-FZ100',
      }),
      rentalRules: 'Govt photo ID verification and refundable deposit required at pickup. Outdoor rain shooting strictly prohibited without rain cover.',
      cancellationPolicy: 'FLEXIBLE',
      ownerId: priyaCreator.id,
      status: 'ACTIVE',
    },
    {
      title: 'Bosch Professional GBH 2-26 DFR Rotary Hammer Drill Kit',
      slug: 'bosch-gbh-2-26-hammer-drill-kit',
      categoryId: toolsCat.id,
      subcategoryId: powerToolsCat ? powerToolsCat.id : null,
      description: 'Heavy duty 800W rotary hammer drill with SDS-plus chuck. Includes chisel and masonry drill bit set (6mm, 8mm, 10mm, 12mm) in sturdy carrying case.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80',
      ]),
      condition: 'GOOD',
      priceHourly: 80,
      priceDaily: 400,
      priceWeekly: 2000,
      securityDeposit: 1000,
      city: 'Bengaluru',
      localArea: 'Koramangala 4th Block',
      approxAddress: 'Near Sony World Signal, Koramangala',
      exactAddress: 'Flat 302, Green View, 4th Block, Koramangala 560034',
      latitude: 12.9345,
      longitude: 77.6265,
      pickupAvailable: true,
      deliveryAvailable: true,
      deliveryFee: 150,
      specs: JSON.stringify({
        power: '800 Watts',
        impactEnergy: '2.7 Joules',
        chuckType: 'SDS Plus Quick-change',
      }),
      rentalRules: 'Operate with safety goggles provided in box. Return clean and dry.',
      cancellationPolicy: 'FLEXIBLE',
      ownerId: anandServices.id,
      status: 'ACTIVE',
    },
    {
      title: 'Quechua 4-Person Waterproof Camping Tent & Dual Sleeping Bags',
      slug: 'quechua-4-person-camping-tent',
      categoryId: travelCat.id,
      subcategoryId: campingCat ? campingCat.id : null,
      description: 'Easy-to-pitch 4-person dome tent with UPF 50+ sun protection and waterproof flysheet. Comes with 2 insulated sleeping bags, ground sheet, and camping lantern.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80',
      ]),
      condition: 'LIKE_NEW',
      priceHourly: null,
      priceDaily: 450,
      priceWeekly: 2200,
      securityDeposit: 800,
      city: 'Bengaluru',
      localArea: 'HSR Layout Sector 1',
      approxAddress: 'Near Agara Lake, HSR Layout',
      exactAddress: 'House 55, 19th Main, Sector 1, HSR Layout 560102',
      latitude: 12.9121,
      longitude: 77.6446,
      pickupAvailable: true,
      deliveryAvailable: false,
      specs: JSON.stringify({
        capacity: '4 Adults',
        waterproofing: '2000mm water column flysheet',
        setupTime: '10 minutes',
      }),
      rentalRules: 'No campfires near tent fabric. Pack only when dry to prevent mildew.',
      cancellationPolicy: 'FLEXIBLE',
      ownerId: priyaCreator.id,
      status: 'ACTIVE',
    },
  ];

  for (const item of sampleListings) {
    await prisma.listing.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  // 6. Initial Legitimate Verified Local Services
  const sampleServices = [
    {
      title: 'Event & Commercial Product Photography',
      slug: 'event-commercial-product-photography',
      categoryId: photoServiceCat.id,
      description: 'Award-winning photographer offering high-resolution event coverage, corporate summits, weddings, and commercial studio/outdoor product shoots. Full post-processing, color grading, and next-day preview delivery included.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80',
      ]),
      hourlyRate: 1500,
      fixedRate: 8500,
      pricingType: 'HOURLY',
      experienceYears: 6,
      serviceArea: 'Bengaluru Urban & Rural (up to 35km radius)',
      city: 'Bengaluru',
      localArea: 'Indiranagar & Central',
      availability: 'Mon - Sun: 7:00 AM - 10:00 PM',
      providerId: priyaCreator.id,
      status: 'ACTIVE',
    },
    {
      title: 'Certified Tractor & Farm Machinery Operator',
      slug: 'certified-tractor-farm-machinery-operator',
      categoryId: operatorServiceCat.id,
      description: 'Professional farm machine operator with 10+ years of precision field experience. Skilled in operating tractors, rotavators, laser levellers, seeders, and combine harvesters. Available on daily wage or hourly farm booking.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=80',
      ]),
      hourlyRate: 150,
      fixedRate: 700,
      pricingType: 'FIXED',
      experienceYears: 10,
      serviceArea: 'Bengaluru North, Nelamangala, Doddaballapur & Tumakuru fringe',
      city: 'Bengaluru',
      localArea: 'Nelamangala / North',
      availability: 'Mon - Sat: 6:00 AM - 6:30 PM',
      providerId: anandServices.id,
      status: 'ACTIVE',
    },
  ];

  for (const srv of sampleServices) {
    await prisma.service.upsert({
      where: { slug: srv.slug },
      update: srv,
      create: srv,
    });
  }

  console.log('Rentoby seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
