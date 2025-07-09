import Variant from '../../modules/variant/variant.model';
import { variants } from '../__mock__/variants';
import { checkCollectionEmpty } from '../../utils/checkCollectionEmpty';

const seedVariants = async () => {
  try {
    const isCollectionEmpty = await checkCollectionEmpty(Variant);

    if (isCollectionEmpty) {
      await Variant.insertMany(variants);
      console.log('Variants seeded successfully');
    } else {
      console.log('Variants collection already has data. Skipping seeding.');
    }
  } catch (error: any) {
    console.error('Error seeding variants:', error);
    throw new Error(`Failed to seed variants: ${error.message}`);
  }
};

export default seedVariants;
