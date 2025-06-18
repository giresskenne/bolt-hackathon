import { getSupabase } from '../config/database.js';

export class SubscriptionModel {
  constructor(data = {}) {
    this.id = data.id;
    this.userId = data.userId || data.user_id;
    this.plan = data.plan || 'free';
    this.status = data.status || 'trial';
    this.currentPeriodEnd = data.currentPeriodEnd || data.current_period_end;
    this.stripeCustomerId = data.stripeCustomerId || data.stripe_customer_id;
    this.stripeSubscriptionId = data.stripeSubscriptionId || data.stripe_subscription_id;
    this.created_at = data.created_at || new Date().toISOString();
  }

  static async findOne(query) {
    const supabase = getSupabase();
    
    let queryBuilder = supabase.from('subscriptions').select('*');
    
    if (query.userId) {
      queryBuilder = queryBuilder.eq('user_id', query.userId);
    }
    if (query.stripeCustomerId) {
      queryBuilder = queryBuilder.eq('stripe_customer_id', query.stripeCustomerId);
    }
    
    const { data, error } = await queryBuilder.single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data ? new SubscriptionModel(data) : null;
  }

  static async create(subscriptionData) {
    const supabase = getSupabase();
    
    const newSubscription = {
      user_id: subscriptionData.userId,
      plan: subscriptionData.plan || 'free',
      status: subscriptionData.status || 'trial',
      current_period_end: subscriptionData.currentPeriodEnd,
      stripe_customer_id: subscriptionData.stripeCustomerId,
      stripe_subscription_id: subscriptionData.stripeSubscriptionId
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([newSubscription])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new SubscriptionModel(data);
  }

  async save() {
    const supabase = getSupabase();
    
    if (this.id) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan: this.plan,
          status: this.status,
          current_period_end: this.currentPeriodEnd,
          stripe_customer_id: this.stripeCustomerId,
          stripe_subscription_id: this.stripeSubscriptionId
        })
        .eq('id', this.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new SubscriptionModel(data);
    } else {
      throw new Error('Cannot save subscription without ID. Use SubscriptionModel.create() instead.');
    }
  }
}

export default SubscriptionModel;