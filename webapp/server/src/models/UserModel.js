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
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase not initialized. Call connectDB() first.');
      }
      
      if (query.email) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', query.email)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error finding user:', error);
          return { data: null, error };
        }
        
        return { data: data ? new UserModel(data) : null, error: null };
      }
      
      return { data: null, error: null };
    } catch (error) {
      console.error('UserModel.findOne error:', error);
      return { data: null, error };
    }
  }

  static async findById(id) {
    try {
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
        console.error('Error finding user by ID:', error);
        return { data: null, error };
      }
      
      return { data: data ? new UserModel(data) : null, error: null };
    } catch (error) {
      console.error('UserModel.findById error:', error);
      return { data: null, error };
    }
  }

  static async create(userData) {
    try {
      console.log('Creating user with data:', { email: userData.email, plan: userData.plan });
      
      const supabase = getSupabase();
      if (!supabase) {
        return { data: null, error: new Error('Supabase not initialized. Call connectDB() first.') };
      }
      
      // Check if user already exists
      const { data: existingUser } = await this.findOne({ email: userData.email });
      if (existingUser) {
        console.log('User already exists:', userData.email);
        return { 
          data: null, 
          error: { message: 'Email already exists', status: 400 } 
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      console.log('Password hashed successfully');

      // Prepare user data
      const subscriptionData = {
        plan: userData.plan || 'free',
        status: 'trial',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };

      const newUserData = {
        email: userData.email,
        password: hashedPassword,
        subscription: subscriptionData
      };

      console.log('Inserting user into database...');
      const { data, error } = await supabase
        .from('users')
        .insert([newUserData])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        return { data: null, error };
      }

      console.log('User created successfully:', data.id);
      return { data: new UserModel(data), error: null };
    } catch (error) {
      console.error('UserModel.create error:', error);
      return { data: null, error };
    }
  }

  async save() {
    try {
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
    } catch (error) {
      console.error('UserModel.save error:', error);
      return { data: null, error };
    }
  }

  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      console.error('Password comparison error:', error);
      return false;
    }
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

  // Remove test-specific methods since we're not in test mode
  static async recordFailedLoginAttempt(email, ip) {
    // In production, this would be implemented with a proper rate limiting system
    console.log(`Failed login attempt for ${email} from ${ip}`);
    return 0;
  }

  static getRateLimitInfo(email, ip) {
    // In production, this would check a proper rate limiting system
    return { remaining: 5, blocked: false };
  }
}

export default UserModel;