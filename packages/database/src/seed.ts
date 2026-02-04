import { PrismaClient, Region, ProductCategory, RetailerType, PriceSourceType } from '@prisma/client';

const prisma = new PrismaClient();

// Image URL mapping for products - using real product images
// Image URL mapping for products - using reliable placeholder images
const productImages: Record<string, string> = {
  // BABY DIAPERS
  'pampers-swaddlers-size-1-198ct': 'https://ui-avatars.com/api/?name=Pampers+1&background=FFD9E5&color=000&bold=true&size=400',
  'pampers-swaddlers-size-2-186ct': 'https://ui-avatars.com/api/?name=Pampers+2&background=FFD9E5&color=000&bold=true&size=400',
  'pampers-swaddlers-size-3-168ct': 'https://ui-avatars.com/api/?name=Pampers+3&background=FFD9E5&color=000&bold=true&size=400',
  'pampers-cruisers-size-4-160ct': 'https://ui-avatars.com/api/?name=Pampers+4&background=FFD9E5&color=000&bold=true&size=400',
  'huggies-little-snugglers-size-1-198ct': 'https://ui-avatars.com/api/?name=Huggies+1&background=E3F2FD&color=000&bold=true&size=400',
  'huggies-little-snugglers-size-2-186ct': 'https://ui-avatars.com/api/?name=Huggies+2&background=E3F2FD&color=000&bold=true&size=400',
  'huggies-little-movers-size-3-162ct': 'https://ui-avatars.com/api/?name=Huggies+3&background=E3F2FD&color=000&bold=true&size=400',
  'huggies-little-movers-size-4-152ct': 'https://ui-avatars.com/api/?name=Huggies+4&background=E3F2FD&color=000&bold=true&size=400',
  'luvs-ultra-leakguards-size-1-252ct': 'https://ui-avatars.com/api/?name=Luvs+1&background=FFF3E0&color=000&bold=true&size=400',
  'luvs-ultra-leakguards-size-2-228ct': 'https://ui-avatars.com/api/?name=Luvs+2&background=FFF3E0&color=000&bold=true&size=400',
  'honest-diapers-size-1-160ct': 'https://ui-avatars.com/api/?name=Honest+1&background=F1F8E9&color=000&bold=true&size=400',
  'seventh-gen-diapers-size-2-144ct': 'https://ui-avatars.com/api/?name=7Gen&background=E0F2F1&color=000&bold=true&size=400',

  // BABY FORMULA
  'similac-pro-advance-36oz': 'https://ui-avatars.com/api/?name=Similac&background=FFF9C4&color=000&bold=true&size=400',
  'similac-pro-sensitive-34oz': 'https://ui-avatars.com/api/?name=Similac+S&background=FFF9C4&color=000&bold=true&size=400',
  'similac-360-total-care-30.8oz': 'https://ui-avatars.com/api/?name=Similac+360&background=FFF9C4&color=000&bold=true&size=400',
  'enfamil-neuropro-20.7oz': 'https://ui-avatars.com/api/?name=Enfamil&background=FCE4EC&color=000&bold=true&size=400',
  'enfamil-neuropro-gentlease-27.4oz': 'https://ui-avatars.com/api/?name=Enfamil+G&background=FCE4EC&color=000&bold=true&size=400',
  'enfamil-ar-27.4oz': 'https://ui-avatars.com/api/?name=Enfamil+AR&background=FCE4EC&color=000&bold=true&size=400',
  'gerber-good-start-gentlepro-32oz': 'https://ui-avatars.com/api/?name=Gerber&background=F0F4C3&color=000&bold=true&size=400',
  'gerber-good-start-soothepro-30.6oz': 'https://ui-avatars.com/api/?name=Gerber+S&background=F0F4C3&color=000&bold=true&size=400',
  'kirkland-infant-formula-34oz': 'https://ui-avatars.com/api/?name=Kirkland&background=E8F5E9&color=000&bold=true&size=400',
  'similac-organic-23.2oz': 'https://ui-avatars.com/api/?name=Similac+O&background=FFF9C4&color=000&bold=true&size=400',

  // BABY WIPES
  'pampers-sensitive-wipes-1008ct': 'https://ui-avatars.com/api/?name=Pampers+W&background=FCE4EC&color=000&bold=true&size=400',
  'pampers-sensitive-wipes-672ct': 'https://ui-avatars.com/api/?name=Pampers+W2&background=FCE4EC&color=000&bold=true&size=400',
  'huggies-natural-care-1040ct': 'https://ui-avatars.com/api/?name=Huggies+W&background=E3F2FD&color=000&bold=true&size=400',
  'huggies-natural-care-560ct': 'https://ui-avatars.com/api/?name=Huggies+W2&background=E3F2FD&color=000&bold=true&size=400',
  'huggies-simply-clean-768ct': 'https://ui-avatars.com/api/?name=Huggies+SC&background=E3F2FD&color=000&bold=true&size=400',
  'pampers-complete-clean-720ct': 'https://ui-avatars.com/api/?name=Pampers+CC&background=FCE4EC&color=000&bold=true&size=400',
  'honest-wipes-576ct': 'https://ui-avatars.com/api/?name=Honest+W&background=F1F8E9&color=000&bold=true&size=400',
  'seventh-gen-wipes-504ct': 'https://ui-avatars.com/api/?name=7Gen+W&background=E0F2F1&color=000&bold=true&size=400',
  'kirkland-baby-wipes-900ct': 'https://ui-avatars.com/api/?name=Kirkland+W&background=E8F5E9&color=000&bold=true&size=400',
  'waterwipes-720ct': 'https://ui-avatars.com/api/?name=WaterWipes&background=E1F5FE&color=000&bold=true&size=400',

  // BABY FOOD
  'gerber-stage1-variety-20pk': 'https://ui-avatars.com/api/?name=Gerber+1&background=FFF3E0&color=000&bold=true&size=400',
  'gerber-stage2-fruit-18pk': 'https://ui-avatars.com/api/?name=Gerber+F&background=FFF3E0&color=000&bold=true&size=400',
  'gerber-stage2-veggie-18pk': 'https://ui-avatars.com/api/?name=Gerber+V&background=FFF3E0&color=000&bold=true&size=400',
  'gerber-organic-pouches-12pk': 'https://ui-avatars.com/api/?name=Gerber+O&background=FFF3E0&color=000&bold=true&size=400',
  'gerber-puffs-variety-8pk': 'https://ui-avatars.com/api/?name=Gerber+P&background=FFF3E0&color=000&bold=true&size=400',
  'gerber-lil-crunchies-8pk': 'https://ui-avatars.com/api/?name=Gerber+C&background=FFF3E0&color=000&bold=true&size=400',
  'gerber-oatmeal-cereal-16oz': 'https://ui-avatars.com/api/?name=Gerber+OAT&background=FFF3E0&color=000&bold=true&size=400',
  'gerber-rice-cereal-16oz': 'https://ui-avatars.com/api/?name=Gerber+R&background=FFF3E0&color=000&bold=true&size=400',
  'honest-organic-baby-food-16pk': 'https://ui-avatars.com/api/?name=Honest+B&background=F1F8E9&color=000&bold=true&size=400',
  'kirkland-organic-baby-food-24pk': 'https://ui-avatars.com/api/?name=Kirkland+B&background=E8F5E9&color=000&bold=true&size=400',

  // BEVERAGES - SODA
  'coca-cola-classic-12oz-24pk': 'https://ui-avatars.com/api/?name=Coca+Cola&background=FFE0E6&color=C00&bold=true&size=400',
  'coca-cola-classic-12oz-36pk': 'https://ui-avatars.com/api/?name=Coke+36&background=FFE0E6&color=C00&bold=true&size=400',
  'diet-coke-12oz-24pk': 'https://ui-avatars.com/api/?name=Diet+Coke&background=F0F0F0&color=000&bold=true&size=400',
  'coke-zero-12oz-24pk': 'https://ui-avatars.com/api/?name=Coke+Zero&background=1A1A1A&color=FFF&bold=true&size=400',
  'pepsi-12oz-24pk': 'https://ui-avatars.com/api/?name=Pepsi&background=FFEBEE&color=003DA5&bold=true&size=400',
  'diet-pepsi-12oz-24pk': 'https://ui-avatars.com/api/?name=Diet+Pepsi&background=E8E8E8&color=003DA5&bold=true&size=400',
  'pepsi-zero-12oz-24pk': 'https://ui-avatars.com/api/?name=Pepsi+0&background=1A1A1A&color=FFF&bold=true&size=400',
  'dr-pepper-12oz-24pk': 'https://ui-avatars.com/api/?name=Dr+Pepper&background=882233&color=FFF&bold=true&size=400',
  'sprite-12oz-24pk': 'https://ui-avatars.com/api/?name=Sprite&background=E8F5E9&color=228B22&bold=true&size=400',
  'mountain-dew-12oz-24pk': 'https://ui-avatars.com/api/?name=Mt+Dew&background=CCFFCC&color=228B22&bold=true&size=400',
  'coca-cola-2l-6pk': 'https://ui-avatars.com/api/?name=Coke+2L&background=FFE0E6&color=C00&bold=true&size=400',
  'pepsi-2l-6pk': 'https://ui-avatars.com/api/?name=Pepsi+2L&background=FFEBEE&color=003DA5&bold=true&size=400',

  // BEVERAGES - WATER
  'dasani-water-16.9oz-24pk': 'https://ui-avatars.com/api/?name=Dasani&background=E1F5FE&color=0277BD&bold=true&size=400',
  'dasani-water-16.9oz-40pk': 'https://ui-avatars.com/api/?name=Dasani+40&background=E1F5FE&color=0277BD&bold=true&size=400',
  'aquafina-water-16.9oz-24pk': 'https://ui-avatars.com/api/?name=Aquafina&background=B3E5FC&color=01579B&bold=true&size=400',
  'aquafina-water-16.9oz-40pk': 'https://ui-avatars.com/api/?name=Aquafina+40&background=B3E5FC&color=01579B&bold=true&size=400',
  'poland-spring-16.9oz-24pk': 'https://ui-avatars.com/api/?name=P.Spring&background=C8E6C9&color=0D3600&bold=true&size=400',
  'poland-spring-16.9oz-40pk': 'https://ui-avatars.com/api/?name=P.Spring+40&background=C8E6C9&color=0D3600&bold=true&size=400',
  'evian-1l-6pk': 'https://ui-avatars.com/api/?name=Evian&background=B3E5FC&color=01579B&bold=true&size=400',
  'fiji-16.9oz-24pk': 'https://ui-avatars.com/api/?name=Fiji&background=A8D8EA&color=0277BD&bold=true&size=400',
  'kirkland-water-16.9oz-40pk': 'https://ui-avatars.com/api/?name=Kirkland+W&background=E1F5FE&color=01579B&bold=true&size=400',
  'kirkland-water-8oz-80pk': 'https://ui-avatars.com/api/?name=Kirkland+80&background=E1F5FE&color=01579B&bold=true&size=400',
  'dasani-sparkling-12oz-24pk': 'https://ui-avatars.com/api/?name=Dasani+S&background=E0F2F1&color=004D40&bold=true&size=400',
  'smart-water-1l-6pk': 'https://ui-avatars.com/api/?name=Smart+H2O&background=E0F2F1&color=004D40&bold=true&size=400',

  // BEVERAGES - JUICE (using warm colors for juice)
  'tropicana-oj-89oz': 'https://ui-avatars.com/api/?name=Tropicana&background=FFE0B2&color=FF6F00&bold=true&size=400',
  'tropicana-no-pulp-52oz': 'https://ui-avatars.com/api/?name=Trop+NP&background=FFE0B2&color=FF6F00&bold=true&size=400',
  'tropicana-apple-10oz-24pk': 'https://ui-avatars.com/api/?name=Trop+A&background=F1F8E9&color=558B2F&bold=true&size=400',
  'minute-maid-oj-59oz': 'https://ui-avatars.com/api/?name=MM+OJ&background=FFE0B2&color=E65100&bold=true&size=400',
  'minute-maid-apple-64oz': 'https://ui-avatars.com/api/?name=MM+Apple&background=F1F8E9&color=558B2F&bold=true&size=400',
  'minute-maid-lemonade-59oz': 'https://ui-avatars.com/api/?name=MM+Lemon&background=FFFDE7&color=F57F17&bold=true&size=400',
  'simply-orange-52oz': 'https://ui-avatars.com/api/?name=Simply+OJ&background=FFE0B2&color=FF6F00&bold=true&size=400',
  'kirkland-oj-2x59oz': 'https://ui-avatars.com/api/?name=K+OJ&background=FFE0B2&color=E65100&bold=true&size=400',
  'tropicana-grape-10oz-24pk': 'https://ui-avatars.com/api/?name=Trop+G&background=F3E5F5&color=6A1B9A&bold=true&size=400',
  'ocean-spray-cranberry-101oz': 'https://ui-avatars.com/api/?name=Ocean+Spray&background=FFEBEE&color=C2185B&bold=true&size=400',

  // BEVERAGES - SPORTS DRINKS
  'gatorade-variety-12oz-28pk': 'https://ui-avatars.com/api/?name=Gatorade+V&background=C8E6C9&color=1B5E20&bold=true&size=400',
  'gatorade-lemon-lime-20oz-12pk': 'https://ui-avatars.com/api/?name=Gatorade+LL&background=FFFDE7&color=F57F17&bold=true&size=400',
  'gatorade-cool-blue-20oz-12pk': 'https://ui-avatars.com/api/?name=Gatorade+B&background=B3E5FC&color=01579B&bold=true&size=400',
  'gatorade-fruit-punch-20oz-12pk': 'https://ui-avatars.com/api/?name=Gatorade+FP&background=FFEBEE&color=C2185B&bold=true&size=400',
  'gatorade-zero-12oz-24pk': 'https://ui-avatars.com/api/?name=Gatorade+0&background=F0F0F0&color=333&bold=true&size=400',
  'powerade-berry-20oz-12pk': 'https://ui-avatars.com/api/?name=Powerade+B&background=FCE4EC&color=880E4F&bold=true&size=400',
  'powerade-mixed-berry-20oz-12pk': 'https://ui-avatars.com/api/?name=Powerade+MB&background=F3E5F5&color=6A1B9A&bold=true&size=400',
  'powerade-fruit-punch-20oz-12pk': 'https://ui-avatars.com/api/?name=Powerade+FP&background=FFCCBC&color=D84315&bold=true&size=400',
  'gatorade-g2-12oz-24pk': 'https://ui-avatars.com/api/?name=Gatorade+G2&background=F0F0F0&color=333&bold=true&size=400',
  'powerade-zero-20oz-12pk': 'https://ui-avatars.com/api/?name=Powerade+0&background=E0E0E0&color=424242&bold=true&size=400',

  // HOUSEHOLD - CLEANING
  'clorox-wipes-3pk': 'https://ui-avatars.com/api/?name=Clorox&background=FFEBEE&color=C62828&bold=true&size=400',
  'clorox-cleanup-32oz-2pk': 'https://ui-avatars.com/api/?name=Clorox+C&background=FFEBEE&color=C62828&bold=true&size=400',
  'clorox-bleach-121oz': 'https://ui-avatars.com/api/?name=Bleach&background=FFF9C4&color=F57F17&bold=true&size=400',
  'lysol-wipes-4pk': 'https://ui-avatars.com/api/?name=Lysol+W&background=BBDEFB&color=0D47A1&bold=true&size=400',
  'lysol-spray-19oz-2pk': 'https://ui-avatars.com/api/?name=Lysol&background=BBDEFB&color=0D47A1&bold=true&size=400',
  'lysol-all-purpose-144oz': 'https://ui-avatars.com/api/?name=Lysol+AP&background=BBDEFB&color=0D47A1&bold=true&size=400',
  'mr-clean-128oz': 'https://ui-avatars.com/api/?name=Mr.Clean&background=E0F2F1&color=00695C&bold=true&size=400',
  'mr-clean-magic-eraser-8pk': 'https://ui-avatars.com/api/?name=Magic+E&background=FFF3E0&color=E65100&bold=true&size=400',
  'windex-23oz-2pk': 'https://ui-avatars.com/api/?name=Windex&background=E3F2FD&color=0D47A1&bold=true&size=400',
  'kirkland-wipes-4pk': 'https://ui-avatars.com/api/?name=Kirkland+W&background=F1F8E9&color=33691E&bold=true&size=400',
  'kirkland-all-purpose-2pk': 'https://ui-avatars.com/api/?name=Kirkland+AP&background=F1F8E9&color=33691E&bold=true&size=400',
  'seventh-gen-all-purpose-23oz': 'https://ui-avatars.com/api/?name=7Gen&background=E0F2F1&color=004D40&bold=true&size=400',

  // HOUSEHOLD - PAPER
  'bounty-paper-towels-12pk': 'https://ui-avatars.com/api/?name=Bounty&background=FFF9C4&color=F57F17&bold=true&size=400',
  'bounty-quick-size-8pk': 'https://ui-avatars.com/api/?name=Bounty+Q&background=FFF9C4&color=F57F17&bold=true&size=400',
  'scott-paper-towels-15pk': 'https://ui-avatars.com/api/?name=Scott&background=FFFDE7&color=F57F17&bold=true&size=400',
  'kirkland-paper-towels-12pk': 'https://ui-avatars.com/api/?name=Kirkland+PT&background=FFF9C4&color=F57F17&bold=true&size=400',
  'charmin-ultra-soft-24pk': 'https://ui-avatars.com/api/?name=Charmin+S&background=F3E5F5&color=7B1FA2&bold=true&size=400',
  'charmin-ultra-strong-24pk': 'https://ui-avatars.com/api/?name=Charmin+St&background=F3E5F5&color=7B1FA2&bold=true&size=400',
  'cottonelle-ultra-24pk': 'https://ui-avatars.com/api/?name=Cottonelle&background=FFF3E0&color=E65100&bold=true&size=400',
  'scott-1000-30pk': 'https://ui-avatars.com/api/?name=Scott+1k&background=FFFDE7&color=F57F17&bold=true&size=400',
  'kirkland-bath-tissue-30pk': 'https://ui-avatars.com/api/?name=Kirkland+BT&background=F3E5F5&color=6A1B9A&bold=true&size=400',
  'bounty-napkins-200ct-4pk': 'https://ui-avatars.com/api/?name=Bounty+N&background=FFF9C4&color=F57F17&bold=true&size=400',
  'vanity-fair-napkins-660ct': 'https://ui-avatars.com/api/?name=VF+Nap&background=FCE4EC&color=C2185B&bold=true&size=400',
  'kirkland-napkins-500ct-2pk': 'https://ui-avatars.com/api/?name=K+Nap&background=F1F8E9&color=558B2F&bold=true&size=400',

  // HOUSEHOLD - LAUNDRY
  'tide-original-154oz': 'https://ui-avatars.com/api/?name=Tide+O&background=FFEBEE&color=C62828&bold=true&size=400',
  'tide-pods-81ct': 'https://ui-avatars.com/api/?name=Tide+Pods&background=FFEBEE&color=C62828&bold=true&size=400',
  'tide-free-gentle-154oz': 'https://ui-avatars.com/api/?name=Tide+F&background=F1F8E9&color=558B2F&bold=true&size=400',
  'gain-original-154oz': 'https://ui-avatars.com/api/?name=Gain+O&background=FFF3E0&color=E65100&bold=true&size=400',
  'gain-flings-96ct': 'https://ui-avatars.com/api/?name=Gain+F&background=FFF3E0&color=E65100&bold=true&size=400',
  'all-free-clear-184oz': 'https://ui-avatars.com/api/?name=All+Free&background=F0F0F0&color=333&bold=true&size=400',
  'arm-hammer-clean-burst-170oz': 'https://ui-avatars.com/api/?name=AH+Clean&background=BBDEFB&color=0D47A1&bold=true&size=400',
  'kirkland-ultra-clean-194oz': 'https://ui-avatars.com/api/?name=K+Clean&background=E8F5E9&color=1B5E20&bold=true&size=400',
  'kirkland-pods-152ct': 'https://ui-avatars.com/api/?name=K+Pods&background=E8F5E9&color=1B5E20&bold=true&size=400',
  'seventh-gen-laundry-150oz': 'https://ui-avatars.com/api/?name=7Gen+L&background=E0F2F1&color=004D40&bold=true&size=400',

  // PERSONAL CARE
  'head-shoulders-classic-32oz': 'https://ui-avatars.com/api/?name=H%2BS&background=BBDEFB&color=1565C0&bold=true&size=400',
  'pantene-daily-moisture-25oz': 'https://ui-avatars.com/api/?name=Pantene&background=FCE4EC&color=C2185B&bold=true&size=400',
  'dove-daily-moisture-25oz-2pk': 'https://ui-avatars.com/api/?name=Dove+DM&background=E1F5FE&color=01579B&bold=true&size=400',
  'dove-body-wash-24oz-3pk': 'https://ui-avatars.com/api/?name=Dove+BW&background=E1F5FE&color=01579B&bold=true&size=400',
  'old-spice-swagger-30oz-2pk': 'https://ui-avatars.com/api/?name=Old+Spice&background=FFCCBC&color=BF360C&bold=true&size=400',
  'old-spice-pure-sport-deo-3pk': 'https://ui-avatars.com/api/?name=OS+Deo&background=FFCCBC&color=BF360C&bold=true&size=400',
  'secret-clinical-deo-2pk': 'https://ui-avatars.com/api/?name=Secret&background=FCE4EC&color=C2185B&bold=true&size=400',
  'degree-cool-rush-deo-4pk': 'https://ui-avatars.com/api/?name=Degree&background=B3E5FC&color=01579B&bold=true&size=400',
  'crest-3d-white-5.4oz-4pk': 'https://ui-avatars.com/api/?name=Crest+3D&background=FFFDE7&color=F57F17&bold=true&size=400',
  'colgate-total-5.1oz-4pk': 'https://ui-avatars.com/api/?name=Colgate&background=FFCCBC&color=D84315&bold=true&size=400',
  'sensodyne-pronamel-4oz-3pk': 'https://ui-avatars.com/api/?name=Sensodyne&background=F1F8E9&color=558B2F&bold=true&size=400',
  'oral-b-pro-1000': 'https://ui-avatars.com/api/?name=Oral-B&background=BBDEFB&color=0D47A1&bold=true&size=400',
  'cetaphil-cleanser-20oz-2pk': 'https://ui-avatars.com/api/?name=Cetaphil&background=E0F2F1&color=004D40&bold=true&size=400',
  'aveeno-lotion-18oz-2pk': 'https://ui-avatars.com/api/?name=Aveeno&background=F1F8E9&color=558B2F&bold=true&size=400',
  'nivea-body-lotion-16.9oz-3pk': 'https://ui-avatars.com/api/?name=Nivea&background=E3F2FD&color=0D47A1&bold=true&size=400',

  // PET FOOD - DOG
  'purina-one-smartblend-40lb': 'https://ui-avatars.com/api/?name=Purina+1&background=FFCCBC&color=BF360C&bold=true&size=400',
  'purina-pro-plan-adult-35lb': 'https://ui-avatars.com/api/?name=Purina+PP&background=FFCCBC&color=BF360C&bold=true&size=400',
  'blue-buffalo-life-protection-30lb': 'https://ui-avatars.com/api/?name=Blue+Buff&background=B3E5FC&color=01579B&bold=true&size=400',
  'blue-buffalo-wilderness-24lb': 'https://ui-avatars.com/api/?name=BB+Wild&background=C8E6C9&color=1B5E20&bold=true&size=400',
  'pedigree-adult-dry-33lb': 'https://ui-avatars.com/api/?name=Pedigree&background=FFF3E0&color=E65100&bold=true&size=400',
  'pedigree-complete-50lb': 'https://ui-avatars.com/api/?name=Pedigree+C&background=FFF3E0&color=E65100&bold=true&size=400',
  'iams-proactive-adult-30lb': 'https://ui-avatars.com/api/?name=Iams&background=FFE0B2&color=FF6F00&bold=true&size=400',
  'kirkland-natures-domain-35lb': 'https://ui-avatars.com/api/?name=K+Nat.D&background=E8F5E9&color=1B5E20&bold=true&size=400',
  'purina-beneful-originals-40lb': 'https://ui-avatars.com/api/?name=Beneful&background=FFCCBC&color=BF360C&bold=true&size=400',
  'kirkland-premium-dog-food-40lb': 'https://ui-avatars.com/api/?name=K+Premium&background=E8F5E9&color=1B5E20&bold=true&size=400',

  // PET FOOD - CAT
  'purina-one-healthy-22lb': 'https://ui-avatars.com/api/?name=P+One+Cat&background=FFCCBC&color=BF360C&bold=true&size=400',
  'purina-cat-chow-25lb': 'https://ui-avatars.com/api/?name=Cat+Chow&background=FFCCBC&color=BF360C&bold=true&size=400',
  'blue-buffalo-indoor-15lb': 'https://ui-avatars.com/api/?name=BB+Indoor&background=B3E5FC&color=01579B&bold=true&size=400',
  'blue-buffalo-tastefuls-15lb': 'https://ui-avatars.com/api/?name=BB+Taste&background=B3E5FC&color=01579B&bold=true&size=400',
  'friskies-surfin-turfin-22lb': 'https://ui-avatars.com/api/?name=Friskies&background=FFF3E0&color=E65100&bold=true&size=400',
  'meow-mix-original-22lb': 'https://ui-avatars.com/api/?name=Meow+Mix&background=FCE4EC&color=C2185B&bold=true&size=400',
  'iams-proactive-indoor-22lb': 'https://ui-avatars.com/api/?name=Iams+In&background=FFE0B2&color=FF6F00&bold=true&size=400',
  'fancy-feast-gourmet-48pk': 'https://ui-avatars.com/api/?name=Fancy+F&background=F3E5F5&color=6A1B9A&bold=true&size=400',
  'friskies-wet-variety-60pk': 'https://ui-avatars.com/api/?name=Friskies+W&background=FFF3E0&color=E65100&bold=true&size=400',
  'kirkland-cat-food-25lb': 'https://ui-avatars.com/api/?name=K+Cat&background=E8F5E9&color=1B5E20&bold=true&size=400',

  // PET TREATS
  'greenies-dental-36oz': 'https://ui-avatars.com/api/?name=Greenies&background=C8E6C9&color=1B5E20&bold=true&size=400',
  'greenies-regular-36ct': 'https://ui-avatars.com/api/?name=Greenies+R&background=C8E6C9&color=1B5E20&bold=true&size=400',
  'milk-bone-original-10lb': 'https://ui-avatars.com/api/?name=Milk-Bone&background=FFE0B2&color=FF6F00&bold=true&size=400',
  'milk-bone-marosnacks-40oz': 'https://ui-avatars.com/api/?name=MB+Snacks&background=FFE0B2&color=FF6F00&bold=true&size=400',
  'beggin-strips-bacon-40oz': 'https://ui-avatars.com/api/?name=Beggin&background=FFCCBC&color=D84315&bold=true&size=400',
  'blue-wilderness-treats-24oz': 'https://ui-avatars.com/api/?name=BB+Treats&background=C8E6C9&color=1B5E20&bold=true&size=400',
  'greenies-feline-21oz': 'https://ui-avatars.com/api/?name=G+Feline&background=C8E6C9&color=1B5E20&bold=true&size=400',
  'temptations-variety-4pk': 'https://ui-avatars.com/api/?name=Tempt&background=FCE4EC&color=C2185B&bold=true&size=400',
  'friskies-party-mix-20oz': 'https://ui-avatars.com/api/?name=Party+Mix&background=FFF3E0&color=E65100&bold=true&size=400',
   'kirkland-dog-biscuits-15lb': 'https://ui-avatars.com/api/?name=K+Treats&background=E8F5E9&color=1B5E20&bold=true&size=400',
};

