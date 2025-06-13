import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'past_due', 'canceled'],
    default: 'active'
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String
});

// Index for quick lookups
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
