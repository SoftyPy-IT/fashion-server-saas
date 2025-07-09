import seedAdmin from './seeds/admin.seed';
import seedStorefront from './seeds/storefront.seed';
import seedVariants from './seeds/variants.seed';
import seedTaxRates from './seeds/tax.seed';
import seedUnitData from './seeds/unit.seed';

const seeders = [seedAdmin, seedStorefront, seedVariants, seedTaxRates, seedUnitData];

export default seeders;
