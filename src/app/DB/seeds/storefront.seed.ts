import Storefront from '../../modules/storefront/storefront.model';
import { storefrontData } from '../__mock__/storefront';
import { checkCollectionEmpty } from '../../utils/checkCollectionEmpty';

const seedStorefront = async () => {
  try {
    const isCollectionEmpty = await checkCollectionEmpty(Storefront);

    if (isCollectionEmpty) {
      await Storefront.create(storefrontData);
      console.log('Storefront seeded successfully');
    } else {
      console.log('Storefront collection already has data. Skipping seeding.');
    }
  } catch (error: any) {
    throw new Error(`Failed to seed storefront: ${error.message}`);
  }
};

export default seedStorefront;
