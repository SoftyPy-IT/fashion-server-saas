const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const Material = ['Cotton', 'Polyester', 'Wool', 'Silk', 'Leather', 'Denim', 'Linen'];

const Capacity = ['1GB', '2GB', '4GB', '8GB', '16GB', '32GB', '64GB', '128GB'];
const Resolution = ['720p', '1080p', '2K', '4K', '8K'];
const Weight = ['1kg', '2kg', '3kg', '4kg', '5kg', '6kg', '7kg', '8kg'];

const Flavor = ['Vanilla', 'Chocolate', 'Strawberry', 'Mint', 'Lemon', 'Orange'];

const Style = ['Casual', 'Formal', 'Sporty', 'Vintage', 'Bohemian', 'Retro'];

const Configuration = [
  '4GB RAM, 64GB Storage',
  '8GB RAM, 128GB Storage',
  '16GB RAM, 256GB Storage',
  '32GB RAM, 512GB Storage'
];

const Packaging = ['Single Unit', 'Pack of 3', 'Pack of 6', 'Pack of 12'];

export const variants = [
  {
    name: 'Color',
    items: [
      {
        name: 'Red',
        value: 'red'
      },
      {
        name: 'Blue',
        value: 'blue'
      },
      {
        name: 'Green',
        value: 'green'
      },
      {
        name: 'Yellow',
        value: 'yellow'
      }
    ]
  },
  { name: 'Size', items: sizes.map((size) => ({ name: size, value: size })) },
  { name: 'Material', items: Material.map((material) => ({ name: material, value: material })) },
  { name: 'Capacity', items: Capacity.map((capacity) => ({ name: capacity, value: capacity })) },
  {
    name: 'Resolution',
    items: Resolution.map((resolution) => ({ name: resolution, value: resolution }))
  },
  { name: 'Weight', items: Weight.map((weight) => ({ name: weight, value: weight })) },
  { name: 'Flavor', items: Flavor.map((flavor) => ({ name: flavor, value: flavor })) },
  { name: 'Style', items: Style.map((style) => ({ name: style, value: style })) },
  {
    name: 'Configuration',
    items: Configuration.map((config) => ({ name: config, value: config }))
  },
  { name: 'Packaging', items: Packaging.map((pack) => ({ name: pack, value: pack })) }
];
