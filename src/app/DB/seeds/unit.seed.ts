import Unit from '../../modules/unit/unit.model';
import { checkCollectionEmpty } from '../../utils/checkCollectionEmpty';
import unitData from '../__mock__/unit';

const seedUnitData = async () => {
  try {
    const isCollectionEmpty = await checkCollectionEmpty(Unit);

    if (isCollectionEmpty) {
      console.log('Seeding units...');
      await Unit.create(unitData);
      console.log('Unit seeding completed.');
    } else {
      console.log('Unit collection already has data. Skipping seeding.');
    }
  } catch (error: any) {
    console.error('Error seeding units:', error);
    throw new Error('Failed to seed units' + error.message);
  }
};

export default seedUnitData;
