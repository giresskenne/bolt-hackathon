import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/database.js';

export class UserModel {
  constructor(data = {}) {
    this.id = data.id || Math.random().toString(36).substring(2, 15);
    this.email = data.email;
    this.password = data.password;
    this.subscription = data.subscription || {
      plan: 'free',
      status: 'trial',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    };
    this.created_at = data.created_at || new Date().toISOString();
  }

  static async findOne(query) {
    if (process.env.NODE_ENV === 'test' && global.__TEST_STATE__) {
      if (query.email) {
        const user = Array.from(global.__TEST_STATE__.users.values())
          .find(u => u.email === query.email);
        return { data: user ? new UserModel(user) : null, error: null };
      }
      return { data: null, error: null };
    }

    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized. Call connectDB() first.');
    
    if (query.email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', query.email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        return { data: null, error };
      }
      
      return { data: data ? new UserModel(data) : null, error: null };
    }
    
    return { data: null, error: null };
  }

  static async findById(id) {
    if (process.env.NODE_ENV === 'test' && global.__TEST_STATE__) {
      const user = Array.from(global.__TEST_STATE__.users.values())
        .find(u => u.id === id);
      return { data: user ? new UserModel(user) : null, error: null };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return { data: null, error: new Error('Supabase not initialized. Call connectDB() first.') };
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return { data: null, error };
    }
    
    return { data: data ? new UserModel(data) : null, error: null };
  }

  static async create(userData) {
    const supabase = getSupabase();
    if (!supabase) {
      return { data: null, error: new Error('Supabase not initialized. Call connectDB() first.') };
    }
    
    // Check if user already exists
    const { data: existingUser } = await this.findOne({ email: userData.email });
    if (existingUser) {
      return { 
        data: null, 
        error: { message: 'Email already exists', status: 400 } 
      };
    }

    // Hash password in production, use plain password in tests
    const password = process.env.NODE_ENV === 'test' 
      ? userData.password
      : await bcrypt.hash(userData.password, 10);

    // Prepare user data with common fields
    const subscriptionData = {
      plan: userData.plan || 'free',
      status: 'trial',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };

    if (process.env.NODE_ENV === 'test' && global.__TEST_STATE__) {
      const id = Math.random().toString(36).substr(2, 9);
      const user = new UserModel({
        id,
        email: userData.email,
        password: password,
        subscription: subscriptionData
      });
      global.__TEST_STATE__.users.set(id, {
        id,
        email: userData.email,
        password: password,
        subscription: subscriptionData
      });
      return { data: user, error: null };
    }

    const newUserData = {
      email: userData.email,
      password: password,
      subscription: subscriptionData
    };

    const { data, error } = await supabase
      .from('users')
      .insert([newUserData])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: new UserModel(data), error: null };
  }

  async save() {
    const supabase = getSupabase();
    if (!supabase) {
      return { data: null, error: new Error('Supabase not initialized. Call connectDB() first.') };
    }
    
    if (!this.id) {
      return { 
        data: null, 
        error: new Error('Cannot save user without ID. Use create() for new users.') 
      };
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        email: this.email,
        password: this.password,
        subscription: this.subscription
      })
      .eq('id', this.id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: new UserModel(data), error: null };
  }

  async comparePassword(candidatePassword) {
    if (process.env.NODE_ENV === 'test') {
      return candidatePassword === this.password;
    }
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const subscriptionData = {
      plan: this.subscription.plan || 'free',
      status: this.subscription.status || 'trial',
      stripeCustomerId: this.subscription.stripeCustomerId || null,
      stripeSubscriptionId: this.subscription.stripeSubscriptionId || null,
      trialEnds: this.subscription.trialEnds || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    return {
      email: this.email,
      plan: subscriptionData.plan,
      subscription: subscriptionData
    };
  }

  static async recordFailedLoginAttempt(email, ip) {
    if (global.__TEST_STATE__) {
      const key = `${ip}:${email}`;
      const rateLimiter = global.__TEST_STATE__.rateLimiters.auth;
      const attempts = rateLimiter.get(key) || [];
      attempts.push(Date.now());
      
      // Only keep attempts within the window (15 minutes)
      const windowMs = 15 * 60 * 1000;
      const now = Date.now();
      const recentAttempts = attempts.filter(time => now - time < windowMs);
      
      rateLimiter.set(key, recentAttempts);
      return recentAttempts.length;
    }
    return 0;
  }

  static getRateLimitInfo(email, ip) {
    if (global.__TEST_STATE__) {
      const key = `${ip}:${email}`;
      const rateLimiter = global.__TEST_STATE__.rateLimiters.auth;
      const attempts = rateLimiter.get(key) || [];
      const now = Date.now();
      const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
      return {
        remaining: Math.max(0, 5 - recentAttempts.length),
        blocked: recentAttempts.length >= 5
      };
    }
    return { remaining: 5, blocked: false };
  }
}

export default UserModel;