async function main() {
  console.log('Seeding database with comprehensive data...');

  // ============================================
  // RETAILERS
  // ============================================
  const retailers = await Promise.all([
    // US Retailers
    prisma.retailer.upsert({
      where: { slug: 'walmart-us' },
      update: {},
      create: {
        name: 'Walmart',
        slug: 'walmart-us',
        displayName: 'Walmart US',
        region: Region.US,
        type: RetailerType.BOTH,
        websiteUrl: 'https://www.walmart.com',
        apiType: PriceSourceType.API,
        logoUrl: 'https://logo.clearbit.com/walmart.com',
        isActive: true,
      },
    }),
    prisma.retailer.upsert({
      where: { slug: 'amazon-us' },
      update: {},
      create: {
        name: 'Amazon',
        slug: 'amazon-us',
        displayName: 'Amazon.com',
        region: Region.US,
        type: RetailerType.ONLINE,
        websiteUrl: 'https://www.amazon.com',
        apiType: PriceSourceType.API,
        logoUrl: 'https://logo.clearbit.com/amazon.com',
        isActive: true,
      },
    }),
    prisma.retailer.upsert({
      where: { slug: 'costco-us' },
      update: {},
      create: {
        name: 'Costco',
        slug: 'costco-us',
        displayName: 'Costco US',
        region: Region.US,
        type: RetailerType.BOTH,
        websiteUrl: 'https://www.costco.com',
        apiType: PriceSourceType.SCRAPER,
        logoUrl: 'https://logo.clearbit.com/costco.com',
        isActive: true,
      },
    }),
    prisma.retailer.upsert({
      where: { slug: 'target-us' },
      update: {},
      create: {
        name: 'Target',
        slug: 'target-us',
        displayName: 'Target',
        region: Region.US,
        type: RetailerType.BOTH,
        websiteUrl: 'https://www.target.com',
        apiType: PriceSourceType.SCRAPER,
        logoUrl: 'https://logo.clearbit.com/target.com',
        isActive: true,
      },
    }),
    // Canadian Retailers
    prisma.retailer.upsert({
      where: { slug: 'walmart-ca' },
      update: {},
      create: {
        name: 'Walmart',
        slug: 'walmart-ca',
        displayName: 'Walmart Canada',
        region: Region.CA,
        type: RetailerType.BOTH,
        websiteUrl: 'https://www.walmart.ca',
        apiType: PriceSourceType.SCRAPER,
        logoUrl: 'https://logo.clearbit.com/walmart.com',
        isActive: true,
      },
    }),
    prisma.retailer.upsert({
      where: { slug: 'amazon-ca' },
      update: {},
      create: {
        name: 'Amazon',
        slug: 'amazon-ca',
        displayName: 'Amazon.ca',
        region: Region.CA,
        type: RetailerType.ONLINE,
        websiteUrl: 'https://www.amazon.ca',
        apiType: PriceSourceType.API,
        logoUrl: 'https://logo.clearbit.com/amazon.com',
        isActive: true,
      },
    }),
    prisma.retailer.upsert({
      where: { slug: 'costco-ca' },
      update: {},
      create: {
        name: 'Costco',
        slug: 'costco-ca',
        displayName: 'Costco Canada',
        region: Region.CA,
        type: RetailerType.BOTH,
        websiteUrl: 'https://www.costco.ca',
        apiType: PriceSourceType.SCRAPER,
        logoUrl: 'https://logo.clearbit.com/costco.com',
        isActive: true,
      },
    }),
    prisma.retailer.upsert({
      where: { slug: 'shoppers-ca' },
      update: {},
      create: {
        name: 'Shoppers Drug Mart',
        slug: 'shoppers-ca',
        displayName: 'Shoppers Drug Mart',
        region: Region.CA,
        type: RetailerType.BOTH,
        websiteUrl: 'https://www.shoppersdrugmart.ca',
        apiType: PriceSourceType.SCRAPER,
        logoUrl: 'https://logo.clearbit.com/shoppersdrugmart.ca',
        isActive: true,
      },
    }),
    prisma.retailer.upsert({
      where: { slug: 'loblaws-ca' },
      update: {},
      create: {
        name: 'Loblaws',
        slug: 'loblaws-ca',
        displayName: 'Loblaws',
        region: Region.CA,
        type: RetailerType.BOTH,
        websiteUrl: 'https://www.loblaws.ca',
        apiType: PriceSourceType.SCRAPER,
        logoUrl: 'https://logo.clearbit.com/loblaws.ca',
        isActive: true,
      },
    }),
    prisma.retailer.upsert({
      where: { slug: 'wellca' },
      update: {},
      create: {
        name: 'Well.ca',
        slug: 'wellca',
        displayName: 'Well.ca',
        region: Region.CA,
        type: RetailerType.ONLINE,
        websiteUrl: 'https://www.well.ca',
        apiType: PriceSourceType.API,
        logoUrl: 'https://logo.clearbit.com/well.ca',
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${retailers.length} retailers`);
  const retailerMap = Object.fromEntries(retailers.map(r => [r.slug, r.id]));

  // ============================================
  // BRANDS
  // ============================================
  const brandData = [
    // Baby brands
    { name: 'Pampers', slug: 'pampers', logoUrl: 'https://logo.clearbit.com/pampers.com' },
    { name: 'Huggies', slug: 'huggies', logoUrl: 'https://logo.clearbit.com/huggies.com' },
    { name: 'Luvs', slug: 'luvs', logoUrl: null },
    { name: 'Similac', slug: 'similac', logoUrl: 'https://logo.clearbit.com/similac.com' },
    { name: 'Enfamil', slug: 'enfamil', logoUrl: 'https://logo.clearbit.com/enfamil.com' },
    { name: 'Gerber', slug: 'gerber', logoUrl: 'https://logo.clearbit.com/gerber.com' },
    { name: 'Honest Company', slug: 'honest-company', logoUrl: 'https://logo.clearbit.com/honest.com' },
    { name: 'Seventh Generation', slug: 'seventh-generation', logoUrl: 'https://logo.clearbit.com/seventhgeneration.com' },
    // Beverage brands
    { name: 'Coca-Cola', slug: 'coca-cola', logoUrl: 'https://logo.clearbit.com/coca-cola.com' },
    { name: 'Pepsi', slug: 'pepsi', logoUrl: 'https://logo.clearbit.com/pepsi.com' },
    { name: 'Dr Pepper', slug: 'dr-pepper', logoUrl: 'https://logo.clearbit.com/drpepper.com' },
    { name: 'Sprite', slug: 'sprite', logoUrl: null },
    { name: 'Mountain Dew', slug: 'mountain-dew', logoUrl: null },
    { name: 'Dasani', slug: 'dasani', logoUrl: null },
    { name: 'Aquafina', slug: 'aquafina', logoUrl: null },
    { name: 'Poland Spring', slug: 'poland-spring', logoUrl: null },
    { name: 'Evian', slug: 'evian', logoUrl: 'https://logo.clearbit.com/evian.com' },
    { name: 'Fiji', slug: 'fiji', logoUrl: 'https://logo.clearbit.com/fijiwater.com' },
    { name: 'Tropicana', slug: 'tropicana', logoUrl: 'https://logo.clearbit.com/tropicana.com' },
    { name: 'Minute Maid', slug: 'minute-maid', logoUrl: null },
    { name: 'Gatorade', slug: 'gatorade', logoUrl: 'https://logo.clearbit.com/gatorade.com' },
    { name: 'Powerade', slug: 'powerade', logoUrl: null },
    // Household brands
    { name: 'Kirkland Signature', slug: 'kirkland-signature', logoUrl: null },
    { name: 'Tide', slug: 'tide', logoUrl: 'https://logo.clearbit.com/tide.com' },
    { name: 'Gain', slug: 'gain', logoUrl: null },
    { name: 'All', slug: 'all-detergent', logoUrl: null },
    { name: 'Arm & Hammer', slug: 'arm-hammer', logoUrl: 'https://logo.clearbit.com/armandhammer.com' },
    { name: 'Clorox', slug: 'clorox', logoUrl: 'https://logo.clearbit.com/clorox.com' },
    { name: 'Lysol', slug: 'lysol', logoUrl: 'https://logo.clearbit.com/lysol.com' },
    { name: 'Mr. Clean', slug: 'mr-clean', logoUrl: null },
    { name: 'Windex', slug: 'windex', logoUrl: null },
    { name: 'Bounty', slug: 'bounty', logoUrl: null },
    { name: 'Scott', slug: 'scott', logoUrl: null },
    { name: 'Charmin', slug: 'charmin', logoUrl: 'https://logo.clearbit.com/charmin.com' },
    { name: 'Cottonelle', slug: 'cottonelle', logoUrl: null },
    // Personal Care brands
    { name: 'Head & Shoulders', slug: 'head-shoulders', logoUrl: null },
    { name: 'Pantene', slug: 'pantene', logoUrl: 'https://logo.clearbit.com/pantene.com' },
    { name: 'Dove', slug: 'dove', logoUrl: 'https://logo.clearbit.com/dove.com' },
    { name: 'Old Spice', slug: 'old-spice', logoUrl: 'https://logo.clearbit.com/oldspice.com' },
    { name: 'Secret', slug: 'secret', logoUrl: null },
    { name: 'Degree', slug: 'degree', logoUrl: null },
    { name: 'Crest', slug: 'crest', logoUrl: 'https://logo.clearbit.com/crest.com' },
    { name: 'Colgate', slug: 'colgate', logoUrl: 'https://logo.clearbit.com/colgate.com' },
    { name: 'Oral-B', slug: 'oral-b', logoUrl: 'https://logo.clearbit.com/oralb.com' },
    { name: 'Sensodyne', slug: 'sensodyne', logoUrl: 'https://logo.clearbit.com/sensodyne.com' },
    { name: 'Nivea', slug: 'nivea', logoUrl: 'https://logo.clearbit.com/nivea.com' },
    { name: 'Aveeno', slug: 'aveeno', logoUrl: 'https://logo.clearbit.com/aveeno.com' },
    { name: 'Cetaphil', slug: 'cetaphil', logoUrl: 'https://logo.clearbit.com/cetaphil.com' },
    // Pet brands
    { name: 'Purina', slug: 'purina', logoUrl: 'https://logo.clearbit.com/purina.com' },
    { name: 'Blue Buffalo', slug: 'blue-buffalo', logoUrl: 'https://logo.clearbit.com/bluebuffalo.com' },
    { name: 'Pedigree', slug: 'pedigree', logoUrl: 'https://logo.clearbit.com/pedigree.com' },
    { name: 'Iams', slug: 'iams', logoUrl: 'https://logo.clearbit.com/iams.com' },
    { name: 'Friskies', slug: 'friskies', logoUrl: null },
    { name: 'Fancy Feast', slug: 'fancy-feast', logoUrl: null },
    { name: 'Meow Mix', slug: 'meow-mix', logoUrl: null },
    { name: 'Greenies', slug: 'greenies', logoUrl: 'https://logo.clearbit.com/greenies.com' },
    { name: 'Milk-Bone', slug: 'milk-bone', logoUrl: null },
  ];

  const brands = await Promise.all(
    brandData.map(b =>
      prisma.brand.upsert({
        where: { slug: b.slug },
        update: {},
        create: b,
      })
    )
  );

  console.log(`Created ${brands.length} brands`);
  const brandMap = Object.fromEntries(brands.map(b => [b.slug, b.id]));

  // ============================================
  // PRODUCTS BY CATEGORY
  // ============================================

  // BABY DIAPERS (12 products)
  const diapersProducts = [
    { name: 'Pampers Swaddlers Diapers Size 1', slug: 'pampers-swaddlers-size-1-198ct', brand: 'pampers', upc: '037000862017', size: 198, sizeUnit: 'count', basePrice: 49.99 },
    { name: 'Pampers Swaddlers Diapers Size 2', slug: 'pampers-swaddlers-size-2-186ct', brand: 'pampers', upc: '037000862024', size: 186, sizeUnit: 'count', basePrice: 49.99 },
    { name: 'Pampers Swaddlers Diapers Size 3', slug: 'pampers-swaddlers-size-3-168ct', brand: 'pampers', upc: '037000862031', size: 168, sizeUnit: 'count', basePrice: 49.99 },
    { name: 'Pampers Cruisers Diapers Size 4', slug: 'pampers-cruisers-size-4-160ct', brand: 'pampers', upc: '037000862048', size: 160, sizeUnit: 'count', basePrice: 52.99 },
    { name: 'Huggies Little Snugglers Size 1', slug: 'huggies-little-snugglers-size-1-198ct', brand: 'huggies', upc: '036000464238', size: 198, sizeUnit: 'count', basePrice: 51.99 },
    { name: 'Huggies Little Snugglers Size 2', slug: 'huggies-little-snugglers-size-2-186ct', brand: 'huggies', upc: '036000464245', size: 186, sizeUnit: 'count', basePrice: 51.99 },
    { name: 'Huggies Little Movers Size 3', slug: 'huggies-little-movers-size-3-162ct', brand: 'huggies', upc: '036000464252', size: 162, sizeUnit: 'count', basePrice: 54.99 },
    { name: 'Huggies Little Movers Size 4', slug: 'huggies-little-movers-size-4-152ct', brand: 'huggies', upc: '036000464269', size: 152, sizeUnit: 'count', basePrice: 54.99 },
    { name: 'Luvs Ultra Leakguards Size 1', slug: 'luvs-ultra-leakguards-size-1-252ct', brand: 'luvs', upc: '037000866626', size: 252, sizeUnit: 'count', basePrice: 34.99 },
    { name: 'Luvs Ultra Leakguards Size 2', slug: 'luvs-ultra-leakguards-size-2-228ct', brand: 'luvs', upc: '037000866633', size: 228, sizeUnit: 'count', basePrice: 34.99 },
    { name: 'Honest Company Diapers Size 1', slug: 'honest-diapers-size-1-160ct', brand: 'honest-company', upc: '817810024523', size: 160, sizeUnit: 'count', basePrice: 59.99 },
    { name: 'Seventh Generation Diapers Size 2', slug: 'seventh-gen-diapers-size-2-144ct', brand: 'seventh-generation', upc: '732913440016', size: 144, sizeUnit: 'count', basePrice: 54.99 },
  ];

  // BABY FORMULA (10 products)
  const formulaProducts = [
    { name: 'Baby Formula - Similac Pro-Advance 36oz', slug: 'similac-pro-advance-36oz', brand: 'similac', upc: '070074681092', size: 36, sizeUnit: 'oz', basePrice: 39.99 },
    { name: 'Baby Formula - Similac Pro-Sensitive 34oz', slug: 'similac-pro-sensitive-34oz', brand: 'similac', upc: '070074681108', size: 34, sizeUnit: 'oz', basePrice: 42.99 },
    { name: 'Similac 360 Total Care 30.8oz', slug: 'similac-360-total-care-30.8oz', brand: 'similac', upc: '070074681115', size: 30.8, sizeUnit: 'oz', basePrice: 44.99 },
    { name: 'Baby Formula - Enfamil NeuroPro 20.7oz', slug: 'enfamil-neuropro-20.7oz', brand: 'enfamil', upc: '300875121023', size: 20.7, sizeUnit: 'oz', basePrice: 37.99 },
    { name: 'Baby Formula - Enfamil NeuroPro Gentlease 27.4oz', slug: 'enfamil-neuropro-gentlease-27.4oz', brand: 'enfamil', upc: '300875121030', size: 27.4, sizeUnit: 'oz', basePrice: 41.99 },
    { name: 'Enfamil A.R. Infant Formula 27.4oz', slug: 'enfamil-ar-27.4oz', brand: 'enfamil', upc: '300875121047', size: 27.4, sizeUnit: 'oz', basePrice: 43.99 },
    { name: 'Baby Formula - Gerber Good Start GentlePro 32oz', slug: 'gerber-good-start-gentlepro-32oz', brand: 'gerber', upc: '050000584512', size: 32, sizeUnit: 'oz', basePrice: 34.99 },
    { name: 'Gerber Good Start SoothePro 30.6oz', slug: 'gerber-good-start-soothepro-30.6oz', brand: 'gerber', upc: '050000584529', size: 30.6, sizeUnit: 'oz', basePrice: 36.99 },
    { name: 'Kirkland Signature Infant Formula 34oz', slug: 'kirkland-infant-formula-34oz', brand: 'kirkland-signature', upc: '096619123456', size: 34, sizeUnit: 'oz', basePrice: 24.99 },
    { name: 'Baby Formula - Similac Organic 23.2oz', slug: 'similac-organic-23.2oz', brand: 'similac', upc: '070074681122', size: 23.2, sizeUnit: 'oz', basePrice: 38.99 },
  ];

  // BABY WIPES (10 products)
  const wipesProducts = [
    { name: 'Pampers Sensitive Baby Wipes 1008 Count', slug: 'pampers-sensitive-wipes-1008ct', brand: 'pampers', upc: '037000863018', size: 1008, sizeUnit: 'wipes', basePrice: 29.99 },
    { name: 'Pampers Sensitive Baby Wipes 672 Count', slug: 'pampers-sensitive-wipes-672ct', brand: 'pampers', upc: '037000863025', size: 672, sizeUnit: 'wipes', basePrice: 22.99 },
    { name: 'Huggies Natural Care Wipes 1040 Count', slug: 'huggies-natural-care-1040ct', brand: 'huggies', upc: '036000465018', size: 1040, sizeUnit: 'wipes', basePrice: 27.99 },
    { name: 'Huggies Natural Care Wipes 560 Count', slug: 'huggies-natural-care-560ct', brand: 'huggies', upc: '036000465025', size: 560, sizeUnit: 'wipes', basePrice: 18.99 },
    { name: 'Huggies Simply Clean Wipes 768 Count', slug: 'huggies-simply-clean-768ct', brand: 'huggies', upc: '036000465032', size: 768, sizeUnit: 'wipes', basePrice: 16.99 },
    { name: 'Pampers Complete Clean Wipes 720 Count', slug: 'pampers-complete-clean-720ct', brand: 'pampers', upc: '037000863032', size: 720, sizeUnit: 'wipes', basePrice: 19.99 },
    { name: 'Honest Company Baby Wipes 576 Count', slug: 'honest-wipes-576ct', brand: 'honest-company', upc: '817810025018', size: 576, sizeUnit: 'wipes', basePrice: 24.99 },
    { name: 'Seventh Generation Baby Wipes 504 Count', slug: 'seventh-gen-wipes-504ct', brand: 'seventh-generation', upc: '732913441018', size: 504, sizeUnit: 'wipes', basePrice: 22.99 },
    { name: 'Kirkland Signature Baby Wipes 900 Count', slug: 'kirkland-baby-wipes-900ct', brand: 'kirkland-signature', upc: '096619124018', size: 900, sizeUnit: 'wipes', basePrice: 19.99 },
    { name: 'WaterWipes Sensitive Baby Wipes 720 Count', slug: 'waterwipes-720ct', brand: 'honest-company', upc: '850000125018', size: 720, sizeUnit: 'wipes', basePrice: 34.99 },
  ];

  // BABY FOOD (10 products)
  const babyFoodProducts = [
    { name: 'Gerber Stage 1 Variety Pack 20 Pack', slug: 'gerber-stage1-variety-20pk', brand: 'gerber', upc: '050000585018', size: 20, sizeUnit: 'jars', basePrice: 18.99 },
    { name: 'Gerber Stage 2 Fruit Variety 18 Pack', slug: 'gerber-stage2-fruit-18pk', brand: 'gerber', upc: '050000585025', size: 18, sizeUnit: 'jars', basePrice: 17.99 },
    { name: 'Gerber Stage 2 Veggie Variety 18 Pack', slug: 'gerber-stage2-veggie-18pk', brand: 'gerber', upc: '050000585032', size: 18, sizeUnit: 'jars', basePrice: 17.99 },
    { name: 'Gerber Organic Baby Food Pouches 12 Pack', slug: 'gerber-organic-pouches-12pk', brand: 'gerber', upc: '050000585049', size: 12, sizeUnit: 'pouches', basePrice: 16.99 },
    { name: 'Gerber Puffs Cereal Snack Variety 8 Pack', slug: 'gerber-puffs-variety-8pk', brand: 'gerber', upc: '050000585056', size: 8, sizeUnit: 'containers', basePrice: 19.99 },
    { name: 'Gerber Lil Crunchies 8 Pack', slug: 'gerber-lil-crunchies-8pk', brand: 'gerber', upc: '050000585063', size: 8, sizeUnit: 'containers', basePrice: 18.99 },
    { name: 'Gerber Single Grain Oatmeal Cereal 16oz', slug: 'gerber-oatmeal-cereal-16oz', brand: 'gerber', upc: '050000585070', size: 16, sizeUnit: 'oz', basePrice: 6.99 },
    { name: 'Gerber Rice Cereal 16oz', slug: 'gerber-rice-cereal-16oz', brand: 'gerber', upc: '050000585087', size: 16, sizeUnit: 'oz', basePrice: 6.49 },
    { name: 'Honest Company Organic Baby Food 16 Pack', slug: 'honest-organic-baby-food-16pk', brand: 'honest-company', upc: '817810026018', size: 16, sizeUnit: 'pouches', basePrice: 24.99 },
    { name: 'Kirkland Signature Organic Baby Food 24 Pack', slug: 'kirkland-organic-baby-food-24pk', brand: 'kirkland-signature', upc: '096619125018', size: 24, sizeUnit: 'pouches', basePrice: 21.99 },
  ];

  // BEVERAGES - SODA (12 products)
  const sodaProducts = [
    { name: 'Coca-Cola Classic 12oz 24 Pack', slug: 'coca-cola-classic-12oz-24pk', brand: 'coca-cola', upc: '049000028904', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 13.99 },
    { name: 'Coca-Cola Classic 12oz 36 Pack', slug: 'coca-cola-classic-12oz-36pk', brand: 'coca-cola', upc: '049000028911', size: 12, sizeUnit: 'fl oz', packSize: 36, basePrice: 18.99 },
    { name: 'Diet Coke 12oz 24 Pack', slug: 'diet-coke-12oz-24pk', brand: 'coca-cola', upc: '049000028928', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 13.99 },
    { name: 'Coca-Cola Zero Sugar 12oz 24 Pack', slug: 'coke-zero-12oz-24pk', brand: 'coca-cola', upc: '049000028935', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 13.99 },
    { name: 'Pepsi Cola 12oz 24 Pack', slug: 'pepsi-12oz-24pk', brand: 'pepsi', upc: '012000016516', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 13.99 },
    { name: 'Diet Pepsi 12oz 24 Pack', slug: 'diet-pepsi-12oz-24pk', brand: 'pepsi', upc: '012000016523', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 13.99 },
    { name: 'Pepsi Zero Sugar 12oz 24 Pack', slug: 'pepsi-zero-12oz-24pk', brand: 'pepsi', upc: '012000016530', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 13.99 },
    { name: 'Dr Pepper 12oz 24 Pack', slug: 'dr-pepper-12oz-24pk', brand: 'dr-pepper', upc: '078000016516', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 13.99 },
    { name: 'Sprite 12oz 24 Pack', slug: 'sprite-12oz-24pk', brand: 'sprite', upc: '049000028942', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 13.99 },
    { name: 'Mountain Dew 12oz 24 Pack', slug: 'mountain-dew-12oz-24pk', brand: 'mountain-dew', upc: '012000016547', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 13.99 },
    { name: 'Coca-Cola 2 Liter 6 Pack', slug: 'coca-cola-2l-6pk', brand: 'coca-cola', upc: '049000028959', size: 2, sizeUnit: 'L', packSize: 6, basePrice: 12.99 },
    { name: 'Pepsi 2 Liter 6 Pack', slug: 'pepsi-2l-6pk', brand: 'pepsi', upc: '012000016554', size: 2, sizeUnit: 'L', packSize: 6, basePrice: 12.99 },
  ];

  // BEVERAGES - WATER (12 products)
  const waterProducts = [
    { name: 'Dasani Purified Water 16.9oz 24 Pack', slug: 'dasani-water-16.9oz-24pk', brand: 'dasani', upc: '049000031652', size: 16.9, sizeUnit: 'fl oz', packSize: 24, basePrice: 5.99 },
    { name: 'Dasani Purified Water 16.9oz 40 Pack', slug: 'dasani-water-16.9oz-40pk', brand: 'dasani', upc: '049000031669', size: 16.9, sizeUnit: 'fl oz', packSize: 40, basePrice: 8.99 },
    { name: 'Aquafina Purified Water 16.9oz 24 Pack', slug: 'aquafina-water-16.9oz-24pk', brand: 'aquafina', upc: '012000041235', size: 16.9, sizeUnit: 'fl oz', packSize: 24, basePrice: 5.99 },
    { name: 'Aquafina Purified Water 16.9oz 40 Pack', slug: 'aquafina-water-16.9oz-40pk', brand: 'aquafina', upc: '012000041242', size: 16.9, sizeUnit: 'fl oz', packSize: 40, basePrice: 8.99 },
    { name: 'Poland Spring Water 16.9oz 24 Pack', slug: 'poland-spring-16.9oz-24pk', brand: 'poland-spring', upc: '075720004478', size: 16.9, sizeUnit: 'fl oz', packSize: 24, basePrice: 6.49 },
    { name: 'Poland Spring Water 16.9oz 40 Pack', slug: 'poland-spring-16.9oz-40pk', brand: 'poland-spring', upc: '075720004485', size: 16.9, sizeUnit: 'fl oz', packSize: 40, basePrice: 9.99 },
    { name: 'Evian Natural Spring Water 1L 6 Pack', slug: 'evian-1l-6pk', brand: 'evian', upc: '061314000012', size: 1, sizeUnit: 'L', packSize: 6, basePrice: 11.99 },
    { name: 'Fiji Natural Artesian Water 16.9oz 24 Pack', slug: 'fiji-16.9oz-24pk', brand: 'fiji', upc: '632565000012', size: 16.9, sizeUnit: 'fl oz', packSize: 24, basePrice: 29.99 },
    { name: 'Kirkland Signature Water 16.9oz 40 Pack', slug: 'kirkland-water-16.9oz-40pk', brand: 'kirkland-signature', upc: '096619756803', size: 16.9, sizeUnit: 'fl oz', packSize: 40, basePrice: 4.49 },
    { name: 'Kirkland Signature Water 8oz 80 Pack', slug: 'kirkland-water-8oz-80pk', brand: 'kirkland-signature', upc: '096619756810', size: 8, sizeUnit: 'fl oz', packSize: 80, basePrice: 6.99 },
    { name: 'Dasani Sparkling Water Variety 12oz 24 Pack', slug: 'dasani-sparkling-12oz-24pk', brand: 'dasani', upc: '049000031676', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 12.99 },
    { name: 'Smart Water 1L 6 Pack', slug: 'smart-water-1l-6pk', brand: 'dasani', upc: '786162000019', size: 1, sizeUnit: 'L', packSize: 6, basePrice: 10.99 },
  ];

  // BEVERAGES - JUICE (10 products)
  const juiceProducts = [
    { name: 'Tropicana Pure Premium Orange Juice 89oz', slug: 'tropicana-oj-89oz', brand: 'tropicana', upc: '048500012345', size: 89, sizeUnit: 'fl oz', packSize: 1, basePrice: 6.99 },
    { name: 'Tropicana Pure Premium No Pulp 52oz', slug: 'tropicana-no-pulp-52oz', brand: 'tropicana', upc: '048500012352', size: 52, sizeUnit: 'fl oz', packSize: 1, basePrice: 4.49 },
    { name: 'Tropicana Apple Juice 10oz 24 Pack', slug: 'tropicana-apple-10oz-24pk', brand: 'tropicana', upc: '048500012369', size: 10, sizeUnit: 'fl oz', packSize: 24, basePrice: 14.99 },
    { name: 'Minute Maid Orange Juice 59oz', slug: 'minute-maid-oj-59oz', brand: 'minute-maid', upc: '025000012345', size: 59, sizeUnit: 'fl oz', packSize: 1, basePrice: 4.29 },
    { name: 'Minute Maid Apple Juice 64oz', slug: 'minute-maid-apple-64oz', brand: 'minute-maid', upc: '025000012352', size: 64, sizeUnit: 'fl oz', packSize: 1, basePrice: 3.99 },
    { name: 'Minute Maid Lemonade 59oz', slug: 'minute-maid-lemonade-59oz', brand: 'minute-maid', upc: '025000012369', size: 59, sizeUnit: 'fl oz', packSize: 1, basePrice: 3.49 },
    { name: 'Simply Orange Juice Pulp Free 52oz', slug: 'simply-orange-52oz', brand: 'minute-maid', upc: '025000012376', size: 52, sizeUnit: 'fl oz', packSize: 1, basePrice: 5.99 },
    { name: 'Kirkland Organic Orange Juice 2x59oz', slug: 'kirkland-oj-2x59oz', brand: 'kirkland-signature', upc: '096619234567', size: 59, sizeUnit: 'fl oz', packSize: 2, basePrice: 9.99 },
    { name: 'Tropicana Grape Juice 10oz 24 Pack', slug: 'tropicana-grape-10oz-24pk', brand: 'tropicana', upc: '048500012383', size: 10, sizeUnit: 'fl oz', packSize: 24, basePrice: 14.99 },
    { name: 'Ocean Spray Cranberry Juice 101oz', slug: 'ocean-spray-cranberry-101oz', brand: 'minute-maid', upc: '031200012345', size: 101, sizeUnit: 'fl oz', packSize: 1, basePrice: 6.49 },
  ];

  // BEVERAGES - SPORTS DRINKS (10 products)
  const sportsProducts = [
    { name: 'Gatorade Thirst Quencher Variety 12oz 28 Pack', slug: 'gatorade-variety-12oz-28pk', brand: 'gatorade', upc: '052000012345', size: 12, sizeUnit: 'fl oz', packSize: 28, basePrice: 19.99 },
    { name: 'Gatorade Lemon Lime 20oz 12 Pack', slug: 'gatorade-lemon-lime-20oz-12pk', brand: 'gatorade', upc: '052000012352', size: 20, sizeUnit: 'fl oz', packSize: 12, basePrice: 14.99 },
    { name: 'Gatorade Cool Blue 20oz 12 Pack', slug: 'gatorade-cool-blue-20oz-12pk', brand: 'gatorade', upc: '052000012369', size: 20, sizeUnit: 'fl oz', packSize: 12, basePrice: 14.99 },
    { name: 'Gatorade Fruit Punch 20oz 12 Pack', slug: 'gatorade-fruit-punch-20oz-12pk', brand: 'gatorade', upc: '052000012376', size: 20, sizeUnit: 'fl oz', packSize: 12, basePrice: 14.99 },
    { name: 'Gatorade Zero Variety 12oz 24 Pack', slug: 'gatorade-zero-12oz-24pk', brand: 'gatorade', upc: '052000012383', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 17.99 },
    { name: 'Powerade Mountain Berry Blast 20oz 12 Pack', slug: 'powerade-berry-20oz-12pk', brand: 'powerade', upc: '049000012345', size: 20, sizeUnit: 'fl oz', packSize: 12, basePrice: 12.99 },
    { name: 'Powerade Mixed Berry 20oz 12 Pack', slug: 'powerade-mixed-berry-20oz-12pk', brand: 'powerade', upc: '049000012352', size: 20, sizeUnit: 'fl oz', packSize: 12, basePrice: 12.99 },
    { name: 'Powerade Fruit Punch 20oz 12 Pack', slug: 'powerade-fruit-punch-20oz-12pk', brand: 'powerade', upc: '049000012369', size: 20, sizeUnit: 'fl oz', packSize: 12, basePrice: 12.99 },
    { name: 'Gatorade G2 Variety 12oz 24 Pack', slug: 'gatorade-g2-12oz-24pk', brand: 'gatorade', upc: '052000012390', size: 12, sizeUnit: 'fl oz', packSize: 24, basePrice: 16.99 },
    { name: 'Powerade Zero Variety 20oz 12 Pack', slug: 'powerade-zero-20oz-12pk', brand: 'powerade', upc: '049000012376', size: 20, sizeUnit: 'fl oz', packSize: 12, basePrice: 13.99 },
  ];

  // HOUSEHOLD - CLEANING (12 products)
  const cleaningProducts = [
    { name: 'Clorox Disinfecting Wipes 3 Pack', slug: 'clorox-wipes-3pk', brand: 'clorox', upc: '044600012345', size: 225, sizeUnit: 'wipes', packSize: 3, basePrice: 14.99 },
    { name: 'Clorox Clean-Up Cleaner Spray 32oz 2 Pack', slug: 'clorox-cleanup-32oz-2pk', brand: 'clorox', upc: '044600012352', size: 32, sizeUnit: 'fl oz', packSize: 2, basePrice: 9.99 },
    { name: 'Clorox Bleach 121oz', slug: 'clorox-bleach-121oz', brand: 'clorox', upc: '044600012369', size: 121, sizeUnit: 'fl oz', packSize: 1, basePrice: 8.49 },
    { name: 'Lysol Disinfecting Wipes 4 Pack', slug: 'lysol-wipes-4pk', brand: 'lysol', upc: '019200012345', size: 320, sizeUnit: 'wipes', packSize: 4, basePrice: 16.99 },
    { name: 'Lysol Disinfectant Spray 19oz 2 Pack', slug: 'lysol-spray-19oz-2pk', brand: 'lysol', upc: '019200012352', size: 19, sizeUnit: 'fl oz', packSize: 2, basePrice: 12.99 },
    { name: 'Lysol All Purpose Cleaner 144oz', slug: 'lysol-all-purpose-144oz', brand: 'lysol', upc: '019200012369', size: 144, sizeUnit: 'fl oz', packSize: 1, basePrice: 10.99 },
    { name: 'Mr. Clean Multi-Surface Cleaner 128oz', slug: 'mr-clean-128oz', brand: 'mr-clean', upc: '037000012345', size: 128, sizeUnit: 'fl oz', packSize: 1, basePrice: 8.99 },
    { name: 'Mr. Clean Magic Eraser 8 Pack', slug: 'mr-clean-magic-eraser-8pk', brand: 'mr-clean', upc: '037000012352', size: 8, sizeUnit: 'count', packSize: 1, basePrice: 9.99 },
    { name: 'Windex Original Glass Cleaner 23oz 2 Pack', slug: 'windex-23oz-2pk', brand: 'windex', upc: '019800012345', size: 23, sizeUnit: 'fl oz', packSize: 2, basePrice: 8.49 },
    { name: 'Kirkland Signature Disinfecting Wipes 4 Pack', slug: 'kirkland-wipes-4pk', brand: 'kirkland-signature', upc: '096619345678', size: 304, sizeUnit: 'wipes', packSize: 4, basePrice: 12.99 },
    { name: 'Kirkland Signature All Purpose Cleaner 2 Pack', slug: 'kirkland-all-purpose-2pk', brand: 'kirkland-signature', upc: '096619345685', size: 40, sizeUnit: 'fl oz', packSize: 2, basePrice: 6.99 },
    { name: 'Seventh Generation All Purpose Cleaner 23oz', slug: 'seventh-gen-all-purpose-23oz', brand: 'seventh-generation', upc: '732913012345', size: 23, sizeUnit: 'fl oz', packSize: 1, basePrice: 4.99 },
  ];

  // HOUSEHOLD - PAPER PRODUCTS (12 products)
  const paperProducts = [
    { name: 'Bounty Select-A-Size Paper Towels 12 Rolls', slug: 'bounty-paper-towels-12pk', brand: 'bounty', upc: '037000012359', size: 12, sizeUnit: 'rolls', packSize: 1, basePrice: 24.99 },
    { name: 'Bounty Quick-Size Paper Towels 8 Rolls', slug: 'bounty-quick-size-8pk', brand: 'bounty', upc: '037000012366', size: 8, sizeUnit: 'rolls', packSize: 1, basePrice: 18.99 },
    { name: 'Scott Choose-A-Sheet Paper Towels 15 Rolls', slug: 'scott-paper-towels-15pk', brand: 'scott', upc: '054000012345', size: 15, sizeUnit: 'rolls', packSize: 1, basePrice: 19.99 },
    { name: 'Kirkland Signature Paper Towels 12 Rolls', slug: 'kirkland-paper-towels-12pk', brand: 'kirkland-signature', upc: '096619456789', size: 12, sizeUnit: 'rolls', packSize: 1, basePrice: 19.99 },
    { name: 'Charmin Ultra Soft Toilet Paper 24 Mega Rolls', slug: 'charmin-ultra-soft-24pk', brand: 'charmin', upc: '037000012373', size: 24, sizeUnit: 'mega rolls', packSize: 1, basePrice: 29.99 },
    { name: 'Charmin Ultra Strong Toilet Paper 24 Mega Rolls', slug: 'charmin-ultra-strong-24pk', brand: 'charmin', upc: '037000012380', size: 24, sizeUnit: 'mega rolls', packSize: 1, basePrice: 29.99 },
    { name: 'Cottonelle Ultra CleanCare 24 Mega Rolls', slug: 'cottonelle-ultra-24pk', brand: 'cottonelle', upc: '036000012345', size: 24, sizeUnit: 'mega rolls', packSize: 1, basePrice: 27.99 },
    { name: 'Scott 1000 Toilet Paper 30 Rolls', slug: 'scott-1000-30pk', brand: 'scott', upc: '054000012352', size: 30, sizeUnit: 'rolls', packSize: 1, basePrice: 26.99 },
    { name: 'Kirkland Signature Bath Tissue 30 Rolls', slug: 'kirkland-bath-tissue-30pk', brand: 'kirkland-signature', upc: '096619456796', size: 30, sizeUnit: 'rolls', packSize: 1, basePrice: 22.99 },
    { name: 'Bounty Paper Napkins 200 Count 4 Pack', slug: 'bounty-napkins-200ct-4pk', brand: 'bounty', upc: '037000012397', size: 200, sizeUnit: 'count', packSize: 4, basePrice: 12.99 },
    { name: 'Vanity Fair Napkins 660 Count', slug: 'vanity-fair-napkins-660ct', brand: 'bounty', upc: '037000012404', size: 660, sizeUnit: 'count', packSize: 1, basePrice: 14.99 },
    { name: 'Kirkland Signature Napkins 500 Count 2 Pack', slug: 'kirkland-napkins-500ct-2pk', brand: 'kirkland-signature', upc: '096619456803', size: 500, sizeUnit: 'count', packSize: 2, basePrice: 9.99 },
  ];

  // HOUSEHOLD - LAUNDRY (10 products)
  const laundryProducts = [
    { name: 'Tide Original Liquid Detergent 154oz', slug: 'tide-original-154oz', brand: 'tide', upc: '037000012411', size: 154, sizeUnit: 'fl oz', packSize: 1, basePrice: 24.99 },
    { name: 'Tide PODS Laundry Detergent 81 Count', slug: 'tide-pods-81ct', brand: 'tide', upc: '037000012428', size: 81, sizeUnit: 'count', packSize: 1, basePrice: 27.99 },
    { name: 'Tide Free & Gentle 154oz', slug: 'tide-free-gentle-154oz', brand: 'tide', upc: '037000012435', size: 154, sizeUnit: 'fl oz', packSize: 1, basePrice: 26.99 },
    { name: 'Gain Original Liquid Detergent 154oz', slug: 'gain-original-154oz', brand: 'gain', upc: '037000012442', size: 154, sizeUnit: 'fl oz', packSize: 1, basePrice: 19.99 },
    { name: 'Gain Flings Laundry Detergent 96 Count', slug: 'gain-flings-96ct', brand: 'gain', upc: '037000012459', size: 96, sizeUnit: 'count', packSize: 1, basePrice: 24.99 },
    { name: 'All Free Clear Liquid Detergent 184oz', slug: 'all-free-clear-184oz', brand: 'all-detergent', upc: '072613012345', size: 184, sizeUnit: 'fl oz', packSize: 1, basePrice: 18.99 },
    { name: 'Arm & Hammer Clean Burst 170oz', slug: 'arm-hammer-clean-burst-170oz', brand: 'arm-hammer', upc: '033200012345', size: 170, sizeUnit: 'fl oz', packSize: 1, basePrice: 14.99 },
    { name: 'Kirkland Signature Ultra Clean 194oz', slug: 'kirkland-ultra-clean-194oz', brand: 'kirkland-signature', upc: '096619567890', size: 194, sizeUnit: 'fl oz', packSize: 1, basePrice: 17.99 },
    { name: 'Kirkland Signature PODS 152 Count', slug: 'kirkland-pods-152ct', brand: 'kirkland-signature', upc: '096619567907', size: 152, sizeUnit: 'count', packSize: 1, basePrice: 22.99 },
    { name: 'Seventh Generation Free & Clear 150oz', slug: 'seventh-gen-laundry-150oz', brand: 'seventh-generation', upc: '732913012352', size: 150, sizeUnit: 'fl oz', packSize: 1, basePrice: 19.99 },
  ];

  // PERSONAL CARE (12 products)
  const personalCareProducts = [
    { name: 'Head & Shoulders Classic Clean Shampoo 32oz', slug: 'head-shoulders-classic-32oz', brand: 'head-shoulders', upc: '037000012500', size: 32, sizeUnit: 'fl oz', packSize: 1, basePrice: 12.99 },
    { name: 'Pantene Pro-V Daily Moisture Shampoo 25oz', slug: 'pantene-daily-moisture-25oz', brand: 'pantene', upc: '080878012501', size: 25, sizeUnit: 'fl oz', packSize: 1, basePrice: 10.99 },
    { name: 'Dove Daily Moisture Shampoo 25oz 2 Pack', slug: 'dove-daily-moisture-25oz-2pk', brand: 'dove', upc: '079400012501', size: 25, sizeUnit: 'fl oz', packSize: 2, basePrice: 16.99 },
    { name: 'Dove Body Wash 24oz 3 Pack', slug: 'dove-body-wash-24oz-3pk', brand: 'dove', upc: '079400012518', size: 24, sizeUnit: 'fl oz', packSize: 3, basePrice: 21.99 },
    { name: 'Old Spice Swagger Body Wash 30oz 2 Pack', slug: 'old-spice-swagger-30oz-2pk', brand: 'old-spice', upc: '037000012525', size: 30, sizeUnit: 'fl oz', packSize: 2, basePrice: 17.99 },
    { name: 'Old Spice Pure Sport Deodorant 3 Pack', slug: 'old-spice-pure-sport-deo-3pk', brand: 'old-spice', upc: '037000012532', size: 3, sizeUnit: 'oz', packSize: 3, basePrice: 14.99 },
    { name: 'Secret Clinical Strength Deodorant 2 Pack', slug: 'secret-clinical-deo-2pk', brand: 'secret', upc: '037000012549', size: 2.6, sizeUnit: 'oz', packSize: 2, basePrice: 16.99 },
    { name: 'Degree Men Cool Rush Deodorant 4 Pack', slug: 'degree-cool-rush-deo-4pk', brand: 'degree', upc: '079400012556', size: 2.7, sizeUnit: 'oz', packSize: 4, basePrice: 15.99 },
    { name: 'Crest 3D White Toothpaste 5.4oz 4 Pack', slug: 'crest-3d-white-5.4oz-4pk', brand: 'crest', upc: '037000012563', size: 5.4, sizeUnit: 'oz', packSize: 4, basePrice: 18.99 },
    { name: 'Colgate Total Toothpaste 5.1oz 4 Pack', slug: 'colgate-total-5.1oz-4pk', brand: 'colgate', upc: '035000012501', size: 5.1, sizeUnit: 'oz', packSize: 4, basePrice: 17.99 },
    { name: 'Sensodyne Pronamel Toothpaste 4oz 3 Pack', slug: 'sensodyne-pronamel-4oz-3pk', brand: 'sensodyne', upc: '083100012501', size: 4, sizeUnit: 'oz', packSize: 3, basePrice: 21.99 },
    { name: 'Oral-B Pro 1000 Electric Toothbrush', slug: 'oral-b-pro-1000', brand: 'oral-b', upc: '069055012501', size: 1, sizeUnit: 'unit', packSize: 1, basePrice: 49.99 },
    { name: 'Cetaphil Gentle Skin Cleanser 20oz 2 Pack', slug: 'cetaphil-cleanser-20oz-2pk', brand: 'cetaphil', upc: '302990012501', size: 20, sizeUnit: 'fl oz', packSize: 2, basePrice: 22.99 },
    { name: 'Aveeno Daily Moisturizing Lotion 18oz 2 Pack', slug: 'aveeno-lotion-18oz-2pk', brand: 'aveeno', upc: '381370012501', size: 18, sizeUnit: 'fl oz', packSize: 2, basePrice: 19.99 },
    { name: 'Nivea Body Lotion 16.9oz 3 Pack', slug: 'nivea-body-lotion-16.9oz-3pk', brand: 'nivea', upc: '072140012501', size: 16.9, sizeUnit: 'fl oz', packSize: 3, basePrice: 17.99 },
  ];

  // PET FOOD - DOG (10 products)
  const dogFoodProducts = [
    { name: 'Purina ONE SmartBlend Dog Food 40lb', slug: 'purina-one-smartblend-40lb', brand: 'purina', upc: '017800012501', size: 40, sizeUnit: 'lb', packSize: 1, basePrice: 54.99 },
    { name: 'Purina Pro Plan Adult Dog Food 35lb', slug: 'purina-pro-plan-adult-35lb', brand: 'purina', upc: '038100012501', size: 35, sizeUnit: 'lb', packSize: 1, basePrice: 64.99 },
    { name: 'Blue Buffalo Life Protection Adult 30lb', slug: 'blue-buffalo-life-protection-30lb', brand: 'blue-buffalo', upc: '840243012501', size: 30, sizeUnit: 'lb', packSize: 1, basePrice: 62.99 },
    { name: 'Blue Buffalo Wilderness Chicken 24lb', slug: 'blue-buffalo-wilderness-24lb', brand: 'blue-buffalo', upc: '840243012518', size: 24, sizeUnit: 'lb', packSize: 1, basePrice: 59.99 },
    { name: 'Pedigree Adult Dry Dog Food 33lb', slug: 'pedigree-adult-dry-33lb', brand: 'pedigree', upc: '023100012501', size: 33, sizeUnit: 'lb', packSize: 1, basePrice: 32.99 },
    { name: 'Pedigree Complete Nutrition 50lb', slug: 'pedigree-complete-50lb', brand: 'pedigree', upc: '023100012518', size: 50, sizeUnit: 'lb', packSize: 1, basePrice: 42.99 },
    { name: 'Iams ProActive Health Adult 30lb', slug: 'iams-proactive-adult-30lb', brand: 'iams', upc: '019014012501', size: 30, sizeUnit: 'lb', packSize: 1, basePrice: 44.99 },
    { name: 'Kirkland Signature Nature\'s Domain 35lb', slug: 'kirkland-natures-domain-35lb', brand: 'kirkland-signature', upc: '096619678901', size: 35, sizeUnit: 'lb', packSize: 1, basePrice: 38.99 },
    { name: 'Purina Beneful Originals 40lb', slug: 'purina-beneful-originals-40lb', brand: 'purina', upc: '017800012518', size: 40, sizeUnit: 'lb', packSize: 1, basePrice: 36.99 },
    { name: 'Kirkland Signature Super Premium Dog Food 40lb', slug: 'kirkland-premium-dog-food-40lb', brand: 'kirkland-signature', upc: '096619678918', size: 40, sizeUnit: 'lb', packSize: 1, basePrice: 34.99 },
  ];

  // PET FOOD - CAT (10 products)
  const catFoodProducts = [
    { name: 'Purina ONE Healthy Metabolism Cat Food 22lb', slug: 'purina-one-healthy-22lb', brand: 'purina', upc: '017800013501', size: 22, sizeUnit: 'lb', packSize: 1, basePrice: 39.99 },
    { name: 'Purina Cat Chow Complete 25lb', slug: 'purina-cat-chow-25lb', brand: 'purina', upc: '017800013518', size: 25, sizeUnit: 'lb', packSize: 1, basePrice: 29.99 },
    { name: 'Blue Buffalo Indoor Health Adult 15lb', slug: 'blue-buffalo-indoor-15lb', brand: 'blue-buffalo', upc: '840243013501', size: 15, sizeUnit: 'lb', packSize: 1, basePrice: 42.99 },
    { name: 'Blue Buffalo Tastefuls Adult 15lb', slug: 'blue-buffalo-tastefuls-15lb', brand: 'blue-buffalo', upc: '840243013518', size: 15, sizeUnit: 'lb', packSize: 1, basePrice: 38.99 },
    { name: 'Friskies Dry Cat Food Surfin\' & Turfin\' 22lb', slug: 'friskies-surfin-turfin-22lb', brand: 'friskies', upc: '050000013501', size: 22, sizeUnit: 'lb', packSize: 1, basePrice: 24.99 },
    { name: 'Meow Mix Original Choice 22lb', slug: 'meow-mix-original-22lb', brand: 'meow-mix', upc: '829274013501', size: 22, sizeUnit: 'lb', packSize: 1, basePrice: 22.99 },
    { name: 'Iams ProActive Health Indoor Cat 22lb', slug: 'iams-proactive-indoor-22lb', brand: 'iams', upc: '019014013501', size: 22, sizeUnit: 'lb', packSize: 1, basePrice: 34.99 },
    { name: 'Fancy Feast Gourmet Wet Food 48 Pack', slug: 'fancy-feast-gourmet-48pk', brand: 'fancy-feast', upc: '050000013518', size: 48, sizeUnit: 'cans', packSize: 1, basePrice: 42.99 },
    { name: 'Friskies Wet Cat Food Variety 60 Pack', slug: 'friskies-wet-variety-60pk', brand: 'friskies', upc: '050000013525', size: 60, sizeUnit: 'cans', packSize: 1, basePrice: 32.99 },
    { name: 'Kirkland Signature Maintenance Cat Food 25lb', slug: 'kirkland-cat-food-25lb', brand: 'kirkland-signature', upc: '096619679001', size: 25, sizeUnit: 'lb', packSize: 1, basePrice: 24.99 },
  ];

  // PET TREATS (10 products)
  const petTreatsProducts = [
    { name: 'Greenies Original Dental Dog Treats 36oz', slug: 'greenies-dental-36oz', brand: 'greenies', upc: '642863013501', size: 36, sizeUnit: 'oz', packSize: 1, basePrice: 34.99 },
    { name: 'Greenies Original Regular 36 Count', slug: 'greenies-regular-36ct', brand: 'greenies', upc: '642863013518', size: 36, sizeUnit: 'count', packSize: 1, basePrice: 32.99 },
    { name: 'Milk-Bone Original Dog Biscuits 10lb', slug: 'milk-bone-original-10lb', brand: 'milk-bone', upc: '079100013501', size: 10, sizeUnit: 'lb', packSize: 1, basePrice: 16.99 },
    { name: 'Milk-Bone MaroSnacks 40oz', slug: 'milk-bone-marosnacks-40oz', brand: 'milk-bone', upc: '079100013518', size: 40, sizeUnit: 'oz', packSize: 1, basePrice: 11.99 },
    { name: 'Purina Beggin\' Strips Bacon 40oz', slug: 'beggin-strips-bacon-40oz', brand: 'purina', upc: '038100013501', size: 40, sizeUnit: 'oz', packSize: 1, basePrice: 19.99 },
    { name: 'Blue Buffalo Wilderness Trail Treats 24oz', slug: 'blue-wilderness-treats-24oz', brand: 'blue-buffalo', upc: '840243014501', size: 24, sizeUnit: 'oz', packSize: 1, basePrice: 18.99 },
    { name: 'Greenies Feline Dental Treats 21oz', slug: 'greenies-feline-21oz', brand: 'greenies', upc: '642863014501', size: 21, sizeUnit: 'oz', packSize: 1, basePrice: 24.99 },
    { name: 'Temptations Classic Cat Treats Variety 4 Pack', slug: 'temptations-variety-4pk', brand: 'purina', upc: '023100014501', size: 4, sizeUnit: 'bags', packSize: 4, basePrice: 14.99 },
    { name: 'Friskies Party Mix Cat Treats 20oz', slug: 'friskies-party-mix-20oz', brand: 'friskies', upc: '050000014501', size: 20, sizeUnit: 'oz', packSize: 1, basePrice: 9.99 },
    { name: 'Kirkland Signature Dog Biscuits 15lb', slug: 'kirkland-dog-biscuits-15lb', brand: 'kirkland-signature', upc: '096619680001', size: 15, sizeUnit: 'lb', packSize: 1, basePrice: 14.99 },
  ];

  // Create all products
  const allProductsData = [
    ...diapersProducts.map(p => ({ ...p, category: ProductCategory.BABY_DIAPERS, packSize: p.packSize || 1 })),
    ...formulaProducts.map(p => ({ ...p, category: ProductCategory.BABY_FORMULA, packSize: p.packSize || 1 })),
    ...wipesProducts.map(p => ({ ...p, category: ProductCategory.BABY_WIPES, packSize: p.packSize || 1 })),
    ...babyFoodProducts.map(p => ({ ...p, category: ProductCategory.BABY_FOOD, packSize: p.packSize || 1 })),
    ...sodaProducts.map(p => ({ ...p, category: ProductCategory.BEVERAGES_SODA })),
    ...waterProducts.map(p => ({ ...p, category: ProductCategory.BEVERAGES_WATER })),
    ...juiceProducts.map(p => ({ ...p, category: ProductCategory.BEVERAGES_JUICE })),
    ...sportsProducts.map(p => ({ ...p, category: ProductCategory.BEVERAGES_SPORTS })),
    ...cleaningProducts.map(p => ({ ...p, category: ProductCategory.HOUSEHOLD_CLEANING })),
    ...paperProducts.map(p => ({ ...p, category: ProductCategory.HOUSEHOLD_PAPER })),
    ...laundryProducts.map(p => ({ ...p, category: ProductCategory.HOUSEHOLD_LAUNDRY })),
    ...personalCareProducts.map(p => ({ ...p, category: ProductCategory.PERSONAL_CARE })),
    ...dogFoodProducts.map(p => ({ ...p, category: ProductCategory.PET_FOOD })),
    ...catFoodProducts.map(p => ({ ...p, category: ProductCategory.PET_FOOD })),
    ...petTreatsProducts.map(p => ({ ...p, category: ProductCategory.PET_SUPPLIES })),
  ];

  const products: any[] = [];
  for (const p of allProductsData) {
    const imageUrl = productImages[p.slug] || `https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name.substring(0, 20))}`;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: `${p.name} - Quality product from ${p.brand}.`,
        imageUrl,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: `${p.name} - Quality product from ${p.brand}.`,
        upc: p.upc,
        brandId: brandMap[p.brand],
        category: p.category,
        size: p.size,
        sizeUnit: p.sizeUnit,
        packSize: p.packSize || 1,
        regions: [Region.US, Region.CA],
        imageUrl,
      },
    });
    products.push({ ...product, basePrice: p.basePrice });
  }

  console.log(`Created ${products.length} products`);

  // ============================================
  // GENERATE PRICES FOR ALL PRODUCTS
  // ============================================
  const usRetailers = ['walmart-us', 'amazon-us', 'costco-us', 'target-us'];
  const caRetailers = ['walmart-ca', 'amazon-ca', 'costco-ca', 'shoppers-ca', 'loblaws-ca', 'wellca'];

  let priceCount = 0;
  for (const product of products) {
    const basePrice = product.basePrice;
    
    // Generate US prices
    for (const retailerSlug of usRetailers) {
      const retailerId = retailerMap[retailerSlug];
      const isOnSale = Math.random() < 0.2; // 20% chance of sale
      const priceVariation = retailerSlug === 'costco-us' ? 0.9 : // Costco usually cheaper
                            retailerSlug === 'amazon-us' ? 1.05 : // Amazon slightly higher
                            retailerSlug === 'walmart-us' ? 0.95 : // Walmart competitive
                            1.0; // Target base price
      
      const currentPrice = Math.round(basePrice * priceVariation * (0.9 + Math.random() * 0.2) * 100) / 100;
      const originalPrice = isOnSale ? Math.round(currentPrice * 1.15 * 100) / 100 : null;
      const unitPrice = product.size ? currentPrice / (product.size * product.packSize) : null;

      await prisma.price.upsert({
        where: {
          productId_retailerId: { productId: product.id, retailerId },
        },
        update: {
          currentPrice,
          originalPrice,
          currency: 'USD',
          inStock: Math.random() > 0.1, // 90% in stock
          isOnSale,
          unitPrice,
          unitMeasure: product.sizeUnit ? `per ${product.sizeUnit}` : null,
          lastCheckedAt: new Date(),
        },
        create: {
          productId: product.id,
          retailerId,
          currentPrice,
          originalPrice,
          currency: 'USD',
          inStock: Math.random() > 0.1,
          isOnSale,
          unitPrice,
          unitMeasure: product.sizeUnit ? `per ${product.sizeUnit}` : null,
          productUrl: `https://example.com/product/${product.slug}`,
          sourceType: PriceSourceType.MANUAL,
          lastCheckedAt: new Date(),
        },
      });
      priceCount++;
    }

    // Generate CA prices (higher due to exchange rate)
    for (const retailerSlug of caRetailers) {
      const retailerId = retailerMap[retailerSlug];
      const isOnSale = Math.random() < 0.15; // 15% chance of sale
      const cadMultiplier = 1.35; // Approximate CAD/USD rate plus markup
      const priceVariation = retailerSlug === 'costco-ca' ? 0.92 :
                            retailerSlug === 'amazon-ca' ? 1.03 :
                            retailerSlug === 'wellca' ? 1.01 : // Well.ca competitive online pricing
                            retailerSlug === 'loblaws-ca' ? 1.02 : // Loblaws mid-range pricing
                            retailerSlug === 'shoppers-ca' ? 1.1 : // Shoppers typically higher
                            1.0;
      
      const currentPrice = Math.round(basePrice * cadMultiplier * priceVariation * (0.9 + Math.random() * 0.2) * 100) / 100;
      const originalPrice = isOnSale ? Math.round(currentPrice * 1.12 * 100) / 100 : null;
      const unitPrice = product.size ? currentPrice / (product.size * product.packSize) : null;

      await prisma.price.upsert({
        where: {
          productId_retailerId: { productId: product.id, retailerId },
        },
        update: {
          currentPrice,
          originalPrice,
          currency: 'CAD',
          inStock: Math.random() > 0.12,
          isOnSale,
          unitPrice,
          unitMeasure: product.sizeUnit ? `per ${product.sizeUnit}` : null,
          lastCheckedAt: new Date(),
        },
        create: {
          productId: product.id,
          retailerId,
          currentPrice,
          originalPrice,
          currency: 'CAD',
          inStock: Math.random() > 0.12,
          isOnSale,
          unitPrice,
          unitMeasure: product.sizeUnit ? `per ${product.sizeUnit}` : null,
          productUrl: `https://example.com/product/${product.slug}`,
          sourceType: PriceSourceType.MANUAL,
          lastCheckedAt: new Date(),
        },
      });
      priceCount++;
    }
  }

  console.log(`Created ${priceCount} price entries`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n========================================');
  console.log('SEEDING COMPLETED SUCCESSFULLY!');
  console.log('========================================');
  console.log(`Retailers: ${retailers.length}`);
  console.log(`Brands: ${brands.length}`);
  console.log(`Products: ${products.length}`);
  console.log(`  - Baby Diapers: ${diapersProducts.length}`);
  console.log(`  - Baby Formula: ${formulaProducts.length}`);
  console.log(`  - Baby Wipes: ${wipesProducts.length}`);
  console.log(`  - Baby Food: ${babyFoodProducts.length}`);
  console.log(`  - Soda: ${sodaProducts.length}`);
  console.log(`  - Water: ${waterProducts.length}`);
  console.log(`  - Juice: ${juiceProducts.length}`);
  console.log(`  - Sports Drinks: ${sportsProducts.length}`);
  console.log(`  - Cleaning: ${cleaningProducts.length}`);
  console.log(`  - Paper Products: ${paperProducts.length}`);
  console.log(`  - Laundry: ${laundryProducts.length}`);
  console.log(`  - Personal Care: ${personalCareProducts.length}`);
  console.log(`  - Dog Food: ${dogFoodProducts.length}`);
  console.log(`  - Cat Food: ${catFoodProducts.length}`);
  console.log(`  - Pet Treats: ${petTreatsProducts.length}`);
  console.log(`Price entries: ${priceCount}`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
