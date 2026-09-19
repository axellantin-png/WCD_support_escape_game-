/**
 * Base de données des durées de décomposition des déchets
 */

export const TIMELINE_SLOTS = [
  { id: 'weeks_few', label: 'Quelques semaines', childCategory: 'fast' },
  { id: 'months_few', label: 'Quelques mois', childCategory: 'fast' },
  { id: '1_year', label: '1 an', childCategory: 'slow' },
  { id: '5_years', label: '5 ans', childCategory: 'slow' },
  { id: '10_years', label: '10 ans', childCategory: 'slow' },
  { id: '50_years', label: '50 ans', childCategory: 'slow' },
  { id: '100_years', label: '100 ans', childCategory: 'very_slow' },
  { id: '500_years', label: '500 ans', childCategory: 'very_slow' },
  { id: '1000_years', label: '1000 ans', childCategory: 'very_slow' },
  { id: '4000_years', label: '4000 ans', childCategory: 'very_slow' }
];

export const CHILD_MODE_SLOTS = [
  { id: 'fast', label: 'Disparaît rapidement' },
  { id: 'slow', label: 'Disparaît lentement' },
  { id: 'very_slow', label: 'Reste très longtemps' }
];

export const WASTES_DATA = [
  {
    id: 'apple_core',
    name: 'Trognon de pomme',
    image: './images/apple_core.png',
    correctSlotId: 'weeks_few',
    childCategoryId: 'fast',
    explanation: 'Riche en eau et en matière biologique, il est rapidement décomposé par les insectes et bactéries (1 à 4 semaines).'
  },
  {
    id: 'paper',
    name: 'Papier',
    image: './images/paper.png',
    correctSlotId: 'months_few',
    childCategoryId: 'fast',
    explanation: 'Constitué de cellulose naturelle, le papier se désagrège en 2 à 5 mois s\'il est exposé aux intempéries.'
  },
  {
    id: 'banana_peel',
    name: 'Peau de banane',
    image: './images/banana_peel.png',
    correctSlotId: 'months_few',
    childCategoryId: 'fast',
    explanation: 'Selon le climat et la présence de micro-organismes, elle met entre 3 et 8 mois à s\'adapter au sol.'
  },
  {
    id: 'cardboard',
    name: 'Carton',
    image: './images/cardboard.png',
    correctSlotId: 'months_few',
    childCategoryId: 'fast',
    explanation: 'Plus épais que le papier classique, le carton met en moyenne 6 mois à disparaître complètement.'
  },
  {
    id: 'chewing_gum',
    name: 'Chewing-gum',
    image: './images/chewing_gum.png',
    correctSlotId: '5_years',
    childCategoryId: 'slow',
    explanation: 'Fabriqué avec des résines synthétiques issues du pétrole, il s\'effrite très lentement sur 5 ans.'
  },
  {
    id: 'cigarette_butt',
    name: 'Mégot',
    image: './images/cigarette_butt.png',
    correctSlotId: '10_years',
    childCategoryId: 'slow',
    explanation: 'Son filtre contient du plastique (acétate de cellulose) et libère des milliers de produits toxiques pendant 10 ans.'
  },
  {
    id: 'soda_can',
    name: 'Canette',
    image: './images/soda_can.png',
    correctSlotId: '100_years',
    childCategoryId: 'very_slow',
    explanation: 'L\'aluminium s\'oxyde lentement. Une canette jetée dans la nature y reste près d\'un siècle.'
  },
  {
    id: 'plastic_bag',
    name: 'Sac plastique',
    image: './images/plastic_bag.png',
    correctSlotId: '500_years',
    childCategoryId: 'very_slow',
    explanation: 'Il se détruit en se fragmentant en dangereux microplastiques qui persistent jusqu\'à 500 ans.'
  },
  {
    id: 'plastic_bottle',
    name: 'Bouteille plastique',
    image: './images/plastic_bottle.png',
    correctSlotId: '500_years',
    childCategoryId: 'very_slow',
    explanation: 'Le polyéthylène (PET) met plusieurs siècles à se fragmenter en particules invisibles et polluantes.'
  },
  {
    id: 'glass_bottle',
    name: 'Bouteille en verre',
    image: './images/glass_bottle.png',
    correctSlotId: '4000_years',
    childCategoryId: 'very_slow',
    explanation: 'Créé à partir de minéraux (sable), le verre est quasiment inaltérable et met plus de 4 000 ans à s\'éroder.'
  }
];