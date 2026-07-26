/* ==========================================================================
   Pupil of Fate Automobile Trading — Inventory & Site Data
   --------------------------------------------------------------------------
   SINGLE SOURCE OF TRUTH. Everything the site renders — the fleet grid, the
   filters, the detail sheet, the Fate concierge's product knowledge and the
   structured data emitted for Google — is derived from the objects below.
   Add, edit or remove a car here and the whole site updates. No HTML edits.

   MEDIA
   Each car carries `media.exterior`, `media.interior` and `media.motion`.
   These are resolved through `POF.mediaURL()` (see media.js) so the whole
   site can be switched between remote and self-hosted assets by flipping
   `POF.MEDIA_BASE`. See pupil-of-fate/README.md.

   PRICING / SPEC ACCURACY
   Figures marked `verified: true` were confirmed from public listings.
   Everything else is representative of the brands POF stocks and MUST be
   reconciled against the live DMS feed before this goes to production.
   ========================================================================== */

(function (root) {
  'use strict';

  var POF = root.POF || (root.POF = {});

  /* ---------------------------------------------------------------- brand */

  POF.BRAND = {
    legalName: 'Pupil of Fate Automobile Trading L.L.C',
    name: 'Pupil of Fate',
    short: 'POF',
    tagline: 'Collector, super and hyper cars. Dubai.',
    founded: 2022,
    address: {
      street: '419 Sheikh Zayed Road, Al Quoz 1',
      city: 'Dubai',
      country: 'United Arab Emirates',
      countryCode: 'AE'
    },
    phone: '+971503189544',
    phoneDisplay: '+971 50 318 9544',
    phoneAlt: '+971589735366',
    phoneAltDisplay: '+971 58 973 5366',
    whatsapp: '971503189544',
    email: 'sales@pupiloffate.ae',
    hours: 'Saturday to Thursday, 09:00 to 20:00 GST. Friday by appointment.',
    social: {
      instagram: 'https://www.instagram.com/pofmotors/',
      facebook: 'https://www.facebook.com/pofmotors/',
      linkedin: 'https://www.linkedin.com/company/pupiloffate/',
      tiktok: 'https://www.tiktok.com/@pofmotors'
    }
  };

  /* ------------------------------------------------------------ taxonomy */

  POF.CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'hyper', label: 'Hypercar' },
    { id: 'super', label: 'Supercar' },
    { id: 'collector', label: 'Collector' },
    { id: 'gt', label: 'GT' },
    { id: 'suv', label: 'SUV' }
  ];

  /* ---------------------------------------------------------------- fleet */

  POF.CARS = [
    {
      slug: 'bugatti-chiron-pur-sport',
      make: 'Bugatti',
      model: 'Chiron Pur Sport',
      year: 2021,
      category: 'hyper',
      price: 14500000,
      priceOnRequest: false,
      status: 'available',
      headline: 'One of 60. Built to corner rather than to set a top speed.',
      blurb:
        'Pur Sport gives up 60 km/h of top speed and takes 50 kg out of the car. The suspension is 65 percent stiffer and the final drive 15 percent shorter, which is why this is the only W16 Chiron that changes direction properly. Two owners from new, UAE car, full Molsheim service history, complete carbon Sport package.',
      engine: '8.0L Quad-Turbocharged W16',
      power: 1500,
      torque: 1600,
      accel: 2.3,
      topSpeed: 350,
      transmission: '7-speed DCT, all-wheel drive',
      drivetrain: 'AWD',
      mileage: 1200,
      exteriorColour: 'Blu Royal Carbon / Exposed Carbon',
      interiorColour: 'Beige Alcantara with Blu stitching',
      seats: 2,
      vin: 'VF9SP3V3XMM795XXX',
      highlights: [
        'One of 60 units built worldwide',
        'Full exposed Blu Royal carbon body',
        'Magnesium wheels with aero blades',
        'Molsheim-documented service history'
      ],
      media: {
        exterior: 'bugatti-chiron-pur-sport/exterior',
        interior: 'bugatti-chiron-pur-sport/interior',
        motion: 'bugatti-chiron-pur-sport/motion'
      },
      verified: false
    },
    {
      slug: 'ferrari-f40',
      make: 'Ferrari',
      model: 'F40',
      year: 1990,
      category: 'collector',
      price: 9750000,
      priceOnRequest: false,
      status: 'available',
      headline: 'Signed off by Enzo Ferrari. Still the reference point.',
      blurb:
        'Built for Ferrari\'s 40th year. 1,100 kg of Kevlar and carbon, twin turbos, no ABS, no power steering, no driver aids at all. Classiche certified with matching numbers, and it still has the original tool roll and fitted luggage.',
      engine: '2.9L Twin-Turbocharged V8',
      power: 478,
      torque: 577,
      accel: 4.1,
      topSpeed: 324,
      transmission: '5-speed manual, rear-wheel drive',
      drivetrain: 'RWD',
      mileage: 18900,
      exteriorColour: 'Rosso Corsa',
      interiorColour: 'Rosso cloth over exposed Kevlar',
      seats: 2,
      vin: 'ZFFGJ34B000086XXX',
      highlights: [
        'Ferrari Classiche certified',
        'Matching numbers engine and gearbox',
        'Original tool roll and fitted luggage set',
        'Non-cat, non-adjust, the collector specification'
      ],
      media: {
        exterior: 'ferrari-f40/exterior',
        interior: 'ferrari-f40/interior',
        motion: 'ferrari-f40/motion'
      },
      verified: false
    },
    {
      slug: 'ferrari-sf90-xx-stradale',
      make: 'Ferrari',
      model: 'SF90 XX Stradale',
      year: 2024,
      category: 'hyper',
      price: 4850000,
      priceOnRequest: false,
      status: 'available',
      headline: 'The first XX car Ferrari made road legal.',
      blurb:
        '1,030 hp from a twin-turbo V8 and three electric motors. The fixed rear wing makes 530 kg of downforce at 250 km/h, and Extra Boost dumps the whole hybrid charge into one lap. One of 799 coupes, delivered new in the UAE, still under factory warranty.',
      engine: '4.0L Twin-Turbocharged V8 + 3 Electric Motors',
      power: 1030,
      torque: 804,
      accel: 2.3,
      topSpeed: 320,
      transmission: '8-speed DCT, all-wheel drive',
      drivetrain: 'AWD Hybrid',
      mileage: 900,
      exteriorColour: 'Rosso Corsa with Giallo Modena livery',
      interiorColour: 'Nero Alcantara with Rosso stitching',
      seats: 2,
      vin: 'ZFF99SLA0R0300XXX',
      highlights: [
        'One of 799 SF90 XX Stradale coupés',
        'Carbon-fibre racing seats and roll bar',
        'Extra Boost qualifying mode',
        'Under Ferrari factory warranty'
      ],
      media: {
        exterior: 'ferrari-sf90-xx-stradale/exterior',
        interior: 'ferrari-sf90-xx-stradale/interior',
        motion: 'ferrari-sf90-xx-stradale/motion'
      },
      verified: true
    },
    {
      slug: 'lamborghini-revuelto',
      make: 'Lamborghini',
      model: 'Revuelto',
      year: 2024,
      category: 'hyper',
      price: 3650000,
      priceOnRequest: false,
      status: 'available',
      headline: 'A 9,500 rpm V12 with three electric motors around it.',
      blurb:
        'Lamborghini kept the naturally aspirated twelve and added hybrid drive rather than replacing it. New carbon monocoque, 25 percent stiffer than the Aventador\'s. Specified through Ad Personam in Verde Mantis over Nero Ade.',
      engine: '6.5L Naturally Aspirated V12 + 3 Electric Motors',
      power: 1015,
      torque: 725,
      accel: 2.5,
      topSpeed: 350,
      transmission: '8-speed DCT, all-wheel drive',
      drivetrain: 'AWD Hybrid',
      mileage: 3100,
      exteriorColour: 'Verde Mantis',
      interiorColour: 'Nero Ade Alcantara with Verde stitching',
      seats: 2,
      vin: 'ZHWUT6ZD5RLA10XXX',
      highlights: [
        'Full Ad Personam commission',
        'Carbon-fibre monocoque and body panels',
        '9,500 rpm naturally aspirated V12',
        'Remaining Lamborghini factory warranty'
      ],
      media: {
        exterior: 'lamborghini-revuelto/exterior',
        interior: 'lamborghini-revuelto/interior',
        motion: 'lamborghini-revuelto/motion'
      },
      verified: false
    },
    {
      slug: 'mclaren-765lt-spider',
      make: 'McLaren',
      model: '765LT Spider',
      year: 2022,
      category: 'super',
      price: 2150000,
      priceOnRequest: false,
      status: 'available',
      headline: 'Longtail specification with a folding roof that costs 49 kg.',
      blurb:
        'More power, less weight, longer aero. The retractable hardtop leaves the 2.8 second sprint to 100 intact. Titanium quad exhaust, carbon racing seats, MSO Clubsport pack, full McLaren Dubai history.',
      engine: '4.0L Twin-Turbocharged V8',
      power: 765,
      torque: 800,
      accel: 2.8,
      topSpeed: 330,
      transmission: '7-speed SSG, rear-wheel drive',
      drivetrain: 'RWD',
      mileage: 6800,
      exteriorColour: 'Volcano Yellow',
      interiorColour: 'Carbon Black Alcantara',
      seats: 2,
      vin: 'SBM14DCA5NW765XXX',
      highlights: [
        'MSO Clubsport package',
        'Titanium quad-exit exhaust',
        'Carbon-fibre racing seats',
        'Full McLaren Dubai service history'
      ],
      media: {
        exterior: 'mclaren-765lt-spider/exterior',
        interior: 'mclaren-765lt-spider/interior',
        motion: 'mclaren-765lt-spider/motion'
      },
      verified: false
    },
    {
      slug: 'porsche-959-komfort',
      make: 'Porsche',
      model: '959 Komfort',
      year: 1988,
      category: 'collector',
      price: 5900000,
      priceOnRequest: false,
      status: 'available',
      headline: 'Sequential twin turbos and computer-controlled all-wheel drive, in 1988.',
      blurb:
        'Adaptive ride height, 317 km/h, and a level of engineering that made every rival look dated overnight. Still the most technically ambitious car Porsche has sold. Komfort specification, original paint, documented from new, recently recommissioned.',
      engine: '2.85L Sequential Twin-Turbocharged Flat-6',
      power: 444,
      torque: 500,
      accel: 3.7,
      topSpeed: 317,
      transmission: '6-speed manual, all-wheel drive',
      drivetrain: 'AWD',
      mileage: 42000,
      exteriorColour: 'Silver Metallic',
      interiorColour: 'Grey full leather',
      seats: 4,
      vin: 'WP0ZZZ95ZJS900XXX',
      highlights: [
        'Original paint throughout',
        'Documented ownership from new',
        'Recent full recommissioning',
        'Komfort specification with air conditioning'
      ],
      media: {
        exterior: 'porsche-959-komfort/exterior',
        interior: 'porsche-959-komfort/interior',
        motion: 'porsche-959-komfort/motion'
      },
      verified: false
    },
    {
      slug: 'rolls-royce-cullinan-black-badge',
      make: 'Rolls-Royce',
      model: 'Cullinan Black Badge',
      year: 2023,
      category: 'suv',
      price: 2450000,
      priceOnRequest: false,
      status: 'available',
      headline: '600 hp under a hand-set Starlight Headliner.',
      blurb:
        'Black Badge darkens every piece of brightwork, raises output to 600 hp and gives the exhaust a voice. Commissioned in Mandarin over black hide with the Recreation Module and the Viewing Suite. Warranty runs to 2027.',
      engine: '6.75L Twin-Turbocharged V12',
      power: 600,
      torque: 900,
      accel: 5.0,
      topSpeed: 250,
      transmission: '8-speed automatic, all-wheel drive',
      drivetrain: 'AWD',
      mileage: 9600,
      exteriorColour: 'Black Diamond',
      interiorColour: 'Mandarin over Black natural grain leather',
      seats: 5,
      vin: 'SLA1D2C0XPU200XXX',
      highlights: [
        'Bespoke Starlight Headliner with shooting stars',
        'Recreation Module and Viewing Suite',
        'Darkened Spirit of Ecstasy',
        'Rolls-Royce extended warranty to 2027'
      ],
      media: {
        exterior: 'rolls-royce-cullinan-black-badge/exterior',
        interior: 'rolls-royce-cullinan-black-badge/interior',
        motion: 'rolls-royce-cullinan-black-badge/motion'
      },
      verified: false
    },
    {
      slug: 'rolls-royce-phantom-coupe',
      make: 'Rolls-Royce',
      model: 'Phantom Coupé',
      year: 2011,
      category: 'gt',
      price: 1490000,
      priceOnRequest: false,
      status: 'available',
      headline: 'The last coach-built two-door Phantom.',
      blurb:
        'Coach doors, a brushed steel bonnet and a cabin that took 450 hours to trim. Production ended in 2016 and good examples have been climbing since. Full Rolls-Royce Dubai history, Starlight Headliner.',
      engine: '6.75L Naturally Aspirated V12',
      power: 453,
      torque: 720,
      accel: 5.8,
      topSpeed: 250,
      transmission: '6-speed automatic, rear-wheel drive',
      drivetrain: 'RWD',
      mileage: 31000,
      exteriorColour: 'Arctic White with brushed steel bonnet',
      interiorColour: 'Seashell over Navy',
      seats: 4,
      vin: 'SCA6M2C50BUX10XXX',
      highlights: [
        'Starlight Headliner',
        'Brushed stainless steel bonnet',
        'Full Rolls-Royce Dubai service history',
        'Appreciating modern collectible'
      ],
      media: {
        exterior: 'rolls-royce-phantom-coupe/exterior',
        interior: 'rolls-royce-phantom-coupe/interior',
        motion: 'rolls-royce-phantom-coupe/motion'
      },
      verified: true
    },
    {
      slug: 'porsche-911-gt3-rs-weissach',
      make: 'Porsche',
      model: '911 GT3 RS Weissach',
      year: 2025,
      category: 'super',
      price: 1395000,
      priceOnRequest: false,
      status: 'available',
      headline: 'Active aero from the 911 RSR, with a number plate.',
      blurb:
        '860 kg of downforce at 285 km/h and a drag reduction system on the rear wing. This car has the full Weissach package: magnesium wheels, exposed carbon roof, bonnet and anti-roll bars. Delivery mileage, first owner.',
      engine: '4.0L Naturally Aspirated Flat-6',
      power: 518,
      torque: 465,
      accel: 3.2,
      topSpeed: 296,
      transmission: '7-speed PDK, rear-wheel drive',
      drivetrain: 'RWD',
      mileage: 1850,
      exteriorColour: 'Arctic Grey',
      interiorColour: 'Black Race-Tex with Guards Red stitching',
      seats: 2,
      vin: 'WP0AF2A99SS275XXX',
      highlights: [
        'Full Weissach package',
        'Forged magnesium wheels',
        'Exposed carbon roof, bonnet and anti-roll bars',
        'Delivery mileage, first owner'
      ],
      media: {
        exterior: 'porsche-911-gt3-rs-weissach/exterior',
        interior: 'porsche-911-gt3-rs-weissach/interior',
        motion: 'porsche-911-gt3-rs-weissach/motion'
      },
      verified: true
    },
    {
      slug: 'lamborghini-urus-se',
      make: 'Lamborghini',
      model: 'Urus SE',
      year: 2025,
      category: 'suv',
      price: 1290000,
      priceOnRequest: false,
      status: 'available',
      headline: '789 hp, and 60 km of it silent.',
      blurb:
        'The plug-in Urus is the most powerful Super SUV Lamborghini has built. Twin-turbo V8 with a 192 hp electric motor, a new torque-vectoring rear differential and a redesigned front end. School run in silence, 312 km/h afterwards.',
      engine: '4.0L Twin-Turbocharged V8 + Electric Motor',
      power: 789,
      torque: 950,
      accel: 3.4,
      topSpeed: 312,
      transmission: '8-speed automatic, all-wheel drive',
      drivetrain: 'AWD Hybrid',
      mileage: 2400,
      exteriorColour: 'Blu Eleos',
      interiorColour: 'Nero Ade with Blu contrast stitching',
      seats: 5,
      vin: 'ZPBUA1ZL5SLA20XXX',
      highlights: [
        'Plug-in hybrid with 60 km electric range',
        'Carbon-fibre exterior package',
        'Akrapovič sports exhaust',
        'Full Lamborghini Dubai warranty'
      ],
      media: {
        exterior: 'lamborghini-urus-se/exterior',
        interior: 'lamborghini-urus-se/interior',
        motion: 'lamborghini-urus-se/motion'
      },
      verified: true
    },
    {
      slug: 'bentley-continental-gt-speed',
      make: 'Bentley',
      model: 'Continental GT Speed',
      year: 2023,
      category: 'gt',
      price: 1180000,
      priceOnRequest: false,
      status: 'available',
      headline: 'One of the last W12 Continentals Crewe built.',
      blurb:
        'Bentley retired the 6.0-litre W12 in 2024, which makes the final Speed cars the end of a twenty year line. All-wheel steering, electronic limited-slip differential and 48-volt anti-roll bars. Mulliner Driving Specification, Naim audio.',
      engine: '6.0L Twin-Turbocharged W12',
      power: 650,
      torque: 900,
      accel: 3.6,
      topSpeed: 335,
      transmission: '8-speed DCT, all-wheel drive',
      drivetrain: 'AWD',
      mileage: 12400,
      exteriorColour: 'Anthracite Satin',
      interiorColour: 'Linen over Beluga hide',
      seats: 4,
      vin: 'SCBCA4ZG5PC010XXX',
      highlights: [
        'Final-generation W12 engine',
        'Mulliner Driving Specification',
        'Naim for Bentley audio',
        'Rotating dashboard display'
      ],
      media: {
        exterior: 'bentley-continental-gt-speed/exterior',
        interior: 'bentley-continental-gt-speed/interior',
        motion: 'bentley-continental-gt-speed/motion'
      },
      verified: false
    },
    {
      slug: 'mercedes-amg-g63',
      make: 'Mercedes-AMG',
      model: 'G 63',
      year: 2023,
      category: 'suv',
      price: 635000,
      priceOnRequest: false,
      status: 'available',
      headline: 'Forty years of unchanged geometry, with 585 hp in it.',
      blurb:
        'The G-Class refuses to modernise its shape and is worth more for it. Three locking differentials, a hand-built AMG V8, and a cabin that has quietly become one of the best Mercedes makes. Obsidian Black with the AMG Night Package, full service history.',
      engine: '4.0L Twin-Turbocharged V8',
      power: 585,
      torque: 850,
      accel: 4.5,
      topSpeed: 220,
      transmission: '9-speed automatic, all-wheel drive',
      drivetrain: 'AWD',
      mileage: 50660,
      exteriorColour: 'Obsidian Black Metallic',
      interiorColour: 'Black Nappa leather with diamond quilting',
      seats: 5,
      vin: 'W1NYC7HJ0PX460XXX',
      highlights: [
        'AMG Night Package',
        'Burmester surround sound',
        'Three locking differentials',
        'Full Mercedes-Benz service history'
      ],
      media: {
        exterior: 'mercedes-amg-g63/exterior',
        interior: 'mercedes-amg-g63/interior',
        motion: 'mercedes-amg-g63/motion'
      },
      verified: true
    }
  ];

  /* -------------------------------------------------------------- services */

  POF.SERVICES = [
    {
      icon: 'trade',
      title: 'Trading',
      copy:
        'We buy, sell and broker collector, super and hyper cars across the GCC, ' +
        'Europe and the United States. Every car is inspected here before it goes ' +
        'on the floor.'
    },
    {
      icon: 'source',
      title: 'Sourcing',
      copy:
        'Give us the specification and we will find it. Allocation cars, ' +
        'discontinued builds, single-market colours. Our network covers 40 ' +
        'countries and most of what we place is never publicly listed.'
    },
    {
      icon: 'export',
      title: 'Export',
      copy:
        'Enclosed transport, customs clearance, homologation and door-to-door ' +
        'delivery to any port. Fully insured and fully documented, handled by our ' +
        'own logistics desk.'
    },
    {
      icon: 'service',
      title: 'Service',
      copy:
        'Maintenance, pre-purchase inspection, paint protection and full ' +
        'nut-and-bolt restoration of 1980s and 1990s cars, in our own workshop.'
    },
    {
      icon: 'finance',
      title: 'Finance',
      copy:
        'Structured finance through UAE banking partners, including balloon and ' +
        'asset-backed facilities for collectors holding several cars.'
    },
    {
      icon: 'rental',
      title: 'Rental',
      copy:
        'Short-term access to the fleet by the day, the week or the event, with ' +
        'or without a chauffeur.'
    }
  ];

  /* --------------------------------------------------------------- helpers */

  POF.carBySlug = function (slug) {
    for (var i = 0; i < POF.CARS.length; i++) {
      if (POF.CARS[i].slug === slug) return POF.CARS[i];
    }
    return null;
  };

  POF.formatAED = function (n) {
    return 'AED ' + Number(n).toLocaleString('en-US');
  };

  POF.formatKm = function (n) {
    return Number(n).toLocaleString('en-US') + ' km';
  };
})(window);
