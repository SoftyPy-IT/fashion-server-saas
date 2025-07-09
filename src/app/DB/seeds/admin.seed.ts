import User from '../../modules/user/user.model';
import { checkCollectionEmpty } from '../../utils/checkCollectionEmpty';

const admin = {
  firstName: 'Softypy',
  lastName: 'IT',
  email: 'softypy@gmail.com',
  password: '12345678',
  role: 'admin',
  isVerified: true,
  isDeleted: false
};

const seedAdmin = async () => {
  try {
    const isCollectionEmpty = await checkCollectionEmpty(User);

    if (isCollectionEmpty) {
      await User.create(admin);
      console.log('Admin seeded successfully');
    } else {
      console.log('Admin collection already has data. Skipping seeding.');
    }
  } catch (error: any) {
    throw new Error(`Failed to seed admin: ${error.message}`);
  }
};

export default seedAdmin;
