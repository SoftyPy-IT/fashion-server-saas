import Tax from '../../modules/tax/tax.model';
import taxData from '../__mock__/tax';
import { checkCollectionEmpty } from '../../utils/checkCollectionEmpty';

const seedTaxRates = async () => {
  try {
    const isCollectionEmpty = await checkCollectionEmpty(Tax);

    if (isCollectionEmpty) {
      await Tax.insertMany(taxData);
      console.log('Tax rates seeded successfully');
    } else {
      console.log('Tax collection already has data. Skipping seeding.');
    }
  } catch (error: any) {
    console.error('Error seeding tax rates:', error);
    throw new Error('Failed to seed tax rates' + error.message);
  }
};

export default seedTaxRates;
