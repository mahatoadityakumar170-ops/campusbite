import { MealCategory, MenuItem } from '../types/campus';

export const HERO_IMAGE = '/src/assets/images/hero_campus_meals_1795166878279.jpg';

export const MENU_CATEGORIES: MealCategory[] = [
  'All',
  'Thalis & Combos',
  'Bowls & Rolls',
  'Snacks',
  'Beverages',
];

export const DEHRADUN_CAMPUSES = [
  {
    name: 'DBS Global University',
    area: 'Selaqui, Dehradun',
    eta: '15–20 min',
    dropPoints: 'Main Gate · Boys & Girls Hostels · MBA Block',
  },
  {
    name: 'Graphic Era University',
    area: 'Clement Town, Dehradun',
    eta: '18–25 min',
    dropPoints: 'Subhash Nagar PGs · B.Tech Block · Hostel Gate',
  },
  {
    name: 'Doon University',
    area: 'Mothrowala Road, Dehradun',
    eta: '18–22 min',
    dropPoints: 'Kedar Hostel · Library Lawn · Main Gate',
  },
  {
    name: 'DAV (PG) College',
    area: 'Karanpur, Dehradun',
    eta: '15–20 min',
    dropPoints: 'Karanpur PGs · Science Block · Main Gate',
  },
  {
    name: 'Uttarakhand Technical University',
    area: 'Chakrata Road, Dehradun',
    eta: '20–25 min',
    dropPoints: 'Premnagar Hostels · Admin Block · Campus Gate',
  },
];

export const FLAT_DELIVERY_FEE = 12;
export const FREE_DELIVERY_THRESHOLD = 149;

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'meal-paneer-thali',
    name: 'Student Paneer Mini Thali',
    outlet: 'Annapurna Campus Kitchen',
    category: 'Thalis & Combos',
    price: 120,
    prepTime: '20 min',
    dietary: 'Pure Veg',
    portion: 'Kadai paneer, dal tadka, 2 phulkas, jeera rice & raita',
    description: 'Balanced hostel lunch box cooked fresh in mustard-free oil.',
    image: '/src/assets/images/meal_paneer_thali_1795166878775.jpg',
  },
  {
    id: 'meal-rajma-chawal',
    name: 'Dehradun Homestyle Rajma Chawal',
    outlet: 'Doon Kitchen House',
    category: 'Bowls & Rolls',
    price: 85,
    prepTime: '15 min',
    dietary: 'Pure Veg',
    portion: '450g bowl with pickled onions & mint chutney',
    description: 'Slow-simmered hill kidney beans over steamed basmati rice.',
    image: '/src/assets/images/meal_rajma_chawal_1795166878144.jpg',
  },
  {
    id: 'meal-chole-kulche',
    name: 'Amritsari Chole & Butter Kulche',
    outlet: 'Pind Tandoor Hub',
    category: 'Thalis & Combos',
    price: 95,
    prepTime: '18 min',
    dietary: 'Pure Veg',
    portion: '2 buttered kulchas, spiced chole & tamarind chutney',
    description: 'Hearty midday combo packed hot for classroom breaks.',
    image: '/src/assets/images/meal_chole_kulche_1795166878145.jpg',
  },
  {
    id: 'meal-paneer-roll',
    name: 'Grilled Paneer Tikka Kathi Roll',
    outlet: 'Bistro 24 Outlet',
    category: 'Bowls & Rolls',
    price: 75,
    prepTime: '14 min',
    dietary: 'Pure Veg',
    portion: 'Whole-wheat wrap with spiced paneer & mint yogurt dip',
    description: 'Easy one-hand meal between lectures or evening study.',
    image: '/src/assets/images/meal_paneer_roll_1795166877790.jpg',
  },
  {
    id: 'meal-masala-maggi',
    name: 'Veggie Masala Maggi Bowl',
    outlet: 'Hostel Night Canteen',
    category: 'Snacks',
    price: 55,
    prepTime: '12 min',
    dietary: 'Pure Veg',
    portion: 'Double-pack noodles with green peas & sweet corn',
    description: 'Hot evening snack favourite delivered sealed to your block.',
    image: '/src/assets/images/meal_masala_maggi_1795166878986.jpg',
  },
  {
    id: 'meal-chai-bunmaska',
    name: 'Kulhad Masala Chai & Bun Maska',
    outlet: 'Chai Tapri Co.',
    category: 'Beverages',
    price: 50,
    prepTime: '10 min',
    dietary: 'Pure Veg',
    portion: 'Ginger cardamom chai flask (200ml) + toasted butter bun',
    description: 'Freshly brewed Assam tea with warm toasted bun maska.',
    image: '/src/assets/images/meal_chai_bunmaska_1795166879534.jpg',
  },
];
