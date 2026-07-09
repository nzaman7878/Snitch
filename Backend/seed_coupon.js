import mongoose from 'mongoose';
import Coupon from './src/models/coupon.model.js';
import User from './src/models/user.model.js';

mongoose.connect('mongodb+srv://nuruzzaman31032001:nzaman31032001@cluster0.f51u9zu.mongodb.net/snitch?retryWrites=true&w=majority').then(async () => {
    const seller = await User.findOne({ role: { $in: ['admin', 'seller'] } });
    if (!seller) { console.log('No seller found'); process.exit(1); }
    
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    
    await Coupon.findOneAndUpdate(
        { code: 'SUMMER20' },
        {
            code: 'SUMMER20',
            discountType: 'percentage',
            discountValue: 20,
            seller: seller._id,
            expiryDate: expiry,
            isActive: true
        },
        { upsert: true, new: true }
    );
    console.log('Created SUMMER20 coupon!');
    process.exit(0);
});
